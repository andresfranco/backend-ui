import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  IconButton,
  Button,
  Tooltip,
  Chip
} from '@mui/material';
import { 
  DataGrid,
  GridToolbarQuickFilter,
  GridToolbarFilterButton
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import UserForm from './UserForm';

function CustomToolbar({ onCreateClick }) {
  return (
    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
      <Tooltip title="Create new user" arrow placement="right">
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          color="primary"
          size="large"
          onClick={onCreateClick}
          sx={{
            boxShadow: 2,
            backgroundColor: 'primary.dark',
            '&:hover': {
              backgroundColor: 'primary.dark',
              boxShadow: 4,
            },
            fontWeight: 'bold',
            px: 3,
            py: 1
          }}
        >
          New User
        </Button>
      </Tooltip>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1, maxWidth: 500 }}>
        <GridToolbarQuickFilter 
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search in all columns..."
          sx={{ 
            mt: 0,
            '& .MuiInputBase-root': {
              backgroundColor: 'background.paper',
            }
          }}
        />
        <GridToolbarFilterButton />
      </Box>
    </Box>
  );
}

function UserIndex() {
  const [pageSize, setPageSize] = useState(10);
  const [formMode, setFormMode] = useState(null); // 'create', 'edit', or 'delete'
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/users/');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      // Ensure each user has the required properties
      const processedData = data.map(user => ({
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        roles: Array.isArray(user.roles) ? user.roles : []
      }));
      setUsers(processedData);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormMode('create');
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (user) => {
    setFormMode('edit');
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (user) => {
    setFormMode('delete');
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
    setFormMode(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      let response;
      switch (formMode) {
        case 'create':
          response = await fetch('http://127.0.0.1:8000/api/users/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: formData.username,
              email: formData.email,
              password: formData.password,
              roles: formData.roles.map(role => role.id)
            })
          });
          break;
          
        case 'edit':
          response = await fetch(`http://127.0.0.1:8000/api/users/${selectedUser.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: formData.username,
              email: formData.email,
              ...(formData.password && { password: formData.password }),
              roles: formData.roles.map(role => role.id)
            })
          });
          break;
          
        case 'delete':
          response = await fetch(`http://127.0.0.1:8000/api/users/${selectedUser.id}`, {
            method: 'DELETE'
          });
          break;

        default:
          return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Operation failed');
      }

      // Refresh the users list after successful operation
      await fetchUsers();
      handleFormClose();
    } catch (error) {
      console.error('Operation failed:', error);
      setError(error.message);
    }
  };

  const columns = [
    { 
      field: 'username', 
      headerName: 'Username',
      description: 'User account name', // Added label
      flex: 1, 
      minWidth: 130,
      filterable: true,  // Enabled filter
      renderHeader: (params) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Username
          </Typography>
          <Typography variant="caption" color="textSecondary">
            User account name
          </Typography>
        </Box>
      )
    },
    { 
      field: 'email', 
      headerName: 'Email',
      description: 'User email address', // Added label
      flex: 1.5, 
      minWidth: 200,
      filterable: true,  // Enabled filter
      renderHeader: (params) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Email
          </Typography>
          <Typography variant="caption" color="textSecondary">
            User email address
          </Typography>
        </Box>
      )
    },
    { 
      field: 'roles', 
      headerName: 'Roles',
      description: 'User assigned roles', // Added label
      flex: 1, 
      minWidth: 120,
      filterable: true,  // Enabled filter
      renderHeader: (params) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Roles
          </Typography>
          <Typography variant="caption" color="textSecondary">
            User assigned roles
          </Typography>
        </Box>
      ),
      renderCell: (params) => {
        const userRoles = params.row.roles || [];
        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {userRoles.map((role) => (
              <Chip
                key={role.id}
                label={role.name}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        );
      },
      valueGetter: (params) => {
        if (!params.row) return [];
        return params.row.roles || [];
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.7,
      minWidth: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit User">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleEditClick(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDeleteClick(params.row)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Users Management
      </Typography>
      <Paper sx={{ height: 'calc(100vh - 180px)', width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          onPaginationModelChange={(newModel) => {
            setPageSize(newModel.pageSize);
          }}
          loading={loading}
          error={error}
          slots={{
            toolbar: (props) => <CustomToolbar {...props} onCreateClick={handleCreateClick} />,
            noRowsOverlay: () => (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                {error ? (
                  <Typography color="error">{error}</Typography>
                ) : (
                  <Typography>No users found</Typography>
                )}
              </Box>
            ),
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { 
                debounceMs: 500,
                variant: "outlined"
              },
            },
          }}
          filterMode="client"
          disableColumnFilter={false}
          disableDensitySelector
          disableColumnSelector
          autoHeight
          getRowHeight={() => 'auto'}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
            },
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
            '& .MuiDataGrid-row': {
              minHeight: '48px !important'
            }
          }}
        />
      </Paper>

      <UserForm
        open={isFormOpen}
        onClose={handleFormClose}
        user={selectedUser}
        onSubmit={handleFormSubmit}
        mode={formMode}
      />
    </Box>
  );
}

export default UserIndex;