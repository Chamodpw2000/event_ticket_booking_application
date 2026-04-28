import Artist from "../models/Artist.js";
import mongoose from "mongoose";
import {
  deleteArtistProfileImageFromS3,
  uploadArtistProfileImageBase64ToS3,
} from "../lib/s3UploadImage.js";

export const createArtist = async (req, res) => {
  const { name, email, bio, genre, profileImage, isActive } = req.body;
  let uploadedS3Key = null;

  if (!name || !email) {
    return res.status(400).json({
      message: "name and email are required",
    });
  }

  if (!profileImage) {
    return res.status(400).json({
      message: "profileImage (base64) is required",
    });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const emailExists = await Artist.exists({ email: normalizedEmail });
    if (emailExists) {
      return res.status(409).json({ message: "email already exists" });
    }

    const artistId = new mongoose.Types.ObjectId();

    const uploadResult = await uploadArtistProfileImageBase64ToS3({
      artistId: artistId.toString(),
      profileImageBase64: profileImage,
    });
    const finalProfileImageUrl = uploadResult.url;
    uploadedS3Key = uploadResult.key;

    const artist = await Artist.create({
      _id: artistId,
      name,
      email: normalizedEmail,
      bio,
      genre,
      profileImageUrl: finalProfileImageUrl,
      isActive,
    });

    return res.status(201).json(artist);
  } catch (error) {
    console.error("Failed to create artist", error);

    if (uploadedS3Key) {
      try {
        await deleteArtistProfileImageFromS3({ key: uploadedS3Key });
      } catch (cleanupError) {
        console.error("Failed to cleanup uploaded profile image", cleanupError);
      }
    }

    if (
      typeof error?.message === "string" &&
      (error.message.startsWith("profileImage") ||
        error.message.startsWith("S3_") ||
        error.message.startsWith("Unable to determine image"))
    ) {
      return res.status(400).json({ message: error.message });
    }

    if (error?.code === 11000) {
      return res.status(409).json({
        message: "email already exists",
      });
    }

    return res.status(500).json({ message: "Failed to create artist" });
  }
};

export const getArtists = async (req, res) => {
  try {
    const artists = await Artist.find().sort({ createdAt: -1 });

    return res.status(200).json(artists);
  } catch (error) {
    console.error("Failed to fetch artists", error);
    return res.status(500).json({ message: "Failed to fetch artists" });
  }
};

export const getArtistById = async (req, res) => {
  const { id } = req.params;

  try {
    const artist = await Artist.findById(id);

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    return res.status(200).json(artist);
  } catch (error) {
    console.error("Failed to fetch artist", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid artist id format" });
    }
    return res.status(500).json({ message: "Failed to fetch artist" });
  }
};
