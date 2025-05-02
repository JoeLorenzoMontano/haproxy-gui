import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Box, Button, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const API_URL = 'http://192.168.1.175:3000/api';

const Dashboard = () => {
  const [status, setStatus] = useState({ status: 'unknown', details: '', version: '' });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    fetchStatus();
    
    // Refresh status every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/status`);
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceAction = async (action) => {
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/service`, { action });
      setMessage({ text: `HAProxy ${action} successful`, type: 'success' });
      setShowMessage(true);
      setTimeout(fetchStatus, 1000); // Refresh status after action
    } catch (error) {
      console.error(`Error ${action} HAProxy:`, error);
      setMessage({ 
        text: error.response?.data?.error || `Failed to ${action} HAProxy`, 
        type: 'error' 
      });
      setShowMessage(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseMessage = () => {
    setShowMessage(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        HAProxy Dashboard
      </Typography>
      
      {showMessage && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 2 }}
          onClose={handleCloseMessage}
        >
          {message.text}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography variant="h6">Current Status</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Typography variant="h5" color={status.status === 'running' ? 'primary' : 'error'}>
                  HAProxy is {status.status}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Version: {status.version}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<RefreshIcon />} 
                  sx={{ mt: 2 }}
                  onClick={fetchStatus}
                >
                  Refresh Status
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography variant="h6">Quick Actions</Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-around',
              height: '100%',
              pt: 2
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleServiceAction('start')}
                  disabled={actionLoading || status.status === 'running'}
                >
                  Start
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={() => handleServiceAction('stop')}
                  disabled={actionLoading || status.status !== 'running'}
                >
                  Stop
                </Button>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={() => handleServiceAction('reload')}
                  disabled={actionLoading || status.status !== 'running'}
                >
                  Reload
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<RestartAltIcon />}
                  onClick={() => handleServiceAction('restart')}
                  disabled={actionLoading}
                >
                  Restart
                </Button>
              </Box>
              {actionLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6">Service Details</Typography>
            <Box sx={{ mt: 2, fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
              {status.details || 'No details available'}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
