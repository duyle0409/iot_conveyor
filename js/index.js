"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_router_1 = __importDefault(require("./router/index.router"));
const database = __importStar(require("./config/database"));
const mqtt_1 = require("./config/mqtt");
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Tạo HTTP server để gắn Socket.IO vào
const server = http_1.default.createServer(app);
// Khởi tạo socket.io
const io = new socket_io_1.Server(server);
// Kết nối database
database.connect();
// View engine
app.set("view engine", "pug");
app.set("views", `${__dirname}/view`);
// Static folder
app.use(express_1.default.static(`${__dirname}/public/`));
// Router
app.use(index_router_1.default);
// Khởi động MQTT và truyền io vào
(0, mqtt_1.initMqtt)(io);
io.on("connection", (socket) => {
    const client = (0, mqtt_1.getClient)();
    socket.emit("mqtt_status", {
        status: (client === null || client === void 0 ? void 0 : client.connected) ? "connected" : "disconnected",
    });
});
// ---- CHỈ DÙNG server.listen ----
server.listen(3000, () => {
    console.log("Connected to port 3000");
});
