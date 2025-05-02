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
  exec('ps aux | grep -v grep | grep haproxy', (error, stdout) => {
    const status = !error && stdout ? 'running' : 'stopped';
    
    exec('haproxy -v', (statusError, statusOutput) => {
      res.json({
        status,
        details: statusOutput || stdout || 'Status details not available',
        version: statusOutput ? statusOutput.split('\n')[0] : '2.x'
      });
    });
  });
});

app.post('/api/service', (req, res) => {
  const { action } = req.body;
  
  if (!['start', 'stop', 'restart', 'reload'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }
  
  // Using host network mode, we can control HAProxy via a script
  // This requires that you've set up the sudoers file correctly
  exec(`/app/scripts/haproxy-control.sh ${action}`, (error) => {
    if (error) {
      return res.status(500).json({ error: `Failed to ${action} HAProxy service: ${error.message}` });
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
  // First try reading from the stats socket directly
  exec('echo "show stat" | socat unix-connect:/var/run/haproxy.sock stdio 2>/dev/null', (error, stdout) => {
    if (error || !stdout) {
      // Fall back to reading stats file if it exists
      fs.readFile('/var/lib/haproxy/stats', 'utf8', (err, data) => {
        if (err) {
          console.error('Error fetching HAProxy stats:', err);
          // If both methods fail, return a placeholder
          return res.json({ 
            stats: [
              { pxname: 'frontend', type: '0', status: 'OPEN', scur: '0', bin: '0', bout: '0', ereq: '0', econ: '0' },
              { pxname: 'backend', type: '1', status: 'UP', scur: '0', act: '1', down: '0', bin: '0', bout: '0' }
            ] 
          });
        }
        
        // Parse CSV output from HAProxy stats
        try {
          const lines = data.trim().split('\n');
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
        } catch (parseError) {
          console.error('Error parsing stats:', parseError);
          res.status(500).json({ error: 'Failed to parse HAProxy stats' });
        }
      });
      return;
    }
    
    // Parse CSV output from HAProxy stats
    try {
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
    } catch (parseError) {
      console.error('Error parsing stats:', parseError);
      res.status(500).json({ error: 'Failed to parse HAProxy stats' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
