import { Router } from "express";
import {
	createEvent,
	getEvents,
	addEventArtists,
	addEventTicketType,
} from "../controllers/eventsController.js";

const eventsRouter = Router();

eventsRouter.post("/", createEvent);
eventsRouter.get("/", getEvents);
eventsRouter.post("/:eventId/artists", addEventArtists);
eventsRouter.post("/:eventId/ticket-types", addEventTicketType);

export default eventsRouter;
