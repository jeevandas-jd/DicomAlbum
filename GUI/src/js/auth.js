// Login button click
document.getElementById('login-btn').addEventListener('click', async () => {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const result = await window.electronAPI.login(username,password);
    console.log(result); // Log the response to check

    if (result.access && result.refresh) {
      alert('Login successful');
      window.location.href = 'home.html';
    } else {
      alert('Login failed');
    }
  } catch (err) {
    console.log(err);
    alert('Unexpected error during login');
    console.error(err);
  }
});

// Register button click — ✅ corrected IDs
document.getElementById('register-btn').addEventListener('click', async () => {
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  const email = document.getElementById('register-email').value;

  try {
    const result = await window.electronAPI.register(username, email, password);
    console.log(result); // Log the response to check

    if (result.access && result.refresh) {
      alert('Registration successful. You can now login.');
    } else {
      alert('Registration failed');
    }
  } catch (err) {
    alert('Unexpected error during registration');
    console.error(err);
  }
});
