import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const refetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://localhost:7097/Usuario/{45566115}', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error al refrescar datos de usuario:', error);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
