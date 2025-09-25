import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAttendanceCode extends Document {
  classId: mongoose.Types.ObjectId;
  code: string;
  expiresAt: Date;
  date: Date; // normalized Date of the class/session
}

const AttendanceCodeSchema: Schema<IAttendanceCode> = new Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true } // optional, helps track creation/update time
);

// Prevent model overwrite in development
const AttendanceCode: Model<IAttendanceCode> =
  mongoose.models.AttendanceCode ||
  mongoose.model<IAttendanceCode>("AttendanceCode", AttendanceCodeSchema);

export default AttendanceCode;
