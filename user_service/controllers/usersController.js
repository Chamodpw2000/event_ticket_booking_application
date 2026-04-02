import { prisma } from "../lib/prismaClient.js";
import { createHash } from "node:crypto";
import jwt from "jsonwebtoken";

const userResponseFields = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};

const hashPassword = (password) => {
  return createHash("sha256").update(password).digest("hex");
};

const signToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    jwtSecret,
    { expiresIn: "1h" },
  );
};

export const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "name, email, and password are required",
    });
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword(password),
      },
      select: userResponseFields,
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error("Failed to create user", error);

    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "email already exists",
      });
    }

    return res.status(500).json({ message: "Failed to create user" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: userResponseFields,
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Failed to fetch users", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "email and password are required",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    const hashedPassword = hashPassword(password);

    if (!user || user.password !== hashedPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Failed to login user", error);
    return res.status(500).json({ message: "Failed to login user" });
  }
};
