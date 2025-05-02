import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Grid, Button, Link, Box, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';

const API_URL = 'http://192.168.1.175:3000/api';

// Helper function to format bytes
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || isNaN(parseInt(bytes))) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load HAProxy stats. Stats might not be enabled or accessible.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Function to open the original stats page
  const openOriginalStatsPage = () => {
    window.open('https://eliteinventory.jolomo.io/haproxy?stats', '_blank');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          HAProxy Statistics
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={fetchStats}
            disabled={refreshing}
            sx={{ mr: 2 }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Stats'}
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={openOriginalStatsPage}
          >
            Open HAProxy Stats Page
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#fff4e5' }}>
          <Typography color="error">{error}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            You can still view statistics directly on the 
            <Link 
              href="https://eliteinventory.jolomo.io/haproxy?stats" 
              target="_blank" 
              sx={{ ml: 1 }}
            >
              HAProxy Stats Page
            </Link>.
          </Typography>
        </Paper>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, overflowX: 'auto' }}>
              <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                Frontend Statistics
              </Typography>
              {stats && stats.stats && stats.stats.some(stat => stat.type === '0') ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Sessions</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Max Sessions</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Connections</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Bytes In</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Bytes Out</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Error Req</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.stats
                      .filter(stat => stat.type === '0')
                      .map((stat, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                          <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.pxname}</td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                            <span style={{ 
                              color: stat.status === 'OPEN' ? 'green' : 
                                     stat.status === 'DOWN' ? 'red' : 'orange',
                              fontWeight: 'bold',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: stat.status === 'OPEN' ? '#e6f7e6' : 
                                              stat.status === 'DOWN' ? '#ffe6e6' : '#fff4e5'
                            }}>
                              {stat.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.scur}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.smax}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.conn}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                            {formatBytes(stat.bin)}
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                            {formatBytes(stat.bout)}
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.ereq}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <Typography>No frontend statistics available</Typography>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 2, overflowX: 'auto' }}>
              <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                Backend Statistics
              </Typography>
              {stats && stats.stats && stats.stats.some(stat => stat.type === '1') ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Sessions</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Max Sessions</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Server Up</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Server Down</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Bytes In</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Bytes Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.stats
                      .filter(stat => stat.type === '1')
                      .map((stat, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                          <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.pxname}</td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                            <span style={{ 
                              color: stat.status === 'UP' ? 'green' : 
                                     stat.status === 'DOWN' ? 'red' : 'orange',
                              fontWeight: 'bold',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: stat.status === 'UP' ? '#e6f7e6' : 
                                              stat.status === 'DOWN' ? '#ffe6e6' : '#fff4e5'
                            }}>
                              {stat.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.scur}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.smax}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.act}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.down}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                            {formatBytes(stat.bin)}
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                            {formatBytes(stat.bout)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <Typography>No backend statistics available</Typography>
              )}
            </Paper>
          </Grid>
          
          {stats && stats.stats && stats.stats.some(stat => stat.type === '2') && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, overflowX: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                  Server Statistics
                </Typography>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Backend</th>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Server</th>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Sessions</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Weight</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Last Status</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Bytes In</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Bytes Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.stats
                      .filter(stat => stat.type === '2')
                      .map((stat, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                          <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.pxname}</td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.svname}</td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                            <span style={{ 
                              color: stat.status === 'UP' ? 'green' : 
                                     stat.status === 'DOWN' ? 'red' : 'orange',
                              fontWeight: 'bold',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: stat.status === 'UP' ? '#e6f7e6' : 
                                              stat.status === 'DOWN' ? '#ffe6e6' : '#fff4e5'
                            }}>
                              {stat.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.scur}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.weight}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.lastchg}s</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                            {formatBytes(stat.bin)}
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                            {formatBytes(stat.bout)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
};

export default Stats;
