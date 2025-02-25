import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  IconButton,
  Button,
  Tooltip
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

// Temporary mock data - replace with API call
const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'Administrator', lastLogin: '2024-02-24' },
  { id: 2, username: 'user1', email: 'user1@example.com', role: 'User', lastLogin: '2024-02-23' },
  // Add more mock data as needed
];

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

  const handleFormSubmit = (formData) => {
    switch (formMode) {
      case 'create':
        console.log('Creating user:', formData);
        // Add API call here
        break;
      case 'edit':
        console.log('Updating user:', formData);
        // Add API call here
        break;
      case 'delete':
        console.log('Deleting user:', selectedUser.id);
        // Add API call here
        break;
      default:
        break;
    }
    handleFormClose();
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
      field: 'role', 
      headerName: 'Role',
      description: 'User assigned role', // Added label
      flex: 1, 
      minWidth: 120,
      filterable: true,  // Enabled filter
      renderHeader: (params) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Role
          </Typography>
          <Typography variant="caption" color="textSecondary">
            User assigned role
          </Typography>
        </Box>
      )
    },
    { 
      field: 'lastLogin', 
      headerName: 'Last Login',
      description: 'Last login date', // Added label
      flex: 1, 
      minWidth: 130,
      filterable: true,  // Enabled filter
      renderHeader: (params) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Last Login
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Last login date
          </Typography>
        </Box>
      )
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
          rows={mockUsers}
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
          slots={{
            toolbar: (props) => <CustomToolbar {...props} onCreateClick={handleCreateClick} />,
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