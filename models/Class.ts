import mongoose, { Schema, model, models } from "mongoose";

const classSchema = new Schema({
  name: { type: String, required: true },
  teacherId: { type: String, required: true },
});

const ClassModel = models.Class || model("Class", classSchema);
export default ClassModel;
