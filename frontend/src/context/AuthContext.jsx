import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(authService.getToken());
    const [user, setUser] = useState(authService.getStoredUser());
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function initializeAuth() {
            const storedToken = authService.getToken();
            const storedUser = authService.getStoredUser();

            if (!storedToken) {
                if (isMounted) {
                    setIsInitializing(false);
                }
                return;
            }

            if (storedUser && isMounted) {
                setUser(storedUser);
            }

            try {
                const currentUser = await authService.getCurrentUser();

                if (!isMounted) {
                    return;
                }

                setToken(storedToken);
                setUser(currentUser);
                authService.setSession(storedToken, currentUser);
            } catch {
                if (!isMounted) {
                    return;
                }

                authService.clearSession();
                setToken(null);
                setUser(null);
            } finally {
                if (isMounted) {
                    setIsInitializing(false);
                }
            }
        }

        initializeAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    const login = async (data) => {
        const response = await authService.login(data);
        setToken(response.access_token);
        setUser(response.user);
        return response;
    };

    const logout = () => {
        authService.logout();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: Boolean(token),
                isInitializing,
                token,
                user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
