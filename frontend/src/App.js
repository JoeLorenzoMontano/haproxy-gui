import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Dashboard from './components/Dashboard';
import ConfigEditor from './components/ConfigEditor';
import StructuredConfigEditor from './components/StructuredConfigEditor';
import Stats from './components/Stats';
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/config" element={<StructuredConfigEditor />} />
          <Route path="/config/raw" element={<ConfigEditor />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
