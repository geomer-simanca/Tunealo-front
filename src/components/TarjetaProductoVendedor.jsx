import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../context/AuthContext';

const TarjetaProductoVendedor = () => {
    const { usuario, cargando } = useContext(AuthContext);
    const [productos, setProductos] = useState([]);
    const [loadingProductos, setLoadingProductos] = useState(true);
    const [error, setError] = useState(null);

    // Cargar productos del vendedor
    useEffect(() => {
        const cargarProductos = async () => {
            if (!usuario) {
                setLoadingProductos(false);
                return;
            }

            try {
                console.log("🔍 Buscando vendedor para usuario:", usuario.id);

                // PASO 1: Buscar id_vendedor usando el id del usuario
                const { data: vendedorData, error: vendedorError } = await supabase
                    .from("vendedores")
                    .select("id_vendedor")
                    .eq("id_usuario", usuario.id)
                    .single();

                if (vendedorError) {
                    console.error("❌ Error buscando vendedor:", vendedorError);
                    setError("No tienes un perfil de vendedor activo.");
                    setLoadingProductos(false);
                    return;
                }

                if (!vendedorData) {
                    setError("No se encontró tu perfil de vendedor.");
                    setLoadingProductos(false);
                    return;
                }

                const idVendedor = vendedorData.id_vendedor;
                console.log("✅ ID Vendedor encontrado:", idVendedor);

                // PASO 2: Buscar todos los productos de este vendedor
                const { data: productosData, error: productosError } = await supabase
                    .from("productos")
                    .select("*")
                    .eq("id_vendedor", idVendedor)
                    .order("fecha_publicacion", { ascending: false });

                if (productosError) {
                    console.error("❌ Error cargando productos:", productosError);
                    setError("Error al cargar tus productos.");
                    setLoadingProductos(false);
                    return;
                }

                console.log("✅ Productos cargados:", productosData);
                setProductos(productosData || []);
                setLoadingProductos(false);

            } catch (err) {
                console.error("❌ Error general:", err);
                setError("Error al cargar la información.");
                setLoadingProductos(false);
            }
        };

        cargarProductos();
    }, [usuario]);

    // Formatear precio
    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(precio);
    };

    // Formatear fecha
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Mientras carga el usuario
    if (cargando) {
        return (
            <div className="container py-4">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Si no hay usuario
    if (!usuario) {
        return (
            <div className="container py-4">
                <div className="alert alert-warning">
                    Debes iniciar sesión para ver tus productos.
                </div>
            </div>
        );
    }

    // Mientras carga los productos
    if (loadingProductos) {
        return (
            <div className="container py-4">
                <h2 className="mb-4">Mis Productos</h2>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando productos...</span>
                    </div>
                    <p className="mt-3 text-muted">Cargando tus productos...</p>
                </div>
            </div>
        );
    }

    // Si hay error
    if (error) {
        return (
            <div className="container py-4">
                <h2 className="mb-4">Mis Productos</h2>
                <div className="alert alert-danger">
                    {error}
                </div>
            </div>
        );
    }

    // Si no hay productos
    if (productos.length === 0) {
        return (
            <div className="container py-4">
                <h2 className="mb-4">Mis Productos</h2>
                <div className="alert alert-info">
                    <h5 className="alert-heading">¡No tienes productos publicados!</h5>
                    <p className="mb-0">Comienza a vender subiendo tu primer producto.</p>
                </div>
            </div>
        );
    }

    // Renderizar productos
    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Mis Productos ({productos.length})</h2>
            </div>

            {productos.map((producto) => {
                const imagenProducto = producto.imagen_url || 'https://via.placeholder.com/150?text=Sin+Imagen';
                const precioFormateado = formatearPrecio(producto.precio);
                const fechaFormateada = formatearFecha(producto.fecha_publicacion);

                return (
                    <div key={producto.id_producto} className="card mb-3 shadow-sm hover-shadow" style={{ transition: 'all 0.3s' }}>
                        <div className="row g-0">
                            {/* Imagen del producto */}
                            <div className="col-md-3">
                                <img 
                                    src={imagenProducto} 
                                    className="img-fluid rounded-start h-100" 
                                    alt={producto.nombre}
                                    style={{ 
                                        objectFit: 'cover',
                                        minHeight: '200px',
                                        maxHeight: '200px'
                                    }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/150?text=Error+Imagen';
                                    }}
                                />
                            </div>

                            {/* Información del producto */}
                            <div className="col-md-9">
                                <div className="card-body d-flex flex-column h-100">
                                    {/* Header con título y estado */}
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="card-title mb-0 fw-bold">{producto.nombre}</h5>
                                        <span 
                                            className={`badge ${
                                                producto.estado === 'activo' 
                                                    ? 'bg-success' 
                                                    : 'bg-secondary'
                                            }`}
                                        >
                                            {producto.estado === 'activo' ? '✓ Activo' : '✕ Inactivo'}
                                        </span>
                                    </div>

                                    {/* Categoría */}
                                    <div className="mb-2">
                                        <span className="badge bg-primary">{producto.categoria || 'Sin categoría'}</span>
                                    </div>

                                    {/* Descripción */}
                                    <p className="card-text text-muted mb-2" style={{ 
                                        fontSize: '0.95rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {producto.descripcion || 'Sin descripción disponible'}
                                    </p>

                                    {/* Información adicional */}
                                    <div className="row mb-2">
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Precio</small>
                                            <span className="fw-bold text-success fs-5">{precioFormateado}</span>
                                        </div>
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Stock</small>
                                            <span className={`fw-bold ${producto.stock > 0 ? 'text-dark' : 'text-danger'}`}>
                                                {producto.stock} unidades
                                            </span>
                                        </div>
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Publicado</small>
                                            <span className="text-dark">{fechaFormateada}</span>
                                        </div>
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="mt-auto d-flex gap-2">
                                        <button className="btn btn-sm btn-outline-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-pencil me-1" viewBox="0 0 16 16">
                                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                                            </svg>
                                            Editar
                                        </button>
                                        <button 
                                            className={`btn btn-sm ${
                                                producto.estado === 'activo' 
                                                    ? 'btn-outline-warning' 
                                                    : 'btn-outline-success'
                                            }`}
                                        >
                                            {producto.estado === 'activo' ? 'Desactivar' : 'Activar'}
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-trash me-1" viewBox="0 0 16 16">
                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                                            </svg>
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TarjetaProductoVendedor;