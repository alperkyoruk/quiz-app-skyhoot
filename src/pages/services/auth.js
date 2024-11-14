import axios from 'axios';
import Cookies from 'js-cookie';

export const registerUser = async (userData) => {
  return axios.post('/api/register', userData);
};

export const loginUser = async (loginData) => {
  return axios.post('/api/login', loginData);
};

// Store token in cookies
export const setToken = (token) => {
  Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'Strict' });
};

// Retrieve token from cookies
export const getToken = () => Cookies.get('token');

// Remove token from cookies
export const removeToken = () => {
  Cookies.remove('token');
};

export const logout = () => {
    removeToken();
  };
  