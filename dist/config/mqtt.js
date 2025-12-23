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
        client.subscribe("esp/status");
        client.subscribe("esp/arduino/data");
        client.subscribe("esp/ack");
    });
    client.on("message", (topic, message) => {
        const msg = message.toString();
        if (topic === "esp/arduino/data") {
            if (msg.startsWith("{")) {
                try {
                    (0, session_service_1.processData)(JSON.parse(msg));
                    io.emit("mqtt_data", { msg });
                }
                catch (error) {
                    console.error("Lỗi parse JSON data:", msg);
                }
            }
            else {
                // Nếu không phải JSON (ví dụ: STATUS:RUNNING), chỉ in ra log
                console.log("Arduino Status:", msg);
            }
        }
        if (topic === "esp/status") {
            if (msg == "OFF") {
                (0, session_service_1.stopSession)();
            }
            else {
                (0, session_service_1.startSession)();
            }
            io.emit("mqtt_status", { msg });
        }
    });
    client.on("error", (err) => {
        console.error("MQTT Error:", err);
    });
    client.on("offline", () => {
        console.warn("MQTT Offline");
    });
    client.on("reconnect", () => {
        console.log("MQTT Reconnecting..");
    });
    io.on("connection", (socket) => {
        socket.on("send_cmd", (cmd) => {
            console.log("CMD from FE:", cmd);
            if (cmd == "WIFI") {
                (0, exports.publishCommand)("esp/arduino/wifi", cmd);
                return;
            }
            (0, exports.publishCommand)("esp/control", cmd);
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
const publishCommand = (topic, cmd) => {
    client.publish(topic, cmd);
};
exports.publishCommand = publishCommand;
const subscribeTopic = (topic) => {
    client.subscribe(topic);
    console.log("Subscribed to:", topic);
};
exports.subscribeTopic = subscribeTopic;
const getClient = () => client;
exports.getClient = getClient;
