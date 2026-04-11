import { prisma } from "../lib/prismaClient.js";

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
    bannerUrl,
  } = req.body;

  if (!venueId || !title || !startTime || !endTime) {
    return res.status(400).json({
      message: "venueId, title, startTime, and endTime are required",
    });
  }

  const parsedVenueId = Number(venueId);
  const parsedStartTime = new Date(startTime);
  const parsedEndTime = new Date(endTime);

  if (!Number.isInteger(parsedVenueId) || parsedVenueId <= 0) {
    return res.status(400).json({
      message: "venueId must be a positive integer",
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

  try {
    const event = await prisma.event.create({
      data: {
        venueId: parsedVenueId,
        title: title.trim(),
        description: description?.trim() || null,
        category: category?.trim() || null,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        status: typeof status === "string" && status.trim() ? status.trim() : "draft",
        bannerUrl: bannerUrl?.trim() || null,
      },
      include: {
        eventArtists: true,
        eventTicketTypes: true,
      },
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Failed to create event", error);
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

    return res.status(200).json(events);
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
    .map((id) => parsePositiveInt(id))
    .filter((id) => id !== null);

  if (parsedArtistIds.length !== artistIds.length) {
    return res.status(400).json({
      message: "artistIds must contain only positive integers",
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
