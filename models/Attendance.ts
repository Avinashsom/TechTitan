// models/Attendance.ts

import mongoose, { Schema, model, models } from "mongoose";

const AttendanceSchema = new Schema({
  method: {
    type: String,
    enum: ["manual", "code"],
    required: true,
  },

  teacherId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: function (this: any) {
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
    required: function (this: mongoose.Document) {
      return (this as any).method === "manual";
    },
  },

  date: {
    type: String,
    required: true, // always required for both methods
  },

  studentId: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: function (this: mongoose.Document) {
      return (this as any).method === "code";
    },
  },

  status: {
    type: String,
    enum: ["Present", "Absent"],
    required: function (this: mongoose.Document) {
      return (this as any).method === "code";
    },
  },

  // For manual attendance: array of records
  records: {
    type: [
      {
        studentId: {
          type: Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        status: {
          type: String,
          enum: ["Present", "Absent"],
          required: true,
        },
      },
    ],
    validate: {
      validator: function (arr: any[]) {
        // Only validate if method is 'manual'
        return (this as any).method !== "manual" || arr.length > 0;
      },
      message: "At least one attendance record is required for manual method.",
    },
  },
});

// ✅ Prevent duplicate manual attendance
AttendanceSchema.index(
  { teacherId: 1, classId: 1, subject: 1, date: 1 },
  {
    unique: true,
    partialFilterExpression: { method: "manual" }, // only apply to manual
  }
);

// ✅ Prevent duplicate code-based entries per student/class/date
AttendanceSchema.index(
  { studentId: 1, classId: 1, date: 1 },
  {
    unique: true,
    partialFilterExpression: { method: "code" }, // only apply to code-based
  }
);

const Attendance =
  models.Attendance || model("Attendance", AttendanceSchema);

export default Attendance;
