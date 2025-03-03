import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import RoleForm from './RoleForm';
import ReusableDataGrid from '../common/ReusableDataGrid';
import RoleFilters from './RoleFilters';
import SERVER_URL from '../common/BackendServerData';

function RoleIndex() {
  const [filters, setFilters] = useState({
    name: '',
    description: '',
    permission: []
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  // Define columns for the grid
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Role Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    {
      field: 'permissions',
      headerName: 'Permissions',
      flex: 2,
      renderCell: (params) => {
        const permissions = params.value || [];
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {permissions.slice(0, 3).map((permission) => (
              <Chip 
                key={permission.id} 
                label={permission.name} 
                size="small" 
                variant="outlined"
              />
            ))}
            {permissions.length > 3 && (
              <Chip 
                label={`+${permissions.length - 3} more`} 
                size="small" 
                variant="outlined" 
                color="primary"
              />
            )}
          </Box>
        );
      }
    },
    {
      field: 'users',
      headerName: 'Users',
      width: 80,
      renderCell: (params) => {
        const count = typeof params.value === 'number' 
          ? params.value 
          : Array.isArray(params.value) 
            ? params.value.length 
            : 0;
        return <span>{count}</span>;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit Role">
            <IconButton onClick={() => handleEditClick(params.row)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Role">
            <IconButton onClick={() => handleDeleteClick(params.row)} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Handle create button click
  const handleCreateClick = () => {
    setSelectedRole(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (role) => {
    setSelectedRole(role);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (role) => {
    if (window.confirm(`Are you sure you want to delete role ${role.name}?`)) {
      fetch(`${SERVER_URL}/api/roles/${role.id}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to delete role: ${response.status}`);
          }
          return response.text();
        })
        .then(() => {
          // Refresh the grid after successful deletion
          window.location.reload();
        })
        .catch(err => {
          console.error('Error deleting role:', err);
          alert(`Failed to delete role: ${err.message}`);
        });
    }
  };

  // Handle form close
  const handleFormClose = (refreshData) => {
    setIsFormOpen(false);
    if (refreshData) {
      window.location.reload();
    }
  };

  // Handle form submit
  const handleFormSubmit = () => {
    setIsFormOpen(false);
    window.location.reload();
  };

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2 }}>
      <ReusableDataGrid
        title="Roles Management"
        columns={columns}
        apiEndpoint="/api/roles/full"
        initialFilters={filters}
        FiltersComponent={RoleFilters}
        createButtonText="Role"
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {isFormOpen && (
        <RoleForm
          open={isFormOpen}
          onClose={handleFormClose}
          role={selectedRole}
          onSubmit={handleFormSubmit}
          mode={formMode}
        />
      )}
    </Box>
  );
}

export default RoleIndex;