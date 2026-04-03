import { Router } from "express";
import {
	createEvent,
	getEvents,
	addEventArtists,
	addEventTicketType,
	updateEventInventory,
} from "../controllers/eventsController.js";

const eventsRouter = Router();

eventsRouter.post("/", createEvent);
eventsRouter.get("/", getEvents);
eventsRouter.post("/:eventId/artists", addEventArtists);
eventsRouter.post("/:eventId/ticket-types", addEventTicketType);
eventsRouter.put("/:eventId/inventory/:ticketTypeId", updateEventInventory);

export default eventsRouter;
