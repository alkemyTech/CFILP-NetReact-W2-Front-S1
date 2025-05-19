import usuario from '@local/pruebaUsuario.json'; // Usando el alias correcto

const API_BASE_URL = 'https://localhost:7097/';

export const login = async (email, password) => {
  try {
    const response = await axios("https://localhost:7097/Token/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Credenciales incorrectas");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logout = () => {
  return Promise.resolve({ success: true });
};
