import React, { useState, useCallback } from 'react';
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
  const [gridKey, setGridKey] = useState(0); // Added gridKey state to force refresh

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
                key={permission} 
                label={permission} 
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
      field: 'users_count',
      headerName: 'Users',
      width: 80,
      renderCell: (params) => {
        return <span>{params.value || 0}</span>;
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
    setSelectedRole(role);
    setFormMode('delete');
    setIsFormOpen(true);
  };

  // Handle form close
  const handleFormClose = (refreshData) => {
    setIsFormOpen(false);
    if (refreshData) {
      // Refresh the grid by incrementing the key
      setGridKey(prevKey => prevKey + 1);
    }
  };

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2 }}>
      <ReusableDataGrid
        key={gridKey} // Force refresh when key changes
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
          mode={formMode}
        />
      )}
    </Box>
  );
}

export default RoleIndex;