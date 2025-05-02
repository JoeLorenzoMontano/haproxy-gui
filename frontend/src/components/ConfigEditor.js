import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, Box, Alert, Snackbar } from '@mui/material';
import axios from 'axios';

const API_URL = 'http://192.168.1.175:3000/api';

const ConfigEditor = () => {
  const [config, setConfig] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/config`);
      setConfig(response.data.config);
    } catch (error) {
      console.error('Error fetching config:', error);
      setMessage({ text: 'Failed to load configuration', type: 'error' });
      setShowMessage(true);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      await axios.post(`${API_URL}/config`, { config });
      setMessage({ text: 'Configuration saved successfully', type: 'success' });
      setShowMessage(true);
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ 
        text: error.response?.data?.error || 'Failed to save configuration', 
        type: 'error' 
      });
      setShowMessage(true);
    }
  };

  const handleCloseMessage = () => {
    setShowMessage(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        HAProxy Configuration Editor
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={fetchConfig} sx={{ mr: 1 }}>
          Reload
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={saveConfig}
          disabled={loading}
        >
          Save & Apply
        </Button>
      </Box>
      <TextField
        multiline
        fullWidth
        minRows={20}
        maxRows={40}
        value={config}
        onChange={(e) => setConfig(e.target.value)}
        variant="outlined"
        InputProps={{
          style: { fontFamily: 'monospace' }
        }}
        disabled={loading}
      />
      <Snackbar open={showMessage} autoHideDuration={6000} onClose={handleCloseMessage}>
        <Alert onClose={handleCloseMessage} severity={message.type} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConfigEditor;
