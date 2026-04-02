import { prisma } from "../lib/prismaClient.js";

export const createArtist = async (req, res) => {
  const { name, email, bio, genre, profileImageUrl, isActive } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: "name and email are required",
    });
  }

  try {
    const artist = await prisma.artist.create({
      data: {
        name,
        email,
        bio,
        genre,
        profileImageUrl,
        isActive,
      },
    });

    return res.status(201).json(artist);
  } catch (error) {
    console.error("Failed to create artist", error);

    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "email already exists",
      });
    }

    return res.status(500).json({ message: "Failed to create artist" });
  }
};

export const getArtists = async (req, res) => {
  try {
    const artists = await prisma.artist.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(artists);
  } catch (error) {
    console.error("Failed to fetch artists", error);
    return res.status(500).json({ message: "Failed to fetch artists" });
  }
};
