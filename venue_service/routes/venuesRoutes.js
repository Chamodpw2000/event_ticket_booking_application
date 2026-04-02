import { Router } from "express";
import { createVenue, getVenues } from "../controllers/venuesController.js";

const venuesRouter = Router();

venuesRouter.post("/", createVenue);
venuesRouter.get("/", getVenues);

export default venuesRouter;