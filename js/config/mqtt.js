"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.subscribeTopic = exports.publishCommand = exports.initMqtt = void 0;
// src/services/mqttService.ts
const mqtt_1 = __importDefault(require("mqtt"));
const session_service_1 = require("../service/session.service");
let client;
const initMqtt = (io) => {
    client = mqtt_1.default.connect(`${process.env.mqtt_server}`, {
        username: `${process.env.mqtt_username}`,
        password: `${process.env.mqtt_password}`,
    });
    client.on("connect", () => {
        io.emit("mqtt_status", {
            status: "connected",
            message: "MQTT Broker connected successfully"
        });
        console.log("MQTT connected");
        // Subscribe cố định
        client.subscribe("esp/status");
        client.subscribe("esp/arduino/data");
    });
    // Nhận message → gửi sang FE qua Socket.io
    client.on("message", (topic, message) => {
        const msg = message.toString();
        if (topic === "esp/arduino/data") {
            (0, session_service_1.processData)(JSON.parse(msg));
        }
        io.emit("mqtt_message", { topic, msg });
    });
    io.on("connection", (socket) => {
        socket.on("send_cmd", (cmd) => {
            console.log("CMD from FE:", cmd);
            (0, exports.publishCommand)(cmd);
            if (cmd == "ON") {
                (0, session_service_1.startSession)();
            }
            if (cmd == "OFF" || cmd == "STOP") {
                (0, session_service_1.stopSession)();
            }
        });
    });
};
exports.initMqtt = initMqtt;
// Publish lệnh cho ESP
const publishCommand = (cmd) => {
    client.publish("esp/control", cmd);
};
exports.publishCommand = publishCommand;
// Subscribe động
const subscribeTopic = (topic) => {
    client.subscribe(topic);
    console.log("Subscribed to:", topic);
};
exports.subscribeTopic = subscribeTopic;
const getClient = () => client;
exports.getClient = getClient;
