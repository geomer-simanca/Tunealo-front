import React, { useContext } from 'react';
import style from '../styles/style-navbar.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons'
import { faCartShopping } from '@fortawesome/free-solid-svg-icons'
import { faBox } from '@fortawesome/free-solid-svg-icons'
import { faComment } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext';
import { CarritoContext } from '../context/CarritoContext';

const Navbar = () => {
    const { usuario, cargando } = useContext(AuthContext);
    const { cantidadTotal } = useContext(CarritoContext);
    
    if (cargando || !usuario) {
        return null;
    }
    
    const perfil = usuario?.foto || 'https://static.vecteezy.com/system/resources/thumbnails/008/442/086/small/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg';
    const totalProductos = cantidadTotal();

    return (
        <div className={style.navbar}>
            <img src={perfil} className={style.perfil} alt="foto de perfil" referrerPolicy="no-referrer" />
            <Link to='/'><FontAwesomeIcon icon={faHouse} size="2x"/></Link>
            
            {/* Carrito con badge de cantidad */}
            <Link to='/carrito' style={{ position: 'relative', display: 'inline-block' }}>
                <FontAwesomeIcon icon={faCartShopping} size="2x" />
                {totalProductos > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        borderRadius: '50%',
                        minWidth: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        {totalProductos > 99 ? '99+' : totalProductos}
                    </span>
                )}
            </Link>
            
            <Link to='/tusproductos'><FontAwesomeIcon icon={faBox} size="2x"/></Link>
            <Link to='/ia'><FontAwesomeIcon icon={faComment} size="2x"/></Link>
        </div>
    )
}

export default Navbar