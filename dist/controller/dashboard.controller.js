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
exports.dashboard = void 0;
const session_model_1 = __importDefault(require("../model/session.model"));
const dashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { filterColor, sortBy, order } = req.query;
    let query = { status: "stopped" };
    // 1. Lọc theo màu sắc (Nếu tổng số lượng màu đó > 0)
    if (filterColor === "blue")
        query.totalBlue = { $gt: 0 };
    if (filterColor === "red")
        query.totalRed = { $gt: 0 };
    if (filterColor === "green")
        query.totalGreen = { $gt: 0 };
    // 2. Lọc theo thời gian (Ví dụ lọc các session trong hôm nay)
    if (req.query.today === "true") {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        query.startAt = { $gte: startOfToday };
    }
    // 3. Sắp xếp
    let sortOptions = {};
    if (sortBy) {
        // order = 'asc' hoặc 'desc'
        sortOptions[sortBy] = order === "asc" ? 1 : -1;
    }
    else {
        sortOptions.startAt = -1; // Mặc định mới nhất lên đầu
    }
    const sessionList = yield session_model_1.default.find(query).sort(sortOptions);
    res.render("dashboard/dashboard", {
        sessionList: sessionList,
        filters: req.query, // Gửi lại filter để giữ trạng thái trên giao diện
        pageTitle: "Tổng quan"
    });
});
exports.dashboard = dashboard;
