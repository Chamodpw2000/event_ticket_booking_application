import { prisma } from "../lib/prismaClient.js";

export const createTicket = async (req, res) => {
  const { eventId, userId, quantity, price } = req.body;

  if (!eventId || !userId || !quantity || !price) {
    return res.status(400).json({
      message: "eventId, userId, quantity, and price are required",
    });
  }

  if (quantity <= 0 || price <= 0) {
    return res.status(400).json({
      message: "quantity and price must be positive numbers",
    });
  }

  try {
    const totalPrice = quantity * price;

    const ticket = await prisma.ticket.create({
      data: {
        eventId,
        userId,
        quantity,
        price,
        totalPrice,
        status: "pending",
      },
    });

    return res.status(201).json(ticket);
  } catch (error) {
    console.error("Failed to create ticket", error);
    return res.status(500).json({ message: "Failed to create ticket" });
  }
};

export const getTickets = async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Failed to fetch tickets", error);
    return res.status(500).json({ message: "Failed to fetch tickets" });
  }
};
