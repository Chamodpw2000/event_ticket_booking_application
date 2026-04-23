import { prisma } from "../lib/prismaClient.js";

const BOOKING_STATUSES = new Set([
  "PENDING",
  "CONFIRMED",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
]);

const parsePositiveInt = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const normalizeBookingStatus = (value) => {
  if (value === undefined || value === null || value === "") {
    return "PENDING";
  }

  if (typeof value !== "string" || !BOOKING_STATUSES.has(value)) {
    return null;
  }

  return value;
};

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

  const initialStatus = normalizeBookingStatus(status);
  if (!initialStatus) {
    return res.status(400).json({
      message: "status must be one of PENDING, CONFIRMED, FAILED, CANCELLED, EXPIRED",
    });
  }

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
    const booking = await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          userId,
          eventId,
          bookingReference,
          status: initialStatus,
          totalAmount: Number(totalAmount).toFixed(2),
          currency,
          paymentStatus,
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: createdBooking.id,
          oldStatus: initialStatus,
          newStatus: initialStatus,
          reason: "Booking created",
        },
      });

      return createdBooking;
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

export const getBookingById = async (req, res) => {
  const bookingId = parsePositiveInt(req.params.bookingId);
  if (!bookingId) {
    return res.status(400).json({ message: "bookingId must be a positive integer" });
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ booking });
  } catch (error) {
    console.error("Failed to fetch booking", error);
    return res.status(500).json({ message: "Failed to fetch booking" });
  }
};

export const checkPaymentAvailability = async (req, res) => {
  const bookingId = parsePositiveInt(req.params.bookingId);
  if (!bookingId) {
    return res.status(400).json({ message: "bookingId must be a positive integer" });
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const status = booking.status;
    if (status === "PENDING") {
      return res.status(200).json({
        booking,
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        status,
        availableForPayment: true,
      });
    }

    if (status === "CONFIRMED") {
      return res.status(409).json({
        message: "Already confirmed",
        booking,
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        status,
        availableForPayment: false,
      });
    }

    // Treat FAILED as EXPIRED (payment timeout).
    if (status === "FAILED" || status === "EXPIRED") {
      const bookingForResponse = { ...booking, status: "EXPIRED" };
      return res.status(409).json({
        message: "Booking expired (payment timeout)",
        booking: bookingForResponse,
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        status: "EXPIRED",
        availableForPayment: false,
      });
    }

    if (status === "CANCELLED") {
      return res.status(409).json({
        message: "Booking cancelled",
        booking,
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        status,
        availableForPayment: false,
      });
    }

    return res.status(409).json({
      message: `Payment not allowed for booking status: ${status}`,
      booking,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      status,
      availableForPayment: false,
    });
  } catch (error) {
    console.error("Failed to check payment availability", error);
    return res.status(500).json({ message: "Failed to check payment availability" });
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

  const initialStatus = normalizeBookingStatus(status);
  if (!initialStatus) {
    return res.status(400).json({
      message: "status must be one of PENDING, CONFIRMED, FAILED, CANCELLED, EXPIRED",
    });
  }

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
          status: initialStatus,
          totalAmount: Number(totalAmount).toFixed(2),
          currency,
          paymentStatus,
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          oldStatus: initialStatus,
          newStatus: initialStatus,
          reason: "Booking created",
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
