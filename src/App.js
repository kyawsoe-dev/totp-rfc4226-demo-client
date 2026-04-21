import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  const handleLogin = (newToken, user) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', user);
    setToken(newToken);
    setUsername(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
  };

  if (!token) {
    return <Login apiUrl={API_URL} onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>TOTP 2FA Demo</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      <main>
        <Dashboard apiUrl={API_URL} token={token} username={username} />
      </main>
    </div>
  );
}

export default App;
