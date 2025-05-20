// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Visibility, VisibilityOff } from '@mui/icons-material';
// import {
//   TextField,
//   Button,
//   Box,
//   Typography,
//   Paper,
//   InputAdornment,
//   IconButton,
//   useTheme,
//   useMediaQuery
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { login } from '../servicios/authService';
// import { theme } from '../utils/theme';

// const LoginForm = ({ setUser }) => {
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const themeMUI = useTheme();
//   const isMobile = useMediaQuery(themeMUI.breakpoints.down('sm'));
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword((prev) => !prev);
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     if (!form.email || !form.password) {
//       setError('Completa todos los campos');
//       return;
//     }

//     try {
//       const { token, user } = await login(form.email, form.password);
//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(user));
//       setUser(user);
//       setError('');
//       navigate('/Home');
//     } catch (err) {
//       const mensaje = err.response?.status === 401
//         ? 'Credenciales inválidas'
//         : 'Ocurrió un error al iniciar sesión. Intente más tarde.';
//       setError(mensaje);
//       console.error(err);
//     }
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           minHeight: '100vh',
//           backgroundColor: '#f5f5f5',
//           p: 2
//         }}
//       >
//         <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 2 }}>
//           <Typography variant="h4" component="h1" align="center" gutterBottom>
//             Billetera Virtual
//           </Typography>

//           {error && (
//             <Typography color="error" align="center" sx={{ mb: 2 }}>
//               {error}
//             </Typography>
//           )}

//           <Box component="form" onSubmit={handleLogin}>
//             <TextField
//               label="Email"
//               name="email"
//               value={form.email}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               variant="outlined"
//               type="email"
//               autoComplete="email"
//             />
//             <TextField
//               label="Contraseña"
//               name="password"
//               value={form.password}
//               onChange={handleChange}
//               type={showPassword ? 'text' : 'password'}
//               fullWidth
//               margin="normal"
//               variant="outlined"
//               autoComplete="current-password"
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton
//                       onClick={togglePasswordVisibility}
//                       edge="end"
//                       aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
//                     >
//                       {showPassword ? <VisibilityOff /> : <Visibility />}
//                     </IconButton>
//                   </InputAdornment>
//                 )
//               }}
//               sx={{ mb: 3 }}
//             />
//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               size="large"
//               sx={{ py: 1.5 }}
//             >
//               Iniciar sesión
//             </Button>
//           </Box>
//         </Paper>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default LoginForm;

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
import { ThemeProvider } from '@mui/material/styles';
import { login } from '../servicios/authService';
import { theme } from '../utils/theme';
import { AuthContext } from '../servicios/AuthContext';

const LoginForm = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const themeMUI = useTheme();
  const isMobile = useMediaQuery(themeMUI.breakpoints.down('sm'));
  const navigate = useNavigate();

  const { setUser } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError('Completa todos los campos');
      return;
    }

    try {
      const { token, user } = await login(form.email, form.password);

      // Asignar rol para el user antes de setear
      user.rol = user.roles?.[0]?.nombre || 'Sin rol';

      // Guardar token y usuario con rol en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Actualizar contexto con usuario con rol
      setUser(user);

      setError('');
      navigate('/Home');
    } catch (err) {
      const mensaje = err.response?.status === 401
        ? 'Credenciales inválidas'
        : 'Ocurrió un error al iniciar sesión. Intente más tarde.';
      setError(mensaje);
      console.error(err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          p: 2
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Billetera Virtual
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
              fullWidth
              margin="normal"
              variant="outlined"
              type="email"
              autoComplete="email"
            />
            <TextField
              label="Contraseña"
              name="password"
              value={form.password}
              onChange={handleChange}
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              variant="outlined"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
              fullWidth
              variant="contained"
              size="large"
              sx={{ py: 1.5 }}
            >
              Iniciar sesión
            </Button>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default LoginForm;
