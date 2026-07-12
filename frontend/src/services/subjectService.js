import api from "./api";

export async function getSubjects() {
  const response = await api.get("/subjects/");
  return response.data;
}

export async function getSubject(id) {
  const response = await api.get(`/subjects/${id}`);
  return response.data;
}