import { uploadImage } from "../lib/uploadImage"; 
import { supabase } from "../lib/supabaseClient";
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import TarjetaProductoVendedor from '../components/TarjetaProductoVendedor'

const TusProductos = () => {
    const { usuario, cargando } = useContext(AuthContext);
    
    if (cargando) {
        return null;
    }

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: '',
        stock: '',
        imagenes: []
    });

    const abrirModal = () => setShowModal(true);
    
    const cerrarModal = () => {
        setShowModal(false);
        setFormData({
            nombre: '',
            descripcion: '',
            precio: '',
            categoria: '',
            stock: '',
            imagenes: []
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImagenes = (e) => {
        const archivos = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            imagenes: archivos
        }));
    };

    // ✅ FUNCIÓN CORREGIDA
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 🔍 PASO 1: Buscar el id_vendedor del usuario actual
            const { data: vendedorData, error: vendedorError } = await supabase
                .from("vendedores")
                .select("id_vendedor")
                .eq("id_usuario", usuario.id)  // 👈 Buscar por el id del usuario
                .single();

            if (vendedorError || !vendedorData) {
                console.error("Error buscando vendedor:", vendedorError);
                alert("No tienes un perfil de vendedor activo. Por favor crea tu tienda primero.");
                return;
            }

            const idVendedor = vendedorData.id_vendedor;
            console.log("✅ ID Vendedor encontrado:", idVendedor);

            // 🖼️ PASO 2: Subir la imagen si existe
            let imageUrl = null;
            if (formData.imagenes.length > 0) {
                const file = formData.imagenes[0];
                imageUrl = await uploadImage(file);
                console.log("✅ Imagen subida:", imageUrl);
            }

            // 💾 PASO 3: Insertar el producto en la base de datos
            const { data, error } = await supabase
                .from("productos")
                .insert({
                    id_vendedor: idVendedor,  // 👈 Ahora sí tenemos el id_vendedor correcto
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    precio: parseFloat(formData.precio),
                    categoria: formData.categoria,
                    stock: parseInt(formData.stock),
                    imagen_url: imageUrl,
                    estado: 'activo'  // Por defecto activo
                });

            if (error) {
                console.error("❌ Error al insertar producto:", error);
                alert("Error al subir el producto: " + error.message);
                return;
            }

            console.log("✅ Producto insertado:", data);
            alert("¡Producto subido exitosamente!");
            cerrarModal();

        } catch (error) {
            console.error("❌ Error general:", error);
            alert("Error al procesar el producto: " + error.message);
        }
    };

    return (
        <div className='container py-4'>
            <div className='d-flex justify-content-between align-items-center mb-4'>
                <h1 className='fs-1 mb-0'>Mis Productos</h1>
                <button 
                    type="button" 
                    className="btn btn-outline-danger btn-lg d-flex align-items-center gap-2"
                    onClick={abrirModal}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z"/>
                    </svg>
                    Subir Nuevo Producto
                </button>
            </div>

            <div className="caja productos border rounded p-3">
                {/* <p className='text-muted'>Aquí aparecerán tus productos...</p> */}
                <TarjetaProductoVendedor/>

            </div>

            {/* MODAL */}
            {showModal && (
                <>
                    <div 
                        className="modal-backdrop fade show" 
                        onClick={cerrarModal}
                        style={{ zIndex: 1040 }}
                    ></div>
                    
                    <div 
                        className="modal fade show d-block" 
                        tabIndex="-1" 
                        style={{ zIndex: 1050 }}
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-box-seam me-2" viewBox="0 0 16 16">
                                            <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.426L5.596 5 8 5.961 14.154 3.5zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z"/>
                                        </svg>
                                        Subir Nuevo Producto
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close" 
                                        onClick={cerrarModal}
                                    ></button>
                                </div>

                                <div className="modal-body">
                                    {/* Nombre del producto */}
                                    <div className="mb-3">
                                        <label htmlFor="nombre" className="form-label fw-bold">
                                            Nombre del Producto *
                                        </label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="nombre"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            placeholder="Ej: iPhone 15 Pro Max"
                                            required
                                        />
                                    </div>

                                    {/* Descripción */}
                                    <div className="mb-3">
                                        <label htmlFor="descripcion" className="form-label fw-bold">
                                            Descripción *
                                        </label>
                                        <textarea 
                                            className="form-control" 
                                            id="descripcion"
                                            name="descripcion"
                                            value={formData.descripcion}
                                            onChange={handleChange}
                                            rows="3"
                                            placeholder="Describe tu producto..."
                                            required
                                        ></textarea>
                                    </div>

                                    {/* Precio y Stock */}
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label htmlFor="precio" className="form-label fw-bold">
                                                Precio ($) *
                                            </label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                id="precio"
                                                name="precio"
                                                value={formData.precio}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="stock" className="form-label fw-bold">
                                                Stock Disponible *
                                            </label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                id="stock"
                                                name="stock"
                                                value={formData.stock}
                                                onChange={handleChange}
                                                placeholder="0"
                                                min="0"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Categoría */}
                                    <div className="mb-3">
                                        <label htmlFor="categoria" className="form-label fw-bold">
                                            Categoría *
                                        </label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="categoria"
                                            name="categoria"
                                            value={formData.categoria}
                                            onChange={handleChange}
                                            placeholder="Ej: Electrónica, Ropa, Hogar, Deportes..."
                                            required
                                        />
                                        <small className="text-muted">
                                            Escribe la categoría de tu producto
                                        </small>
                                    </div>

                                    {/* Imágenes */}
                                    <div className="mb-3">
                                        <label htmlFor="imagenes" className="form-label fw-bold">
                                            Imágenes del Producto
                                        </label>
                                        <input 
                                            type="file" 
                                            className="form-control" 
                                            id="imagenes"
                                            name="imagenes"
                                            onChange={handleImagenes}
                                            accept="image/*"
                                            multiple
                                        />
                                        <small className="text-muted">
                                            Puedes seleccionar solo una imagen
                                        </small>
                                    </div>

                                    {/* Vista previa de imágenes */}
                                    {formData.imagenes.length > 0 && (
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Vista Previa:</label>
                                            <div className="d-flex gap-2 flex-wrap">
                                                {formData.imagenes.map((img, index) => (
                                                    <div key={index} className="border rounded p-1">
                                                        <img 
                                                            src={URL.createObjectURL(img)} 
                                                            alt={`Preview ${index + 1}`}
                                                            style={{ 
                                                                width: '80px', 
                                                                height: '80px', 
                                                                objectFit: 'cover',
                                                                borderRadius: '4px'
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer con botones */}
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={cerrarModal}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-danger"
                                        onClick={handleSubmit}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-upload me-2" viewBox="0 0 16 16">
                                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                                            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z"/>
                                        </svg>
                                        Publicar Producto
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TusProductos;