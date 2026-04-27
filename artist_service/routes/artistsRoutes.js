import { Router } from "express";
import { createArtist, getArtists, getArtistById } from "../controllers/artistsController.js";

const artistsRouter = Router();

artistsRouter.post("/", createArtist);
artistsRouter.get("/", getArtists);
artistsRouter.get("/:id", getArtistById);

export default artistsRouter;
