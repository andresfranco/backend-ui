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
  Stack
} from '@mui/material';

// Mock permissions data - replace with API call
const availablePermissions = [
  'CREATE_USER',
  'EDIT_USER',
  'DELETE_USER',
  'VIEW_USER',
  'CREATE_ROLE',
  'EDIT_ROLE',
  'DELETE_ROLE',
  'VIEW_ROLE'
];

function RoleForm({ open, onClose, role, onSubmit, mode = 'create' }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
  });
  
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: Array.isArray(role.permissions) ? role.permissions : []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
  }, [role]);

  const [errors, setErrors] = useState({});

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
    if (validateForm()) {
      onSubmit(formData);
      onClose();
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
    const {
      target: { value },
    } = event;
    setFormData(prev => ({
      ...prev,
      permissions: typeof value === 'string' ? value.split(',') : value,
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
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Stack>
                )}
              >
                {availablePermissions.map((permission) => (
                  <MenuItem key={permission} value={permission}>
                    {permission}
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