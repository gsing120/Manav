import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Fade,
  Zoom,
  Grow
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';
import { TransitionProps } from '@mui/material/transitions';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Slide transition for new messages
const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Message types
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: string[];
  isThinking?: boolean;
  contextEnhanced?: boolean;
}

// Conversation interface
interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ImprovedConversationPage component with enhanced conversation abilities
 */
const ImprovedConversationPage: React.FC = () => {
  // State for conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  
  // State for message input
  const [messageInput, setMessageInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for voice input
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  // State for file attachments
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // State for model selection
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  
  // State for context enhancement
  const [useContextEnhancement, setUseContextEnhancement] = useState(true);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Menu state
  const [conversationMenuAnchor, setConversationMenuAnchor] = useState<null | HTMLElement>(null);
  const [messageMenuAnchor, setMessageMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  // Dialog state
  const [newConversationDialogOpen, setNewConversationDialogOpen] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [deleteConversationDialogOpen, setDeleteConversationDialogOpen] = useState(false);
  
  // Load data on component mount
  useEffect(() => {
    loadConversations();
    loadAvailableModels();
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);
  
  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  /**
   * Load conversations
   */
  const loadConversations = async () => {
    try {
      setError(null);
      
      const response = await axios.get('/api/conversation');
      const loadedConversations = response.data;
      
      setConversations(loadedConversations);
      
      // Set active conversation if none is selected
      if (loadedConversations.length > 0 && !activeConversation) {
        setActiveConversation(loadedConversations[0]);
        setSelectedModel(loadedConversations[0].model);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
    }
  };
  
  /**
   * Load available models
   */
  const loadAvailableModels = async () => {
    try {
      setError(null);
      
      const response = await axios.get('/api/models');
      setAvailableModels(response.data);
      
      // Set default model if none is selected
      if (response.data.length > 0 && !selectedModel) {
        setSelectedModel(response.data[0].id);
      }
    } catch (error) {
      console.error('Error loading available models:', error);
      setError('Failed to load available models');
    }
  };
  
  /**
   * Create a new conversation
   */
  const createNewConversation = async () => {
    try {
      setError(null);
      
      const title = newConversationTitle.trim() || `New Conversation ${new Date().toLocaleString()}`;
      
      const response = await axios.post('/api/conversation', {
        title,
        model: selectedModel
      });
      
      const newConversation = response.data;
      
      setConversations([newConversation, ...conversations]);
      setActiveConversation(newConversation);
      setNewConversationDialogOpen(false);
      setNewConversationTitle('');
    } catch (error) {
      console.error('Error creating new conversation:', error);
      setError('Failed to create new conversation');
    }
  };
  
  /**
   * Delete a conversation
   */
  const deleteConversation = async () => {
    if (!activeConversation) return;
    
    try {
      setError(null);
      
      await axios.delete(`/api/conversation/${activeConversation.id}`);
      
      const updatedConversations = conversations.filter(conv => conv.id !== activeConversation.id);
      setConversations(updatedConversations);
      
      // Set new active conversation
      if (updatedConversations.length > 0) {
        setActiveConversation(updatedConversations[0]);
      } else {
        setActiveConversation(null);
      }
      
      setDeleteConversationDialogOpen(false);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation');
    }
  };
  
  /**
   * Send a message
   */
  const sendMessage = async () => {
    if (!activeConversation || !messageInput.trim()) return;
    
    try {
      setError(null);
      setIsProcessing(true);
      
      // Create message object
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageInput,
        timestamp: new Date(),
        attachments: attachments.map(file => file.name)
      };
      
      // Add thinking message from assistant
      const thinkingMessage: Message = {
        id: `assistant-thinking-${Date.now()}`,
        role: 'assistant',
        content: '...',
        timestamp: new Date(),
        isThinking: true
      };
      
      // Update conversation with user message and thinking message
      const updatedMessages = [...activeConversation.messages, userMessage, thinkingMessage];
      const updatedConversation = {
        ...activeConversation,
        messages: updatedMessages,
        updatedAt: new Date()
      };
      
      setActiveConversation(updatedConversation);
      setMessageInput('');
      setAttachments([]);
      
      // Prepare form data for file uploads
      const formData = new FormData();
      formData.append('message', messageInput);
      formData.append('conversationId', activeConversation.id);
      formData.append('model', selectedModel);
      formData.append('useContextEnhancement', useContextEnhancement.toString());
      
      // Add attachments
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
      
      // Add audio if recording
      if (audioBlob) {
        formData.append('audio', audioBlob);
      }
      
      // Send message to API
      const response = await axios.post('/api/conversation/message', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Get assistant response
      const assistantMessage = response.data;
      
      // Update conversation with assistant response (replacing thinking message)
      const finalMessages = [...updatedMessages.slice(0, -1), assistantMessage];
      const finalConversation = {
        ...activeConversation,
        messages: finalMessages,
        updatedAt: new Date()
      };
      
      setActiveConversation(finalConversation);
      
      // Update conversations list
      const updatedConversations = conversations.map(conv => 
        conv.id === activeConversation.id ? finalConversation : conv
      );
      
      setConversations(updatedConversations);
      
      // Clear audio blob
      setAudioBlob(null);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      
      // Remove thinking message
      if (activeConversation) {
        const updatedMessages = [...activeConversation.messages.slice(0, -1)];
        const updatedConversation = {
          ...activeConversation,
          messages: updatedMessages
        };
        
        setActiveConversation(updatedConversation);
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Handle message input change
   */
  const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
  };
  
  /**
   * Handle message input key press
   */
  const handleMessageInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  /**
   * Handle file input change
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };
  
  /**
   * Handle file button click
   */
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  /**
   * Remove attachment
   */
  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };
  
  /**
   * Start voice recording
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Convert speech to text and set as message input
        convertSpeechToText(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      });
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Stop recording after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 30000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording');
    }
  };
  
  /**
   * Stop voice recording
   */
  const stopRecording = () => {
    setIsRecording(false);
    
    // MediaRecorder is handled in startRecording
  };
  
  /**
   * Convert speech to text
   */
  const convertSpeechToText = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await axios.post('/api/conversation/speech-to-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const { text } = response.data;
      
      if (text) {
        setMessageInput(prev => prev + (prev ? ' ' : '') + text);
      }
    } catch (error) {
      console.error('Error converting speech to text:', error);
      setError('Failed to convert speech to text');
    }
  };
  
  /**
   * Handle model change
   */
  const handleModelChange = async (modelId: string) => {
    if (!activeConversation) return;
    
    try {
      setError(null);
      
      await axios.put(`/api/conversation/${activeConversation.id}/model`, {
        model: modelId
      });
      
      // Update active conversation
      const updatedConversation = {
        ...activeConversation,
        model: modelId
      };
      
      setActiveConversation(updatedConversation);
      setSelectedModel(modelId);
      
      // Update conversations list
      const updatedConversations = conversations.map(conv => 
        conv.id === activeConversation.id ? updatedConversation : conv
      );
      
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Error changing model:', error);
      setError('Failed to change model');
    }
  };
  
  /**
   * Handle conversation click
   */
  const handleConversationClick = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setSelectedModel(conversation.model);
  };
  
  /**
   * Open conversation menu
   */
  const handleConversationMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setConversationMenuAnchor(event.currentTarget);
  };
  
  /**
   * Close conversation menu
   */
  const handleConversationMenuClose = () => {
    setConversationMenuAnchor(null);
  };
  
  /**
   * Open message menu
   */
  const handleMessageMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, messageId: string) => {
    setMessageMenuAnchor(event.currentTarget);
    setSelectedMessageId(messageId);
  };
  
  /**
   * Close message menu
   */
  const handleMessageMenuClose = () => {
    setMessageMenuAnchor(null);
    setSelectedMessageId(null);
  };
  
  /**
   * Copy message to clipboard
   */
  const copyMessageToClipboard = () => {
    if (!activeConversation || !selectedMessageId) return;
    
    const message = activeConversation.messages.find(msg => msg.id === selectedMessageId);
    
    if (message) {
      navigator.clipboard.writeText(message.content);
    }
    
    handleMessageMenuClose();
  };
  
  /**
   * Delete message
   */
  const deleteMessage = async () => {
    if (!activeConversation || !selectedMessageId) return;
    
    try {
      setError(null);
      
      await axios.delete(`/api/conversation/${activeConversation.id}/message/${selectedMessageId}`);
      
      // Update active conversation
      const updatedMessages = activeConversation.messages.filter(msg => msg.id !== selectedMessageId);
      const updatedConversation = {
        ...activeConversation,
        messages: updatedMessages,
        updatedAt: new Date()
      };
      
      setActiveConversation(updatedConversation);
      
      // Update conversations list
      const updatedConversations = conversations.map(conv => 
        conv.id === activeConversation.id ? updatedConversation : conv
      );
      
      setConversations(updatedConversations);
      
      handleMessageMenuClose();
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message');
    }
  };
  
  /**
   * Render message content with markdown
   */
  const renderMessageContent = (content: string) => {
    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={tomorrow}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };
  
  /**
   * Render message
   */
  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    const isThinking = message.isThinking;
    
    return (
      <Grow
        in={true}
        key={message.id}
        timeout={300}
        style={{ transformOrigin: isUser ? 'right' : 'left' }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isUser ? 'row-reverse' : 'row',
            mb: 2
          }}
        >
          <Avatar
            sx={{
              bgcolor: isUser ? 'primary.main' : 'secondary.main',
              mr: isUser ? 0 : 1,
              ml: isUser ? 1 : 0
            }}
          >
            {isUser ? <PersonIcon /> : <SmartToyIcon />}
          </Avatar>
          
          <Box
            sx={{
              maxWidth: '70%'
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                bgcolor: isUser ? 'primary.light' : isThinking ? 'grey.200' : 'secondary.light',
                borderRadius: 2,
                position: 'relative'
              }}
            >
              {isThinking ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography>Thinking...</Typography>
                </Box>
              ) : (
                <>
                  {renderMessageContent(message.content)}
                  
                  {message.contextEnhanced && (
                    <Tooltip title="Enhanced with contextual awareness">
                      <Chip
                        label="Context Enhanced"
                        size="small"
                        color="primary"
                        sx={{ mt: 1 }}
                      />
                    </Tooltip>
                  )}
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Attachments:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                        {message.attachments.map((attachment, i) => (
                          <Chip
                            key={i}
                            label={attachment}
                            size="small"
                            icon={<AttachFileIcon />}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </>
              )}
              
              {!isThinking && (
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    opacity: 0.5,
                    '&:hover': {
                      opacity: 1
                    }
                  }}
                  onClick={(e) => handleMessageMenuOpen(e, message.id)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </Paper>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
      </Grow>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex' }}>
      {/* Conversations sidebar */}
      <Box
        sx={{
          width: 300,
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setNewConversationDialogOpen(true)}
          >
            New Conversation
          </Button>
        </Box>
        
        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
          {conversations.map((conversation) => (
            <ListItem
              key={conversation.id}
              button
              selected={activeConversation?.id === conversation.id}
              onClick={() => handleConversationClick(conversation)}
            >
              <ListItemIcon>
                <SmartToyIcon />
              </ListItemIcon>
              <ListItemText
                primary={conversation.title}
                secondary={new Date(conversation.updatedAt).toLocaleDateString()}
              />
            </ListItem>
          ))}
          
          {conversations.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No conversations"
                secondary="Start a new conversation"
              />
            </ListItem>
          )}
        </List>
      </Box>
      
      {/* Main conversation area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        {/* Conversation header */}
        {activeConversation && (
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6">
              {activeConversation.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mr: 2 }}>
                <Chip
                  label={availableModels.find(model => model.id === selectedModel)?.name || selectedModel}
                  color="primary"
                  onClick={handleConversationMenuOpen}
                />
              </Box>
              
              <IconButton onClick={handleConversationMenuOpen}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>
        )}
        
        {/* Messages area */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 2,
            bgcolor: 'background.default'
          }}
        >
          {activeConversation ? (
            activeConversation.messages.length > 0 ? (
              activeConversation.messages.map((message, index) => renderMessage(message, index))
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}
              >
                <SmartToyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Start a new conversation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type a message below to get started
                </Typography>
              </Box>
            )
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}
            >
              <SmartToyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Select or create a conversation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a conversation from the sidebar or create a new one
              </Typography>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Input area */}
        {activeConversation && (
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}
          >
            {/* Attachments */}
            {attachments.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Attachments:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                  {attachments.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => removeAttachment(index)}
                      size="small"
                      icon={<AttachFileIcon />}
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Audio recording indicator */}
            {isRecording && (
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2" color="error">
                  Recording audio...
                </Typography>
              </Box>
            )}
            
            {/* Context enhancement toggle */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Chip
                label={useContextEnhancement ? "Context Enhancement: ON" : "Context Enhancement: OFF"}
                color={useContextEnhancement ? "success" : "default"}
                onClick={() => setUseContextEnhancement(!useContextEnhancement)}
                sx={{ mr: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {useContextEnhancement 
                  ? "Messages will be enhanced with contextual awareness"
                  : "Messages will be processed without contextual enhancement"}
              </Typography>
            </Box>
            
            {/* Input field */}
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type a message..."
                value={messageInput}
                onChange={handleMessageInputChange}
                onKeyPress={handleMessageInputKeyPress}
                disabled={isProcessing}
                sx={{ mr: 1 }}
              />
              
              <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
              
              <IconButton
                color="primary"
                onClick={handleFileButtonClick}
                disabled={isProcessing}
              >
                <AttachFileIcon />
              </IconButton>
              
              <IconButton
                color={isRecording ? 'error' : 'primary'}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
              >
                {isRecording ? <StopIcon /> : <MicIcon />}
              </IconButton>
              
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={sendMessage}
                disabled={isProcessing || !messageInput.trim()}
              >
                Send
              </Button>
            </Box>
            
            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Box>
        )}
      </Box>
      
      {/* Conversation menu */}
      <Menu
        anchorEl={conversationMenuAnchor}
        open={Boolean(conversationMenuAnchor)}
        onClose={handleConversationMenuClose}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Select Model</Typography>
        </MenuItem>
        <Divider />
        {availableModels.map((model) => (
          <MenuItem
            key={model.id}
            selected={model.id === selectedModel}
            onClick={() => {
              handleModelChange(model.id);
              handleConversationMenuClose();
            }}
          >
            {model.name}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={() => {
            setDeleteConversationDialogOpen(true);
            handleConversationMenuClose();
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete Conversation
        </MenuItem>
      </Menu>
      
      {/* Message menu */}
      <Menu
        anchorEl={messageMenuAnchor}
        open={Boolean(messageMenuAnchor)}
        onClose={handleMessageMenuClose}
      >
        <MenuItem onClick={copyMessageToClipboard}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          Copy
        </MenuItem>
        <MenuItem onClick={deleteMessage}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
      
      {/* New conversation dialog */}
      <Dialog
        open={newConversationDialogOpen}
        onClose={() => setNewConversationDialogOpen(false)}
      >
        <DialogTitle>New Conversation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Conversation Title"
            fullWidth
            value={newConversationTitle}
            onChange={(e) => setNewConversationTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewConversationDialogOpen(false)}>Cancel</Button>
          <Button onClick={createNewConversation} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete conversation dialog */}
      <Dialog
        open={deleteConversationDialogOpen}
        onClose={() => setDeleteConversationDialogOpen(false)}
      >
        <DialogTitle>Delete Conversation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this conversation? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConversationDialogOpen(false)}>Cancel</Button>
          <Button onClick={deleteConversation} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImprovedConversationPage;
