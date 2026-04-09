import { prisma } from "../lib/prismaClient.js";

export const createBooking = async (req, res) => {
  const {
    userId,
    eventId,
    bookingReference,
    status,
    totalAmount,
    currency,
    paymentStatus,
  } = req.body;

  if (
    userId === undefined ||
    eventId === undefined ||
    !bookingReference ||
    totalAmount === undefined ||
    !currency ||
    !paymentStatus
  ) {
    return res.status(400).json({
      message:
        "userId, eventId, bookingReference, totalAmount, currency, and paymentStatus are required",
    });
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        userId,
        eventId,
        bookingReference,
        status,
        totalAmount: Number(totalAmount).toFixed(2),
        currency,
        paymentStatus,
      },
    });

    return res.status(201).json(booking);
  } catch (error) {
    console.error("Failed to create booking", error);
    return res.status(500).json({ message: "Failed to create booking" });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Failed to fetch bookings", error);
    return res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

export const createBookingWithItems = async (req, res) => {
  const {
    userId,
    eventId,
    bookingReference,
    status,
    totalAmount,
    currency,
    paymentStatus,
    items,
  } = req.body;

  if (
    userId === undefined ||
    eventId === undefined ||
    !bookingReference ||
    totalAmount === undefined ||
    !currency ||
    !paymentStatus
  ) {
    return res.status(400).json({
      message:
        "userId, eventId, bookingReference, totalAmount, currency, and paymentStatus are required",
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "items must be a non-empty array",
    });
  }

  for (const item of items) {
    if (
      item.ticketTypeId === undefined ||
      item.quantity === undefined ||
      item.unitPrice === undefined ||
      item.subtotal === undefined
    ) {
      return res.status(400).json({
        message:
          "Each item must include ticketTypeId, quantity, unitPrice, and subtotal",
      });
    }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId,
          eventId,
          bookingReference,
          status,
          totalAmount: Number(totalAmount).toFixed(2),
          currency,
          paymentStatus,
        },
      });

      await tx.bookingItem.createMany({
        data: items.map((item) => ({
          bookingId: booking.id,
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice).toFixed(2),
          subtotal: Number(item.subtotal).toFixed(2),
        })),
      });

      const bookingItems = await tx.bookingItem.findMany({
        where: { bookingId: booking.id },
        orderBy: { id: "asc" },
      });

      return {
        booking,
        items: bookingItems,
      };
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("Failed to create booking with items", error);
    return res
      .status(500)
      .json({ message: "Failed to create booking with items" });
  }
};
