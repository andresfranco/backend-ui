import React, { useState, useCallback } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import UserForm from './UserForm';
import ReusableDataGrid from '../common/ReusableDataGrid';
import UserFilters from './UserFilters';
import SERVER_URL from '../common/BackendServerData';

function UserIndex() {
  const [filters, setFilters] = useState({
    username: '',
    email: '',
    roles: []
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [gridKey, setGridKey] = useState(0); // Used to force grid refresh

  // Define columns for the grid
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: 'Username', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'roles',
      headerName: 'Roles',
      flex: 1,
      renderCell: (params) => {
        const roles = params.value || [];
        return (
          <div>
            {roles.map(role => role.name).join(', ')}
          </div>
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
          <Tooltip title="Edit User">
            <IconButton onClick={() => handleEditClick(params.row)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
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
    setSelectedUser(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
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
        title="Users Management"
        columns={columns}
        apiEndpoint="/api/users/full"
        initialFilters={filters}
        FiltersComponent={UserFilters}
        createButtonText="User"
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {isFormOpen && (
        <UserForm
          open={isFormOpen}
          onClose={handleFormClose}
          user={selectedUser}
          onSubmit={() => {}} // Not needed as we handle refresh in onClose
          mode={formMode}
        />
      )}
    </Box>
  );
}

export default UserIndex;