// models/Student.ts
import mongoose, { Schema, model, models } from "mongoose";

const studentSchema = new Schema(
  {
    name: { type: String, required: true },
    rollNo: { type: String, required: true }, // unique roll number within class
    email: { type: String, unique: true, sparse: true }, // optional, but unique if provided
    password: { type: String, required: true }, // store hashed password

    // Relations
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// ✅ Ensure rollNo is unique within a class
studentSchema.index({ rollNo: 1, classId: 1 }, { unique: true });

const Student = models.Student || model("Student", studentSchema);
export default Student;
