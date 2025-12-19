import express, { Request, Response } from "express";
import dotenv from "dotenv";
import router from "./router/index.router";
import * as database from "./config/database";
import { initMqtt, getClient } from "./config/mqtt";
import { Server } from "socket.io";
import http from "http";
import path from "path";

dotenv.config();

const app = express();

// Tạo HTTP server để gắn Socket.IO vào
const server = http.createServer(app);

// Khởi tạo socket.io
const io = new Server(server);

// Kết nối database
database.connect();

// Router
app.use(router);

// View engine
app.set("view engine", "pug");
app.engine("html", require("ejs").renderFile);
// app.set("views", `${__dirname}/view`);
app.set("views", path.join(__dirname, "view"));

// Static folder
// app.use(express.static(`${__dirname}/public/`));
app.use(express.static(path.join(__dirname, "public")));

// Khởi tạo MQTT và truyền io vào
initMqtt(io);

io.on("connection", (socket) => {
  const client = getClient();

  socket.emit("mqtt_status", {
    status: client?.connected ? "connected" : "disconnected",
  });
});

// ---- CHỈ DÙNG server.listen ----
const port = process.env.PORT || 3000;
server.listen(3000, () => {
  console.log("Connected to port 3000");
});
