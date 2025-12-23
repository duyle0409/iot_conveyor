const socket = io();

/* ================= TOAST ================= */
const showToast = (message, type = "success") => {
  let background = "linear-gradient(to right, #00b09b, #96c93d)";

  if (type === "error") {
    background = "linear-gradient(to right, #ff5f6d, #ffc371)";
  }

  if (type === "info") {
    background = "linear-gradient(to right, #2193b0, #6dd5ed)";
  }

  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: background,
  }).showToast();

  sessionStorage.removeItem("toast");
};

const drawToast = (message, type = "success") => {
  sessionStorage.setItem(
    "toast",
    JSON.stringify({ type, message })
  );
};

const toast = sessionStorage.getItem("toast");
if (toast) {
  const { type, message } = JSON.parse(toast);
  showToast(message, type);
}

/* ================= DOM ================= */
const statusEl = document.getElementById("systemStatus");
const speedEl = document.getElementById("currentSpeed");

/* ================= STATE ================= */
let systemOn = false;
let countXanh = 0;
let countDo = 0;
let countVang = 0;

// chống spam toast màu
let lastColorTime = 0;
const COLOR_TOAST_DELAY = 1200;

// /* ================= MQTT STATUS ================= */
// socket.on("", (data) => {
  
// });

/* ================= MQTT MESSAGE ================= */
socket.on("mqtt_status", (data) => {
  /* ===== ESP STATUS ===== */
    console.log(data)
    if (data.status === "ON") {
      systemOn = true;
      showToast("Hệ thống đã bật", "success");
    }

    if (data.status === "OFF" || data.status === "STOP") {
      systemOn = false;
      showToast("Hệ thống đã dừng", "error");
    }

    if (data.status === "connected") {
      statusEl.innerText = "Kết nối thành công";
      statusEl.className = "connected";
      showToast("MQTT đã kết nối", "success");
    }

    if (data.status === "disconnected") {
      statusEl.innerText = "Mất kết nối";
      statusEl.className = "disconnected";
      showToast("MQTT bị mất kết nối", "error");
    }
})
socket.on("mqtt_data", (data) => {
  /* ===== ARDUINO DATA ===== */

    try {
      const jsonData = JSON.parse(data.msg);

      /* ===== COUNT COLOR ===== */
      if (jsonData.col) {
        const now = Date.now();

        if (jsonData.col === "Xanh") countXanh++;
        if (jsonData.col === "Do") countDo++;
        if (jsonData.col === "Vang") countVang++;

        updateCountUI();

        if (now - lastColorTime > COLOR_TOAST_DELAY) {
          showToast(`Phát hiện màu ${jsonData.col}`, "info");
          lastColorTime = now;
        }
      }

      /* ===== SPEED ===== */
      if (jsonData.spd) {
        speedEl.textContent = jsonData.spd;
        showToast(`Tốc độ đã thay đổi ${jsonData.spd}`, "info");
      }

    } catch (err) {
      console.error("JSON Error:", err);
      showToast("Lỗi dữ liệu từ Arduino", "error");
    }
  
}) 

/* ================= UI UPDATE ================= */
function updateCountUI() {
  document.getElementById("countXanh").textContent = `Xanh: ${countXanh}`;
  document.getElementById("countDo").textContent = `Đỏ: ${countDo}`;
  document.getElementById("countVang").textContent = `Vàng: ${countVang}`;
}

/* ================= SEND CMD ================= */
function sendCmd(cmd) {
  socket.emit("send_cmd", cmd);
  showToast(`Đã gửi lệnh: ${cmd}`, "success");

  if (cmd === "ON") systemOn = true;
  if (cmd === "OFF"){ 
    countDo = countVang = countXanh = 0;
    systemOn = false
    updateCountUI()
  };

  if (cmd === "SPEED:1") speedEl.textContent = "50";
  if (cmd === "SPEED:2") speedEl.textContent = "70";
  if (cmd === "SPEED:3") speedEl.textContent = "100";
}


const button_page = document.querySelectorAll("[button-page]");
if(button_page.length > 0) {
    button_page.forEach((button) => {
        const url = new URL(window.location.href)
        button.addEventListener("click", () => {
            if(button.getAttribute("button-page"))
                url.searchParams.set("page",button.getAttribute("button-page"))
            else
                url.searchParams.delete("page")
            window.location.href = url 
        })
    })
}