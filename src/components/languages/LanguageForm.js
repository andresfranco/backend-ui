import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Alert
} from '@mui/material';
import SERVER_URL from '../common/BackendServerData';

function LanguageForm({ open, onClose, language, mode = 'create' }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    is_default: false
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when language prop changes or mode changes
  useEffect(() => {
    if (mode === 'edit' || mode === 'delete') {
      if (language) {
        setFormData({
          id: language.id,
          name: language.name || '',
          code: language.code || '',
          is_default: language.is_default || false
        });
      }
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        code: '',
        is_default: false
      });
    }
  }, [language, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    } else if (formData.code.length > 5) {
      newErrors.code = 'Code must be 5 characters or less';
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
      let url = `${SERVER_URL}/api/languages`;
      let method = 'POST';
      
      // For edit and delete, use the language ID in the URL
      if (mode === 'edit' || mode === 'delete') {
        url = `${SERVER_URL}/api/languages/${formData.id}`;
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
        throw new Error(errorData.detail || `Failed to ${mode} language: ${response.status}`);
      }
      
      // Close the form and refresh data
      onClose(true);
    } catch (error) {
      console.error(`Error ${mode}ing language:`, error);
      setApiError(error.message || `Failed to ${mode} language`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {mode === 'create' ? 'Create New Language' : mode === 'edit' ? 'Edit Language' : 'Delete Language'}
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
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={mode === 'delete'}
            />
            <TextField
              fullWidth
              label="Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              error={!!errors.code}
              helperText={errors.code}
              disabled={mode === 'delete'}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_default}
                  onChange={handleChange}
                  name="is_default"
                  disabled={mode === 'delete'}
                />
              }
              label="Default Language"
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

export default LanguageForm;
