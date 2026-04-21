import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard({ apiUrl, token, username, onLogout }) {
  const [devices, setDevices] = useState([]);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDevice, setNewDevice] = useState(null);
  const [confirmToken, setConfirmToken] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchDevices = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/auth/devices`, { params: { username } });
      setDevices(res.data);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
  }, [apiUrl, username]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleAddDevice = async (deviceName) => {
    try {
      const res = await axios.post(`${apiUrl}/auth/add-device`, { username, deviceName });
      setNewDevice(res.data);
      setShowAddDevice(true);
    } catch (err) {
      console.error('Failed to add device:', err);
    }
  };

  const handleConfirmDevice = async () => {
    try {
      await axios.post(`${apiUrl}/auth/confirm-device`, {
        username,
        deviceId: newDevice.deviceId,
        token: confirmToken,
      });
      setNewDevice(null);
      setConfirmToken('');
      setShowAddDevice(false);
      fetchDevices();
    } catch (err) {
      alert('Invalid OTP token');
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm('Are you sure you want to remove this device?')) return;
    try {
      await axios.delete(`${apiUrl}/auth/devices/${deviceId}`, {
        params: { username },
        ...authHeader,
      });
      fetchDevices();
    } catch (err) {
      console.error('Failed to delete device:', err);
    }
  };

  const handleGenerateBackupCodes = async () => {
    try {
      const res = await axios.post(`${apiUrl}/auth/backup-codes`, { username }, authHeader);
      setBackupCodes(res.data.codes);
      setShowBackupCodes(true);
    } catch (err) {
      console.error('Failed to generate backup codes:', err);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Security Dashboard</h1>
        <div className="user-info">
          <span>Logged in as</span>
          <strong>{username}</strong>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <section className="devices-section">
        <div className="section-header">
          <h2>Your Devices</h2>
          <span className="device-count">{devices.length} device{devices.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="devices-list">
          {devices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📱</div>
              <p>No devices added yet. Set up your first authenticator below.</p>
            </div>
          ) : (
            devices.map((device) => (
              <div key={device.id} className="device-card">
                <div className="device-info">
                  <div className="device-icon">📱</div>
                  <div>
                    <h3>{device.deviceName}</h3>
                    <span className={`status ${device.confirmed ? 'confirmed' : 'pending'}`}>
                      {device.confirmed ? 'Active' : 'Pending'}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDeleteDevice(device.id)} className="delete-btn">
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <div className="add-device-section">
          {!showAddDevice && (
            <div className="setup-2fa-section">
              <h3>Add New Authenticator</h3>
              <p>Generate a QR code and scan it with your authenticator app (Google Authenticator, Authy, etc.)</p>
              <button onClick={() => handleAddDevice('TOTP-RFC4226-DEMO APP')} className="add-btn">
                Generate QR Code
              </button>
            </div>
          )}

          {showAddDevice && newDevice && (
            <div className="confirm-device">
              <h3>Step 1: Scan QR with Your Phone</h3>
              <p>Open your authenticator app and scan this QR code:</p>
              <img src={newDevice.qr} alt="QR Code" className="qr-image" />

              <div className="manual-entry">
                <p>Can't scan? Enter this secret manually:</p>
                <code className="secret-code">{newDevice.secret}</code>
              </div>

              <hr />

              <h3>Step 2: Enter OTP to Confirm</h3>
              <p>After scanning, enter the 6-digit code from your authenticator app:</p>
              <input
                type="text"
                placeholder="000000"
                value={confirmToken}
                onChange={(e) => setConfirmToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="otp-input"
              />
              <div className="button-group">
                <button onClick={handleConfirmDevice} className="confirm-btn">
                  Confirm & Enable 2FA
                </button>
                <button onClick={() => { setShowAddDevice(false); setNewDevice(null); setConfirmToken(''); }} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="backup-section">
        <div className="section-header">
          <h2>Backup Codes</h2>
        </div>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Generate backup codes in case you lose access to your authenticator app.
        </p>
        <button onClick={handleGenerateBackupCodes} className="generate-btn">
          Generate New Backup Codes
        </button>

        {showBackupCodes && (
          <div className="backup-codes-display">
            <p className="warning">Save these codes in a secure place! You won't see them again.</p>
            <div className="codes-grid">
              {backupCodes.map((code, i) => (
                <code key={i}>{code}</code>
              ))}
            </div>
            <button onClick={() => setShowBackupCodes(false)} className="done-btn">
              I've Saved These Codes
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;