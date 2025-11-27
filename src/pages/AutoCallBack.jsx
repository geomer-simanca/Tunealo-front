import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { AuthContext } from "../context/AuthContext";

const AuthCallback = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    useEffect(() => {

        const handleCallback = async () => {
            try {
                console.log("🔁 Verificando sesión...");

                // Obtener la sesión actual de Supabase
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                console.error("❌ Error obteniendo sesión:", error.message);
                return;
                }

                if (session) {
                console.log("✅ Sesión recibida:", session);

                // Construir objeto usuario para el contexto
                const usuario = {
                    id: session.user.id,
                    nombre: session.user.user_metadata.full_name || session.user.user_metadata.name,
                    email: session.user.email,
                    foto: session.user.user_metadata.avatar_url || session.user.user_metadata.picture, // 🔹 aquí
                    role: session.user.role
                };

                // Guardar usuario y token en contexto y localStorage
                login(session.access_token, usuario);

                // Redirigir al home o dashboard
                navigate("/");
                } else {
                console.log("❌ No hay sesión activa");
                navigate("/login"); // opcional: enviar al login
                }
            } catch (err) {
                console.error("❌ Error en AuthCallback:", err);
            }
        };

    handleCallback();
    }, []);

    return <p>Procesando login...</p>;
};

export default AuthCallback;

