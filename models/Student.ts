// models/Student.ts
import mongoose, { Schema, model, models } from "mongoose";

const studentSchema = new Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true },      // unique student ID
  class: { type: String, required: true },
  email: { type: String },                        // optional
  password: { type: String, required: true },    // hashed password
});

const Student = models.Student || model("Student", studentSchema);
export default Student;
