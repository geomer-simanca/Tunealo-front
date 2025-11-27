import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import btnstyle from '../styles/stylesPages/style-Home-botonVender.module.scss'

const BotonCerrar = () => {
    const { logout } = useContext(AuthContext);

    const handleCerrarSesion = () => {
        logout();
    };

    return (
        <button className={btnstyle.cerrarSesionBtn} onClick={handleCerrarSesion}>
            cerrar sesión
        </button>
    );
};

export default BotonCerrar;
