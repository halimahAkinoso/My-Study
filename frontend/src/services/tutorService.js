import api from "./api";

export async function sendTutorMessage(payload) {
  const response = await api.post("/ai/tutor", payload);
  return response.data;
}
