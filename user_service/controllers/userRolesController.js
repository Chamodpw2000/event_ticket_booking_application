import { prisma } from "../lib/prismaClient.js";

const roleResponseFields = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
};

export const createRole = async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "role name is required" });
  }

  try {
    const role = await prisma.role.create({
      data: { name: name.trim() },
      select: roleResponseFields,
    });

    return res.status(201).json(role);
  } catch (error) {
    console.error("Failed to create role", error);

    if (error?.code === "P2002") {
      return res.status(409).json({ message: "role already exists" });
    }

    return res.status(500).json({ message: "Failed to create role" });
  }
};

export const getRoles = async (_req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { createdAt: "desc" },
      select: roleResponseFields,
    });

    return res.status(200).json(roles);
  } catch (error) {
    console.error("Failed to fetch roles", error);
    return res.status(500).json({ message: "Failed to fetch roles" });
  }
};

export const getRoleById = async (req, res) => {
  const roleId = Number(req.params.id);

  if (!Number.isInteger(roleId) || roleId <= 0) {
    return res.status(400).json({ message: "invalid role id" });
  }

  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      select: roleResponseFields,
    });

    if (!role) {
      return res.status(404).json({ message: "role not found" });
    }

    return res.status(200).json(role);
  } catch (error) {
    console.error("Failed to fetch role", error);
    return res.status(500).json({ message: "Failed to fetch role" });
  }
};

export const updateRole = async (req, res) => {
  const roleId = Number(req.params.id);
  const { name } = req.body;

  if (!Number.isInteger(roleId) || roleId <= 0) {
    return res.status(400).json({ message: "invalid role id" });
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "role name is required" });
  }

  try {
    const role = await prisma.role.update({
      where: { id: roleId },
      data: { name: name.trim() },
      select: roleResponseFields,
    });

    return res.status(200).json(role);
  } catch (error) {
    console.error("Failed to update role", error);

    if (error?.code === "P2025") {
      return res.status(404).json({ message: "role not found" });
    }

    if (error?.code === "P2002") {
      return res.status(409).json({ message: "role already exists" });
    }

    return res.status(500).json({ message: "Failed to update role" });
  }
};

export const deleteRole = async (req, res) => {
  const roleId = Number(req.params.id);

  if (!Number.isInteger(roleId) || roleId <= 0) {
    return res.status(400).json({ message: "invalid role id" });
  }

  try {
    await prisma.role.delete({
      where: { id: roleId },
    });

    return res.status(200).json({ message: "role deleted successfully" });
  } catch (error) {
    console.error("Failed to delete role", error);

    if (error?.code === "P2025") {
      return res.status(404).json({ message: "role not found" });
    }

    return res.status(500).json({ message: "Failed to delete role" });
  }
};
