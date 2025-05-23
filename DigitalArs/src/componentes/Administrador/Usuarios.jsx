import React, { useMemo, useState, useEffect, useContext } from "react";
import { ConfigContext } from "../../config/ConfigContext";
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import { AuthContext } from '../../servicios/AuthContext';

const Usuarios = () => {
  const { MuiComponents, api, router, commonFunctions } = useContext(ConfigContext);
  const {
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
  } = MuiComponents;
  const { navigate } = router;
  const { getToken } = commonFunctions;
  const { user } = useContext(AuthContext);
  const roleNames = useMemo(() => user?.roles?.map(rol => rol.nombre) ?? [], [user]);
  const esAdmin = useMemo(() => roleNames.includes('Administrador'), [roleNames]);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");
  const adminPath = '/Administrar';
  const titulo = "Usuarios";

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError("No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
        navigate("/");
        return;
      }
      const response = await api.get("https://localhost:7097/Usuario", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const usuariosFiltrados = response.data
        ? response.data.filter((usuario) => usuario.dni > 100)
        : [];
      setUsuarios(usuariosFiltrados);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setError("Error al cargar los usuarios.");
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        navigate("/");
      }
    }
  };

  const eliminarUsuario = async (dni) => {
    try {
      const token = getToken();
      if (!token) {
        alert("No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
        navigate("/");
        return;
      }
      await api.delete(`https://localhost:7097/Usuario/${dni}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsuarios(prev => prev.filter(u => u.dni !== dni));
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert("Error al eliminar el usuario.");
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        navigate("/");
      }
    }
  };

  const crearUsuario = () => {
    navigate('/crearUsuario');
  };

  const editarUsuario = (dni) => {
    navigate(`/editarUsuario/${dni}`);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          maxWidth: 800,
          margin: 'auto',
          border: '1.5px solid #1976d2',
          backgroundColor: esAdmin ? '#FFD89B' : '#ffffff',
        }}
      >
        <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
          <Grid sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: esAdmin ? 'error.main' : 'primary.main',
              }}>
              {titulo.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
          <Grid sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {titulo}
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
                    <TableCell sx={{ textAlign: 'center' }}><strong>DNI</strong></TableCell>
                    <TableCell sx={{ textAlign: 'center' }}><strong>Nombre</strong></TableCell>
                    <TableCell sx={{ textAlign: 'center' }}><strong>Email</strong></TableCell>
                    <TableCell sx={{ textAlign: 'center' }}><strong>Roles</strong></TableCell>
                    <TableCell sx={{ textAlign: 'center' }}><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuarios.length > 0 ? (
                    usuarios.map((usuario) => (
                      <TableRow key={usuario.dni}>
                        <TableCell sx={{ textAlign: 'center' }}>{usuario.dni}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{usuario.nombre} {usuario.apellido}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{usuario.email}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {usuario.roles?.length > 0
                            ? usuario.roles.map(r => r.nombre).join(", ")
                            : "Sin roles"
                          }
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {/* Botón Editar */}
                          <IconButton
                            color="info"
                            onClick={() => editarUsuario(usuario.dni)}
                            aria-label="Editar usuario"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          {/* Botón Eliminar */}
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
                  color="primary"
                  size="large"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(adminPath)}
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
  );
};

export default Usuarios;