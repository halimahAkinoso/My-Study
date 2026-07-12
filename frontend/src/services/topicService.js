import api from "./api";

export async function getTopics(subjectId) {
  const response = await api.get(`/topics/${subjectId}`);
  return response.data;
}