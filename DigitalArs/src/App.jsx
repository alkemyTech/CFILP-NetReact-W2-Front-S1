import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './servicios/AuthContext';
import { PrivateRoute } from './componentes/PrivateRoute';
import { ConfigProvider } from './config/ConfigContext';
import LoginForm from './componentes/Session/LoginForm';
import Home from './componentes/Home';
import Perfil from './componentes/Perfil';
import Deposito from './componentes/Operaciones/Deposito';
import Transferencia from './componentes/Operaciones/Transferencia';
import Inversion from './componentes/Operaciones/Inversion';
import Administrar from './componentes/Administrador/Administrar';
import Usuarios from './componentes/Administrador/Usuarios';
import CrearUsuario from './componentes/Administrador/Usuario/CrearUsuario';
import EditarUsuario from './componentes/Administrador/Usuario/EditarUsuario';
import Cuentas from './componentes/Administrador/Cuentas';
import Transacciones from './componentes/Administrador/Transacciones';
import CrearCuenta from './componentes/Administrador/Usuario/CrearCuenta';
import EditarCuenta from './componentes/Administrador/Usuario/EditarCuenta';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ConfigProvider>
          <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <PrivateRoute>
                  <Perfil />
                </PrivateRoute>
              }
            />
            <Route
              path="/transferencia"
              element={
                <PrivateRoute>
                  <Transferencia />
                </PrivateRoute>
              }
            />
            <Route
              path="/inversion"
              element={
                <PrivateRoute>
                  <Inversion />
                </PrivateRoute>
              }
            />
            <Route
              path="/administrar"
              element={
                <PrivateRoute>
                  <Administrar />
                </PrivateRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <PrivateRoute>
                  <Usuarios />
                </PrivateRoute>
              }
            />
            <Route
              path="/crearUsuario"
              element={
                <PrivateRoute>
                  <CrearUsuario />
                </PrivateRoute>
              }
            />
            <Route
              path="/CrearCuenta"
              element={
                <PrivateRoute>
                  <CrearCuenta />
                </PrivateRoute>
              }
            />
            <Route
              path="/editarUsuario/:dni"
              element={
                <PrivateRoute>
                  <EditarUsuario />
                </PrivateRoute>
              }
            />
            <Route
              path="/EditarCuenta/:id"
              element={
                <PrivateRoute>
                  <EditarCuenta />
                </PrivateRoute>
              }
            />
            <Route
              path="/cuentas"
              element={
                <PrivateRoute>
                  <Cuentas />
                </PrivateRoute>
              }
            />
            <Route
              path="/transacciones"
              element={
                <PrivateRoute>
                  <Transacciones />
                </PrivateRoute>
              }
            />
            <Route
              path="/deposito"
              element={
                <PrivateRoute>
                  <Deposito />
                </PrivateRoute>
              }
            />
          </Routes>
        </ConfigProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;