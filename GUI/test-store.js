const { setToken, getToken, clearToken } = require('./store');

setToken('abc123');
console.log('Stored token:', getToken());
clearToken();
console.log('After clear:', getToken());
