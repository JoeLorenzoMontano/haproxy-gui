const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs-extra');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HAPROXY_CONFIG_PATH = '/etc/haproxy/haproxy.cfg';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Routes
app.get('/api/status', (req, res) => {
  exec('systemctl is-active haproxy', (error, stdout) => {
    const status = !error && stdout.trim() === 'active' ? 'running' : 'stopped';
    
    exec('systemctl status haproxy', (statusError, statusOutput) => {
      res.json({
        status,
        details: statusOutput || 'Status details not available',
        version: '2.x' // You might want to dynamically get this
      });
    });
  });
});

app.post('/api/service', (req, res) => {
  const { action } = req.body;
  
  if (!['start', 'stop', 'restart', 'reload'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }
  
  exec(`sudo systemctl ${action} haproxy`, (error) => {
    if (error) {
      return res.status(500).json({ error: `Failed to ${action} HAProxy service` });
    }
    res.json({ message: `HAProxy ${action} successful` });
  });
});

app.get('/api/config', async (req, res) => {
  try {
    const config = await fs.readFile(HAPROXY_CONFIG_PATH, 'utf8');
    res.json({ config });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read HAProxy configuration' });
  }
});

app.post('/api/config', async (req, res) => {
  try {
    const { config } = req.body;
    
    // Backup current config
    await fs.copy(HAPROXY_CONFIG_PATH, `${HAPROXY_CONFIG_PATH}.backup`);
    
    // Write new config
    await fs.writeFile(HAPROXY_CONFIG_PATH, config);
    
    // Validate config
    exec('sudo haproxy -c -f /etc/haproxy/haproxy.cfg', (error) => {
      if (error) {
        // Restore backup if validation fails
        fs.copy(`${HAPROXY_CONFIG_PATH}.backup`, HAPROXY_CONFIG_PATH);
        return res.status(400).json({ error: 'Invalid HAProxy configuration' });
      }
      
      // Reload HAProxy
      exec('sudo systemctl reload haproxy', (reloadError) => {
        if (reloadError) {
          return res.status(500).json({ error: 'Failed to reload HAProxy' });
        }
        res.json({ message: 'Configuration updated successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update HAProxy configuration' });
  }
});

app.get('/api/stats', (req, res) => {
  exec('echo "show stat" | sudo socat unix-connect:/var/run/haproxy.sock stdio', (error, stdout) => {
    if (error) {
      console.error('Error fetching HAProxy stats:', error);
      return res.status(500).json({ error: 'Failed to fetch HAProxy stats' });
    }
    
    // Parse CSV output from HAProxy stats
    const lines = stdout.trim().split('\n');
    const headers = lines[0].split(',');
    
    const stats = lines.slice(1).map(line => {
      const values = line.split(',');
      const stat = {};
      
      headers.forEach((header, index) => {
        stat[header] = values[index];
      });
      
      return stat;
    });
    
    res.json({ stats });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
