import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prismaClient.js";

export const createPayment = async (req, res) => {
  const { amount, currency, method, status, transactionId } = req.body;

  if (amount === undefined || !currency || !method) {
    return res.status(400).json({
      message: "amount, currency, and method are required",
    });
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      message: "amount must be a positive number",
    });
  }

  try {
    const payment = await prisma.payment.create({
      data: {
        amount: parsedAmount,
        currency,
        method,
        status: status || "pending",
        transactionId: transactionId || randomUUID(),
      },
    });

    return res.status(201).json(payment);
  } catch (error) {
    console.error("Failed to create payment", error);

    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "transactionId already exists",
      });
    }

    return res.status(500).json({ message: "Failed to create payment" });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(payments);
  } catch (error) {
    console.error("Failed to fetch payments", error);
    return res.status(500).json({ message: "Failed to fetch payments" });
  }
};