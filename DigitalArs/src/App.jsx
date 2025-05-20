import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from './servicios/AuthContext';
import { PrivateRoute } from './componentes/PrivateRoute';
import LoginForm from './componentes/LoginForm';
import Home from './componentes/Home';
import Transferencia from './componentes/Transferencia';
import Inversion from './componentes/Inversion';
import Administrar from './componentes/Administrar';
import Usuarios from './componentes/usuarios';
import Cuentas from './componentes/cuentas';
import Transacciones from './componentes/transacciones';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
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
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
