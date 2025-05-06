const ElectronStore = require('electron-store');  // ✅ not { Store }

const store = new ElectronStore();

function setToken(token) {
  store.set('token', token);
}

function getToken() {
  return store.get('token');
}

function clearToken() {
  store.delete('token');
}

module.exports = {
  setToken,
  getToken,
  clearToken
};
