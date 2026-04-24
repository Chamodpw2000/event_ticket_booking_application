import { Router } from "express";
import {
  createBooking,
  createBookingWithItems,
  checkPaymentAvailability,
  confirmBooking,
  getBookingById,
  getBookings,
  startCreateBookingSaga,
  expireStalePendingBookings,
} from "../controllers/bookingsController.js";
import { cancelBooking } from "../controllers/bookingCompensationController.js";

const bookingsRouter = Router();
// Expire stale PENDING bookings (created within 1 h, unpaid for > 15 min).
bookingsRouter.patch("/expire-stale", expireStalePendingBookings);
bookingsRouter.post("/", createBooking);
bookingsRouter.post("/with-items", createBookingWithItems);
// SAGA: create booking + reserve inventory (Step Functions).
bookingsRouter.post("/saga", startCreateBookingSaga);
bookingsRouter.get("/", getBookings);
bookingsRouter.get("/:bookingId/payment-availability", checkPaymentAvailability);
bookingsRouter.get("/:bookingId", getBookingById);

// Confirm booking after payment succeeds.
bookingsRouter.patch("/:bookingId/confirm", confirmBooking);

// Compensation endpoint (SAGA): cancel booking if later steps fail.
bookingsRouter.patch("/:bookingId/cancel", cancelBooking);



export default bookingsRouter;
