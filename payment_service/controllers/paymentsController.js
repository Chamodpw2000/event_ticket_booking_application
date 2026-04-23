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
        status: "PAID",
        transactions: {
          create: {
            transactionType: transactionType?.trim() || "INITIATED",
            providerReference: providerReference?.trim() || null,
            status: "TRANSFERD",
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

export const refundPayment = async (req, res) => {
  const paymentId = parsePositiveInt(req.params.paymentId);
  if (!paymentId) {
    return res.status(400).json({ message: "paymentId must be a positive integer" });
  }

  const rawReason = req.body?.reason;

  const reason =
    typeof rawReason === "string" && rawReason.trim() ? rawReason.trim().slice(0, 255) : null;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { refunds: true, transactions: true },
      });

      if (!payment) {
        const error = new Error("PAYMENT_NOT_FOUND");
        error.code = "PAYMENT_NOT_FOUND";
        throw error;
      }

      if ((payment.refunds?.length ?? 0) > 0) {
        return {
          payment,
          refundCreated: false,
          message: "Payment already refunded",
        };
      }

      const refundAmount = Number(payment.amount);
      if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
        return {
          payment,
          refundCreated: false,
          message: "Payment amount is not refundable",
        };
      }

      const refund = await tx.refund.create({
        data: {
          paymentId: payment.id,
          bookingId: payment.bookingId,
          amount: refundAmount,
          reason,
          status: "REFUNDED",
        },
      });

      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          transactionType: "REFUND",
          providerReference: null,
          status: "REFUNDED",
        },
      });

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED" },
        include: { refunds: true, transactions: true },
      });

      return {
        payment: updatedPayment,
        refund,
        refundCreated: true,
      };
    });

    return res.status(result.refundCreated ? 201 : 200).json(result);
  } catch (error) {
    if (error?.code === "PAYMENT_NOT_FOUND") {
      return res.status(404).json({ message: "Payment not found" });
    }

    // If two requests refund the same payment concurrently, the DB unique constraint can throw P2002.
    // Treat that as "already refunded" and return the current payment state.
    if (error?.code === "P2002") {
      try {
        const payment = await prisma.payment.findUnique({
          where: { id: paymentId },
          include: { refunds: true, transactions: true },
        });

        if (payment) {
          return res.status(200).json({
            payment,
            refundCreated: false,
            message: "Payment already refunded",
          });
        }
      } catch {
        // fall through to generic handler
      }
    }

    console.error("Failed to refund payment", error);
    return res.status(500).json({ message: "Failed to refund payment" });
  }
};
