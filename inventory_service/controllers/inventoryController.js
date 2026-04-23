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
