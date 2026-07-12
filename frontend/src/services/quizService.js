import api from "./api";

export async function getQuiz(topicId) {
    const response = await api.get(`/quiz/${topicId}`);
    return response.data;
}