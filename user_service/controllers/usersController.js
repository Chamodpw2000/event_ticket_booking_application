import { prisma } from "../lib/prismaClient.js";
import { createHash } from "node:crypto";
import jwt from "jsonwebtoken";

const userResponseFields = {
  id: true,
  email: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  userProfile: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      bio: true,
      birthday: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  userRoles: {
    select: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
};

const hashPassword = (password) => {
  return createHash("sha256").update(password).digest("hex");
};

const toApiUser = (user) => {
  const { userRoles, ...rest } = user;
  return {
    ...rest,
    roles: userRoles.map((item) => item.role),
  };
};

const parseUserId = (rawId) => {
  const userId = Number(rawId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
};

const normalizeRoleIds = (roleIds) => {
  if (!Array.isArray(roleIds)) {
    return [];
  }

  return roleIds
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
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
    },
    jwtSecret,
    { expiresIn: "1h" },
  );
};

export const createUser = async (req, res) => {
  const { email, password, status, profile, roleIds } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "email and password are required",
    });
  }

  const normalizedRoleIds = normalizeRoleIds(roleIds);

  if (roleIds !== undefined && normalizedRoleIds.length !== roleIds.length) {
    return res.status(400).json({
      message: "roleIds must be an array of positive integers",
    });
  }

  if (profile !== undefined && profile !== null && typeof profile !== "object") {
    return res.status(400).json({
      message: "profile must be an object",
    });
  }

  if (
    profile &&
    (!profile.firstName || !profile.lastName ||
      typeof profile.firstName !== "string" || typeof profile.lastName !== "string")
  ) {
    return res.status(400).json({
      message: "profile.firstName and profile.lastName are required",
    });
  }

  if (
    profile?.birthday !== undefined &&
    profile?.birthday !== null &&
    Number.isNaN(Date.parse(profile.birthday))
  ) {
    return res.status(400).json({
      message: "profile.birthday must be a valid date",
    });
  }

  try {
    if (normalizedRoleIds.length > 0) {
      const existingRolesCount = await prisma.role.count({
        where: { id: { in: normalizedRoleIds } },
      });

      if (existingRolesCount !== normalizedRoleIds.length) {
        return res.status(400).json({
          message: "one or more roleIds do not exist",
        });
      }
    }

    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashPassword(password),
        status: status && typeof status === "string" ? status : "active",
        ...(profile
          ? {
              userProfile: {
                create: {
                  firstName: profile.firstName.trim(),
                  lastName: profile.lastName.trim(),
                  bio: profile.bio ?? null,
                  birthday: profile.birthday ? new Date(profile.birthday) : null,
                },
              },
            }
          : {}),
        ...(normalizedRoleIds.length > 0
          ? {
              userRoles: {
                create: normalizedRoleIds.map((roleId) => ({
                  role: { connect: { id: roleId } },
                })),
              },
            }
          : {}),
      },
      select: userResponseFields,
    });

    return res.status(201).json(toApiUser(user));
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

    return res.status(200).json(users.map(toApiUser));
  } catch (error) {
    console.error("Failed to fetch users", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getUserById = async (req, res) => {
  const userId = parseUserId(req.params.id);

  if (!userId) {
    return res.status(400).json({ message: "invalid user id" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userResponseFields,
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(200).json(toApiUser(user));
  } catch (error) {
    console.error("Failed to fetch user", error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const updateUser = async (req, res) => {
  const userId = parseUserId(req.params.id);
  const { email, password, status, profile, roleIds } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "invalid user id" });
  }

  if (
    email === undefined &&
    password === undefined &&
    status === undefined &&
    profile === undefined &&
    roleIds === undefined
  ) {
    return res.status(400).json({ message: "no fields provided to update" });
  }

  const normalizedRoleIds = normalizeRoleIds(roleIds);

  if (roleIds !== undefined && normalizedRoleIds.length !== roleIds.length) {
    return res.status(400).json({
      message: "roleIds must be an array of positive integers",
    });
  }

  if (profile !== undefined && profile !== null && typeof profile !== "object") {
    return res.status(400).json({ message: "profile must be an object or null" });
  }

  if (
    profile &&
    ((profile.firstName !== undefined && typeof profile.firstName !== "string") ||
      (profile.lastName !== undefined && typeof profile.lastName !== "string"))
  ) {
    return res.status(400).json({
      message: "profile.firstName and profile.lastName must be strings",
    });
  }

  if (
    profile?.birthday !== undefined &&
    profile?.birthday !== null &&
    Number.isNaN(Date.parse(profile.birthday))
  ) {
    return res.status(400).json({
      message: "profile.birthday must be a valid date",
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { userProfile: true },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "user not found" });
    }

    if (roleIds !== undefined && normalizedRoleIds.length > 0) {
      const existingRolesCount = await prisma.role.count({
        where: { id: { in: normalizedRoleIds } },
      });

      if (existingRolesCount !== normalizedRoleIds.length) {
        return res.status(400).json({ message: "one or more roleIds do not exist" });
      }
    }

    const data = {};

    if (email !== undefined) {
      data.email = String(email).trim().toLowerCase();
    }

    if (password !== undefined) {
      data.password = hashPassword(String(password));
    }

    if (status !== undefined) {
      data.status = String(status);
    }

    if (profile !== undefined) {
      if (profile === null) {
        data.userProfile = { delete: true };
      } else if (existingUser.userProfile) {
        data.userProfile = {
          update: {
            ...(profile.firstName === undefined
              ? {}
              : { firstName: profile.firstName.trim() }),
            ...(profile.lastName === undefined ? {} : { lastName: profile.lastName.trim() }),
            ...(profile.bio === undefined ? {} : { bio: profile.bio }),
            ...(profile.birthday === undefined
              ? {}
              : { birthday: profile.birthday ? new Date(profile.birthday) : null }),
          },
        };
      } else {
        if (!profile.firstName || !profile.lastName) {
          return res.status(400).json({
            message: "profile.firstName and profile.lastName are required when creating profile",
          });
        }

        data.userProfile = {
          create: {
            firstName: profile.firstName.trim(),
            lastName: profile.lastName.trim(),
            bio: profile.bio ?? null,
            birthday: profile.birthday ? new Date(profile.birthday) : null,
          },
        };
      }
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data,
        select: userResponseFields,
      });

      if (roleIds !== undefined) {
        await tx.userRoles.deleteMany({ where: { userId } });

        if (normalizedRoleIds.length > 0) {
          await tx.userRoles.createMany({
            data: normalizedRoleIds.map((roleId) => ({ userId, roleId })),
          });
        }

        return tx.user.findUnique({
          where: { id: userId },
          select: userResponseFields,
        });
      }

      return user;
    });

    return res.status(200).json(toApiUser(updatedUser));
  } catch (error) {
    console.error("Failed to update user", error);

    if (error?.code === "P2002") {
      return res.status(409).json({ message: "email already exists" });
    }

    if (error?.code === "P2025") {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteUser = async (req, res) => {
  const userId = parseUserId(req.params.id);

  if (!userId) {
    return res.status(400).json({ message: "invalid user id" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId } });
      await tx.userProfile.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    return res.status(200).json({ message: "user deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user", error);

    if (error?.code === "P2025") {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(500).json({ message: "Failed to delete user" });
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
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Failed to login user", error);
    return res.status(500).json({ message: "Failed to login user" });
  }
};
