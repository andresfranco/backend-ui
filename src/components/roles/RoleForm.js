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

function RoleForm({ open, onClose, role, onSubmit, mode = 'create' }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [availablePermissions, setAvailablePermissions] = useState([]);

  // Fetch available permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/permissions/full');
        if (!response.ok) {
          throw new Error('Failed to fetch permissions');
        }
        const data = await response.json();
        setAvailablePermissions(data.items || []);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setApiError('Failed to load permissions');
      }
    };

    fetchPermissions();
  }, []);
  
  // Reset form when role changes
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        // Extract permission names from the permissions array
        permissions: Array.isArray(role.permissions) 
          ? role.permissions.map(permission => 
              typeof permission === 'object' ? permission.name : permission
            ) 
          : []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
  }, [role]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError('');
    if (validateForm()) {
      // Log the form data being submitted
      console.log('Submitting role with permissions:', formData.permissions);
      
      // Create a copy of the form data to ensure we're not modifying the original
      const submissionData = {
        ...formData,
        // Ensure permissions is an array of strings
        permissions: Array.isArray(formData.permissions) ? formData.permissions : []
      };
      
      console.log('Final submission data:', submissionData);
      onSubmit(submissionData);
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

  const handlePermissionChange = (event) => {
    const selectedPermissions = event.target.value;
    setFormData(prev => ({
      ...prev,
      permissions: selectedPermissions
    }));

    if (errors.permissions) {
      setErrors(prev => ({
        ...prev,
        permissions: ''
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
              rows={3}
              disabled={mode === 'delete'}
            />
            <FormControl fullWidth error={!!errors.permissions}>
              <InputLabel>Permissions</InputLabel>
              <Select
                multiple
                name="permissions"
                value={formData.permissions}
                onChange={handlePermissionChange}
                label="Permissions"
                disabled={mode === 'delete'}
                renderValue={(selected) => (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                    {selected.map((permissionName) => (
                      <Chip 
                        key={permissionName} 
                        label={permissionName} 
                        size="small" 
                      />
                    ))}
                  </Stack>
                )}
              >
                {availablePermissions.map((permission) => (
                  <MenuItem key={permission.id} value={permission.name}>
                    <Typography variant="body2">{permission.name}</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                      {permission.description}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
              {errors.permissions && (
                <Typography variant="caption" color="error">
                  {errors.permissions}
                </Typography>
              )}
            </FormControl>
            {mode === 'delete' && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                Are you sure you want to delete this role? This action cannot be undone.
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

export default RoleForm;