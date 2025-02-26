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
  Chip,
  Stack,
  Alert
} from '@mui/material';

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

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '', // Don't populate password in edit mode
        roles: Array.isArray(user.roles) ? user.roles : []
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        roles: []
      });
    }
  }, [user]);

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/roles/');
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      const data = await response.json();
      setAvailableRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setApiError('Failed to load roles');
    }
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError('');
    if (validateForm()) {
      onSubmit(formData);
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
            {(mode === 'create' || mode === 'edit') && (
              <TextField
                fullWidth
                label={mode === 'create' ? "Password" : "New Password (leave blank to keep current)"}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                required={mode === 'create'}
              />
            )}
            <FormControl fullWidth error={!!errors.roles}>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                name="roles"
                value={formData.roles.map(role => role.id)}
                onChange={handleRoleChange}
                label="Roles"
                disabled={mode === 'delete'}
                renderValue={(selected) => (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                    {formData.roles.map((role) => (
                      <Chip key={role.id} label={role.name} size="small" />
                    ))}
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
            {mode === 'delete' && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                Are you sure you want to delete this user? This action cannot be undone.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={onClose}
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

export default UserForm;