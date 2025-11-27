import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext"; // 👈 Importar

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CarritoProvider> {/* 👈 Agregar */}
        <App />
      </CarritoProvider> {/* 👈 Cerrar */}
    </AuthProvider>
  </StrictMode>,
)
