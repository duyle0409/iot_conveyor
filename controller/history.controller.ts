// src/controller/dashboard.controller.ts
import { Request, Response } from "express";
import { PaginationHelper } from "../helper/pagination.helper";
import Session from "../model/session.model";

export const index = async (req: Request, res: Response) => {
  const { filterColor, sortBy, order } = req.query;
  let query: any = { status: "stopped" };

  // 1. Lọc theo màu sắc (Nếu tổng số lượng màu đó > 0)
  if (filterColor === "blue") query.totalBlue = { $gt: 0 };
  if (filterColor === "red") query.totalRed = { $gt: 0 };
  if (filterColor === "green") query.totalGreen = { $gt: 0 };

  // 2. Lọc theo thời gian (Ví dụ lọc các session trong hôm nay)
  if (req.query.today === "true") {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    query.startAt = { $gte: startOfToday };
  }
  

  //Pagination 
  const countRecord = await Session.countDocuments();
  const pagination = PaginationHelper(req, countRecord, 5);

  // 3. Sắp xếp
  let sortOptions: any = {};
  if (sortBy) {
    // order = 'asc' hoặc 'desc'
    sortOptions[sortBy as string] = order === "asc" ? 1 : -1;
  } else {
    sortOptions.startAt = -1; // Mặc định mới nhất lên đầu
  }

  const sessionList = await Session.find(query).sort(sortOptions).limit(pagination.limit).skip(pagination.skip ?? 0);

  res.render("history/index", {
    sessionList: sessionList,
    filters: req.query ,// Gửi lại filter để giữ trạng thái trên giao diện
    objectPagination: pagination,
    pageTitle: "Thống kê"
  });
}