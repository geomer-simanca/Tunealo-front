import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from './AuthContext';

export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
    const { usuario } = useContext(AuthContext);
    const [carrito, setCarrito] = useState([]);
    const [idCarrito, setIdCarrito] = useState(null);
    const [loading, setLoading] = useState(false);

    // Cargar o crear carrito del usuario
    useEffect(() => {
        if (usuario?.id) {
            cargarCarrito();
        } else {
            setCarrito([]);
            setIdCarrito(null);
        }
    }, [usuario]);

    const cargarCarrito = async () => {
        if (!usuario?.id) return;

        try {
            setLoading(true);

            // Buscar carrito pendiente del usuario
            const { data: carritoData, error: carritoError } = await supabase
                .from('carros')
                .select('id_carro')
                .eq('id_usuario', usuario.id)
                .eq('estado', 'pendiente')
                .single();

            if (carritoError && carritoError.code !== 'PGRST116') {
                console.error('Error buscando carrito:', carritoError);
                return;
            }

            let carritoId;

            // Si no existe carrito, crear uno
            if (!carritoData) {
                const { data: nuevoCarrito, error: crearError } = await supabase
                    .from('carros')
                    .insert({
                        id_usuario: usuario.id,
                        total: 0,
                        estado: 'pendiente'
                    })
                    .select('id_carro')
                    .single();

                if (crearError) {
                    console.error('Error creando carrito:', crearError);
                    return;
                }

                carritoId = nuevoCarrito.id_carro;
            } else {
                carritoId = carritoData.id_carro;
            }

            setIdCarrito(carritoId);

            // Cargar productos del carrito con información completa
            const { data: pedidos, error: pedidosError } = await supabase
                .from('pedidos')
                .select(`
                    id_pedido,
                    cantidad,
                    precio_unitario,
                    subtotal,
                    productos (
                        id_producto,
                        nombre,
                        descripcion,
                        precio,
                        imagen_url,
                        stock
                    )
                `)
                .eq('id_carro', carritoId)
                .eq('estado', 'pendiente');

            if (pedidosError) {
                console.error('Error cargando pedidos:', pedidosError);
                return;
            }

            setCarrito(pedidos || []);
        } catch (error) {
            console.error('Error general:', error);
        } finally {
            setLoading(false);
        }
    };

    const agregarAlCarrito = async (producto) => {
        if (!usuario?.id) {
            alert('Debes iniciar sesión para agregar productos al carrito');
            return;
        }

        try {
            // Buscar id_vendedor del producto
            const { data: productoData } = await supabase
                .from('productos')
                .select('id_vendedor')
                .eq('id_producto', producto.id_producto)
                .single();

            if (!productoData) {
                alert('Error al obtener información del producto');
                return;
            }

            // Verificar si el producto ya está en el carrito
            const productoExistente = carrito.find(
                item => item.productos.id_producto === producto.id_producto
            );

            if (productoExistente) {
                // Actualizar cantidad
                const nuevaCantidad = productoExistente.cantidad + 1;
                const nuevoSubtotal = nuevaCantidad * productoExistente.precio_unitario;

                const { error } = await supabase
                    .from('pedidos')
                    .update({
                        cantidad: nuevaCantidad
                    })
                    .eq('id_pedido', productoExistente.id_pedido);

                if (error) {
                    console.error('Error actualizando cantidad:', error);
                    alert('Error al actualizar el carrito');
                    return;
                }
            } else {
                // Agregar nuevo producto
                const { error } = await supabase
                    .from('pedidos')
                    .insert({
                        id_carro: idCarrito,
                        id_vendedor: productoData.id_vendedor,
                        id_producto: producto.id_producto,
                        cantidad: 1,
                        precio_unitario: producto.precio,
                        estado: 'pendiente'
                    });

                if (error) {
                    console.error('Error agregando al carrito:', error);
                    alert('Error al agregar al carrito');
                    return;
                }
            }

            // Recargar carrito
            await cargarCarrito();
            alert('Producto agregado al carrito');
        } catch (error) {
            console.error('Error general:', error);
            alert('Error al agregar al carrito');
        }
    };

    const eliminarDelCarrito = async (idPedido) => {
        try {
            const { error } = await supabase
                .from('pedidos')
                .delete()
                .eq('id_pedido', idPedido);

            if (error) {
                console.error('Error eliminando del carrito:', error);
                alert('Error al eliminar del carrito');
                return;
            }

            await cargarCarrito();
        } catch (error) {
            console.error('Error general:', error);
        }
    };

    const actualizarCantidad = async (idPedido, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;

        try {
            const pedido = carrito.find(item => item.id_pedido === idPedido);
            const nuevoSubtotal = nuevaCantidad * pedido.precio_unitario;

            const { error } = await supabase
                .from('pedidos')
                .update({
                    cantidad: nuevaCantidad
                })
                .eq('id_pedido', idPedido);

            if (error) {
                console.error('Error actualizando cantidad:', error);
                return;
            }

            await cargarCarrito();
        } catch (error) {
            console.error('Error general:', error);
        }
    };

    const calcularTotal = () => {
        return carrito.reduce((total, item) => total + parseFloat(item.subtotal), 0);
    };

    const cantidadTotal = () => {
        return carrito.reduce((total, item) => total + item.cantidad, 0);
    };

    return (
        <CarritoContext.Provider value={{
            carrito,
            loading,
            agregarAlCarrito,
            eliminarDelCarrito,
            actualizarCantidad,
            calcularTotal,
            cantidadTotal
        }}>
            {children}
        </CarritoContext.Provider>
    );
};