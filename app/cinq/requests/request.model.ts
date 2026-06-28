import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export type RequestStatus = "received" | "in_progress" | "fulfilled";
export type StaffRole = "chef" | "employee";
export type GuestRole = "customer" | "vip";

/**
 * HotelRequest — a single live request/booking in the Cinq loop.
 *
 * A guest (customer or vip) places it; it routes to a staff role
 * (chef or employee); staff advance its status; the guest watches
 * the status change in real time.
 */
@modelOptions({
  schemaOptions: {
    collection: "tbl_cinq_requests",
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class HotelRequest extends CommonTypegooseEntity {
  // Who placed it
  @prop({ type: String, required: true })
  guestName!: string;

  @prop({ type: String, required: true, enum: ["customer", "vip"] })
  guestRole!: GuestRole;

  // Whether this carries VIP priority
  @prop({ type: Boolean, default: false })
  priority!: boolean;

  // What was requested
  @prop({ type: String, required: true })
  categoryId!: string;

  @prop({ type: String, required: true })
  categoryLabel!: string;

  @prop({ type: String, required: true })
  itemName!: string;

  @prop({ type: String, default: "" })
  note!: string;

  // Where it routes
  @prop({ type: String, required: true, enum: ["chef", "employee"] })
  routeTo!: StaffRole;

  // Live status of the loop
  @prop({
    type: String,
    required: true,
    enum: ["received", "in_progress", "fulfilled"],
    default: "received",
  })
  status!: RequestStatus;
}

export const HotelRequestModel = getModelForClass(HotelRequest);
