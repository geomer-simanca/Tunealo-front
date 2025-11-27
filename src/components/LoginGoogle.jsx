import React from 'react'
import { supabase } from "../lib/supabaseClient.js";
import style from '../styles/styleComponentes/style-LoginGoogle.module.scss'

const LoginGoogle = () => {

    const loginWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${window.location.origin}/auth/callback` // o tu dominio productivo
        }
        });

        if (error) console.log(error);
    };

    return (
        <button onClick={loginWithGoogle} className={style.botonGoogle}>
            <img src="https://cdn-icons-png.flaticon.com/512/2875/2875404.png" alt="imagen google" style={{height:30}} />
            <p className={style.text}>Sign in with Google</p>
        </button>
    )
}

export default LoginGoogle