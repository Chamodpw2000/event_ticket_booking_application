import { Router } from "express";
import { createEvent, getEvents } from "../controllers/eventsController.js";

const eventsRouter = Router();

eventsRouter.post("/", createEvent);
eventsRouter.get("/", getEvents);

export default eventsRouter;
