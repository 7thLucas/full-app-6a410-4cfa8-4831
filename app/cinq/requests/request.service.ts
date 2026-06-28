import {
  HotelRequestModel,
  type RequestStatus,
  type StaffRole,
  type GuestRole,
} from "./request.model";

export interface CreateRequestInput {
  guestName: string;
  guestRole: GuestRole;
  categoryId: string;
  categoryLabel: string;
  itemName: string;
  note?: string;
  routeTo: StaffRole;
}

const STATUS_ORDER: RequestStatus[] = [
  "received",
  "in_progress",
  "fulfilled",
];

export class HotelRequestService {
  /**
   * Place a new request. VIP guests automatically carry priority.
   */
  static async create(input: CreateRequestInput) {
    const priority = input.guestRole === "vip";
    const doc = await HotelRequestModel.create({
      guestName: input.guestName.trim() || "Guest",
      guestRole: input.guestRole,
      priority,
      categoryId: input.categoryId,
      categoryLabel: input.categoryLabel,
      itemName: input.itemName,
      note: input.note?.trim() ?? "",
      routeTo: input.routeTo,
      status: "received",
    });
    return doc.toObject();
  }

  /**
   * Requests visible to a staff role's live queue.
   * Active (not fulfilled) items first, VIP-priority surfaced to the top,
   * then by recency. Recently-fulfilled items trail behind for context.
   */
  static async listForStaff(routeTo: StaffRole) {
    const docs = await HotelRequestModel.find({
      routeTo,
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .limit(80)
      .lean()
      .exec();

    return docs.sort((a, b) => {
      const aFulfilled = a.status === "fulfilled" ? 1 : 0;
      const bFulfilled = b.status === "fulfilled" ? 1 : 0;
      if (aFulfilled !== bFulfilled) return aFulfilled - bFulfilled;
      // both active or both fulfilled
      if (aFulfilled === 0) {
        const aP = a.priority ? 0 : 1;
        const bP = b.priority ? 0 : 1;
        if (aP !== bP) return aP - bP;
      }
      return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
    });
  }

  /**
   * A guest's own requests, newest first.
   */
  static async listForGuest(guestName: string) {
    return HotelRequestModel.find({
      guestName: guestName.trim(),
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();
  }

  /**
   * Advance a request to the next status in the loop, or set it directly.
   */
  static async advance(id: string, nextStatus?: RequestStatus) {
    const doc = await HotelRequestModel.findById(id).exec();
    if (!doc) return null;

    let target = nextStatus;
    if (!target) {
      const idx = STATUS_ORDER.indexOf(doc.status);
      target = STATUS_ORDER[Math.min(idx + 1, STATUS_ORDER.length - 1)];
    }

    doc.status = target;
    await doc.save();
    return doc.toObject();
  }
}
