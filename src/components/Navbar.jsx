import React, { useContext } from 'react';
import style from '../styles/style-navbar.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons'
import { faCartShopping } from '@fortawesome/free-solid-svg-icons'
import { faBox } from '@fortawesome/free-solid-svg-icons'
import { faComment } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { usuario , cargando } = useContext(AuthContext);
    console.log(usuario)
    if (cargando || !usuario) {
        return null; // o un loader/spinner si quieres
    }
    const perfil = usuario?.foto || 'https://static.vecteezy.com/system/resources/thumbnails/008/442/086/small/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg';

    return (
        <div className={style.navbar}>
            <img src={perfil} className={style.perfil} alt="foto de perfil" referrerPolicy="no-referrer" />
            <Link to='/'><FontAwesomeIcon icon={faHouse} size="2x"/></Link>
            <Link to='/carrito'><FontAwesomeIcon icon={faCartShopping} size="2x" /></Link>
            <Link to='/tusproductos'><FontAwesomeIcon icon={faBox} size="2x"/></Link>
            <Link to='/ia'><FontAwesomeIcon icon={faComment} size="2x"/></Link>
            
            
            

        </div>
    )
}

export default Navbar