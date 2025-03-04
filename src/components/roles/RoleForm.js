import React, { useState, useEffect } from 'react';
import {Dialog,DialogTitle,DialogContent,DialogActions,TextField,Button,Box,FormControl,InputLabel,Select,MenuItem,Typography,Chip,Stack,Alert} from '@mui/material';
import SERVER_URL from '../common/BackendServerData';

function RoleForm({ open, onClose, role, onSubmit, mode = 'create' }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [availablePermissions, setAvailablePermissions] = useState([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/permissions/`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch permissions');
        }
        const data = await response.json();
        setAvailablePermissions(data || []);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setApiError('Failed to load permissions');
      }
    };

    fetchPermissions();
  }, []);
  
  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    } else if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: Array.isArray(role.permissions) ? role.permissions : []
      });
    }
  }, [role, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.permissions.length) {
      newErrors.permissions = 'At least one permission is required';
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
      const endpoint = mode === 'create' 
        ? `${SERVER_URL}/api/roles/` 
        : `${SERVER_URL}/api/roles/${role?.id}`;
        
      const method = mode === 'create' ? 'POST' : mode === 'edit' ? 'PUT' : 'DELETE';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: method !== 'DELETE' ? JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          permissions: formData.permissions
        }) : undefined,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to ${mode} role`);
      }
      
      onClose(true);
    } catch (error) {
      console.error(`Error ${mode}ing role:`, error);
      setApiError(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissionChange = (event) => {
    const selectedPermissions = event.target.value;
    setFormData(prev => ({
      ...prev,
      permissions: selectedPermissions
    }));
    if (errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: '' }));
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
        {mode === 'create' ? 'Create New Role' : mode === 'edit' ? 'Edit Role' : 'Delete Role'}
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
              label="Role Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
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
              rows={2}
              disabled={mode === 'delete'}
            />
            <FormControl fullWidth error={!!errors.permissions}>
              <InputLabel>Permissions</InputLabel>
              <Select
                multiple
                name="permissions"
                value={formData.permissions}
                onChange={handlePermissionChange}
                renderValue={(selected) => (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Stack>
                )}
                disabled={mode === 'delete'}
              >
                {availablePermissions.map((permission) => (
                  <MenuItem key={permission} value={permission}>
                    {permission}
                  </MenuItem>
                ))}
              </Select>
              {errors.permissions && (
                <Typography color="error" variant="caption">
                  {errors.permissions}
                </Typography>
              )}
            </FormControl>
            {mode === 'delete' && (
              <Typography color="error">
                Are you sure you want to delete this role? This action cannot be undone.
                {role?.users_count > 0 && (
                  <strong> Warning: This role is assigned to {role.users_count} users.</strong>
                )}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(false)}>Cancel</Button>
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

export default RoleForm;