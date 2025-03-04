import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  TextField
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Add as AddIcon
} from '@mui/icons-material';
import SERVER_URL from '../common/BackendServerData';

// Image categories for projects
const IMAGE_CATEGORIES = [
  { value: 'main', label: 'Main Image' },
  { value: 'thumbnail', label: 'Thumbnail' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'detail', label: 'Detail' }
];

function ProjectImageForm({ open, onClose, project }) {
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState({
    file: null,
    category: 'gallery',
    description: ''
  });
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);

  // Fetch project images
  useEffect(() => {
    const fetchImages = async () => {
      if (!project || !project.id) return;
      
      try {
        const response = await fetch(`${SERVER_URL}/api/projects/${project.id}/images`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch project images');
        }
        
        const data = await response.json();
        setImages(data || []);
      } catch (error) {
        console.error('Error fetching project images:', error);
        setApiError('Failed to load project images');
      }
    };

    fetchImages();
  }, [project]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(prev => ({
        ...prev,
        file
      }));
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewImage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadImage = async () => {
    if (!newImage.file) {
      setApiError('Please select an image to upload');
      return;
    }
    
    setIsSubmitting(true);
    setApiError('');
    
    try {
      const formData = new FormData();
      formData.append('file', newImage.file);
      formData.append('category', newImage.category);
      formData.append('description', newImage.description);
      
      const response = await fetch(`${SERVER_URL}/api/projects/${project.id}/images`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to upload image: ${response.status}`);
      }
      
      // Refresh the images list
      const updatedResponse = await fetch(`${SERVER_URL}/api/projects/${project.id}/images`, {
        credentials: 'include'
      });
      
      if (!updatedResponse.ok) {
        throw new Error('Failed to refresh project images');
      }
      
      const updatedData = await updatedResponse.json();
      setImages(updatedData || []);
      
      // Reset the form
      setNewImage({
        file: null,
        category: 'gallery',
        description: ''
      });
      setUploadPreview(null);
      
      // Reset the file input
      const fileInput = document.getElementById('project-image-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setApiError(error.message || 'Failed to upload image');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    setIsSubmitting(true);
    setApiError('');
    
    try {
      const response = await fetch(`${SERVER_URL}/api/projects/${project.id}/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to delete image: ${response.status}`);
      }
      
      // Update the images list
      setImages(images.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      setApiError(error.message || 'Failed to delete image');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (categoryValue) => {
    const category = IMAGE_CATEGORIES.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        Manage Project Images - {project?.title}
      </DialogTitle>
      <DialogContent>
        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Upload New Image
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box 
                sx={{ 
                  border: '1px dashed grey', 
                  height: 200, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {uploadPreview ? (
                  <CardMedia
                    component="img"
                    image={uploadPreview}
                    alt="Upload preview"
                    sx={{ 
                      height: '100%', 
                      width: '100%', 
                      objectFit: 'contain' 
                    }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <UploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Select an image to upload
                    </Typography>
                  </Box>
                )}
                <input
                  id="project-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="image-category-label">Category</InputLabel>
                  <Select
                    labelId="image-category-label"
                    id="image-category"
                    name="category"
                    value={newImage.category}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    {IMAGE_CATEGORIES.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={newImage.description}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleUploadImage}
                  disabled={isSubmitting || !newImage.file}
                >
                  Upload Image
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Typography variant="h6" gutterBottom>
          Current Images
        </Typography>
        {images.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No images have been uploaded for this project yet.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {images.map((image) => (
              <Grid item xs={12} sm={6} md={4} key={image.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={`${SERVER_URL}/static/${image.image_path}`}
                    alt={image.description || 'Project image'}
                    sx={{ objectFit: 'contain', bgcolor: 'background.paper' }}
                  />
                  <CardContent sx={{ pb: 0 }}>
                    <Typography variant="subtitle1" color="primary">
                      {getCategoryLabel(image.category)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {image.description || 'No description'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={isSubmitting}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => onClose(true)} 
          variant="contained"
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProjectImageForm;
