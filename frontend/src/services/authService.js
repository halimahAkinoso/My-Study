import api from "./api";

const TOKEN_KEY = "token";
const USER_KEY = "studyhub_user";

export const setSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);

    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
};

export const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const register = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

export const login = async (userData) => {
    const response = await api.post("/auth/login", userData);
    setSession(response.data.access_token, response.data.user);

    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

export const logout = () => {
    clearSession();
};

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = () => {
    const rawUser = localStorage.getItem(USER_KEY);

    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser);
    } catch {
        localStorage.removeItem(USER_KEY);
        return null;
    }
};
