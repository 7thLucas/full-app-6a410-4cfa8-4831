import type { Request, Response } from "express";
import { HotelRequestService } from "./request.service";
import type { RequestStatus, StaffRole, GuestRole } from "./request.model";

const STAFF_ROLES: StaffRole[] = ["chef", "employee"];
const GUEST_ROLES: GuestRole[] = ["customer", "vip"];
const STATUSES: RequestStatus[] = ["received", "in_progress", "fulfilled"];

export async function createRequest(req: Request, res: Response) {
  try {
    const body = req.body ?? {};
    const guestRole = body.guestRole as GuestRole;
    const routeTo = body.routeTo as StaffRole;

    if (!GUEST_ROLES.includes(guestRole)) {
      return res.status(400).json({ success: false, message: "Invalid guest role" });
    }
    if (!STAFF_ROLES.includes(routeTo)) {
      return res.status(400).json({ success: false, message: "Invalid route target" });
    }
    if (!body.itemName || !body.categoryId || !body.categoryLabel) {
      return res.status(400).json({ success: false, message: "Missing request details" });
    }

    const created = await HotelRequestService.create({
      guestName: String(body.guestName ?? "Guest"),
      guestRole,
      categoryId: String(body.categoryId),
      categoryLabel: String(body.categoryLabel),
      itemName: String(body.itemName),
      note: body.note ? String(body.note) : "",
      routeTo,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error("createRequest failed:", error);
    return res.status(500).json({ success: false, message: "Failed to place request" });
  }
}

export async function listStaffRequests(req: Request, res: Response) {
  try {
    const role = String(req.params.role) as StaffRole;
    if (!STAFF_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid staff role" });
    }
    const data = await HotelRequestService.listForStaff(role);
    return res.json({ success: true, data });
  } catch (error) {
    console.error("listStaffRequests failed:", error);
    return res.status(500).json({ success: false, message: "Failed to load queue" });
  }
}

export async function listGuestRequests(req: Request, res: Response) {
  try {
    const raw = req.query.guestName;
    const guestName = (typeof raw === "string" ? raw : "").trim();
    if (!guestName) {
      return res.json({ success: true, data: [] });
    }
    const data = await HotelRequestService.listForGuest(guestName);
    return res.json({ success: true, data });
  } catch (error) {
    console.error("listGuestRequests failed:", error);
    return res.status(500).json({ success: false, message: "Failed to load your requests" });
  }
}

export async function advanceRequest(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const next = req.body?.status as RequestStatus | undefined;
    if (next && !STATUSES.includes(next)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const updated = await HotelRequestService.advance(id, next);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("advanceRequest failed:", error);
    return res.status(500).json({ success: false, message: "Failed to update request" });
  }
}
