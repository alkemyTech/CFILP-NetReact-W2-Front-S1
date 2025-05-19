// En App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from './componentes/Home';
import LoginForm from './componentes/LoginForm';
import { PrivateRoute } from './componentes/PrivateRoute';
import Transferencia from './componentes/Transferencia';
import PlazoFijo from './componentes/PlazoFijo';
import Administrar from './componentes/Administrar';



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
  const [user, setUser] = useState(null); // Nuevo estado para la lista de usuarios

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

  // useEffect(() => {
  //   const storedUsuariosData = localStorage.getItem('usuarios_data');
  //   if (storedUsuariosData) {
  //     const data = JSON.parse(storedUsuariosData);
  //     if (Array.isArray(data)) { // Verifica si data es un array
  //       setUser(data);
  //       const usuarioGuardado = localStorage.getItem('usuario');
  //       if (usuarioGuardado) {
  //         const datosUsuario = JSON.parse(usuarioGuardado);
  //         const usuarioEncontrado = data.find(u => u.id === datosUsuario.id);
  //         if (usuarioEncontrado) {
  //           setUsuario(usuarioEncontrado);
  //           setSaldo(usuarioEncontrado.saldo);
  //         }
  //       }
  //     } else {
  //       // Manejar el caso en que data no es un array (opcional: puedes inicializar con un array vacío o mostrar un error)
  //       console.warn("localStorage 'usuarios_data' no contiene un array válido:", data);
  //       setUser([]);
  //     }
  //   } else {
  //     setUser(user);
  //     const usuarioGuardado = localStorage.getItem('user');
  //     if (usuarioGuardado) {
  //       const datosUsuario = JSON.parse(usuarioGuardado);
  //       const usuarioEncontrado = user.find(u => u.dni === datosUsuario.dni);
  //       if (usuarioEncontrado) {
  //         setUser(usuarioEncontrado);

  //       }
  //     }
  //   }
  // }, []);

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
            path="/PlazoFijo"
            element={
              <PrivateRoute>
                <PlazoFijo user={user} />
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
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;