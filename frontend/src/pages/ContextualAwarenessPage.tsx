import React, { useState, useEffect } from 'react';
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
  Tab,
  Tabs,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import UpdateIcon from '@mui/icons-material/Update';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventIcon from '@mui/icons-material/Event';
import MemoryIcon from '@mui/icons-material/Memory';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryption';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`context-tabpanel-${index}`}
      aria-labelledby={`context-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * ContextualAwarenessPage component for managing and utilizing contextual awareness capabilities
 */
const ContextualAwarenessPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Knowledge state
  const [knowledgeItems, setKnowledgeItems] = useState<any[]>([]);
  const [selectedKnowledgeItem, setSelectedKnowledgeItem] = useState<any | null>(null);
  const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState('');
  
  // Current events state
  const [currentEvents, setCurrentEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  
  // Entity relationships state
  const [entityRelationships, setEntityRelationships] = useState<any[]>([]);
  
  // Temporal context state
  const [temporalContext, setTemporalContext] = useState<any | null>(null);
  
  // Dialog state
  const [addKnowledgeDialogOpen, setAddKnowledgeDialogOpen] = useState(false);
  const [newKnowledgeItem, setNewKnowledgeItem] = useState<any>({
    topic: '',
    content: '',
    source: '',
    confidence: 0.8,
    relevance: 0.8
  });
  
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<any>({
    title: '',
    description: '',
    source: '',
    url: '',
    publishedAt: new Date().toISOString().split('T')[0],
    category: 'Technology',
    relevance: 0.8
  });
  
  const [enhanceQueryDialogOpen, setEnhanceQueryDialogOpen] = useState(false);
  const [queryToEnhance, setQueryToEnhance] = useState('');
  const [enhancedQueryResult, setEnhancedQueryResult] = useState<any | null>(null);
  
  // Load data on component mount
  useEffect(() => {
    loadKnowledgeItems();
    loadCurrentEvents();
    loadEntityRelationships();
    loadTemporalContext();
  }, []);
  
  /**
   * Handle tab change
   */
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Refresh data when switching tabs
    if (newValue === 0) {
      loadKnowledgeItems();
    } else if (newValue === 1) {
      loadCurrentEvents();
    } else if (newValue === 2) {
      loadEntityRelationships();
    } else if (newValue === 3) {
      loadTemporalContext();
    }
  };
  
  /**
   * Load knowledge items
   */
  const loadKnowledgeItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/api/context/knowledge');
      setKnowledgeItems(response.data);
    } catch (error) {
      console.error('Error loading knowledge items:', error);
      setError('Failed to load knowledge items');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Load current events
   */
  const loadCurrentEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/api/context/events');
      setCurrentEvents(response.data);
    } catch (error) {
      console.error('Error loading current events:', error);
      setError('Failed to load current events');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Load entity relationships
   */
  const loadEntityRelationships = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/api/context/relationships');
      setEntityRelationships(response.data);
    } catch (error) {
      console.error('Error loading entity relationships:', error);
      setError('Failed to load entity relationships');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Load temporal context
   */
  const loadTemporalContext = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/api/context/temporal');
      setTemporalContext(response.data);
    } catch (error) {
      console.error('Error loading temporal context:', error);
      setError('Failed to load temporal context');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle knowledge item selection
   */
  const handleSelectKnowledgeItem = (item: any) => {
    setSelectedKnowledgeItem(item);
  };
  
  /**
   * Handle event selection
   */
  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
  };
  
  /**
   * Handle knowledge search
   */
  const handleKnowledgeSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!knowledgeSearchQuery.trim()) {
        await loadKnowledgeItems();
        return;
      }
      
      const response = await axios.get(`/api/context/knowledge/search?query=${encodeURIComponent(knowledgeSearchQuery)}`);
      setKnowledgeItems(response.data);
    } catch (error) {
      console.error('Error searching knowledge items:', error);
      setError('Failed to search knowledge items');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle event search
   */
  const handleEventSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!eventSearchQuery.trim()) {
        await loadCurrentEvents();
        return;
      }
      
      const response = await axios.get(`/api/context/events/search?query=${encodeURIComponent(eventSearchQuery)}`);
      setCurrentEvents(response.data);
    } catch (error) {
      console.error('Error searching current events:', error);
      setError('Failed to search current events');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Open add knowledge dialog
   */
  const handleOpenAddKnowledgeDialog = () => {
    setNewKnowledgeItem({
      topic: '',
      content: '',
      source: '',
      confidence: 0.8,
      relevance: 0.8
    });
    setAddKnowledgeDialogOpen(true);
  };
  
  /**
   * Close add knowledge dialog
   */
  const handleCloseAddKnowledgeDialog = () => {
    setAddKnowledgeDialogOpen(false);
  };
  
  /**
   * Handle add knowledge item
   */
  const handleAddKnowledgeItem = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/context/knowledge', newKnowledgeItem);
      
      // Close dialog
      handleCloseAddKnowledgeDialog();
      
      // Refresh knowledge items
      await loadKnowledgeItems();
      
      // Select the new item
      setSelectedKnowledgeItem(response.data);
    } catch (error) {
      console.error('Error adding knowledge item:', error);
      setError('Failed to add knowledge item');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle delete knowledge item
   */
  const handleDeleteKnowledgeItem = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.delete(`/api/context/knowledge/${id}`);
      
      // Refresh knowledge items
      await loadKnowledgeItems();
      
      // Clear selected item if it was deleted
      if (selectedKnowledgeItem && selectedKnowledgeItem.id === id) {
        setSelectedKnowledgeItem(null);
      }
    } catch (error) {
      console.error('Error deleting knowledge item:', error);
      setError('Failed to delete knowledge item');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Open add event dialog
   */
  const handleOpenAddEventDialog = () => {
    setNewEvent({
      title: '',
      description: '',
      source: '',
      url: '',
      publishedAt: new Date().toISOString().split('T')[0],
      category: 'Technology',
      relevance: 0.8
    });
    setAddEventDialogOpen(true);
  };
  
  /**
   * Close add event dialog
   */
  const handleCloseAddEventDialog = () => {
    setAddEventDialogOpen(false);
  };
  
  /**
   * Handle add event
   */
  const handleAddEvent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const eventToAdd = {
        ...newEvent,
        publishedAt: new Date(newEvent.publishedAt)
      };
      
      const response = await axios.post('/api/context/events', eventToAdd);
      
      // Close dialog
      handleCloseAddEventDialog();
      
      // Refresh current events
      await loadCurrentEvents();
      
      // Select the new event
      setSelectedEvent(response.data);
    } catch (error) {
      console.error('Error adding current event:', error);
      setError('Failed to add current event');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle update knowledge from web search
   */
  const handleUpdateKnowledgeFromWebSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!knowledgeSearchQuery.trim()) {
        setError('Search query is required');
        return;
      }
      
      await axios.post('/api/context/knowledge/web-search', { query: knowledgeSearchQuery });
      
      // Refresh knowledge items
      await loadKnowledgeItems();
    } catch (error) {
      console.error('Error updating knowledge from web search:', error);
      setError('Failed to update knowledge from web search');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle update current events from news API
   */
  const handleUpdateCurrentEventsFromNewsAPI = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.post('/api/context/events/news-api');
      
      // Refresh current events
      await loadCurrentEvents();
    } catch (error) {
      console.error('Error updating current events from news API:', error);
      setError('Failed to update current events from news API');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Open enhance query dialog
   */
  const handleOpenEnhanceQueryDialog = () => {
    setQueryToEnhance('');
    setEnhancedQueryResult(null);
    setEnhanceQueryDialogOpen(true);
  };
  
  /**
   * Close enhance query dialog
   */
  const handleCloseEnhanceQueryDialog = () => {
    setEnhanceQueryDialogOpen(false);
  };
  
  /**
   * Handle enhance query
   */
  const handleEnhanceQuery = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!queryToEnhance.trim()) {
        setError('Query is required');
        return;
      }
      
      const response = await axios.post('/api/context/enhance', { query: queryToEnhance });
      setEnhancedQueryResult(response.data);
    } catch (error) {
      console.error('Error enhancing query:', error);
      setError('Failed to enhance query');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle new knowledge item change
   */
  const handleNewKnowledgeItemChange = (field: string, value: any) => {
    setNewKnowledgeItem({
      ...newKnowledgeItem,
      [field]: value
    });
  };
  
  /**
   * Handle new event change
   */
  const handleNewEventChange = (field: string, value: any) => {
    setNewEvent({
      ...newEvent,
      [field]: value
    });
  };
  
  /**
   * Render knowledge item card
   */
  const renderKnowledgeItemCard = (item: any) => {
    const isSelected = selectedKnowledgeItem && selectedKnowledgeItem.id === item.id;
    
    return (
      <Card 
        key={item.id} 
        sx={{ 
          mb: 2, 
          cursor: 'pointer',
          border: isSelected ? '2px solid' : 'none',
          borderColor: 'primary.main'
        }}
        onClick={() => handleSelectKnowledgeItem(item)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">
              {item.topic}
            </Typography>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteKnowledgeItem(item.id);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {item.content}
          </Typography>
          
          <Box sx={{ display: 'flex', mt: 1 }}>
            <Chip 
              label={`Source: ${item.source}`} 
              size="small" 
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`Confidence: ${(item.confidence * 100).toFixed(0)}%`} 
              size="small" 
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`Relevance: ${(item.relevance * 100).toFixed(0)}%`} 
              size="small" 
            />
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Last updated: {new Date(item.lastUpdated).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    );
  };
  
  /**
   * Render event card
   */
  const renderEventCard = (event: any) => {
    const isSelected = selectedEvent && selectedEvent.id === event.id;
    
    return (
      <Card 
        key={event.id} 
        sx={{ 
          mb: 2, 
          cursor: 'pointer',
          border: isSelected ? '2px solid' : 'none',
          borderColor: 'primary.main'
        }}
        onClick={() => handleSelectEvent(event)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">
              {event.title}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {event.description}
          </Typography>
          
          <Box sx={{ display: 'flex', mt: 1 }}>
            <Chip 
              label={`Source: ${event.source}`} 
              size="small" 
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`Category: ${event.category}`} 
              size="small" 
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`Relevance: ${(event.relevance * 100).toFixed(0)}%`} 
              size="small" 
            />
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Published: {new Date(event.publishedAt).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    );
  };
  
  /**
   * Render entity relationship card
   */
  const renderEntityRelationshipCard = (relationship: any) => {
    return (
      <Card key={relationship.id} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {relationship.relationshipType}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Source Entity: {relationship.sourceEntityId}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Target Entity: {relationship.targetEntityId}
              </Typography>
            </Grid>
          </Grid>
          
          {relationship.properties && Object.keys(relationship.properties).length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Properties:
              </Typography>
              
              <Box sx={{ pl: 2 }}>
                {Object.entries(relationship.properties).map(([key, value]: [string, any]) => (
                  <Typography key={key} variant="body2" color="text.secondary">
                    {key}: {JSON.stringify(value)}
                  </Typography>
                ))}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    );
  };
  
  /**
   * Render temporal reference card
   */
  const renderTemporalReferenceCard = (reference: any) => {
    return (
      <Card key={reference.id} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {reference.referenceText}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Type: {reference.type}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Confidence: {(reference.confidence * 100).toFixed(0)}%
              </Typography>
            </Grid>
          </Grid>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Resolved Date: {new Date(reference.resolvedDate).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        <MemoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Contextual Awareness System
      </Typography>
      
      <Typography variant="body1" paragraph>
        Enhance AI understanding with knowledge updates, current events monitoring, entity relationships, and temporal awareness.
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<EnhancedEncryptionIcon />}
          onClick={handleOpenEnhanceQueryDialog}
        >
          Enhance Query with Context
        </Button>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="contextual awareness tabs">
          <Tab label="Knowledge Base" icon={<MemoryIcon />} iconPosition="start" />
          <Tab label="Current Events" icon={<EventIcon />} iconPosition="start" />
          <Tab label="Entity Relationships" icon={<MemoryIcon />} iconPosition="start" />
          <Tab label="Temporal Context" icon={<AccessTimeIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mr: 2 }}>
            <TextField
              label="Search Knowledge"
              value={knowledgeSearchQuery}
              onChange={(e) => setKnowledgeSearchQuery(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleKnowledgeSearch();
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              sx={{ ml: 1 }}
              onClick={handleKnowledgeSearch}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              startIcon={<UpdateIcon />}
              sx={{ ml: 1 }}
              onClick={handleUpdateKnowledgeFromWebSearch}
            >
              Web Search
            </Button>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddKnowledgeDialog}
          >
            Add Knowledge
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Knowledge Items
            </Typography>
            
            {knowledgeItems.length > 0 ? (
              knowledgeItems.map(item => renderKnowledgeItemCard(item))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No knowledge items available
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {selectedKnowledgeItem ? (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  {selectedKnowledgeItem.topic}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {selectedKnowledgeItem.content}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Source: {selectedKnowledgeItem.source}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated: {new Date(selectedKnowledgeItem.lastUpdated).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Confidence: {(selectedKnowledgeItem.confidence * 100).toFixed(0)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Relevance: {(selectedKnowledgeItem.relevance * 100).toFixed(0)}%
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            ) : (
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="body1" color="text.secondary" align="center">
                  Select a knowledge item to view details
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mr: 2 }}>
            <TextField
              label="Search Events"
              value={eventSearchQuery}
              onChange={(e) => setEventSearchQuery(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEventSearch();
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              sx={{ ml: 1 }}
              onClick={handleEventSearch}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              startIcon={<UpdateIcon />}
              sx={{ ml: 1 }}
              onClick={handleUpdateCurrentEventsFromNewsAPI}
            >
              Update from News
            </Button>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddEventDialog}
          >
            Add Event
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Current Events
            </Typography>
            
            {currentEvents.length > 0 ? (
              currentEvents.map(event => renderEventCard(event))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No current events available
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {selectedEvent ? (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  {selectedEvent.title}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {selectedEvent.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Source: {selectedEvent.source}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Category: {selectedEvent.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Published: {new Date(selectedEvent.publishedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Relevance: {(selectedEvent.relevance * 100).toFixed(0)}%
                    </Typography>
                  </Grid>
                </Grid>
                
                {selectedEvent.url && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      href={selectedEvent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Source
                    </Button>
                  </Box>
                )}
              </Paper>
            ) : (
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="body1" color="text.secondary" align="center">
                  Select an event to view details
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={activeTab} index={2}>
        <Typography variant="h6" gutterBottom>
          Entity Relationships
        </Typography>
        
        {entityRelationships.length > 0 ? (
          entityRelationships.map(relationship => renderEntityRelationshipCard(relationship))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No entity relationships available
          </Typography>
        )}
      </TabPanel>
      
      <TabPanel value={activeTab} index={3}>
        {temporalContext ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Temporal Context
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Current Time: {new Date(temporalContext.currentTime).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Time Zone: {temporalContext.timeZone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated: {new Date(temporalContext.lastUpdated).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Temporal References
              </Typography>
              
              {temporalContext.timeReferences && temporalContext.timeReferences.length > 0 ? (
                temporalContext.timeReferences.map((reference: any) => renderTemporalReferenceCard(reference))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No temporal references available
                </Typography>
              )}
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No temporal context available
          </Typography>
        )}
      </TabPanel>
      
      {/* Add Knowledge Dialog */}
      <Dialog open={addKnowledgeDialogOpen} onClose={handleCloseAddKnowledgeDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add Knowledge Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Topic"
            value={newKnowledgeItem.topic}
            onChange={(e) => handleNewKnowledgeItemChange('topic', e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            label="Content"
            value={newKnowledgeItem.content}
            onChange={(e) => handleNewKnowledgeItemChange('content', e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
          />
          
          <TextField
            label="Source"
            value={newKnowledgeItem.source}
            onChange={(e) => handleNewKnowledgeItemChange('source', e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Confidence (0-1)"
                type="number"
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                value={newKnowledgeItem.confidence}
                onChange={(e) => handleNewKnowledgeItemChange('confidence', parseFloat(e.target.value))}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Relevance (0-1)"
                type="number"
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                value={newKnowledgeItem.relevance}
                onChange={(e) => handleNewKnowledgeItemChange('relevance', parseFloat(e.target.value))}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddKnowledgeDialog}>Cancel</Button>
          <Button 
            onClick={handleAddKnowledgeItem} 
            variant="contained" 
            disabled={isLoading || !newKnowledgeItem.topic || !newKnowledgeItem.content}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Event Dialog */}
      <Dialog open={addEventDialogOpen} onClose={handleCloseAddEventDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add Current Event</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={newEvent.title}
            onChange={(e) => handleNewEventChange('title', e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            label="Description"
            value={newEvent.description}
            onChange={(e) => handleNewEventChange('description', e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
          />
          
          <TextField
            label="Source"
            value={newEvent.source}
            onChange={(e) => handleNewEventChange('source', e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            label="URL"
            value={newEvent.url}
            onChange={(e) => handleNewEventChange('url', e.target.value)}
            fullWidth
            margin="normal"
          />
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Published Date"
                type="date"
                value={newEvent.publishedAt}
                onChange={(e) => handleNewEventChange('publishedAt', e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Category"
                value={newEvent.category}
                onChange={(e) => handleNewEventChange('category', e.target.value)}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
          
          <TextField
            label="Relevance (0-1)"
            type="number"
            inputProps={{ min: 0, max: 1, step: 0.1 }}
            value={newEvent.relevance}
            onChange={(e) => handleNewEventChange('relevance', parseFloat(e.target.value))}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddEventDialog}>Cancel</Button>
          <Button 
            onClick={handleAddEvent} 
            variant="contained" 
            disabled={isLoading || !newEvent.title || !newEvent.description}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Enhance Query Dialog */}
      <Dialog open={enhanceQueryDialogOpen} onClose={handleCloseEnhanceQueryDialog} maxWidth="md" fullWidth>
        <DialogTitle>Enhance Query with Context</DialogTitle>
        <DialogContent>
          <TextField
            label="Query"
            value={queryToEnhance}
            onChange={(e) => setQueryToEnhance(e.target.value)}
            fullWidth
            margin="normal"
            required
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleEnhanceQuery();
              }
            }}
          />
          
          {enhancedQueryResult && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Enhanced Query
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body1">
                  {enhancedQueryResult.enhancedQuery}
                </Typography>
              </Paper>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Context Details
              </Typography>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Knowledge Items ({enhancedQueryResult.context.knowledgeItems.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {enhancedQueryResult.context.knowledgeItems.length > 0 ? (
                    enhancedQueryResult.context.knowledgeItems.map((item: any) => (
                      <Box key={item.id} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">{item.topic}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.content}</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No knowledge items found</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Current Events ({enhancedQueryResult.context.currentEvents.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {enhancedQueryResult.context.currentEvents.length > 0 ? (
                    enhancedQueryResult.context.currentEvents.map((event: any) => (
                      <Box key={event.id} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">{event.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{event.description}</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No current events found</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Entities ({enhancedQueryResult.context.entities.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {enhancedQueryResult.context.entities.length > 0 ? (
                    enhancedQueryResult.context.entities.map((entity: any) => (
                      <Box key={entity.id} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">{entity.name}</Typography>
                        <Typography variant="body2" color="text.secondary">Type: {entity.type}</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No entities found</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Temporal Context</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    Current Time: {new Date(enhancedQueryResult.context.temporalContext.currentTime).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Time Zone: {enhancedQueryResult.context.temporalContext.timeZone}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    Time References ({enhancedQueryResult.context.temporalContext.timeReferences.length})
                  </Typography>
                  {enhancedQueryResult.context.temporalContext.timeReferences.length > 0 ? (
                    enhancedQueryResult.context.temporalContext.timeReferences.map((ref: any) => (
                      <Box key={ref.id} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          {ref.referenceText} → {new Date(ref.resolvedDate).toLocaleString()}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No time references found</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEnhanceQueryDialog}>Close</Button>
          <Button 
            onClick={handleEnhanceQuery} 
            variant="contained" 
            disabled={isLoading || !queryToEnhance}
            startIcon={isLoading ? <CircularProgress size={20} /> : <EnhancedEncryptionIcon />}
          >
            Enhance Query
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContextualAwarenessPage;
