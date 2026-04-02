import { Router } from "express";
import { createArtist, getArtists } from "../controllers/artistsController.js";

const artistsRouter = Router();

artistsRouter.post("/", createArtist);
artistsRouter.get("/", getArtists);

export default artistsRouter;
