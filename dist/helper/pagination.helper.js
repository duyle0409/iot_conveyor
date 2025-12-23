"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationHelper = void 0;
const PaginationHelper = (req, totalRecord, limit) => {
    const pagination = {
        limit: limit,
        page: 1
    };
    if (req.query.page && parseInt(`${req.query.page}`) > 0) {
        pagination.page = parseInt(`${req.query.page}`);
    }
    pagination.totalPage = Math.ceil(totalRecord / pagination.limit);
    pagination.skip = (pagination.page - 1) * pagination.limit;
    return pagination;
};
exports.PaginationHelper = PaginationHelper;
