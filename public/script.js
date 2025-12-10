const socket = io();
const statusEl = document.getElementById("systemStatus");
const speedEl = document.getElementById("currentSpeed");

let systemOn = false;
let countXanh = 0, countDo = 0, countVang = 0;

socket.on("mqtt_status", (data) => {
  statusEl.innerText = `MQTT: ${data.status}`;
});

socket.on("mqtt_message", (data) => {
  if (data.topic === "esp/status") {
    statusEl.textContent = data.msg;
    if (data.msg === "ON") systemOn = true;
    else if (data.msg === "OFF" || data.msg === "STOP") {
      systemOn = false;
    }
  }
  else if (data.topic === "esp/arduino/data") {
    try {
      const jsonData = JSON.parse(data.msg);

      // Cập nhật bộ đếm màu
      if (jsonData.col) {
        if (jsonData.col === "Xanh") countXanh++;
        else if (jsonData.col === "Do") countDo++;
        else if (jsonData.col === "Vang") countVang++;
        updateCountUI();
      }

      // Cập nhật hiển thị tốc độ (nếu Arduino gửi lên)
      if (jsonData.spd) {
        speedEl.textContent = jsonData.spd;
      }

    } catch (err) {
      console.error("JSON Error:", err);
    }
  }
});

function updateCountUI() {
  document.getElementById("countXanh").textContent = `Xanh: ${countXanh}`;
  document.getElementById("countDo").textContent = `Đỏ: ${countDo}`;
  document.getElementById("countVang").textContent = `Vàng: ${countVang}`;
}

function sendCmd(cmd) {
  console.log("Sending:", cmd);
  socket.emit("send_cmd", cmd);

  // Cập nhật giao diện ngay lập tức cho mượt
  if (cmd === "ON") systemOn = true;
  if (cmd === "SPEED:1") speedEl.textContent = "50";
  if (cmd === "SPEED:2") speedEl.textContent = "70";
  if (cmd === "SPEED:3") speedEl.textContent = "100";
}