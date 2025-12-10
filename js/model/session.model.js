"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/session.model.ts
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    startAt: Date,
    endAt: Date,
    totalRed: Number,
    totalBlue: Number,
    totalGreen: Number,
    status: { type: String, enum: ["running", "stopped"], default: "running" },
});
const SessionSchema = mongoose_1.default.model('Session', schema, "sessions");
exports.default = SessionSchema;
