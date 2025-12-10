"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopSession = exports.processData = exports.startSession = void 0;
const session_model_1 = __importDefault(require("../model/session.model"));
let currentSession = null;
let systemOn = false;
// values từ ESP
let currentCounts = {
    "Do": 0,
    "Vang": 0,
    "Xanh": 0
};
let lastColor = null;
let lastCount = 0;
const startSession = () => __awaiter(void 0, void 0, void 0, function* () {
    if (currentSession)
        return;
    currentSession = yield session_model_1.default.create({
        startAt: new Date(),
        totalRed: 0,
        totalBlue: 0,
        totalGreen: 0,
        status: "running",
    });
    // reset RAM
    currentCounts = { "Do": 0, "Xanh": 0, "Vang": 0 };
    lastColor = null;
    lastCount = 0;
    console.log("Session started:", currentSession._id);
});
exports.startSession = startSession;
const processData = (data) => {
    if (!currentSession)
        return;
    // Nếu nhận màu → chỉ lưu lại màu cuối
    const color = data.col.toString();
    // Nếu nhận số lượng và đã có màu trước đó
    if (color == "Do") {
        currentCounts.Do += 1;
    }
    ;
    if (color == "Xanh")
        currentCounts.Xanh += 1;
    if (color == "Vang")
        currentCounts.Vang += 1;
    console.log(currentCounts);
};
exports.processData = processData;
const stopSession = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!currentSession)
        return;
    currentSession.endAt = new Date();
    currentSession.status = "stopped";
    currentSession.totalRed = currentCounts.Do;
    currentSession.totalBlue = currentCounts.Xanh;
    currentSession.totalGreen = currentCounts.Vang;
    yield currentSession.save();
    console.log("Session saved:", currentSession._id);
    currentSession = null;
});
exports.stopSession = stopSession;
