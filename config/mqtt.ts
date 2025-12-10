// src/services/mqttService.ts
import mqtt, { MqttClient } from "mqtt";
import { Server } from "socket.io";
import { startSession, stopSession, processData } from "../service/session.service";

let client: MqttClient;

export const initMqtt = (io: Server) => {
  client = mqtt.connect(`${process.env.mqtt_server}`, {
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
  });

  client.on("message", (topic: string, message: Buffer) => {
    const msg = message.toString();

    if (topic === "esp/arduino/data") {
      // --- SỬA LỖI Ở ĐÂY ---
      // Chỉ xử lý nếu chuỗi bắt đầu bằng '{' (Dấu hiệu của JSON)
      if (msg.startsWith("{")) {
        try {
          processData(JSON.parse(msg));
        } catch (error) {
          console.error("Lỗi parse JSON data:", msg);
        }
      } else {
        // Nếu không phải JSON (ví dụ: STATUS:RUNNING), chỉ in ra log
        console.log("Arduino Status:", msg);
      }
    }

    io.emit("mqtt_message", { topic, msg });
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
    socket.on("send_cmd", (cmd: string) => {
      console.log("CMD from FE:", cmd);
      publishCommand(cmd);

      if (cmd == "ON") {
        startSession()
      }
      if (cmd == "OFF" || cmd == "STOP") {
        stopSession()
      }
    });
  });
};

export const publishCommand = (cmd: string) => {
  client.publish("esp/control", cmd);
};

export const subscribeTopic = (topic: string) => {
  client.subscribe(topic);
  console.log("Subscribed to:", topic);
};

export const getClient = () => client;