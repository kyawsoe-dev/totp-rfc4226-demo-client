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

  const getStepIndicator = () => {
    const steps = ['credentials', '2fa', 'backup'];
    const currentIndex = steps.indexOf(step);
    return (
      <div className="step-indicator">
        {steps.map((s, i) => (
          <div key={s} className={`step-dot ${i <= currentIndex ? 'active' : ''}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>TOTP 2FA</h2>
        <p className="subtitle">Secure Authentication Portal</p>
        
        {getStepIndicator()}
        {error && <div className="error">{error}</div>}

        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit">Continue</button>
          </form>
        )}

        {step === '2fa' && (
          <div>
            <form onSubmit={handle2FASubmit}>
              <div className="form-group device-select-wrapper">
                <label>Select Device</label>
                <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>{d.deviceName}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Verification Code</label>
                <input
                  type="text"
                  placeholder="000000"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="otp-display"
                />
              </div>
              <button type="submit">Verify</button>
            </form>
            <button className="backup-btn" onClick={() => setStep('backup')}>
              Use Backup Code Instead
            </button>
          </div>
        )}

        {step === 'backup' && (
          <div>
            <form onSubmit={handleBackupSubmit}>
              <div className="form-group">
                <label>Backup Code</label>
                <input
                  type="text"
                  placeholder="Enter backup code"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                />
              </div>
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
