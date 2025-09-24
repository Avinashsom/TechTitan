import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // hashed
});

export default mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
