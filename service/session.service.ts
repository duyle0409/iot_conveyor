import Session from "../model/session.model";

let currentSession: any = null;
let currentCounts = { "Do": 0, "Vang": 0, "Xanh": 0 };

export const startSession = async () => {
  if (currentSession) return;
  currentSession = await Session.create({
    startAt: new Date(),
    totalRed: 0, totalBlue: 0, totalGreen: 0,
    status: "running",
  });
  currentCounts = { "Do": 0, "Xanh": 0, "Vang": 0 };
  console.log("Session started:", currentSession._id);
};

export const processData = (data: any) => {
  if (!currentSession) return;

  // QUAN TRỌNG: Chỉ đếm nếu có thuộc tính 'col' (màu)
  // Nếu là gói tin tốc độ {"speed": 37} thì bỏ qua
  if (data.col) {
    const color = data.col.toString();
    if (color == "Do") currentCounts.Do += 1;
    if (color == "Xanh") currentCounts.Xanh += 1;
    if (color == "Vang") currentCounts.Vang += 1;

    console.log("Count update:", currentCounts);
  }
};

export const stopSession = async () => {
  if (!currentSession) return;
  currentSession.endAt = new Date();
  currentSession.status = "stopped";
  currentSession.totalRed = currentCounts.Do;
  currentSession.totalBlue = currentCounts.Xanh;
  currentSession.totalGreen = currentCounts.Vang;
  await currentSession.save();
  console.log("Session stopped & saved.");
  currentSession = null;
};