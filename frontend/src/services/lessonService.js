import api from "./api";

export async function getLesson(topicId) {
  const response = await api.get(`/lessons/${topicId}`);
  return response.data;
}