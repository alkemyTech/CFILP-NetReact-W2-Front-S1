// // En LoginForm.jsx
// import React, { useState, useEffect } from "react";
// import {
  // TextField,
  // Button,
  // Box,
  // Typography,
  // Paper,
  // InputAdornment,
  // IconButton,
  // useTheme,
  // useMediaQuery,
// } from "@mui/material";
// import { Visibility, VisibilityOff } from "@mui/icons-material";
// import { login } from "../servicios/authService";
// import { useNavigate } from "react-router-dom";

// const LoginForm = ({ setUsuario, setSaldo, setUsuariosData }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [usuarios, setUsuarios] = useState([]);

//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   setError("");

//   if (!email || !password) {
//     setError("Por favor completá todos los campos.");
//     return;
//   }

//   try {
//     const result = await login(email, password);
//     if (result.success && result.data?.token) {
//       localStorage.setItem("authToken", result.data.token);
//       localStorage.setItem("usuario", JSON.stringify(result.data.user));

//       setUsuario(result.data.user);
//       setSaldo(result.data.user.saldo);

//       navigate("/home", { replace: true });
//     } else {
//       setError("Credenciales inválidas");
//     }
//   } catch (err) {
//     setError(err?.message || err?.error || "Error al iniciar sesión");
//   }
// };

import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";

const LoginForm = ({ setUser }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

   const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        'https://localhost:7097/Token/login',
        null,
        {
          params: {
            email: form.email,
            password: form.password
          }
        }
      );

      const { token, user } = response.data; // asumimos que `usuario` es el objeto devuelto
      setToken(token);
      setError('');

      // Guardar en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Actualizar estado global
      setUser(user);

      console.log('Datos:', user);

      navigate("/Home");

    } catch (err) {
      setError('Credenciales inválidas');
      setToken('');
      console.error(err);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: isMobile ? 1 : 3,
        backgroundColor: "#f5f5f5"
      }}
    >
      <Paper
        elevation={isMobile ? 1 : 3}
        sx={{
          p: isMobile ? 2 : 4,
          width: "100%",
          maxWidth: isMobile ? "90%" : "450px",
          borderRadius: 2,
          boxSizing: "border-box"
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          component="h1"
          gutterBottom
          align="center"
          sx={{ mb: 4 }}
        >
          Billetera virtual
        </Typography>

        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            margin="normal"
            size={isMobile ? "small" : "medium"}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Contraseña"
            name="password"
            value={form.password}
            onChange={handleChange}
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            margin="normal"
            size={isMobile ? "small" : "medium"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size={isMobile ? "small" : "medium"}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size={isMobile ? "medium" : "large"}
            sx={{
              py: isMobile ? 1 : 1.5,
              fontSize: isMobile ? "0.875rem" : "1rem"
            }}
          >
            Iniciar Sesión
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm;
