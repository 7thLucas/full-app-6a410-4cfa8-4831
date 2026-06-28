export type RequestStatus = "received" | "in_progress" | "fulfilled";
export type StaffRole = "chef" | "employee";
export type GuestRole = "customer" | "vip";
export type Role = GuestRole | StaffRole;

export interface HotelRequestDTO {
  _id: string;
  guestName: string;
  guestRole: GuestRole;
  priority: boolean;
  categoryId: string;
  categoryLabel: string;
  itemName: string;
  note: string;
  routeTo: StaffRole;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  received: "Received",
  in_progress: "In Progress",
  fulfilled: "Fulfilled",
};

export const ROLE_LABELS: Record<Role, string> = {
  customer: "Customer",
  vip: "VIP",
  employee: "Employee",
  chef: "Chef",
};
