import { Router } from "express";
import {
	createEvent,
	getEvents,
	addEventArtists,
	addEventTicketType,
	deleteEventTicketType,
	startAddTicketWithInventorySaga,
} from "../controllers/eventsController.js";

const eventsRouter = Router();

eventsRouter.post("/", createEvent);
eventsRouter.get("/", getEvents);
eventsRouter.post("/:eventId/artists", addEventArtists);
eventsRouter.post("/:eventId/ticket-types", addEventTicketType);
eventsRouter.post("/ticket-types/saga", startAddTicketWithInventorySaga);
eventsRouter.delete("/ticket-types/:ticketTypeId", deleteEventTicketType);

export default eventsRouter;
