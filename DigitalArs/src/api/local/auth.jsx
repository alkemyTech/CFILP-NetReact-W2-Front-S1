
import usuario from "../local/pruebaUsuario.json"

export const login = (email, password) => {
  return new Promise((resolve, reject) => {
    const user = usuario.find(u => u.email === email && u.password === password);
    
  if (user) {
    localStorage.setItem('loggedUserEmail', user.email); // guardar email
    setTimeout(() => resolve({ 
      success: true, 
      data: { user, token: 'fake-token' } 
    }), 500);
  }
  else {
       setTimeout(() => reject({ 
         success: false, 
         error: 'Credenciales incorrectas' 
       }), 500);
     }
   });
};

export const getUsuario = () => {
  return new Promise(resolve => {
    setTimeout(() => resolve({
      success: true,
      data: usuario.filter(u => u.email.includes('.com'))
    }), 300);
  });
};

export const logout = () => {
  return Promise.resolve({ success: true });
};