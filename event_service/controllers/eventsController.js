import { prisma } from "../lib/prismaClient.js";
import {
  SFNClient,
  StartExecutionCommand,
  StartSyncExecutionCommand,
} from "@aws-sdk/client-sfn";
import {
  deleteEventBannerFromS3,
  uploadEventBannerBase64ToS3,
} from "../lib/s3UploadBanner.js";

const getAwsClientConfig = () => {
  const region = process.env.AWS_REGION || "us-east-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;

  return {
    region,
    ...(accessKeyId && secretAccessKey
      ? {
          credentials: {
            accessKeyId,
            secretAccessKey,
            ...(sessionToken ? { sessionToken } : {}),
          },
        }
      : {}),
  };
};

const sfnClient = new SFNClient(getAwsClientConfig());

const parsePositiveInt = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const ensureEventExists = async (eventId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });

  return Boolean(event);
};

export const createEvent = async (req, res) => {
  const {
    venueId,
    title,
    description,
    category,
    startTime,
    endTime,
    status,
    bannerImage,
  } = req.body;

  if (!venueId || !title || !startTime || !endTime) {
    return res.status(400).json({
      message: "venueId, title, startTime, and endTime are required",
    });
  }

  const parsedStartTime = new Date(startTime);
  const parsedEndTime = new Date(endTime);

  if (!venueId || typeof venueId !== "string" || venueId.trim() === "") {
    return res.status(400).json({
      message: "venueId must be a non-empty string",
    });
  }

  if (Number.isNaN(parsedStartTime.getTime())) {
    return res.status(400).json({
      message: "startTime must be a valid ISO date string",
    });
  }

  if (Number.isNaN(parsedEndTime.getTime())) {
    return res.status(400).json({
      message: "endTime must be a valid ISO date string",
    });
  }

  if (parsedEndTime <= parsedStartTime) {
    return res.status(400).json({
      message: "endTime must be greater than startTime",
    });
  }

  let createdEventId = null;
  let uploadedS3Key = null;

  try {
    const createdEvent = await prisma.event.create({
      data: {
        venueId: venueId.trim(),
        title: title.trim(),
        description: description?.trim() || null,
        category: category?.trim() || null,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        status: typeof status === "string" && status.trim() ? status.trim() : "draft",
        bannerUrl: null,
      },
    });

    createdEventId = createdEvent.id;

    let finalBannerUrl = null;
    if (bannerImage) {
      const uploadResult = await uploadEventBannerBase64ToS3({
        eventId: String(createdEvent.id),
        bannerImageBase64: bannerImage,
      });
      finalBannerUrl = uploadResult.url;
      uploadedS3Key = uploadResult.key;

      await prisma.event.update({
        where: { id: createdEvent.id },
        data: { bannerUrl: finalBannerUrl },
      });
    }

    const event = await prisma.event.findUnique({
      where: { id: createdEvent.id },
      include: {
        eventArtists: true,
        eventTicketTypes: true,
      },
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Failed to create event", error);

    if (uploadedS3Key) {
      try {
        await deleteEventBannerFromS3({ key: uploadedS3Key });
      } catch (cleanupError) {
        console.error("Failed to cleanup uploaded banner image", cleanupError);
      }
    }

    if (createdEventId) {
      try {
        await prisma.event.delete({ where: { id: createdEventId } });
      } catch (cleanupError) {
        console.error("Failed to cleanup created event after failure", cleanupError);
      }
    }

    if (
      typeof error?.message === "string" &&
      (error.message.startsWith("bannerImage") ||
        error.message.startsWith("S3_") ||
        error.message.startsWith("Unable to determine image"))
    ) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to create event" });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startTime: "asc" },
      include: {
        eventArtists: true,
        eventTicketTypes: true,
      },
    });

    const venueServiceUrl = process.env.VENUE_SERVICE_URL || "http://localhost:3005";
    const artistServiceUrl = process.env.ARTIST_SERVICE_URL || "http://localhost:3004";
    const inventoryServiceUrl = process.env.INVENTORY_SERVICE_URL || "http://localhost:3007";

    const uniqueVenueIds = [...new Set(events.map(e => e.venueId))];
    const uniqueArtistIds = [...new Set(events.flatMap(e => e.eventArtists.map(ea => ea.artistId)))];

    const venuesMap = new Map();
    const artistsMap = new Map();

    // Fetch venues
    await Promise.all(
      uniqueVenueIds.map(async (id) => {
        try {
          const res = await fetch(`${venueServiceUrl}/venues/${id}`);
          if (res.ok) {
            venuesMap.set(String(id), await res.json());
          }
        } catch (err) {
          console.warn(`Failed to fetch venue ${id}`, err.message);
        }
      })
    );

    // Fetch artists
    await Promise.all(
      uniqueArtistIds.map(async (id) => {
        try {
          const res = await fetch(`${artistServiceUrl}/artists/${id}`);
          if (res.ok) {
            artistsMap.set(String(id), await res.json());
          }
        } catch (err) {
          console.warn(`Failed to fetch artist ${id}`, err.message);
        }
      })
    );

    const inventoriesMap = new Map();
    const uniqueEventIds = events.map(e => e.id);

    try {
      if (uniqueEventIds.length > 0) {
        const inventoryRes = await fetch(`${inventoryServiceUrl}/inventory/events?eventIds=${uniqueEventIds.join(',')}`);
        if (inventoryRes.ok) {
          const inventories = await inventoryRes.json();
          inventories.forEach(inv => {
            if (!inventoriesMap.has(inv.eventId)) {
              inventoriesMap.set(inv.eventId, new Map());
            }
            inventoriesMap.get(inv.eventId).set(inv.ticketTypeId, inv);
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch inventory from inventory_service", err.message);
    }

    // Enrich events with venue and artist data
    const enrichedEvents = events.map(event => {
      const venue = venuesMap.get(String(event.venueId)) || { id: event.venueId, error: "Venue details not found" };

      const enrichedArtists = event.eventArtists.map(ea => {
        const artistDetails = artistsMap.get(String(ea.artistId));
        return artistDetails ? { ...ea, artistDetails } : ea;
      });

      const eventInventories = inventoriesMap.get(event.id) || new Map();
      const enrichedTicketTypes = event.eventTicketTypes.map(tt => {
        const inventory = eventInventories.get(tt.id);
        return {
          ...tt,
          availableQuantity: inventory ? inventory.availableQuantity : 0,
          reservedQuantity: inventory ? inventory.reservedQuantity : 0,
        };
      });

      return {
        ...event,
        venueDetails: venue,
        eventArtists: enrichedArtists,
        eventTicketTypes: enrichedTicketTypes,
      };
    });

    return res.status(200).json(enrichedEvents);
  } catch (error) {
    console.error("Failed to fetch events", error);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const addEventArtists = async (req, res) => {
  const eventId = parsePositiveInt(req.params.eventId);
  const { artistIds } = req.body;

  if (!eventId) {
    return res.status(400).json({ message: "invalid event id" });
  }

  if (!Array.isArray(artistIds) || artistIds.length === 0) {
    return res.status(400).json({
      message: "artistIds must be a non-empty array",
    });
  }

  const parsedArtistIds = artistIds
    .map((id) => String(id).trim())
    .filter((id) => id.length > 0);

  if (parsedArtistIds.length !== artistIds.length) {
    return res.status(400).json({
      message: "artistIds must contain only valid strings",
    });
  }

  try {
    const eventExists = await ensureEventExists(eventId);
    if (!eventExists) {
      return res.status(404).json({ message: "event not found" });
    }

    await prisma.eventArtist.createMany({
      data: parsedArtistIds.map((artistId) => ({ eventId, artistId })),
      skipDuplicates: true,
    });

    const eventArtists = await prisma.eventArtist.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    });

    return res.status(201).json(eventArtists);
  } catch (error) {
    console.error("Failed to add event artists", error);
    return res.status(500).json({ message: "Failed to add event artists" });
  }
};

export const addEventTicketType = async (req, res) => {
  const eventId = parsePositiveInt(req.params.eventId);
  const { name, price, currency, description, initialStock } = req.body;

  if (!eventId) {
    return res.status(400).json({ message: "invalid event id" });
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "name is required" });
  }

  const parsedPrice = Number(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ message: "price must be a non-negative number" });
  }

  const parsedInitialStock = parsePositiveInt(initialStock);
  if (!parsedInitialStock) {
    return res.status(400).json({ message: "initialStock must be a positive integer" });
  }

  try {
    const eventExists = await ensureEventExists(eventId);
    if (!eventExists) {
      return res.status(404).json({ message: "event not found" });
    }

    const ticketType = await prisma.eventTicketType.create({
      data: {
        eventId,
        initialStock: parsedInitialStock,
        name: name.trim(),
        price: parsedPrice,
        currency: typeof currency === "string" && currency.trim() ? currency.trim() : "USD",
        description: description?.trim() || null,
      },
    });

    return res.status(201).json(ticketType);
  } catch (error) {
    console.error("Failed to add event ticket type", error);
    return res.status(500).json({ message: "Failed to add event ticket type" + error.message });
  }
};

export const deleteEventTicketType = async (req, res) => {
  const ticketTypeId = parsePositiveInt(req.params.ticketTypeId);

  if (!ticketTypeId) {
    return res.status(400).json({ message: "invalid ticket type id" });
  }

  try {
    const ticketType = await prisma.eventTicketType.findUnique({
      where: { id: ticketTypeId },
      select: { id: true },
    });

    if (!ticketType) {
      return res.status(404).json({ message: "ticket type not found" });
    }

    await prisma.eventTicketType.delete({
      where: { id: ticketTypeId },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Failed to delete event ticket type", error);
    return res.status(500).json({ message: "Failed to delete event ticket type" });
  }
};

export const startAddTicketWithInventorySaga = async (req, res) => {
  const {
    eventId,
    name,
    price,
    currency,
    description,
    initialStock,
    totalQuantity,
  } = req.body;

  const parsedEventId = parsePositiveInt(eventId);
  const parsedInitialStock = parsePositiveInt(initialStock);
  const parsedTotalQuantity = parsePositiveInt(totalQuantity);
  const parsedPrice = Number(price);
  const waitForResult = req.query.waitForResult === "true" || req.body?.waitForResult === true;

  if (!parsedEventId) {
    return res.status(400).json({ message: "eventId must be a positive integer" });
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "name is required" });
  }

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ message: "price must be a non-negative number" });
  }

  if (!parsedInitialStock) {
    return res.status(400).json({ message: "initialStock must be a positive integer" });
  }

  if (!parsedTotalQuantity) {
    return res.status(400).json({ message: "totalQuantity must be a positive integer" });
  }

  if (!process.env.STATE_MACHINE_ARN_TICKET) {
    return res.status(500).json({ message: "STATE_MACHINE_ARN_TICKET is not configured" });
  }

  try {
    const sagaInput = {
      eventId: parsedEventId,
      name: name.trim(),
      price: parsedPrice,
      currency: typeof currency === "string" && currency.trim() ? currency.trim() : "USD",
      description: typeof description === "string" && description.trim() ? description.trim() : null,
      initialStock: parsedInitialStock,
      totalQuantity: parsedTotalQuantity,
    };

    if (waitForResult) {
      const syncCommand = new StartSyncExecutionCommand({
        stateMachineArn: process.env.STATE_MACHINE_ARN_TICKET,
        input: JSON.stringify(sagaInput),
        name: `ticket-saga-${parsedEventId}-${Date.now()}`,
      });

      const syncResult = await sfnClient.send(syncCommand);
      const parsedOutput = syncResult.output ? JSON.parse(syncResult.output) : null;

      if (syncResult.status !== "SUCCEEDED") {
        return res.status(500).json({
          message: "Saga execution failed",
          executionArn: syncResult.executionArn,
          status: syncResult.status,
          error: syncResult.error,
          cause: syncResult.cause,
        });
      }

      return res.status(200).json({
        message: "Saga execution completed",
        executionArn: syncResult.executionArn,
        status: syncResult.status,
        ticketTypeId: parsedOutput?.ticketTypeId ?? null,
        inventoryId: parsedOutput?.addInventoryResult?.Payload?.inventoryId ?? null,
        result: parsedOutput,
      });
    }

    const command = new StartExecutionCommand({
      stateMachineArn: process.env.STATE_MACHINE_ARN_TICKET,
      name: `ticket-saga-${parsedEventId}-${Date.now()}`,
      input: JSON.stringify(sagaInput),
    });

    const result = await sfnClient.send(command);

    return res.status(202).json({
      message: "Saga execution started",
      executionArn: result.executionArn,
      startDate: result.startDate,
      mode: "async",
    });
  } catch (error) {
    console.error("Failed to start add ticket inventory saga", error);
    return res.status(500).json({
      message: "Failed to start add ticket inventory saga",
      error: error?.message,
    });
  }
};
