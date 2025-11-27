import React, { useContext } from 'react';
import btnstyle from '../styles/stylesPages/style-Home-botonVender.module.scss'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';


const Vender = () => {

    const { usuario , cargando } = useContext(AuthContext);
        if (cargando) {
            return null; // o un loader/spinner si quieres
        }
    const [nombre,setNombre] = useState('')
    const [descripcion,setDescripcion] = useState('')

    const navigate = useNavigate();

    const irARaiz = () => {
        navigate('/'); // "/" es la raíz
    }



    // inicio
    const crearVendedor = async () => {
        try {
            const res = await fetch("https://back-gretta-geoproyectos-f7c21e3a.koyeb.app/vendedores", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${import.meta.env.VITE_API_KEY}` // << Contraseña aquí
            },
            body: JSON.stringify({
                id_usuario: usuario.id,
                nombre_tienda: nombre,
                descripcion: descripcion,
                estado: "activo"
            })
            });

            const data = await res.json();
            console.log("Respuesta:", data);

            if (res.ok) {
            // ✔ Mostrar mensaje si quieres
                alert("Tienda creada con éxito");
            // ✔ Redirigir al home
                navigate("/");
            } else {
                alert("Hubo un error al crear la tienda");
            }
            
        } catch (error) {
            console.error("Error:", error);
        }

    };
    // fin

    return (
        <div className='container' style={{height:'100vh'}}>
            
            <button className={btnstyle.cerrarSesionBtn} onClick={irARaiz} style={{marginTop:'20px',display:'flex', justifyContent:'center',alignItems:'center' ,gap:'3px'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                </svg>
                {/* <p style={{ margin:'0'}}>Regresar</p> */}
                
            </button>
            {/* bienbenida encabezado */}
            <div className="encabezado  fw-bold d-flex justify-content-center  text-center " style={{fontSize:'4rem',marginTop:'100px'}}>
                <p style={{ lineHeight: '1' }}> 
                    SE UN VENDEDOR DE <br /> TUNEALO
                </p>
            </div>


            {/* cuerpo */}

            <div className="cuerpo d-flex flex-column justify-content-center align-items-center mt-5">

                <label for="formGroupExampleInput" className="form-label mt-4 fw-bolder text-uppercase" >Cual es el nombre de tu tienda</label>
                <input type="text" className="form-control w-50" value={nombre} onChange={(event)=>(setNombre(event.target.value))} placeholder="Ejemplo: Autopartes Luxury" aria-label="Username" aria-describedby="basic-addon1"></input>

                <p className='mt-4 fw-bolder text-uppercase' > Describe tu tienda</p>
                <textarea className="form-control w-50 mb-3 " value={descripcion} onChange={(event)=>(setDescripcion(event.target.value))} placeholder="Descripcion" id="floatingTextarea2" ></textarea>


                <button className={btnstyle.cerrarSesionBtn} style={{marginBottom:'20px'}} onClick={crearVendedor} >Enviar</button>
                
            </div>

        </div>
    )
}

export default Vender