import React from 'react'
import style from '../styles/style-contenedorPages.module.scss'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Carrito from '../pages/Carrito'
import TusProductos from '../pages/TusProductos'
import Ia from '../pages/Ia'
import AutoCallBack from '../pages/AutoCallBack'
import Vender from '../pages/Vender'

const ContanerPages = () => {
    return (
        <div className={style.contenedorpages}>
            
            <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/carrito' element={<Carrito/>}/>
                <Route path='/tusproductos' element={<TusProductos/>}/>
                <Route path='/ia' element={<Ia/>}></Route>
                <Route path='/auth/callback' element={<AutoCallBack/>}></Route>
                <Route path='/registroVendedor' element={<Vender/>}></Route>
            </Routes>

        </div>
    )
}

export default ContanerPages