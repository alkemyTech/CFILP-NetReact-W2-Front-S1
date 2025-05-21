import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Grid,
  Avatar
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../utils/theme";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const homePath = '/Home';
  
  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const response = await axios.get("https://localhost:7097/Usuario");
      setUsuarios(response.data ?? []);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setError("Error al cargar los usuarios.");
    }
  };

  const eliminarUsuario = async (dni) => {
    try {
      await axios.delete(`https://localhost:7097/Usuario/${dni}`);
      setUsuarios(prev => prev.filter(u => u.dni !== dni));
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert("Error al eliminar el usuario.");
    }
  };

  const crearUsuario = () => {
    navigate('/crearUsuario');
  };

  const editarUsuario = (dni) => {
    navigate(`/editarUsuario/${dni}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Paper elevation={3} sx={{ padding: 3, maxWidth: 800, margin: "auto" }}>
          <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
            <Grid sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ width: 56, height: 56 }}>U</Avatar>
            </Grid>
            <Grid sx={{ flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Usuarios
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Gestión de usuarios
              </Typography>
            </Grid>
            <Box display="flex" flexDirection="column" gap={1}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonAddIcon />}
                onClick={crearUsuario}
              >
                Usuario Nuevo
              </Button>
            </Box>
          </Grid>

          {error ? (
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ marginY: 2 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell><strong>DNI</strong></TableCell>
                      <TableCell><strong>Nombre</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Roles</strong></TableCell>
                      <TableCell><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuarios.length > 0 ? (
                      usuarios.map((usuario) => (
                        <TableRow key={usuario.dni}>
                          <TableCell>{usuario.dni}</TableCell>
                          <TableCell>{usuario.nombre} {usuario.apellido}</TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>
                            {usuario.roles?.length > 0
                              ? usuario.roles.map(r => r.nombre).join(", ")
                              : "Sin roles"
                            }
                          </TableCell>
                          <TableCell>
                            {/* Botón Editar */}
                            <IconButton
                              color="info"
                              onClick={() => editarUsuario(usuario.dni)}
                              aria-label="Editar usuario"
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            {/* Botón Eliminar existente */}
                            <IconButton
                              color="error"
                              onClick={() => eliminarUsuario(usuario.dni)}
                              aria-label="Eliminar usuario"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No hay usuarios para mostrar.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Botón Volver */}
              <Grid container spacing={2} sx={{ marginTop: 2 }} columns={12}>
                <Grid gridColumn="span 2">
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(homePath)}
                    fullWidth
                    sx={{ height: '60px' }}
                  >
                    Volver
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Usuarios;