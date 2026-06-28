import { apiRequest, apiGet } from "~/lib/api.client";
import type {
  HotelRequestDTO,
  StaffRole,
  GuestRole,
  RequestStatus,
} from "./types";

export interface PlaceRequestPayload {
  guestName: string;
  guestRole: GuestRole;
  categoryId: string;
  categoryLabel: string;
  itemName: string;
  note?: string;
  routeTo: StaffRole;
}

export async function placeRequest(payload: PlaceRequestPayload) {
  return apiRequest<HotelRequestDTO>("/api/cinq/requests", {
    method: "POST",
    data: payload,
  });
}

export async function fetchStaffQueue(role: StaffRole) {
  return apiGet<HotelRequestDTO[]>(`/api/cinq/requests/staff/${role}`);
}

export async function fetchGuestRequests(guestName: string) {
  return apiGet<HotelRequestDTO[]>("/api/cinq/requests/guest", { guestName });
}

export async function advanceRequest(id: string, status?: RequestStatus) {
  return apiRequest<HotelRequestDTO>(`/api/cinq/requests/${id}/advance`, {
    method: "PATCH",
    data: status ? { status } : {},
  });
}
