import axios from 'axios';

const API_BASE_URL = 'https://localhost:7097/';

export const login = async (email, password) => {
  const url = `${API_BASE_URL}Token/login`;
  const response = await axios.post(url, null, {
    params: { email, password }
  });

  const { token, usuarioDNI } = response.data;

  localStorage.setItem('token', token);

  try {
    const userDetailsResponse = await axios.get(`${API_BASE_URL}Usuario/${usuarioDNI}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const user = userDetailsResponse.data;

    localStorage.setItem('user', JSON.stringify(user));

    return { token, user };
  } catch (error) {
    console.error("Error al obtener los detalles del usuario:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return Promise.resolve({ success: true });
};