import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Grid } from '@mui/material';
import axios from 'axios';

const API_URL = 'http://192.168.1.175:3000/api';

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        HAProxy Statistics
      </Typography>
      {loading ? (
        <Typography>Loading stats...</Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, overflowX: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Frontend Statistics
              </Typography>
              {stats && stats.stats ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Sessions</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Bytes In</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Bytes Out</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Error Req</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Error Conn</th>
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
                              fontWeight: 'bold'
                            }}>
                              {stat.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.scur}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.bin}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.bout}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.ereq}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.econ}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <Typography>No statistics available</Typography>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 2, overflowX: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Backend Statistics
              </Typography>
              {stats && stats.stats ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Sessions</th>
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
                              fontWeight: 'bold'
                            }}>
                              {stat.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.scur}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.act}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.down}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.bin}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{stat.bout}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <Typography>No statistics available</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Stats;
