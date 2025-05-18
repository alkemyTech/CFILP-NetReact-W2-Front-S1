// En App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from './componentes/Home';
import LoginForm from './componentes/LoginForm';
import { PrivateRoute } from './componentes/PrivateRoute';
import Transferencia from './componentes/Transferencia';
import Deposito from './componentes/Deposito';
import userData from './api/local/pruebaUsuario.json'; // Importa el JSON para la carga inicial si localStorage está vacío

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
  const [usuario, setUsuario] = useState(null);
  const [saldo, setSaldo] = useState(0);
  const [usuariosData, setUsuariosData] = useState([]); // Nuevo estado para la lista de usuarios

useEffect(() => {
  const storedUsuariosData = localStorage.getItem('usuarios_data');
  if (storedUsuariosData) {
    const data = JSON.parse(storedUsuariosData);
    if (Array.isArray(data)) { // Verifica si data es un array
      setUsuariosData(data);
      const usuarioGuardado = localStorage.getItem('usuario');
      if (usuarioGuardado) {
        const datosUsuario = JSON.parse(usuarioGuardado);
        const usuarioEncontrado = data.find(u => u.id === datosUsuario.id);
        if (usuarioEncontrado) {
          setUsuario(usuarioEncontrado);
          setSaldo(usuarioEncontrado.saldo);
        }
      }
    } else {
        // Manejar el caso en que data no es un array (opcional: puedes inicializar con un array vacío o mostrar un error)
        console.warn("localStorage 'usuarios_data' no contiene un array válido:", data);
        setUsuariosData([]);
    }
  } else {
    setUsuariosData(userData);
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const datosUsuario = JSON.parse(usuarioGuardado);
      const usuarioEncontrado = userData.find(u => u.id === datosUsuario.id);
      if (usuarioEncontrado) {
        setUsuario(usuarioEncontrado);
        setSaldo(usuarioEncontrado.saldo);
      }
    }
  }
}, []);

  useEffect(() => {
    console.log("El saldo en App.js ha cambiado a:", saldo);
  }, [saldo]);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginForm setUsuario={setUsuario} setSaldo={setSaldo} setUsuariosData={setUsuariosData} />} /> {/* Pasa setUsuariosData */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home usuario={usuario} saldo={saldo} />
              </PrivateRoute>
            }
          />
          <Route
            path="/transferencia"
            element={
              <PrivateRoute>
                <Transferencia usuario={usuario} saldo={saldo} setSaldo={setSaldo} />
              </PrivateRoute>
            }
          />
          <Route
            path="/deposito"
            element={
              <PrivateRoute>
                <Deposito usuario={usuario} saldo={saldo} setSaldo={setSaldo} />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;