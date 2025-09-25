import mongoose, { Schema, model, models, Document, Types } from "mongoose";

// 1. Define TypeScript interface for Attendance document
export interface IAttendance extends Document {
  method: "manual" | "code";
  teacherId?: Types.ObjectId;
  classId: Types.ObjectId;
  subject?: string;
  date: Date;
  studentId?: Types.ObjectId;
  status?: "Present" | "Absent";
  records: {
    studentId: Types.ObjectId;
    status: "Present" | "Absent";
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create Schema
const AttendanceSchema = new Schema<IAttendance>(
  {
    method: {
      type: String,
      enum: ["manual", "code"],
      required: true,
    },

    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function (this: IAttendance) {
        return this.method === "manual";
      },
    },

    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    subject: {
      type: String,
      required: function (this: IAttendance) {
        return this.method === "manual";
      },
    },

    date: {
      type: Date,
      required: true,
    },

    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function (this: IAttendance) {
        return this.method === "code";
      },
    },

    status: {
      type: String,
      enum: ["Present", "Absent"],
      default: "Present",
      required: function (this: IAttendance) {
        return this.method === "code";
      },
    },

    records: {
      type: [
        {
          studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
          status: { type: String, enum: ["Present", "Absent"], required: true },
        },
      ],
      default: [],
      validate: {
        validator: function (this: IAttendance, arr: any[]) {
          return this.method !== "manual" || arr.length > 0;
        },
        message: "At least one record is required for manual attendance",
      },
    },
  },
  { timestamps: true }
);

// 3. Indexes to prevent duplicates
AttendanceSchema.index(
  { teacherId: 1, classId: 1, subject: 1, date: 1 },
  { unique: true, partialFilterExpression: { method: "manual" } }
);

AttendanceSchema.index(
  { studentId: 1, classId: 1, date: 1 },
  { unique: true, partialFilterExpression: { method: "code" } }
);

// 4. Create model
const Attendance = models.Attendance || model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
