import React, { useState, useCallback, useEffect } from 'react';
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
  const [gridKey, setGridKey] = useState(0);
  const [error, setError] = useState(null);

  // Check if the permissions endpoint is accessible
  useEffect(() => {
    const checkPermissionsEndpoint = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/permissions/full?page=1&pageSize=10`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to access permissions endpoint: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Permissions data:', data);
      } catch (err) {
        console.error('Error checking permissions endpoint:', err);
        setError(err.message);
      }
    };
    
    checkPermissionsEndpoint();
  }, []);

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
    setSelectedPermission(permission);
    setFormMode('delete');
    setIsFormOpen(true);
  };

  // Handle form close
  const handleFormClose = (refreshData) => {
    setIsFormOpen(false);
    if (refreshData) {
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
        key={gridKey}
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
          mode={formMode}
        />
      )}
    </Box>
  );
}

export default PermissionIndex;