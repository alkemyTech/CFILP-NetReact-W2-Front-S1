import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';

// Crear contexto
export const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Función para refrescar los datos del usuario desde el backend
  const refetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUserRaw = localStorage.getItem('user');

      if (!token || !storedUserRaw) {
        console.warn('Token o usuario faltante en localStorage.');
        return;
      }

      const storedUser = JSON.parse(storedUserRaw);
      const dni = storedUser?.dni;

      if (!dni) {
        console.warn('DNI no encontrado en el usuario almacenado.');
        return;
      }

      const response = await axios.get(`https://localhost:7097/Usuario/${dni}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('Usuario actualizado:', updatedUser);
    } catch (error) {
      console.error('Error al refrescar datos de usuario:', error);
    }
  };

  // Cargar usuario inicial desde localStorage al montar el contexto
  useEffect(() => {
    const storedUserRaw = localStorage.getItem('user');
    if (storedUserRaw) {
      try {
        const storedUser = JSON.parse(storedUserRaw);
        setUser(storedUser);
      } catch (e) {
        console.warn('Error al parsear usuario desde localStorage:', e);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
