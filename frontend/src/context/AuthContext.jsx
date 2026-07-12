import { createContext, useContext, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const login = async (data) => {
        const response = await authService.login(data);
        setToken(response.access_token);
    };

    const logout = () => {
        authService.logout();
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);