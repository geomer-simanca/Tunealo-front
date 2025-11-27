import React, { useState, useRef, useEffect, useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { AuthContext } from '../context/AuthContext';

const ChatIA = () => {
    const [mensajes, setMensajes] = useState([]);
    const [inputUsuario, setInputUsuario] = useState('');
    const [cargando, setCargando] = useState(false);
    const [productos, setProductos] = useState([]);
    const chatEndRef = useRef(null);
    const { agregarAlCarrito } = useContext(CarritoContext);
    const { usuario } = useContext(AuthContext);

    // API Key de Gemini
    const GEMINI_API_KEY = 'AIzaSyCCmruu-b2YI5kgkCwwNUT2ji4YPwLTeAY';

    // Auto-scroll al final del chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes]);

    // Cargar productos al iniciar
    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            const res = await fetch('https://back-gretta-geoproyectos-f7c21e3a.koyeb.app/productos');
            const data = await res.json();
            setProductos(data.productos || []);
            console.log('✅ Productos cargados:', data.productos?.length || 0);
        } catch (err) {
            console.error('❌ Error cargando productos:', err);
        }
    };

    const buscarProductosRelevantes = (consulta) => {
        const palabrasClave = consulta.toLowerCase().split(' ');
        
        const productosEncontrados = productos.filter(producto => {
            const nombreProducto = producto.nombre.toLowerCase();
            const descripcionProducto = producto.descripcion?.toLowerCase() || '';
            
            return palabrasClave.some(palabra => 
                nombreProducto.includes(palabra) || descripcionProducto.includes(palabra)
            );
        }).slice(0, 6);

        console.log('🔍 Productos encontrados:', productosEncontrados.length);
        return productosEncontrados;
    };

    const enviarMensaje = async () => {
        if (!inputUsuario.trim()) return;

        const mensajeUsuario = inputUsuario;
        setInputUsuario('');
        setCargando(true);

        // Agregar mensaje del usuario
        const nuevosMensajes = [...mensajes, { 
            rol: 'usuario', 
            texto: mensajeUsuario 
        }];
        setMensajes(nuevosMensajes);

        try {
            // 1. Buscar productos relevantes
            const productosRelevantes = buscarProductosRelevantes(mensajeUsuario);

            // 2. Crear contexto para Gemini
            const contextoProductos = productosRelevantes.length > 0
                ? `Productos disponibles en la tienda:\n${productosRelevantes.map((p, i) => 
                    `${i + 1}. ${p.nombre} - $${p.precio} COP - ${p.descripcion}`
                  ).join('\n')}`
                : 'No se encontraron productos exactos, pero puedo ayudarte a buscar.';

            // 3. Crear prompt para Gemini
            const prompt = `Eres un asistente de ventas de una tienda de repuestos de autos llamada Gretta.

Consulta del cliente: "${mensajeUsuario}"

${contextoProductos}

Instrucciones:
- Si hay productos relevantes, recomienda brevemente los mejores
- Sé amable, profesional y conciso (máximo 3-4 líneas)
- NO inventes productos que no estén en la lista
- Si no hay productos, sugiere buscar en otras categorías

Respuesta:`;

            console.log('📤 Enviando a Gemini...');

            // 4. Probar con los modelos disponibles (Gemini 2.x)
            const modelosParaProbar = [
                'gemini-2.0-flash-lite',
                'gemini-2.0-flash',
                'gemini-2.5-flash-lite',
                'gemini-2.5-flash'
            ];

            let response = null;
            let modeloUsado = null;

            // Intentar con cada modelo hasta que uno funcione
            for (const modelo of modelosParaProbar) {
                try {
                    console.log(`🔄 Probando modelo: ${modelo}`);
                    
                    response = await fetch(
                        `https://generativelanguage.googleapis.com/v1/models/${modelo}:generateContent?key=${GEMINI_API_KEY}`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [{
                                        text: prompt
                                    }]
                                }]
                            })
                        }
                    );

                    if (response.ok) {
                        modeloUsado = modelo;
                        console.log(`✅ Modelo funcionando: ${modelo}`);
                        break;
                    } else {
                        console.log(`❌ Modelo ${modelo} no disponible`);
                    }
                } catch (error) {
                    console.log(`❌ Error con modelo ${modelo}:`, error.message);
                }
            }

            if (!response || !response.ok) {
                throw new Error('Ningún modelo de Gemini está disponible para tu API Key');
            }

            const data = await response.json();
            
            console.log(`📥 Respuesta de Gemini (${modeloUsado}):`, data);

            if (!response.ok) {
                throw new Error(data.error?.message || `Error ${response.status}`);
            }

            const respuestaIA = data.candidates[0].content.parts[0].text;

            // 5. Agregar respuesta de la IA
            setMensajes([
                ...nuevosMensajes,
                { 
                    rol: 'ia', 
                    texto: respuestaIA,
                    productos: productosRelevantes 
                }
            ]);

            console.log('✅ Mensaje procesado exitosamente');

        } catch (error) {
            console.error('❌ Error completo:', error);
            setMensajes([
                ...nuevosMensajes,
                { 
                    rol: 'ia', 
                    texto: `Lo siento, ocurrió un error: ${error.message}. Por favor intenta nuevamente.` 
                }
            ]);
        } finally {
            setCargando(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje();
        }
    };

    const handleAgregarCarrito = (producto) => {
        if (!usuario) {
            alert('Debes iniciar sesión para agregar productos al carrito');
            return;
        }
        agregarAlCarrito(producto);
    };

    const sugerenciasIniciales = [
        "Busco una farola para mi carro",
        "Necesito llantas nuevas",
        "¿Tienen aceites de motor?",
        "Busco repuestos para frenos"
    ];

    const usarSugerencia = (sugerencia) => {
        setInputUsuario(sugerencia);
    };

    return (
        <div className="container py-4" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="row h-100">
                <div className="col-lg-8 mx-auto h-100 d-flex flex-column">
                    
                    {/* Header */}
                    <div className="card mb-3">
                        <div className="card-body">
                            <h3 className="mb-2">
                                <span className="me-2">🤖</span>
                                Asistente Virtual Gretta
                            </h3>
                            <p className="text-muted mb-0">
                                ¡Hola! Soy tu asistente virtual. Pregúntame sobre repuestos y te ayudaré a encontrar lo que necesitas.
                            </p>
                        </div>
                    </div>

                    {/* Chat Container */}
                    <div className="card flex-grow-1" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-body" style={{ 
                            overflowY: 'auto', 
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            
                            {/* Mensajes vacíos - Sugerencias */}
                            {mensajes.length === 0 && (
                                <div className="text-center my-auto">
                                    <div className="mb-4">
                                        <span style={{ fontSize: '60px' }}>💬</span>
                                    </div>
                                    <h5 className="mb-3">¿En qué puedo ayudarte hoy?</h5>
                                    <p className="text-muted mb-4">Prueba con alguna de estas preguntas:</p>
                                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                                        {sugerenciasIniciales.map((sugerencia, index) => (
                                            <button
                                                key={index}
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => usarSugerencia(sugerencia)}
                                            >
                                                {sugerencia}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Mensajes del chat */}
                            {mensajes.map((mensaje, index) => (
                                <div key={index} className="mb-3">
                                    {mensaje.rol === 'usuario' ? (
                                        // Mensaje del usuario
                                        <div className="d-flex justify-content-end">
                                            <div className="bg-danger text-white rounded px-3 py-2" style={{ maxWidth: '70%' }}>
                                                {mensaje.texto}
                                            </div>
                                        </div>
                                    ) : (
                                        // Mensaje de la IA
                                        <div>
                                            <div className="d-flex justify-content-start mb-2">
                                                <div className="bg-light rounded px-3 py-2" style={{ maxWidth: '70%' }}>
                                                    <div className="d-flex align-items-center mb-1">
                                                        <span className="me-2">🤖</span>
                                                        <small className="text-muted fw-bold">Asistente</small>
                                                    </div>
                                                    {mensaje.texto}
                                                </div>
                                            </div>

                                            {/* Productos recomendados */}
                                            {mensaje.productos && mensaje.productos.length > 0 && (
                                                <div className="ms-4">
                                                    <small className="text-muted fw-bold">Productos sugeridos:</small>
                                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                                        {mensaje.productos.map((producto) => (
                                                            <div key={producto.id_producto} className="card" style={{ width: '200px' }}>
                                                                <img 
                                                                    src={producto.imagen_url} 
                                                                    className="card-img-top" 
                                                                    alt={producto.nombre}
                                                                    style={{ height: '120px', objectFit: 'cover' }}
                                                                />
                                                                <div className="card-body p-2">
                                                                    <h6 className="card-title mb-1" style={{ fontSize: '14px' }}>
                                                                        {producto.nombre}
                                                                    </h6>
                                                                    <p className="text-success fw-bold mb-2">
                                                                        ${parseFloat(producto.precio).toLocaleString('es-CO')} COP
                                                                    </p>
                                                                    <button 
                                                                        className="btn btn-danger btn-sm w-100"
                                                                        onClick={() => handleAgregarCarrito(producto)}
                                                                        disabled={!usuario}
                                                                    >
                                                                        {usuario ? 'Agregar' : 'Inicia sesión'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Indicador de carga */}
                            {cargando && (
                                <div className="d-flex justify-content-start mb-3">
                                    <div className="bg-light rounded px-3 py-2">
                                        <div className="spinner-border spinner-border-sm text-danger me-2" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                        <span className="text-muted">Pensando...</span>
                                    </div>
                                </div>
                            )}

                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="card-footer bg-white border-top">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Escribe tu pregunta aquí..."
                                    value={inputUsuario}
                                    onChange={(e) => setInputUsuario(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={cargando}
                                />
                                <button 
                                    className="btn btn-danger"
                                    onClick={enviarMensaje}
                                    disabled={cargando || !inputUsuario.trim()}
                                >
                                    {cargando ? (
                                        <span className="spinner-border spinner-border-sm" role="status"></span>
                                    ) : (
                                        <span>Enviar</span>
                                    )}
                                </button>
                            </div>
                            <small className="text-muted mt-2 d-block">
                                💡 Tip: Describe lo que necesitas para tu vehículo y te ayudaré a encontrarlo
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatIA;