import usuario from '@local/pruebaUsuario.json'; // Usando el alias correcto

const API_BASE_URL = 'http://localhost:5173/api';

export const login = (email, password) => {
  return new Promise((resolve, reject) => {
    const user = usuario.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem('loggedUserEmail', user.email); // guardar email
      setTimeout(() => resolve({
        success: true,
        data: { user, token: 'fake-token' },
      }), 500);
    } else {
      setTimeout(() => reject({
        success: false,
        error: 'Credenciales incorrectas',
      }), 500);
    }
  });
};

// En ../servicios/authService.js (ejemplo)

export const getUsuario = async () => {
  try {
    const storedUsuariosData = localStorage.getItem('usuarios_data');
    if (storedUsuariosData) {
      const data = JSON.parse(storedUsuariosData);
      return { success: true, data: data };
    } else {
      // Si no hay datos en localStorage (primera vez), podrías leer del JSON inicial
      const response = await fetch('/api/local/pruebaUsuario.json'); // Ajusta la ruta si es necesario
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { success: true, data: data };
    }
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return { success: false, error: "Error al obtener usuarios" };
  }
};

export const logout = () => {
  return Promise.resolve({ success: true });
};
