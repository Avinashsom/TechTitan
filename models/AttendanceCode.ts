import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAttendanceCode extends Document {
  classId: mongoose.Types.ObjectId;
  code: string;
  expiresAt: Date;
  date: string; // yyyy-mm-dd string
}

const AttendanceCodeSchema: Schema<IAttendanceCode> = new Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  date: { type: String, required: true },  // yyyy-mm-dd date string
});

// Use mongoose.models to prevent model overwrite errors in development
const AttendanceCode: Model<IAttendanceCode> =
  mongoose.models.AttendanceCode || mongoose.model<IAttendanceCode>('AttendanceCode', AttendanceCodeSchema);

export default AttendanceCode;
