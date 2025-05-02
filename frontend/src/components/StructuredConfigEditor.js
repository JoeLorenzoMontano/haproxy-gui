import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Box, Alert, Snackbar, Paper, Divider, 
  List, ListItem, ListItemText, Switch, Accordion, AccordionSummary,
  AccordionDetails, TextField, Tabs, Tab
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const API_URL = 'http://192.168.1.175:3000/api';

const StructuredConfigEditor = () => {
  const [structuredConfig, setStructuredConfig] = useState(null);
  const [rawConfig, setRawConfig] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [showMessage, setShowMessage] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      // Fetch both structured and raw config
      const [structuredRes, rawRes] = await Promise.all([
        axios.get(`${API_URL}/config/structured`),
        axios.get(`${API_URL}/config`)
      ]);
      
      setStructuredConfig(structuredRes.data.structuredConfig);
      setRawConfig(rawRes.data.config);
    } catch (error) {
      console.error('Error fetching config:', error);
      setMessage({ text: 'Failed to load configuration', type: 'error' });
      setShowMessage(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBackend = (index) => {
    if (!structuredConfig) return;
    
    const updatedConfig = { ...structuredConfig };
    updatedConfig.backends[index].active = !updatedConfig.backends[index].active;
    setStructuredConfig(updatedConfig);
  };

  const handleToggleFrontend = (index) => {
    if (!structuredConfig) return;
    
    const updatedConfig = { ...structuredConfig };
    updatedConfig.frontends[index].active = !updatedConfig.frontends[index].active;
    setStructuredConfig(updatedConfig);
  };

  const saveStructuredConfig = async () => {
    try {
      await axios.post(`${API_URL}/config/structured`, { structuredConfig });
      setMessage({ text: 'Configuration saved and applied successfully', type: 'success' });
      setShowMessage(true);
      fetchConfig(); // Refresh the config
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ 
        text: error.response?.data?.error || 'Failed to save configuration', 
        type: 'error' 
      });
      setShowMessage(true);
    }
  };

  const saveRawConfig = async () => {
    try {
      await axios.post(`${API_URL}/config`, { config: rawConfig });
      setMessage({ text: 'Configuration saved and applied successfully', type: 'success' });
      setShowMessage(true);
      fetchConfig(); // Refresh the config
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading configuration...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        HAProxy Configuration Editor
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={fetchConfig} 
          sx={{ mr: 1 }}
        >
          Reload
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Structured Editor" />
        <Tab label="Raw Config" />
      </Tabs>

      {activeTab === 0 && structuredConfig && (
        <Box>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Backends</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {structuredConfig.backends.map((backend, index) => (
                  <Paper key={index} sx={{ mb: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle1">{backend.name}</Typography>
                        {backend.referencedIn && backend.referencedIn.length > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            Used in: {backend.referencedIn.map(ref => ref.frontendName).join(', ')}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {backend.active ? 'Enabled' : 'Disabled'}
                        </Typography>
                        <Switch
                          checked={backend.active}
                          onChange={() => handleToggleBackend(index)}
                          color="primary"
                        />
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <TextField
                      multiline
                      fullWidth
                      minRows={5}
                      value={backend.lines.join('\n')}
                      InputProps={{
                        style: { fontFamily: 'monospace', fontSize: '0.85rem' },
                        readOnly: true,
                      }}
                      variant="outlined"
                      disabled={!backend.active}
                    />
                  </Paper>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Frontends</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {structuredConfig.frontends.map((frontend, index) => (
                  <Paper key={index} sx={{ mb: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">{frontend.name}</Typography>
                      <Switch
                        checked={frontend.active}
                        onChange={() => handleToggleFrontend(index)}
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <TextField
                      multiline
                      fullWidth
                      minRows={5}
                      value={frontend.lines.join('\n')}
                      InputProps={{
                        style: { fontFamily: 'monospace', fontSize: '0.85rem' },
                        readOnly: true,
                      }}
                      variant="outlined"
                      disabled={!frontend.active}
                    />
                  </Paper>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Global & Defaults</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle1" gutterBottom>Global</Typography>
              <TextField
                multiline
                fullWidth
                minRows={5}
                value={structuredConfig.global.lines.join('\n')}
                InputProps={{
                  style: { fontFamily: 'monospace', fontSize: '0.85rem' },
                  readOnly: true,
                }}
                variant="outlined"
                sx={{ mb: 3 }}
              />
              
              <Typography variant="subtitle1" gutterBottom>Defaults</Typography>
              <TextField
                multiline
                fullWidth
                minRows={5}
                value={structuredConfig.defaults.lines.join('\n')}
                InputProps={{
                  style: { fontFamily: 'monospace', fontSize: '0.85rem' },
                  readOnly: true,
                }}
                variant="outlined"
              />
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={saveStructuredConfig}
              disabled={loading}
            >
              Save & Apply Changes
            </Button>
          </Box>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <TextField
            multiline
            fullWidth
            minRows={25}
            maxRows={40}
            value={rawConfig}
            onChange={(e) => setRawConfig(e.target.value)}
            variant="outlined"
            InputProps={{
              style: { fontFamily: 'monospace' }
            }}
            disabled={loading}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={saveRawConfig}
              disabled={loading}
            >
              Save & Apply Raw Config
            </Button>
          </Box>
        </Box>
      )}

      <Snackbar open={showMessage} autoHideDuration={6000} onClose={handleCloseMessage}>
        <Alert onClose={handleCloseMessage} severity={message.type} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StructuredConfigEditor;