import { prisma } from "../lib/prismaClient.js";

export const createEvent = async (req, res) => {
  const { title, description, date } = req.body;

  if (!title || !date) {
    return res.status(400).json({
      message: "title and date are required",
    });
  }

  const eventDate = new Date(date);
  if (Number.isNaN(eventDate.getTime())) {
    return res.status(400).json({
      message: "date must be a valid ISO date string",
    });
  }

  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: eventDate,
      },
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Failed to create event", error);
    return res.status(500).json({ message: "Failed to create event" });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
    });

    return res.status(200).json(events);
  } catch (error) {
    console.error("Failed to fetch events", error);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
};
