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

function SectionForm({ open, onClose, section, mode = 'create' }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    portfolio_id: '',
    order: 0
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePortfolios, setAvailablePortfolios] = useState([]);

  // Fetch available portfolios
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/portfolios`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch portfolios');
        }
        const data = await response.json();
        setAvailablePortfolios(data.items || []);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
        setApiError('Failed to load portfolios');
      }
    };

    fetchPortfolios();
  }, []);

  // Initialize form data when section prop changes or mode changes
  useEffect(() => {
    if (mode === 'edit' || mode === 'delete') {
      if (section) {
        setFormData({
          id: section.id,
          title: section.title || '',
          content: section.content || '',
          portfolio_id: section.portfolio_id || '',
          order: section.order || 0
        });
      }
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        content: '',
        portfolio_id: '',
        order: 0
      });
    }
  }, [section, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.portfolio_id) {
      newErrors.portfolio_id = 'Portfolio is required';
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
      let url = `${SERVER_URL}/api/sections`;
      let method = 'POST';
      
      // For edit and delete, use the section ID in the URL
      if (mode === 'edit' || mode === 'delete') {
        url = `${SERVER_URL}/api/sections/${formData.id}`;
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
        throw new Error(errorData.detail || `Failed to ${mode} section: ${response.status}`);
      }
      
      // Close the form and refresh data
      onClose(true);
    } catch (error) {
      console.error(`Error ${mode}ing section:`, error);
      setApiError(error.message || `Failed to ${mode} section`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value, 10) || 0 : value
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
        {mode === 'create' ? 'Create New Section' : mode === 'edit' ? 'Edit Section' : 'Delete Section'}
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
              label="Content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              multiline
              rows={4}
              disabled={mode === 'delete'}
            />
            
            <FormControl fullWidth error={!!errors.portfolio_id} disabled={mode === 'delete'}>
              <InputLabel id="portfolio-select-label">Portfolio</InputLabel>
              <Select
                labelId="portfolio-select-label"
                id="portfolio-select"
                name="portfolio_id"
                value={formData.portfolio_id}
                onChange={handleChange}
                label="Portfolio"
              >
                {availablePortfolios.map((portfolio) => (
                  <MenuItem key={portfolio.id} value={portfolio.id}>
                    {portfolio.title}
                  </MenuItem>
                ))}
              </Select>
              {errors.portfolio_id && (
                <Typography variant="caption" color="error">
                  {errors.portfolio_id}
                </Typography>
              )}
            </FormControl>
            
            <TextField
              fullWidth
              label="Order"
              name="order"
              type="number"
              value={formData.order}
              onChange={handleChange}
              disabled={mode === 'delete'}
              InputProps={{ inputProps: { min: 0 } }}
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

export default SectionForm;
