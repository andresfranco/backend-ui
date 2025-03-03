import React, { useState, useEffect } from 'react';
import {Dialog,DialogTitle,DialogContent,DialogActions,TextField,Button,Box,FormControl,InputLabel,Select,MenuItem,Typography,Chip,Stack,Alert} from '@mui/material';
import SERVER_URL from '../common/BackendServerData';

function UserForm({ open, onClose, user, onSubmit, mode = 'create' }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    roles: []
  });
  const [errors, setErrors] = useState({});
  const [availableRoles, setAvailableRoles] = useState([]);
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/roles/full`);
        if (!response.ok) {
          throw new Error('Failed to fetch roles');
        }
        const data = await response.json();
        setAvailableRoles(data.items || []);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setApiError('Failed to load roles');
      }
    };

    fetchRoles();
  }, []);

  // Initialize form data when user prop changes or mode changes
  useEffect(() => {
    if (mode === 'edit' || mode === 'delete') {
      if (user) {
        setFormData({
          id: user.id,
          username: user.username || '',
          email: user.email || '',
          password: '', // Password is empty when editing
          roles: user.roles || []
        });
      }
    } else {
      // Reset form for create mode
      setFormData({
        username: '',
        email: '',
        password: '',
        roles: []
      });
    }
  }, [user, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (mode === 'create' && !formData.password) {
      newErrors.password = 'Password is required';
    }
    if (formData.roles.length === 0) {
      newErrors.roles = 'At least one role is required';
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
      let url = `${SERVER_URL}/api/users`;
      let method = 'POST';
      
      // Create a copy of formData to modify for the API request
      let body = { ...formData };
      
      // Extract role IDs for the API request
      body.roles = formData.roles.map(role => role.id);
      
      // For edit and delete, use the user ID in the URL
      if (mode === 'edit' || mode === 'delete') {
        url = `${SERVER_URL}/api/users/${formData.id}`;
        method = mode === 'edit' ? 'PUT' : 'DELETE';
      }
      
      // For edit mode, only include password if it's not empty
      if (mode === 'edit' && !formData.password) {
        delete body.password;
      }
      
      console.log('Sending request:', { url, method, body });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: method !== 'DELETE' ? JSON.stringify(body) : undefined
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${mode} user: ${response.status}`);
      }
      
      // Call onSubmit to notify parent component
      if (onSubmit) {
        onSubmit(true);
      }
      
      // Close the form
      onClose(true);
    } catch (error) {
      console.error(`Error ${mode}ing user:`, error);
      setApiError(error.message || `Failed to ${mode} user`);
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

  const handleRoleChange = (event) => {
    const selectedRoleIds = event.target.value;
    const selectedRoles = availableRoles.filter(role => 
      selectedRoleIds.includes(role.id)
    );
    
    setFormData(prev => ({
      ...prev,
      roles: selectedRoles
    }));

    if (errors.roles) {
      setErrors(prev => ({
        ...prev,
        roles: ''
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
        {mode === 'create' ? 'Create New User' : mode === 'edit' ? 'Edit User' : 'Delete User'}
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
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              disabled={mode === 'delete'}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={mode === 'delete'}
            />
            {(mode === 'create' || (mode === 'edit' && formData.password)) && (
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={mode === 'delete'}
              />
            )}
            <FormControl fullWidth error={!!errors.roles} disabled={mode === 'delete'}>
              <InputLabel id="roles-select-label">Roles</InputLabel>
              <Select
                labelId="roles-select-label"
                id="roles-select"
                multiple
                value={formData.roles.map(role => role.id)}
                onChange={handleRoleChange}
                renderValue={(selected) => (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {selected.map((roleId) => {
                      const role = availableRoles.find(r => r.id === roleId);
                      return role ? (
                        <Chip 
                          key={role.id} 
                          label={role.name} 
                          size="small" 
                          sx={{ m: 0.5 }}
                        />
                      ) : null;
                    })}
                  </Stack>
                )}
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.roles && (
                <Typography variant="caption" color="error">
                  {errors.roles}
                </Typography>
              )}
            </FormControl>
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

export default UserForm;