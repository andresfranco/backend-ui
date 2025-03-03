import React, { useState, useEffect } from 'react';
import {Dialog,DialogTitle,DialogContent,DialogActions,TextField,Button,Box,Typography,Alert} from '@mui/material';
import SERVER_URL from '../common/BackendServerData';

function PermissionForm({ open, onClose, permission, mode = 'create' }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  
  // Reset form when permission changes
  useEffect(() => {
    if (mode === 'create') {
      // For create mode, clear the form
      setFormData({
        name: '',
        description: ''
      });
    } else {
      // For other modes (e.g., edit or delete), load the permission data
      setFormData({
        name: permission?.name || '',
        description: permission?.description || ''
      });
    }
  }, [permission, mode]);
  
  

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Permission name is required';
    } else if (!/^[A-Z_]+$/.test(formData.name)) {
      newErrors.name = 'Permission name must be uppercase with underscores only';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
    
    try {
      let url, method;
      
      if (mode === 'create') {
        url = `${SERVER_URL}/api/permissions/`;
        method = 'POST';
      } else if (mode === 'edit') {
        url = `${SERVER_URL}/api/permissions/${permission.id}`;
        method = 'PUT';
      } else if (mode === 'delete') {
        url = `${SERVER_URL}/api/permissions/${permission.id}`;
        method = 'DELETE';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method !== 'DELETE' ? JSON.stringify(formData) : undefined,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to ${mode} permission: ${response.status}`);
      }
      
      // Close the form and refresh data
      onClose(true);
    } catch (error) {
      console.error(`Error ${mode}ing permission:`, error);
      setApiError(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert permission name to uppercase if it's the name field
    const processedValue = name === 'name' ? value.toUpperCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {mode === 'create' ? 'Create New Permission' : mode === 'edit' ? 'Edit Permission' : 'Delete Permission'}
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
              label="Permission Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name || 'Use uppercase letters and underscores only (e.g., CREATE_USER)'}
              disabled={mode === 'delete'}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={3}
              disabled={mode === 'delete'}
            />
            {mode === 'delete' && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                Are you sure you want to delete this permission? This action cannot be undone and may affect roles that use this permission.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => onClose(false)}
            variant="contained"
            sx={{ 
              bgcolor: 'grey.300',
              color: 'grey.800',
              '&:hover': {
                bgcolor: 'grey.400'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={mode === 'delete' ? 'error' : 'primary'}
          >
            {mode === 'create' ? 'Create' : mode === 'edit' ? 'Save' : 'Delete'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default PermissionForm;