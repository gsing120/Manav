import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  LinearProgress
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';

/**
 * AdvancedReasoningPage component for complex problem solving
 */
const AdvancedReasoningPage: React.FC = () => {
  const [problem, setProblem] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [reasoningResult, setReasoningResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle problem submission for reasoning
   */
  const handleSubmitProblem = async () => {
    if (!problem.trim()) {
      setError('Please enter a problem to solve');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setReasoningResult(null);

    try {
      // Send request to API
      const response = await axios.post('/api/reasoning/reason', { problem });

      // Set reasoning result
      setReasoningResult(response.data);
    } catch (error) {
      console.error('Error performing reasoning:', error);
      setError('Failed to perform reasoning. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle problem input change
   */
  const handleProblemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProblem(event.target.value);
    setError(null);
  };

  /**
   * Reset the form
   */
  const handleReset = () => {
    setProblem('');
    setReasoningResult(null);
    setError(null);
  };

  /**
   * Render confidence indicator
   */
  const renderConfidence = (confidence: number) => {
    let color = 'success';
    if (confidence < 0.7) color = 'error';
    else if (confidence < 0.9) color = 'warning';

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Typography variant="body2" sx={{ mr: 1 }}>
          Confidence:
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={confidence * 100} 
          color={color as any}
          sx={{ flexGrow: 1, mr: 1, height: 8, borderRadius: 4 }}
        />
        <Typography variant="body2">
          {Math.round(confidence * 100)}%
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        <PsychologyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Advanced Reasoning
      </Typography>
      
      <Typography variant="body1" paragraph>
        Enter a complex problem and the system will use multi-step reasoning with verification 
        and self-correction to solve it. The system can handle mathematical, logical, explanatory, 
        comparative, and predictive problems.
      </Typography>
      
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <TextField
          label="Enter your problem"
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={problem}
          onChange={handleProblemChange}
          placeholder="E.g., If a train travels at 60 mph for 2 hours and then at 80 mph for 1 hour, what is the average speed for the entire journey?"
          disabled={isProcessing}
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitProblem}
            disabled={!problem.trim() || isProcessing}
            startIcon={isProcessing ? <CircularProgress size={20} /> : <PsychologyIcon />}
          >
            {isProcessing ? 'Processing...' : 'Solve Problem'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={isProcessing}
          >
            Reset
          </Button>
        </Box>
      </Paper>
      
      {reasoningResult && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Reasoning Process
          </Typography>
          
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Problem
              </Typography>
              <Typography variant="body1">
                {reasoningResult.problem}
              </Typography>
              
              {renderConfidence(reasoningResult.confidence)}
              
              {reasoningResult.verificationResult && !reasoningResult.verificationResult.isValid && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Some issues were detected and self-corrected during reasoning
                </Alert>
              )}
            </CardContent>
          </Card>
          
          <Stepper orientation="vertical" sx={{ mb: 3 }}>
            {reasoningResult.steps.map((step: any, index: number) => (
              <Step key={index} active={true} completed={true}>
                <StepLabel
                  StepIconComponent={() => (
                    <Chip
                      label={step.id}
                      color={step.confidence > 0.8 ? "primary" : "warning"}
                      size="small"
                    />
                  )}
                >
                  <Typography variant="subtitle1">
                    {step.description}
                    {step.confidence < 0.7 && (
                      <ErrorIcon color="error" sx={{ ml: 1, verticalAlign: 'middle' }} />
                    )}
                    {step.confidence > 0.9 && (
                      <CheckCircleIcon color="success" sx={{ ml: 1, verticalAlign: 'middle' }} />
                    )}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {step.content}
                  </Typography>
                  
                  {step.result && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Result: {step.result}
                      </Typography>
                    </>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      Confidence:
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={step.confidence * 100} 
                      color={step.confidence < 0.7 ? "error" : step.confidence < 0.9 ? "warning" : "success"}
                      sx={{ width: 100, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {Math.round(step.confidence * 100)}%
                    </Typography>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Final Answer
              </Typography>
              <Typography variant="body1">
                {reasoningResult.answer}
              </Typography>
              
              {reasoningResult.verificationResult && reasoningResult.verificationResult.issues.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Issues Addressed During Reasoning:
                  </Typography>
                  {reasoningResult.verificationResult.issues.map((issue: any, index: number) => (
                    <Alert severity="info" key={index} sx={{ mb: 1 }}>
                      {issue.description}
                    </Alert>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default AdvancedReasoningPage;
