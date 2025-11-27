import React, { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Carrito = () => {
    const { usuario } = useContext(AuthContext);
    const { carrito, loading, eliminarDelCarrito, actualizarCantidad, calcularTotal, cantidadTotal } = useContext(CarritoContext);

    if (!usuario) {
        return (
            <div className="container py-5">
                <div className="alert alert-warning">
                    <h4>Debes iniciar sesión para ver tu carrito</h4>
                    <Link to="/" className="btn btn-primary mt-3">Ir al inicio</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando carrito...</p>
            </div>
        );
    }

    if (carrito.length === 0) {
        return (
            <div className="container py-5">
                <div className="alert alert-info text-center">
                    <h4>Tu carrito está vacío</h4>
                    <p>Agrega productos para comenzar tu compra</p>
                    <Link to="/" className="btn btn-danger mt-3">Ver productos</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <h1 className="mb-4">Mi Carrito ({cantidadTotal()} productos)</h1>

            <div className="row">
                {/* Lista de productos */}
                <div className="col-md-8">
                    {carrito.map((item) => (
                        <div key={item.id_pedido} className="card mb-3">
                            <div className="row g-0">
                                <div className="col-md-3">
                                    <img 
                                        src={item.productos.imagen_url || 'https://via.placeholder.com/150'} 
                                        className="img-fluid rounded-start h-100" 
                                        alt={item.productos.nombre}
                                        style={{ objectFit: 'cover', maxHeight: '150px' }}
                                    />
                                </div>
                                <div className="col-md-9">
                                    <div className="card-body">
                                        <h5 className="card-title">{item.productos.nombre}</h5>
                                        <p className="card-text text-muted small">
                                            {item.productos.descripcion}
                                        </p>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="text-success fw-bold fs-5">
                                                    ${parseFloat(item.precio_unitario).toLocaleString('es-CO')} COP
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => actualizarCantidad(item.id_pedido, item.cantidad - 1)}
                                                    disabled={item.cantidad <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className="fw-bold">{item.cantidad}</span>
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => actualizarCantidad(item.id_pedido, item.cantidad + 1)}
                                                    disabled={item.cantidad >= item.productos.stock}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div>
                                                <span className="fw-bold">
                                                    Subtotal: ${parseFloat(item.subtotal).toLocaleString('es-CO')} COP
                                                </span>
                                            </div>
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => eliminarDelCarrito(item.id_pedido)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Resumen del pedido */}
                <div className="col-md-4">
                    <div className="card sticky-top" style={{ top: '20px' }}>
                        <div className="card-body">
                            <h5 className="card-title">Resumen del pedido</h5>
                            <hr />
                            <div className="d-flex justify-content-between mb-2">
                                <span>Productos ({cantidadTotal()}):</span>
                                <span>${calcularTotal().toLocaleString('es-CO')} COP</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Envío:</span>
                                <span className="text-success">Gratis</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-3">
                                <strong>Total:</strong>
                                <strong className="text-danger fs-4">
                                    ${calcularTotal().toLocaleString('es-CO')} COP
                                </strong>
                            </div>
                            <button className="btn btn-danger w-100 mb-2">
                                Proceder al pago
                            </button>
                            <Link to="/" className="btn btn-outline-secondary w-100">
                                Seguir comprando
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Carrito;