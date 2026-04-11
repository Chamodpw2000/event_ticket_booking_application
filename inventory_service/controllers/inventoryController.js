import { prisma } from "../lib/prismaClient.js";

const parsePositiveInt = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

export const createInventoryRecord = async (req, res) => {
  const { eventId, ticketTypeId, totalQuantity } = req.body;

  const parsedEventId = parsePositiveInt(eventId);
  const parsedTicketTypeId = parsePositiveInt(ticketTypeId);
  const parsedTotalQuantity = parsePositiveInt(totalQuantity);

  if (!parsedEventId || !parsedTicketTypeId || !parsedTotalQuantity) {
    return res.status(400).json({
      message: "eventId, ticketTypeId, and totalQuantity must be positive integers",
    });
  }

  try {
    const inventory = await prisma.eventInventory.create({
      data: {
        eventId: parsedEventId,
        ticketTypeId: parsedTicketTypeId,
        totalQuantity: parsedTotalQuantity,
        availableQuantity: parsedTotalQuantity,
        reservedQuantity: 0,
      },
    });

    return res.status(201).json(inventory);
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "Inventory already exists for this eventId and ticketTypeId",
      });
    }

    console.error("Failed to create inventory record", error);
    return res.status(500).json({ message: "Failed to create inventory record" });
  }
};

export const createInventoryHold = async (req, res) => {
  const { eventId, ticketTypeId, userId, quantity, bookingId, holdExpiryMinutes } = req.body;

  const parsedEventId = parsePositiveInt(eventId);
  const parsedTicketTypeId = parsePositiveInt(ticketTypeId);
  const parsedUserId = parsePositiveInt(userId);
  const parsedQuantity = parsePositiveInt(quantity);

  if (!parsedEventId || !parsedTicketTypeId || !parsedUserId || !parsedQuantity) {
    return res.status(400).json({
      message: "eventId, ticketTypeId, userId, and quantity must be positive integers",
    });
  }

  const parsedBookingId =
    bookingId === undefined || bookingId === null ? null : parsePositiveInt(bookingId);

  if (bookingId !== undefined && bookingId !== null && !parsedBookingId) {
    return res.status(400).json({
      message: "bookingId must be a positive integer when provided",
    });
  }

  const expiryMinutes = holdExpiryMinutes ? Number(holdExpiryMinutes) : null;
  if (!Number.isFinite(expiryMinutes) || expiryMinutes <= 0) {
    return res.status(400).json({
      message: "holdExpiryMinutes must be a positive number when provided",
    });
  }

  const expiresAt = new Date(Date.now() + Math.floor(expiryMinutes * 60 * 1000));

  try {
    const result = await prisma.$transaction(async (tx) => {
      const inventory = await tx.eventInventory.findFirst({
        where: {
          eventId: parsedEventId,
          ticketTypeId: parsedTicketTypeId,
        },
      });

      if (!inventory) {
        throw new Error("INVENTORY_NOT_FOUND");
      }

      const updatedRows = await tx.eventInventory.updateMany({
        where: {
          id: inventory.id,
          availableQuantity: {
            gte: parsedQuantity,
          },
        },
        data: {
          availableQuantity: {
            decrement: parsedQuantity,
          },
          reservedQuantity: {
            increment: parsedQuantity,
          },
        },
      });

      if (updatedRows.count === 0) {
        throw new Error("INSUFFICIENT_INVENTORY");
      }

      const hold = await tx.inventoryHold.create({
        data: {
          inventoryId: inventory.id,
          eventId: parsedEventId,
          ticketTypeId: parsedTicketTypeId,
          bookingId: parsedBookingId,
          userId: parsedUserId,
          quantity: parsedQuantity,
          status: "ACTIVE",
          expiresAt,
        },
      });

      const latestInventory = await tx.eventInventory.findUnique({
        where: { id: inventory.id },
      });

      return { hold, inventory: latestInventory };
    });

    return res.status(201).json({
      holdId: result.hold.id,
      status: result.hold.status,
      expiresAt: result.hold.expiresAt,
      inventory: {
        id: result.inventory.id,
        eventId: result.inventory.eventId,
        ticketTypeId: result.inventory.ticketTypeId,
        totalQuantity: result.inventory.totalQuantity,
        availableQuantity: result.inventory.availableQuantity,
        reservedQuantity: result.inventory.reservedQuantity,
      },
    });
  } catch (error) {
    if (error.message === "INVENTORY_NOT_FOUND") {
      return res.status(404).json({ message: "Inventory record not found" });
    }

    if (error.message === "INSUFFICIENT_INVENTORY") {
      return res.status(409).json({ message: "Not enough available inventory" });
    }

    console.error("Failed to create inventory hold", error);
    return res.status(500).json({ message: "Failed to create inventory hold" });
  }
};
