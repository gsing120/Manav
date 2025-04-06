import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import axios from 'axios';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header = ({ darkMode, toggleDarkMode }: HeaderProps) => {
  const location = useLocation();
  const [title, setTitle] = useState('Dashboard');
  const [selectedModel, setSelectedModel] = useState('');
  
  useEffect(() => {
    // Set title based on current route
    if (location.pathname === '/') {
      setTitle('Dashboard');
    } else if (location.pathname === '/chat') {
      setTitle('Chat');
    } else if (location.pathname === '/settings') {
      setTitle('Settings');
    }
    
    // Fetch default model if on chat page
    if (location.pathname === '/chat') {
      fetchDefaultModel();
    }
  }, [location]);
  
  const fetchDefaultModel = async () => {
    try {
      const response = await axios.get('/api/settings');
      if (response.data.defaultModel) {
        setSelectedModel(response.data.defaultModel);
      }
    } catch (error) {
      console.error('Error fetching default model:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar className="header-toolbar">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          
          {location.pathname === '/chat' && selectedModel && (
            <Chip 
              label={selectedModel}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }}
            />
          )}
        </Box>
        
        <Box>
          <IconButton color="inherit" onClick={toggleDarkMode} title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
