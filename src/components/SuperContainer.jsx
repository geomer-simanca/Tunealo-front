import React from 'react'
import style from '../styles/style-superContainer.module.scss'
import Navbar from './Navbar'
import ContanerPages from './ContanerPages'

const SuperContainer = () => {
    return (
        <div className={style.pantallacompleta}>
            <Navbar/>
            <ContanerPages/>
        </div>
    )
}

export default SuperContainer