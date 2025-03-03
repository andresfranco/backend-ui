import React, { useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import PermissionForm from './PermissionForm';
import ReusableDataGrid from '../common/ReusableDataGrid';
import PermissionFilters from './PermissionFilters';
import SERVER_URL from '../common/BackendServerData';

function PermissionIndex() {
  const [filters, setFilters] = useState({
    name: '',
    description: ''
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState(null);

  // Define columns for the grid
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Permission Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit Permission">
            <IconButton onClick={() => handleEditClick(params.row)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Permission">
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
    setSelectedPermission(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (permission) => {
    setSelectedPermission(permission);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (permission) => {
    if (window.confirm(`Are you sure you want to delete permission ${permission.name}?`)) {
      fetch(`${SERVER_URL}/api/permissions/${permission.id}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to delete permission: ${response.status}`);
          }
          return response.text();
        })
        .then(() => {
          // Refresh the grid after successful deletion
          window.location.reload();
        })
        .catch(err => {
          console.error('Error deleting permission:', err);
          alert(`Failed to delete permission: ${err.message}`);
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
        title="Permissions Management"
        columns={columns}
        apiEndpoint="/api/permissions/full"
        initialFilters={filters}
        FiltersComponent={PermissionFilters}
        createButtonText="Permission"
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {isFormOpen && (
        <PermissionForm
          open={isFormOpen}
          onClose={handleFormClose}
          permission={selectedPermission}
          onSubmit={handleFormSubmit}
          mode={formMode}
        />
      )}
    </Box>
  );
}

export default PermissionIndex;