import { Router } from "express";
import {
  createRequest,
  listStaffRequests,
  listGuestRequests,
  advanceRequest,
} from "./request.controller";

const router = Router();

// Guest places a request / booking
router.post("/cinq/requests", createRequest);

// Guest tracks their own live requests
router.get("/cinq/requests/guest", listGuestRequests);

// Staff live queue (chef | employee)
router.get("/cinq/requests/staff/:role", listStaffRequests);

// Staff advances a request through the loop
router.patch("/cinq/requests/:id/advance", advanceRequest);

export default router;
