import { Router } from "express";
import {
  createBooking,
  createBookingWithItems,
  getBookings,
} from "../controllers/bookingsController.js";

const bookingsRouter = Router();

bookingsRouter.post("/", createBooking);
bookingsRouter.post("/with-items", createBookingWithItems);
bookingsRouter.get("/", getBookings);

export default bookingsRouter;
