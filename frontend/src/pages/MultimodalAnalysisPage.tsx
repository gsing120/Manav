import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

// Styled components
const Input = styled('input')({
  display: 'none',
});

const ImagePreview = styled('img')({
  maxWidth: '100%',
  maxHeight: '400px',
  objectFit: 'contain',
});

const ResultCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

/**
 * MultimodalAnalysisPage component for image analysis and understanding
 */
const MultimodalAnalysisPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError(null);
    }
  };

  /**
   * Handle file upload and analysis
   */
  const handleAnalyzeImage = async () => {
    if (!selectedFile) {
      setError('Please select an image to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Send request to API
      const response = await axios.post('/api/multimodal/process-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Set analysis result
      setAnalysisResult(response.data);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Reset the form
   */
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Multimodal Analysis
      </Typography>
      
      <Typography variant="body1" paragraph>
        Upload an image to analyze its content using advanced AI models. The system will identify objects, 
        classify the image, extract text, and generate a natural language description.
      </Typography>
      
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label htmlFor="image-upload">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                />
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{ marginBottom: 2 }}
                >
                  Upload Image
                </Button>
              </label>
              
              {previewUrl && (
                <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Preview:
                  </Typography>
                  <ImagePreview src={previewUrl} alt="Preview" />
                </Box>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Image Analysis
              </Typography>
              
              {error && (
                <Typography color="error" sx={{ marginBottom: 2 }}>
                  {error}
                </Typography>
              )}
              
              <Box sx={{ marginTop: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SearchIcon />}
                  onClick={handleAnalyzeImage}
                  disabled={!selectedFile || isAnalyzing}
                >
                  Analyze Image
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  disabled={isAnalyzing}
                >
                  Reset
                </Button>
              </Box>
              
              {isAnalyzing && (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                  <CircularProgress />
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {analysisResult && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Analysis Results
          </Typography>
          
          {/* Description */}
          <ResultCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Image Description
              </Typography>
              <Typography variant="body1">
                {analysisResult.description}
              </Typography>
            </CardContent>
          </ResultCard>
          
          <Grid container spacing={3}>
            {/* Classification Results */}
            <Grid item xs={12} md={6}>
              <ResultCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <ImageIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
                    Classification Results
                  </Typography>
                  <List>
                    {analysisResult.classification.map((item: any, index: number) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={item.label}
                            secondary={`Confidence: ${(item.confidence * 100).toFixed(2)}%`}
                          />
                          <Chip 
                            label={`${(item.confidence * 100).toFixed(0)}%`} 
                            color={index === 0 ? "primary" : "default"}
                            size="small"
                          />
                        </ListItem>
                        {index < analysisResult.classification.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </ResultCard>
            </Grid>
            
            {/* Object Detection */}
            <Grid item xs={12} md={6}>
              <ResultCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <SearchIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
                    Detected Objects
                  </Typography>
                  {analysisResult.objects.length > 0 ? (
                    <List>
                      {analysisResult.objects.map((item: any, index: number) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={item.label}
                              secondary={`Confidence: ${(item.confidence * 100).toFixed(2)}%`}
                            />
                            <Chip 
                              label={`${(item.confidence * 100).toFixed(0)}%`} 
                              color="primary"
                              size="small"
                            />
                          </ListItem>
                          {index < analysisResult.objects.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No objects detected
                    </Typography>
                  )}
                </CardContent>
              </ResultCard>
            </Grid>
            
            {/* Text Extraction */}
            <Grid item xs={12}>
              <ResultCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <TextSnippetIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
                    Extracted Text
                  </Typography>
                  {analysisResult.text ? (
                    <Typography variant="body1">
                      {analysisResult.text}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No text detected in the image
                    </Typography>
                  )}
                </CardContent>
              </ResultCard>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default MultimodalAnalysisPage;
