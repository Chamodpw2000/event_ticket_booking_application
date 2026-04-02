import { prisma } from "../lib/prismaClient.js";

export const createVenue = async (req, res) => {
  const {
    name,
    description,
    address,
    city,
    state,
    country,
    postalCode,
    capacity,
    phone,
    isActive,
  } = req.body;

  if (!name || !address || !city || !country || capacity === undefined) {
    return res.status(400).json({
      message: "name, address, city, country, and capacity are required",
    });
  }

  const venueCapacity = Number(capacity);
  if (!Number.isInteger(venueCapacity) || venueCapacity <= 0) {
    return res.status(400).json({
      message: "capacity must be a positive integer",
    });
  }

  try {
    const venue = await prisma.venue.create({
      data: {
        name,
        description,
        address,
        city,
        state,
        country,
        postalCode,
        capacity: venueCapacity,
        phone,
        isActive,
      },
    });

    return res.status(201).json(venue);
  } catch (error) {
    console.error("Failed to create venue", error);
    return res.status(500).json({ message: "Failed to create venue" });
  }
};

export const getVenues = async (req, res) => {
  try {
    const venues = await prisma.venue.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(venues);
  } catch (error) {
    console.error("Failed to fetch venues", error);
    return res.status(500).json({ message: "Failed to fetch venues" });
  }
};