import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from './componentes/Home';
import LoginForm from './componentes/LoginForm';
import { PrivateRoute } from './componentes/PrivateRoute';
import Transferencia from './componentes/Transferencia';
import Deposito from './componentes/Deposito';
import Administrar from './componentes/Administrar';
import Usuarios from './componentes/Usuarios';
import Cuentas from './componentes/Cuentas';
import Transacciones from './componentes/Transacciones';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error('Error al parsear user desde localStorage:', err);
        setUser(null);
      }
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginForm setUser={setUser} />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/transferencia"
            element={
              <PrivateRoute>
                <Transferencia user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/deposito"
            element={
              <PrivateRoute>
                <Deposito user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/administrar"
            element={
              <PrivateRoute>
                <Administrar user={user} />
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
    </ThemeProvider>
  );
}

export default App;