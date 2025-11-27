import React, { useEffect, useState, useContext } from 'react';
import { supabase } from "../lib/supabaseClient";
import style from '../styles/stylesPages/style-page-home.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
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

    const fetchProductos = async ()=>{
        try{
            const res = await fetch(`https://back-gretta-geoproyectos-f7c21e3a.koyeb.app/productos`)
            const data = await res.json()
            setProductos(data.productos)
        }catch(err){
            console.log(`error al intentar traer los personajes: ${err}`)

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

            // Guardar TRUE o FALSE
            setEsVendedorBD(data.es_vendedor);
        };

        verificarVendedor();
    }, [usuario]);

    const handleAgregarCarrito = (producto) => {
        agregarAlCarrito(producto);
    };

    return (
        <div className={style.containerHome} >
            {/* encabezado */}
            <div className="container-fluid border-bottom border-danger ">
                <div className='header m-4 d-flex justify-content-center gap-3 justify-content-between align-items-center'>

                    <div className="busqueda d-flex gap-2" style={{width:'50%', marginLeft:'200px'}}>
                        <input type="text" className="form-control w-150"  placeholder="Buscar Productos..." aria-label="Username" aria-describedby="basic-addon1"></input>
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
                {productos.map((producto,index)=>(

                    <div className="card d-flex flex-column shadow-sm p-3 mb-5 bg-body-tertiary rounded" style={{ width: "18rem", height: "28rem" }} key={index}>

                    {/* CONTENEDOR FIJO DE LA IMAGEN */}
                    <div style={{ width: "100%", height: "200px", overflow: "hidden" }}>
                        <img
                        src={producto.imagen_url}
                        className="card-img-top"
                        alt="..."
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                        />
                    </div>

                    {/* CONTENIDO */}
                    <div className="card-body d-flex flex-column">
                        <h5 className="card-title fw-bold fs-4">{producto.nombre}</h5>
                        <p className='fw-bold'>${producto.precio} COP</p>
                        <p className="card-text">{producto.descripcion}</p>
                        

                        {/* BOTÓN PEGADO ABAJO */}
                        <div className="mt-auto">
                        <button className="btn btn-danger w-100" onClick={() => handleAgregarCarrito(producto)}>Agregar al Carrito</button>
                        </div>
                    </div>

                    </div>



                ))}

            </div>


        </div>
    )
}

export default Home