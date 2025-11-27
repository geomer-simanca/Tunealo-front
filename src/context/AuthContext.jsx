import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const user = localStorage.getItem("usuario");

        if (token && user) {
        setUsuario(JSON.parse(user));
        }

        setCargando(false);
    }, []);

    const login = (access_token, user) => {
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("usuario", JSON.stringify(user));
        setUsuario(user);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("usuario");
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
            {children}
        </AuthContext.Provider>
    );
};
