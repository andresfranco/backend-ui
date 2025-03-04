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
  Alert,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SERVER_URL from '../common/BackendServerData';

function ExperienceForm({ open, onClose, experience, mode = 'create' }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    start_date: null,
    end_date: null,
    current: false,
    section_id: '',
    order: 0
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSections, setAvailableSections] = useState([]);

  // Fetch available sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/sections`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch sections');
        }
        const data = await response.json();
        setAvailableSections(data.items || []);
      } catch (error) {
        console.error('Error fetching sections:', error);
        setApiError('Failed to load sections');
      }
    };

    fetchSections();
  }, []);

  // Initialize form data when experience prop changes or mode changes
  useEffect(() => {
    if (mode === 'edit' || mode === 'delete') {
      if (experience) {
        setFormData({
          id: experience.id,
          title: experience.title || '',
          company: experience.company || '',
          location: experience.location || '',
          description: experience.description || '',
          start_date: experience.start_date ? new Date(experience.start_date) : null,
          end_date: experience.end_date ? new Date(experience.end_date) : null,
          current: experience.current || false,
          section_id: experience.section_id || '',
          order: experience.order || 0
        });
      }
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        company: '',
        location: '',
        description: '',
        start_date: null,
        end_date: null,
        current: false,
        section_id: '',
        order: 0
      });
    }
  }, [experience, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!formData.current && !formData.end_date) {
      newErrors.end_date = 'End date is required if not current position';
    }
    if (!formData.section_id) {
      newErrors.section_id = 'Section is required';
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
      // Create a copy of formData to modify for the API request
      const apiData = { ...formData };
      
      // Format dates for API
      if (apiData.start_date) {
        apiData.start_date = apiData.start_date.toISOString().split('T')[0];
      }
      
      if (apiData.end_date && !apiData.current) {
        apiData.end_date = apiData.end_date.toISOString().split('T')[0];
      } else if (apiData.current) {
        apiData.end_date = null;
      }
      
      let url = `${SERVER_URL}/api/experiences`;
      let method = 'POST';
      
      // For edit and delete, use the experience ID in the URL
      if (mode === 'edit' || mode === 'delete') {
        url = `${SERVER_URL}/api/experiences/${formData.id}`;
        method = mode === 'edit' ? 'PUT' : 'DELETE';
      }
      
      console.log('Sending request:', { url, method, body: apiData });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: method !== 'DELETE' ? JSON.stringify(apiData) : undefined
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to ${mode} experience: ${response.status}`);
      }
      
      // Close the form and refresh data
      onClose(true);
    } catch (error) {
      console.error(`Error ${mode}ing experience:`, error);
      setApiError(error.message || `Failed to ${mode} experience`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'order' ? parseInt(value, 10) || 0 : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCurrentChange = (e) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      current: checked,
      end_date: checked ? null : prev.end_date
    }));
    if (errors.end_date && checked) {
      setErrors(prev => ({
        ...prev,
        end_date: ''
      }));
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    onClose(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={() => onClose(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {mode === 'create' ? 'Create New Experience' : mode === 'edit' ? 'Edit Experience' : 'Delete Experience'}
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
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                error={!!errors.company}
                helperText={errors.company}
                disabled={mode === 'delete'}
              />
              
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
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
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(date) => handleDateChange('start_date', date)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!errors.start_date}
                      helperText={errors.start_date}
                      disabled={mode === 'delete'}
                    />
                  )}
                  disabled={mode === 'delete'}
                />
                
                <DatePicker
                  label="End Date"
                  value={formData.end_date}
                  onChange={(date) => handleDateChange('end_date', date)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!errors.end_date}
                      helperText={errors.end_date}
                      disabled={mode === 'delete' || formData.current}
                    />
                  )}
                  disabled={mode === 'delete' || formData.current}
                />
              </Box>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.current}
                    onChange={handleCurrentChange}
                    name="current"
                    disabled={mode === 'delete'}
                  />
                }
                label="Current Position"
              />
              
              <FormControl fullWidth error={!!errors.section_id} disabled={mode === 'delete'}>
                <InputLabel id="section-select-label">Section</InputLabel>
                <Select
                  labelId="section-select-label"
                  id="section-select"
                  name="section_id"
                  value={formData.section_id}
                  onChange={handleChange}
                  label="Section"
                >
                  {availableSections.map((section) => (
                    <MenuItem key={section.id} value={section.id}>
                      {section.title}
                    </MenuItem>
                  ))}
                </Select>
                {errors.section_id && (
                  <Typography variant="caption" color="error">
                    {errors.section_id}
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
    </LocalizationProvider>
  );
}

export default ExperienceForm;
