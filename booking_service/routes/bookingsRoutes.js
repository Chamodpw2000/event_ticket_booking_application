import { Router } from "express";
import {
  createBooking,
  createBookingWithItems,
  getBookings,
} from "../controllers/bookingsController.js";
import { cancelBooking } from "../controllers/bookingCompensationController.js";

const bookingsRouter = Router();

bookingsRouter.post("/", createBooking);
bookingsRouter.post("/with-items", createBookingWithItems);
bookingsRouter.get("/", getBookings);

// Compensation endpoint (SAGA): cancel booking if later steps fail.
bookingsRouter.patch("/:bookingId/cancel", cancelBooking);

export default bookingsRouter;
