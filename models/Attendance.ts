// models/Attendance.ts
import mongoose, { Schema, model, models } from "mongoose";

const AttendanceSchema = new Schema({
  teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
  subject: { type: String, required: true },
  date: { type: String, required: true }, // stored as yyyy-mm-dd
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
        return arr.length > 0; // must contain at least 1 student
      },
      message: "At least one attendance record is required",
    },
  },
});

// ✅ Prevent duplicate attendance for same teacher+class+subject+date
AttendanceSchema.index(
  { teacherId: 1, classId: 1, subject: 1, date: 1 },
  { unique: true }
);

const Attendance =
  models.Attendance || model("Attendance", AttendanceSchema);

export default Attendance;
