// utils/auth.js
const axios = require('axios');
const Store = require('electron-store');

const store = new Store();
const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Adjust if needed

async function login(username, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/token/`, {
      username,
      password,
    });

    store.set('access', response.data.access);
    store.set('refresh', response.data.refresh);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || error.message };
  }
}

async function register(username, password, email) {
  try {
    const response = await axios.post(`${API_BASE_URL}/register/`, {
      username,
      password,
      email,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || error.message };
  }
}

function getAccessToken() {
  return store.get('access');
}

function logout() {
  store.clear();
}

module.exports = {
  login,
  register,
  getAccessToken,
  logout,
};
