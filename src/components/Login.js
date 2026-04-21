import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

function Login({ apiUrl, onLogin }) {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('password123');
  const [otpToken, setOtpToken] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [step, setStep] = useState('credentials');
  const [error, setError] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${apiUrl}/auth/login`, { username, password });
      
      if (res.data.requires2FA) {
        setStep('2fa');
        const devicesRes = await axios.get(`${apiUrl}/auth/devices`, { params: { username } });
        console.log(devices, "devices");
        
        setDevices(devicesRes.data);
        if (devicesRes.data.length > 0) {
          setSelectedDevice(devicesRes.data[0].id);
        }
      } else {
        onLogin(res.data.token, username);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${apiUrl}/auth/verify-2fa`, {
        username,
        token: otpToken,
        deviceId: selectedDevice || undefined,
      });
      onLogin(res.data.token, username);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP token');
    }
  };

  const handleBackupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${apiUrl}/auth/verify-backup`, {
        username,
        code: backupCode,
      });
      onLogin(res.data.token, username);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid backup code');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>TOTP 2FA Login</h2>
        
        {error && <div className="error">{error}</div>}

        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
        )}

        {step === '2fa' && (
          <div>
            <form onSubmit={handle2FASubmit}>
              <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
                {devices.map(d => (
                  <option key={d.id} value={d.id}>{d.deviceName}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Enter OTP Code"
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value)}
                maxLength={6}
              />
              <button type="submit">Verify</button>
            </form>
            <button className="backup-btn" onClick={() => setStep('backup')}>
              Use Backup Code
            </button>
          </div>
        )}

        {step === 'backup' && (
          <div>
            <form onSubmit={handleBackupSubmit}>
              <input
                type="text"
                placeholder="Enter Backup Code"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
              />
              <button type="submit">Verify</button>
            </form>
            <button className="backup-btn" onClick={() => setStep('2fa')}>
              Back to OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
