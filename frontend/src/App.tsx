import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import MultimodalAnalysisPage from './pages/MultimodalAnalysisPage';
import AdvancedReasoningPage from './pages/AdvancedReasoningPage';
import RealTimeLearningPage from './pages/RealTimeLearningPage';
import CloudServiceIntegrationPage from './pages/CloudServiceIntegrationPage';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar open={sidebarOpen} />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Header 
            toggleDarkMode={toggleDarkMode} 
            darkMode={darkMode} 
            toggleSidebar={toggleSidebar}
          />
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/multimodal" element={<MultimodalAnalysisPage />} />
              <Route path="/reasoning" element={<AdvancedReasoningPage />} />
              <Route path="/learning" element={<RealTimeLearningPage />} />
              <Route path="/cloud" element={<CloudServiceIntegrationPage />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
