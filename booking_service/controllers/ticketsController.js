import { prisma } from "../lib/prismaClient.js";

export const createTicket = async (req, res) => {
  const {
    bookingId,
    userId,
    eventId,
    ticketCode,
    ticketTypeId,
    seatId,
    ticketStatus,
  } = req.body;

  if (
    bookingId === undefined ||
    userId === undefined ||
    eventId === undefined ||
    !ticketCode ||
    ticketTypeId === undefined
  ) {
    return res.status(400).json({
      message:
        "bookingId, userId, eventId, ticketCode, and ticketTypeId are required",
    });
  }

  try {
    const ticket = await prisma.ticket.create({
      data: {
        bookingId,
        eventId,
        userId,
        ticketCode,
        ticketTypeId,
        seatId,
        ticketStatus,
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
      orderBy: { issuedAt: "desc" },
    });

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Failed to fetch tickets", error);
    return res.status(500).json({ message: "Failed to fetch tickets" });
  }
};
