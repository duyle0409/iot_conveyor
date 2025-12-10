const socket = io("https://iot-pj20.onrender.com");
const statusEl = document.getElementById("systemStatus");

// Biến trạng thái hệ thống
let systemOn = false;

// Biến đếm
let countXanh = 0, countDo = 0, countVang = 0;

// Nhận trạng thái MQTT
socket.on("mqtt_status", (data) => {
  console.log("MQTT STATUS:", data);
  statusEl.innerText = `MQTT: ${data.status}`;
});

// Nhận dữ liệu Arduino
socket.on("mqtt_message", (data) => {
  // Trạng thái hệ thống
  if (data.topic === "esp/status") {
    statusEl.textContent = data.msg;

    // Cập nhật biến systemOn dựa vào trạng thái
    if (data.msg === "ON") {
      systemOn = true;
    } else if (data.msg === "OFF" || data.msg === "STOP") {
      systemOn = false;

      // Reset dữ liệu khi tắt/dừng
      countXanh = 0;
      countDo = 0;
      countVang = 0;

      document.getElementById("countXanh").textContent = `Xanh: 0`;
      document.getElementById("countDo").textContent = `Đỏ: 0`;
      document.getElementById("countVang").textContent = `Vàng: 0`;
    }
  }
  // Dữ liệu Arduino
  else if (data.topic === "esp/arduino/data" && systemOn) {
    try {
      const dataCount = JSON.parse(data.msg);  // msg phải là JSON string
      console.log(dataCount);

      if (dataCount.col) {
        if (dataCount.col === "Xanh") countXanh++;
        else if (dataCount.col === "Do") countDo++;
        else if (dataCount.col === "Vang") countVang++;

        updateCount();
        
      }
    } catch (err) {
      console.error("JSON parse error:", err);
    }
  }
});

function updateCount () {
  document.getElementById("countXanh").textContent = `Xanh: ${countXanh}`;
  document.getElementById("countDo").textContent = `Đỏ: ${countDo}`;
  document.getElementById("countVang").textContent = `Vàng: ${countVang}`;
}

// Gửi lệnh từ FE
function sendCmd(cmd) {
  console.log(cmd);
  socket.emit("send_cmd", cmd);

  if(cmd == "ON") {
    systemOn = true;
  }

  if(cmd == "OFF" || cmd == "STOP"){
    systemOn = false;
    countXanh = countDo = countVang = 0;
    updateCount();
    window.location.reload();
  }
}
