import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ClassModel from "@/models/Class";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId");
  if (!teacherId) return NextResponse.json({ error: "Missing teacherId" }, { status: 400 });
  const classes = await ClassModel.find({ teacherId });
  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  if (!body.name || !body.teacherId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const newClass = await ClassModel.create({ name: body.name, teacherId: body.teacherId });
  return NextResponse.json(newClass);
}
