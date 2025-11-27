import React, { useEffect, useState, useContext } from 'react';
import { supabase } from "../lib/supabaseClient";
import style from '../styles/stylesPages/style-page-home.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faTimes } from '@fortawesome/free-solid-svg-icons'
import BotonPruebaConection from '../components/BotonPruebaConection'
import LoginGoogle from '../components/LoginGoogle'
import BotonCerrar from '../components/BotonCerrar'
import { AuthContext } from '../context/AuthContext';
import { CarritoContext } from '../context/CarritoContext';
import { Link } from 'react-router-dom'
import btnstyle from '../styles/stylesPages/style-Home-botonVender.module.scss'
import img from '../assets/logo.png'

const Home = () => {
    const [esVendedorBD, setEsVendedorBD] = useState(false);
    const { usuario } = useContext(AuthContext);
    const { agregarAlCarrito } = useContext(CarritoContext);
    const [productos, setProductos] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);

    const fetchProductos = async ()=>{
        try{
            const res = await fetch(`https://back-gretta-geoproyectos-f7c21e3a.koyeb.app/productos`)
            const data = await res.json()
            setProductos(data.productos)
        }catch(err){
            console.log(`error al intentar traer los productos: ${err}`)
        }
    }

    useEffect(()=>{
        fetchProductos()
    },[])

    useEffect(()=>{
        console.log(productos)
    },[productos])

    // efecto para comprobar si el usuario ya es vendedor
    useEffect(() => {
        const verificarVendedor = async () => {
            if (!usuario?.id) return;

            const { data, error } = await supabase
            .from("usuarios")
            .select("es_vendedor")
            .eq("id", usuario.id)
            .single();

            if (error) {
                console.error("Error consultando Supabase:", error);
                return;
            }

            setEsVendedorBD(data.es_vendedor);
        };

        verificarVendedor();
    }, [usuario]);

    const handleAgregarCarrito = (producto) => {
        agregarAlCarrito(producto);
        setModalAbierto(false); // Cerrar modal después de agregar
    };

    const abrirModal = (producto) => {
        setProductoSeleccionado(producto);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setProductoSeleccionado(null);
    };

    // Función para truncar texto
    const truncarTexto = (texto, maxCaracteres = 80) => {
        if (!texto) return '';
        if (texto.length <= maxCaracteres) return texto;
        return texto.substring(0, maxCaracteres) + '...';
    };

    return (
        <div className={style.containerHome}>
            {/* encabezado */}
            <div className="container-fluid border-bottom border-danger ">
                <div className='header m-4 d-flex justify-content-center gap-3 justify-content-between align-items-center'>
                    <div className="busqueda d-flex gap-2" style={{width:'50%', marginLeft:'200px'}}>
                        <input type="text" className="form-control w-150" placeholder="Buscar Productos..." aria-label="Username" aria-describedby="basic-addon1"></input>
                        <button type="button" className="btn btn-danger"><FontAwesomeIcon icon={faMagnifyingGlass} /></button>
                    </div>
                    
                    <div className="botone d-flex gap-4" style={{marginLeft:'80px'}}>
                        {usuario && !esVendedorBD && (
                            <Link to="/registroVendedor" className={btnstyle.triggerButton}>
                                <span>Vender</span>
                            </Link>
                        )}
                        {!usuario && <LoginGoogle/>}
                        {usuario && <BotonCerrar/>}
                    </div>

                    <img src={img} style={{height:'50px'}} />
                </div>
            </div>

            {/* Cuerpo principal */}
            <div className="container-fluid d-flex justify-content-center flex-wrap gap-4" style={{height:'90%',padding:'20px'}}>
                {productos.map((producto, index) => (
                    <div 
                        className="card d-flex flex-column shadow-sm p-3 mb-5 bg-body-tertiary rounded" 
                        style={{ width: "18rem", height: "28rem", cursor: 'pointer' }} 
                        key={index}
                    >
                        {/* CONTENEDOR FIJO DE LA IMAGEN - Clickeable */}
                        <div 
                            style={{ width: "100%", height: "200px", overflow: "hidden" }}
                            onClick={() => abrirModal(producto)}
                        >
                            <img
                                src={producto.imagen_url}
                                className="card-img-top"
                                alt={producto.nombre}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </div>

                        {/* CONTENIDO */}
                        <div className="card-body d-flex flex-column p-2">
                            <h5 
                                className="card-title fw-bold fs-5 mb-2" 
                                onClick={() => abrirModal(producto)}
                                style={{ cursor: 'pointer' }}
                            >
                                {producto.nombre}
                            </h5>
                            <p className='fw-bold text-success mb-2'>${parseFloat(producto.precio).toLocaleString('es-CO')} COP</p>
                            
                            {/* Descripción truncada */}
                            <p 
                                className="card-text text-muted small mb-2" 
                                style={{ 
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    lineHeight: '1.4em',
                                    maxHeight: '4.2em'
                                }}
                            >
                                {producto.descripcion}
                            </p>

                            {/* BOTONES */}
                            <div className="mt-auto d-flex flex-column gap-2">
                                <button 
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => abrirModal(producto)}
                                >
                                    Ver detalles
                                </button>
                                <button 
                                    className="btn btn-danger"
                                    onClick={() => handleAgregarCarrito(producto)}
                                >
                                    Agregar al Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DE PRODUCTO */}
            {modalAbierto && productoSeleccionado && (
                <div 
                    className="modal fade show" 
                    style={{ 
                        display: 'block', 
                        backgroundColor: 'rgba(0,0,0,0.5)' 
                    }}
                    onClick={cerrarModal}
                >
                    <div 
                        className="modal-dialog modal-dialog-centered modal-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content">
                            {/* Header del modal */}
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">{productoSeleccionado.nombre}</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={cerrarModal}
                                ></button>
                            </div>

                            {/* Body del modal */}
                            <div className="modal-body">
                                <div className="row">
                                    {/* Imagen del producto */}
                                    <div className="col-md-6">
                                        <img 
                                            src={productoSeleccionado.imagen_url}
                                            alt={productoSeleccionado.nombre}
                                            className="img-fluid rounded"
                                            style={{ 
                                                width: '100%', 
                                                maxHeight: '400px', 
                                                objectFit: 'cover' 
                                            }}
                                        />
                                    </div>

                                    {/* Información del producto */}
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <span className="text-muted">Precio:</span>
                                            <h3 className="text-success fw-bold mb-0">
                                                ${parseFloat(productoSeleccionado.precio).toLocaleString('es-CO')} COP
                                            </h3>
                                        </div>

                                        {productoSeleccionado.stock && (
                                            <div className="mb-3">
                                                <span className="text-muted">Disponibilidad:</span>
                                                <p className="mb-0">
                                                    <span className={`badge ${productoSeleccionado.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                        {productoSeleccionado.stock > 0 
                                                            ? `${productoSeleccionado.stock} disponibles` 
                                                            : 'Agotado'}
                                                    </span>
                                                </p>
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <span className="text-muted fw-bold">Descripción:</span>
                                            <p className="mt-2" style={{ textAlign: 'justify' }}>
                                                {productoSeleccionado.descripcion || 'Sin descripción disponible'}
                                            </p>
                                        </div>

                                        {/* Botón de agregar al carrito */}
                                        <div className="d-grid gap-2 mt-4">
                                            <button 
                                                className="btn btn-danger btn-lg"
                                                onClick={() => handleAgregarCarrito(productoSeleccionado)}
                                                disabled={productoSeleccionado.stock === 0}
                                            >
                                                {productoSeleccionado.stock === 0 
                                                    ? 'Producto agotado' 
                                                    : 'Agregar al Carrito'}
                                            </button>
                                            <button 
                                                className="btn btn-outline-secondary"
                                                onClick={cerrarModal}
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home;