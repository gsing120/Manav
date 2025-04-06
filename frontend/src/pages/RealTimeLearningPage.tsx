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
  Rating,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  Alert,
  LinearProgress
} from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MemoryIcon from '@mui/icons-material/Memory';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
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
      id={`learning-tabpanel-${index}`}
      aria-labelledby={`learning-tab-${index}`}
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
 * RealTimeLearningPage component for feedback collection and learning capabilities
 */
const RealTimeLearningPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Feedback form state
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackContext, setFeedbackContext] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackType, setFeedbackType] = useState('general');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Response improvement state
  const [originalResponse, setOriginalResponse] = useState('');
  const [responseContext, setResponseContext] = useState('');
  const [improvedResponse, setImprovedResponse] = useState<any | null>(null);
  
  // Learning stats state
  const [learningStats, setLearningStats] = useState<any | null>(null);
  const [knowledgeGaps, setKnowledgeGaps] = useState<any[]>([]);
  
  // Load learning stats and knowledge gaps on component mount
  useEffect(() => {
    loadLearningStats();
    loadKnowledgeGaps();
  }, []);
  
  /**
   * Handle tab change
   */
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Refresh data when switching to stats tab
    if (newValue === 2) {
      loadLearningStats();
      loadKnowledgeGaps();
    }
  };
  
  /**
   * Load learning statistics
   */
  const loadLearningStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/api/learning/stats');
      setLearningStats(response.data);
    } catch (error) {
      console.error('Error loading learning stats:', error);
      setError('Failed to load learning statistics');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Load knowledge gaps
   */
  const loadKnowledgeGaps = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/api/learning/knowledge-gaps');
      setKnowledgeGaps(response.data);
    } catch (error) {
      console.error('Error loading knowledge gaps:', error);
      setError('Failed to load knowledge gaps');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle feedback submission
   */
  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim()) {
      setError('Please enter feedback content');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const feedbackData = {
        content: feedbackContent,
        context: feedbackContext,
        rating: feedbackRating,
        type: feedbackType
      };
      
      const response = await axios.post('/api/learning/feedback', feedbackData);
      
      if (response.data.success) {
        setFeedbackSubmitted(true);
        
        // Clear form after successful submission
        setTimeout(() => {
          setFeedbackContent('');
          setFeedbackContext('');
          setFeedbackRating(null);
          setFeedbackType('general');
          setFeedbackSubmitted(false);
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle response improvement
   */
  const handleImproveResponse = async () => {
    if (!originalResponse.trim()) {
      setError('Please enter a response to improve');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = {
        response: originalResponse,
        context: responseContext
      };
      
      const response = await axios.post('/api/learning/improve-response', data);
      setImprovedResponse(response.data);
    } catch (error) {
      console.error('Error improving response:', error);
      setError('Failed to improve response');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Reset feedback form
   */
  const handleResetFeedback = () => {
    setFeedbackContent('');
    setFeedbackContext('');
    setFeedbackRating(null);
    setFeedbackType('general');
    setError(null);
  };
  
  /**
   * Reset response improvement form
   */
  const handleResetImprovement = () => {
    setOriginalResponse('');
    setResponseContext('');
    setImprovedResponse(null);
    setError(null);
  };
  
  /**
   * Render feedback type chip
   */
  const renderFeedbackTypeChip = (type: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    let icon = null;
    
    switch (type) {
      case 'suggestion':
        color = 'info';
        icon = <TrendingUpIcon />;
        break;
      case 'correction':
        color = 'warning';
        icon = <BugReportIcon />;
        break;
      case 'appreciation':
        color = 'success';
        icon = <CheckCircleIcon />;
        break;
      case 'question':
        color = 'primary';
        icon = <PsychologyIcon />;
        break;
      default:
        color = 'default';
        icon = <FeedbackIcon />;
        break;
    }
    
    return (
      <Chip 
        icon={icon}
        label={type.charAt(0).toUpperCase() + type.slice(1)} 
        color={color}
        size="small"
        variant={feedbackType === type ? 'filled' : 'outlined'}
        onClick={() => setFeedbackType(type)}
        sx={{ m: 0.5 }}
      />
    );
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        <MemoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Real-Time Learning System
      </Typography>
      
      <Typography variant="body1" paragraph>
        This system learns from user feedback and continuously improves its responses.
        It can identify knowledge gaps, adapt to user preferences, and apply learned improvements.
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="learning system tabs">
          <Tab label="Provide Feedback" icon={<FeedbackIcon />} iconPosition="start" />
          <Tab label="Improve Responses" icon={<TrendingUpIcon />} iconPosition="start" />
          <Tab label="Learning Stats" icon={<PsychologyIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {feedbackSubmitted && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Feedback submitted successfully! Thank you for helping the system learn.
        </Alert>
      )}
      
      <TabPanel value={activeTab} index={0}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Provide Feedback
          </Typography>
          
          <TextField
            label="Feedback Content"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={feedbackContent}
            onChange={(e) => setFeedbackContent(e.target.value)}
            placeholder="Enter your feedback, suggestions, corrections, or appreciation..."
            disabled={isLoading}
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Context (optional)"
            fullWidth
            variant="outlined"
            value={feedbackContext}
            onChange={(e) => setFeedbackContext(e.target.value)}
            placeholder="Provide context for your feedback (e.g., topic, situation)"
            disabled={isLoading}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Feedback Type:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {renderFeedbackTypeChip('general')}
              {renderFeedbackTypeChip('suggestion')}
              {renderFeedbackTypeChip('correction')}
              {renderFeedbackTypeChip('appreciation')}
              {renderFeedbackTypeChip('question')}
            </Box>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Rating:
            </Typography>
            <Rating
              name="feedback-rating"
              value={feedbackRating}
              onChange={(event, newValue) => {
                setFeedbackRating(newValue);
              }}
              disabled={isLoading}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitFeedback}
              disabled={!feedbackContent.trim() || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <FeedbackIcon />}
            >
              {isLoading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleResetFeedback}
              disabled={isLoading}
            >
              Reset
            </Button>
          </Box>
        </Paper>
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Improve Responses
          </Typography>
          
          <TextField
            label="Original Response"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={originalResponse}
            onChange={(e) => setOriginalResponse(e.target.value)}
            placeholder="Enter a response that you want to improve using the learning system..."
            disabled={isLoading}
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Context (optional)"
            fullWidth
            variant="outlined"
            value={responseContext}
            onChange={(e) => setResponseContext(e.target.value)}
            placeholder="Provide context for the response (e.g., topic, situation)"
            disabled={isLoading}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleImproveResponse}
              disabled={!originalResponse.trim() || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <TrendingUpIcon />}
            >
              {isLoading ? 'Improving...' : 'Improve Response'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleResetImprovement}
              disabled={isLoading}
            >
              Reset
            </Button>
          </Box>
          
          {improvedResponse && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Improved Response
              </Typography>
              
              {improvedResponse.appliedLearning && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  This response has been improved using learned patterns from user feedback.
                </Alert>
              )}
              
              <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
                <CardContent>
                  <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                    {improvedResponse.improvedResponse}
                  </Typography>
                </CardContent>
              </Card>
              
              {improvedResponse.improvements && improvedResponse.improvements.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Improvements Applied:
                  </Typography>
                  
                  <List>
                    {improvedResponse.improvements.map((improvement: any, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={improvement.description}
                          secondary={`Confidence: ${Math.round(improvement.confidence * 100)}%`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </TabPanel>
      
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Learning Statistics
              </Typography>
              
              {isLoading && <LinearProgress sx={{ mb: 2 }} />}
              
              {learningStats ? (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {learningStats.totalFeedback}
                        </Typography>
                        <Typography variant="body2">
                          Total Feedback Items
                        </Typography>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {learningStats.knowledgeGapCount}
                        </Typography>
                        <Typography variant="body2">
                          Knowledge Gaps Identified
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Feedback by Type:
                    </Typography>
                    
                    {Object.entries(learningStats.feedbackByType).length > 0 ? (
                      <List>
                        {Object.entries(learningStats.feedbackByType).map(([type, count]: [string, any]) => (
                          <ListItem key={type}>
                            <ListItemText
                              primary={`${type.charAt(0).toUpperCase() + type.slice(1)}`}
                              secondary={`${count} items`}
                            />
                            <LinearProgress 
                              variant="determinate" 
                              value={(count / learningStats.totalFeedback) * 100} 
                              sx={{ width: 100, height: 8, borderRadius: 4 }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No feedback data available yet
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Average Sentiment:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(learningStats.averageSentiment + 1) * 50} 
                        color={learningStats.averageSentiment < 0 ? "error" : "success"}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4, mr: 2 }}
                      />
                      <Typography variant="body2">
                        {learningStats.averageSentiment.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Model Status:
                    </Typography>
                    
                    <Chip 
                      label={learningStats.modelStatus} 
                      color={learningStats.modelStatus === 'ready' ? 'success' : 'warning'} 
                    />
                    
                    {learningStats.lastTrainingTime && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Last trained: {new Date(learningStats.lastTrainingTime).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No learning statistics available yet
                </Typography>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Knowledge Gaps
              </Typography>
              
              {isLoading && <LinearProgress sx={{ mb: 2 }} />}
              
              {knowledgeGaps && knowledgeGaps.length > 0 ? (
                <List>
                  {knowledgeGaps.map((gap, index) => (
                    <Card key={gap.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1">
                            {gap.topic.charAt(0).toUpperCase() + gap.topic.slice(1)}
                          </Typography>
                          <Chip 
                            label={`${gap.count} ${gap.count === 1 ? 'instance' : 'instances'}`} 
                            size="small" 
                            color="primary"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Identified: {new Date(gap.created).toLocaleString()}
                        </Typography>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Typography variant="body2" gutterBottom>
                          Example feedback:
                        </Typography>
                        
                        {gap.examples && gap.examples.length > 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            "{gap.examples[0]}"
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No examples available
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                          <Chip 
                            label={gap.status} 
                            size="small" 
                            color={gap.status === 'addressed' ? 'success' : 'warning'} 
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No knowledge gaps identified yet
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default RealTimeLearningPage;
