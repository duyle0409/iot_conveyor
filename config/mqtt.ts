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
    client.subscribe("esp/ack");
  });

  client.on("message", (topic: string, message: Buffer) => {
    const msg = message.toString();

    if (topic === "esp/arduino/data") {
      if (msg.startsWith("{")) {
        try {
          processData(JSON.parse(msg));
          io.emit("mqtt_data", { msg });
        } catch (error) {
          console.error("Lỗi parse JSON data:", msg);
        }
      } else {
        // Nếu không phải JSON (ví dụ: STATUS:RUNNING), chỉ in ra log
        console.log("Arduino Status:", msg);
      }
    }

    if (topic === "esp/status") {
      if(msg == "OFF"){
        stopSession();
      }
      else{
        startSession();
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
    socket.on("send_cmd", (cmd: string) => {
      console.log("CMD from FE:", cmd);

      if(cmd == "WIFI"){
        publishCommand("esp/arduino/wifi",cmd);
        return;
      }
      publishCommand("esp/control", cmd);

      if (cmd == "ON") {
        startSession()
      }
      if (cmd == "OFF" || cmd == "STOP") {
        stopSession()
      }
    });
  });
};

export const publishCommand = (topic: string, cmd: string) => {
  client.publish(topic, cmd);
};

export const subscribeTopic = (topic: string) => {
  client.subscribe(topic);
  console.log("Subscribed to:", topic);
};

export const getClient = () => client;