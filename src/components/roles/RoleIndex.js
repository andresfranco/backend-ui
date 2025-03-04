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
  const [gridKey, setGridKey] = useState(0);

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Role Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    {
      field: 'permissions',
      headerName: 'Permissions',
      flex: 2,
      renderCell: (params) => {
        const permissions = Array.isArray(params.value) ? params.value : [];
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

  const handleCreateClick = () => {
    setSelectedRole(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEditClick = (role) => {
    setSelectedRole(role);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (role) => {
    setSelectedRole(role);
    setFormMode('delete');
    setIsFormOpen(true);
  };

  const handleFormClose = (refreshData) => {
    setIsFormOpen(false);
    if (refreshData) {
      setGridKey(prevKey => prevKey + 1);
    }
  };

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2 }}>
      <ReusableDataGrid
        key={gridKey}
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