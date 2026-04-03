import { prisma } from "../lib/prismaClient.js";

const parsePositiveInt = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

export const createPayment = async (req, res) => {
  const {
    bookingId,
    userId,
    eventId,
    amount,
    currency,
    paymentMethod,
    providerName,
    providerReference,
    transactionType,
  } = req.body;

  if (
    !bookingId ||
    !userId ||
    !eventId ||
    amount === undefined ||
    !currency ||
    !paymentMethod ||
    !providerName
  ) {
    return res.status(400).json({
      message:
        "bookingId, userId, eventId, amount, currency, paymentMethod, and providerName are required",
    });
  }

  const parsedBookingId = parsePositiveInt(bookingId);
  const parsedUserId = parsePositiveInt(userId);
  const parsedEventId = parsePositiveInt(eventId);
  const parsedAmount = Number(amount);

  if (!parsedBookingId || !parsedUserId || !parsedEventId) {
    return res.status(400).json({
      message: "bookingId, userId, and eventId must be positive integers",
    });
  }

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      message: "amount must be a positive number",
    });
  }

  try {
    const payment = await prisma.payment.create({
      data: {
        bookingId: parsedBookingId,
        userId: parsedUserId,
        eventId: parsedEventId,
        amount: parsedAmount,
        currency: currency.trim(),
        paymentMethod: paymentMethod.trim(),
        providerName: providerName.trim(),
        providerReference: providerReference?.trim() || null,
        status: "initiated",
        transactions: {
          create: {
            transactionType: transactionType?.trim() || "INITIATED",
            providerReference: providerReference?.trim() || null,
            status: "pending",
            responsePayload: null,
          },
        },
      },
      include: {
        transactions: true,
        refunds: true,
      },
    });

    return res.status(201).json(payment);
  } catch (error) {
    console.error("Failed to create payment", error);
    return res.status(500).json({ message: "Failed to create payment" });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        transactions: true,
        refunds: true,
      },
    });

    return res.status(200).json(payments);
  } catch (error) {
    console.error("Failed to fetch payments", error);
    return res.status(500).json({ message: "Failed to fetch payments" });
  }
};