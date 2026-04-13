import { Router } from "express";
import { createTicket, getTickets } from "../controllers/ticketsController.js";

const ticketsRouter = Router();

ticketsRouter.post("/", createTicket);
ticketsRouter.get("/", getTickets);

export default ticketsRouter;
