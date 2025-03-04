import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert
} from '@mui/material';
import SERVER_URL from '../common/BackendServerData';

function PortfolioForm({ open, onClose, portfolio, mode = 'create' }) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    language_id: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  // Fetch available languages
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/languages`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch languages');
        }
        const data = await response.json();
        setAvailableLanguages(data.items || []);
      } catch (error) {
        console.error('Error fetching languages:', error);
        setApiError('Failed to load languages');
      }
    };

    fetchLanguages();
  }, []);

  // Initialize form data when portfolio prop changes or mode changes
  useEffect(() => {
    if (mode === 'edit' || mode === 'delete') {
      if (portfolio) {
        setFormData({
          id: portfolio.id,
          title: portfolio.title || '',
          subtitle: portfolio.subtitle || '',
          description: portfolio.description || '',
          language_id: portfolio.language_id || '',
          meta_title: portfolio.meta_title || '',
          meta_description: portfolio.meta_description || '',
          meta_keywords: portfolio.meta_keywords || ''
        });
      }
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        language_id: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: ''
      });
    }
  }, [portfolio, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.language_id) {
      newErrors.language_id = 'Language is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let url = `${SERVER_URL}/api/portfolios`;
      let method = 'POST';
      
      // For edit and delete, use the portfolio ID in the URL
      if (mode === 'edit' || mode === 'delete') {
        url = `${SERVER_URL}/api/portfolios/${formData.id}`;
        method = mode === 'edit' ? 'PUT' : 'DELETE';
      }
      
      console.log('Sending request:', { url, method, body: formData });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: method !== 'DELETE' ? JSON.stringify(formData) : undefined
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to ${mode} portfolio: ${response.status}`);
      }
      
      // Close the form and refresh data
      onClose(true);
    } catch (error) {
      console.error(`Error ${mode}ing portfolio:`, error);
      setApiError(error.message || `Failed to ${mode} portfolio`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    onClose(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {mode === 'create' ? 'Create New Portfolio' : mode === 'edit' ? 'Edit Portfolio' : 'Delete Portfolio'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              disabled={mode === 'delete'}
            />
            
            <TextField
              fullWidth
              label="Subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              disabled={mode === 'delete'}
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              disabled={mode === 'delete'}
            />
            
            <FormControl fullWidth error={!!errors.language_id} disabled={mode === 'delete'}>
              <InputLabel id="language-select-label">Language</InputLabel>
              <Select
                labelId="language-select-label"
                id="language-select"
                name="language_id"
                value={formData.language_id}
                onChange={handleChange}
                label="Language"
              >
                {availableLanguages.map((lang) => (
                  <MenuItem key={lang.id} value={lang.id}>
                    {lang.name} ({lang.code})
                  </MenuItem>
                ))}
              </Select>
              {errors.language_id && (
                <Typography variant="caption" color="error">
                  {errors.language_id}
                </Typography>
              )}
            </FormControl>
            
            <Typography variant="h6" sx={{ mt: 2 }}>
              SEO Information
            </Typography>
            
            <TextField
              fullWidth
              label="Meta Title"
              name="meta_title"
              value={formData.meta_title}
              onChange={handleChange}
              disabled={mode === 'delete'}
            />
            
            <TextField
              fullWidth
              label="Meta Description"
              name="meta_description"
              value={formData.meta_description}
              onChange={handleChange}
              multiline
              rows={2}
              disabled={mode === 'delete'}
            />
            
            <TextField
              fullWidth
              label="Meta Keywords"
              name="meta_keywords"
              value={formData.meta_keywords}
              onChange={handleChange}
              placeholder="Separate keywords with commas"
              disabled={mode === 'delete'}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color={mode === 'delete' ? 'error' : 'primary'}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default PortfolioForm;
