import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  Slider,
  Typography
} from '@mui/material';
import SERVER_URL from '../common/BackendServerData';

function SkillForm({ open, onClose, skill, mode = 'create' }) {
  const [formData, setFormData] = useState({
    name: '',
    level: 50,
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when skill prop changes or mode changes
  useEffect(() => {
    if (mode === 'edit' || mode === 'delete') {
      if (skill) {
        setFormData({
          id: skill.id,
          name: skill.name || '',
          level: skill.level || 50,
          description: skill.description || ''
        });
      }
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        level: 50,
        description: ''
      });
    }
  }, [skill, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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
      let url = `${SERVER_URL}/api/skills`;
      let method = 'POST';
      
      // For edit and delete, use the skill ID in the URL
      if (mode === 'edit' || mode === 'delete') {
        url = `${SERVER_URL}/api/skills/${formData.id}`;
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
        throw new Error(errorData.detail || `Failed to ${mode} skill: ${response.status}`);
      }
      
      // Close the form and refresh data
      onClose(true);
    } catch (error) {
      console.error(`Error ${mode}ing skill:`, error);
      setApiError(error.message || `Failed to ${mode} skill`);
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

  const handleSliderChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      level: newValue
    }));
  };

  const handleCancel = (e) => {
    e.preventDefault();
    onClose(false);
  };

  // Helper function to get color based on level
  const getLevelColor = (level) => {
    if (level >= 90) return 'success';
    if (level >= 70) return 'primary';
    if (level >= 50) return 'info';
    if (level >= 30) return 'warning';
    return 'error';
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {mode === 'create' ? 'Create New Skill' : mode === 'edit' ? 'Edit Skill' : 'Delete Skill'}
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
            
            <Box sx={{ mt: 2 }}>
              <Typography id="skill-level-slider" gutterBottom>
                Skill Level: {formData.level}%
              </Typography>
              <Slider
                value={formData.level}
                onChange={handleSliderChange}
                aria-labelledby="skill-level-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
                disabled={mode === 'delete'}
                color={getLevelColor(formData.level)}
              />
            </Box>
            
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

export default SkillForm;
