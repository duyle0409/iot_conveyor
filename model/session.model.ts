// src/models/session.model.ts
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  startAt: Date,
  endAt: Date,
  totalRed: Number,
  totalBlue: Number,
  totalGreen: Number,
  status: { type: String, enum: ["running", "stopped"], default: "running" },
});

const SessionSchema = mongoose.model('Session', schema, "sessions");

export default SessionSchema;

