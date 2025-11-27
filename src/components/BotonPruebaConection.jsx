import React from 'react'
import { supabase } from "../lib/supabaseClient.js";

const BotonPruebaConection = () => {

    const probarConexion = async () => {
        const { data, error } = await supabase.from("usuarios").select("*");

        if (error) {
        console.error("❌ Error:", error.message);
        } else {
        console.log("✅ Conectado correctamente. Datos:", data);
        }
    };

    return (
        <div>
            <button onClick={probarConexion}>
                Probar Supabase
            </button>           
        </div>
    )
}

export default BotonPruebaConection