import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Divider, 
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [settings, setSettings] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize conversation and fetch models on component mount
    initializeConversation();
    fetchModels();
    fetchSettings();
  }, []);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversation = async () => {
    try {
      const response = await axios.post('/api/integration/conversations', {
        initialMessages: [
          { role: 'system', content: 'You are Manus Twin, a helpful AI assistant.' }
        ]
      });
      setConversationId(response.data.conversationId);
      setMessages([
        { role: 'system', content: 'Welcome to Manus Twin! How can I help you today?' }
      ]);
    } catch (error) {
      console.error('Error initializing conversation:', error);
      setSnackbar({
        open: true,
        message: 'Failed to initialize conversation',
        severity: 'error'
      });
    }
  };

  const fetchModels = async () => {
    try {
      const response = await axios.get('/api/models');
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load models',
        severity: 'error'
      });
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data);
      setSelectedModel(response.data.defaultModel || '');
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSend = async () => {
    if (input.trim() === '' || !conversationId) return;
    
    // Add user message to UI immediately
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setInput('');
    setLoading(true);
    
    try {
      // Send message to backend
      const response = await axios.post('/api/integration/messages', {
        conversationId,
        message: input,
        modelId: selectedModel || settings.defaultModel,
        options: {
          enableFunctionCalling: true
        }
      });
      
      // Add assistant message to UI
      const assistantMessage = { 
        role: 'assistant', 
        content: response.data.text,
        functionCalls: response.data.functionCalls
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send message',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleClearChat = () => {
    initializeConversation();
    handleMenuClose();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box className="chat-container">
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Model</InputLabel>
          <Select
            value={selectedModel || settings.defaultModel || ''}
            onChange={handleModelChange}
            label="Model"
          >
            {models.map((model) => (
              <MenuItem key={model.id} value={model.id}>
                {model.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton onClick={handleMenuOpen}>
          <SettingsIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleClearChat}>Clear Chat</MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); window.location.href = '/#/settings'; }}>
            Settings
          </MenuItem>
        </Menu>
      </Box>
      
      <Box className="message-list">
        {messages.map((message, index) => (
          <Paper 
            key={index} 
            elevation={1} 
            sx={{ 
              p: 2, 
              mb: 2, 
              backgroundColor: message.role === 'user' ? 'primary.light' : 'background.paper',
              ml: message.role === 'user' ? 'auto' : 0,
              mr: message.role === 'assistant' ? 'auto' : 0,
              maxWidth: '80%',
              position: 'relative'
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
            
            {message.functionCalls && message.functionCalls.length > 0 && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  Function Call: {message.functionCalls[0].name}
                </Typography>
                <Typography variant="caption" component="div" sx={{ 
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.7rem'
                }}>
                  {JSON.stringify(message.functionCalls[0].arguments, null, 2)}
                </Typography>
              </Box>
            )}
          </Paper>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      
      <Divider />
      
      <Box className="message-input">
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          variant="outlined"
          disabled={loading || !conversationId}
          InputProps={{
            endAdornment: (
              <Button 
                variant="contained" 
                color="primary" 
                endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />} 
                onClick={handleSend}
                disabled={input.trim() === '' || loading || !conversationId}
              >
                Send
              </Button>
            )
          }}
        />
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Chat;
