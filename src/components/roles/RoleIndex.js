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
import RoleForm from './RoleForm';

// Temporary mock data - replace with API call
const mockRoles = [
  { 
    id: 1, 
    name: 'Administrator', 
    description: 'Full system access', 
    users: 2, 
    permissions: ['CREATE_USER', 'EDIT_USER', 'DELETE_USER', 'VIEW_USER', 'CREATE_ROLE', 'EDIT_ROLE', 'DELETE_ROLE', 'VIEW_ROLE'] 
  },
  { 
    id: 2, 
    name: 'User', 
    description: 'Standard user access', 
    users: 5, 
    permissions: ['VIEW_USER', 'VIEW_ROLE'] 
  },
  { 
    id: 3, 
    name: 'Manager', 
    description: 'Department management access', 
    users: 3, 
    permissions: ['CREATE_USER', 'EDIT_USER', 'VIEW_USER', 'VIEW_ROLE'] 
  },
];

function CustomToolbar({ onCreateClick }) {
  return (
    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
      <Tooltip title="Create new role" arrow placement="right">
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
          New Role
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

function RoleIndex() {
  const [pageSize, setPageSize] = useState(10);
  const [formMode, setFormMode] = useState(null); // 'create', 'edit', or 'delete'
  const [selectedRole, setSelectedRole] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreateClick = () => {
    setFormMode('create');
    setSelectedRole(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (role) => {
    setFormMode('edit');
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (role) => {
    setFormMode('delete');
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedRole(null);
    setFormMode(null);
  };

  const handleFormSubmit = (formData) => {
    switch (formMode) {
      case 'create':
        console.log('Creating role:', formData);
        // Add API call here
        break;
      case 'edit':
        console.log('Updating role:', formData);
        // Add API call here
        break;
      case 'delete':
        console.log('Deleting role:', selectedRole.id);
        // Add API call here
        break;
      default:
        break;
    }
    handleFormClose();
  };

  const columns = [
    { 
      field: 'name', 
      headerName: 'Role Name',
      description: 'Name of the role', // Added label
      flex: 1, 
      minWidth: 130,
      filterable: true,  // Hiding filter
      renderHeader: (params) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Role Name
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Name of the role
          </Typography>
        </Box>
      )
    },
    { 
      field: 'description', 
      headerName: 'Description',
      description: 'Role description and purpose', // Added label
      flex: 1.5, 
      minWidth: 200,
      filterable: true,  // Hiding filter
      renderHeader: (params) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Description
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Role description and purpose
          </Typography>
        </Box>
      )
    },
    { 
      field: 'users', 
      headerName: 'Users Count',
      description: 'Number of users with this role', // Added label
      flex: 0.7, 
      minWidth: 110,
      filterable: true,  // Hiding filter
      type: 'number',
      renderHeader: (params) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Users Count
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Number of users
          </Typography>
        </Box>
      )
    },
    { 
      field: 'permissions', 
      headerName: 'Permissions Level',
      description: 'Level of access granted', // Added label
      flex: 1, 
      minWidth: 130,
      filterable: true,  // Hiding filter
      renderHeader: (params) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Permissions Level
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Level of access
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Typography>
          {params.row.permissions.length} Permission{params.row.permissions.length !== 1 ? 's' : ''}
        </Typography>
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
          <Tooltip title="Edit Role">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleEditClick(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Role">
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
        Roles Management
      </Typography>
      <Paper sx={{ height: 'calc(100vh - 180px)', width: '100%' }}>
        <DataGrid
          rows={mockRoles}
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

      <RoleForm
        open={isFormOpen}
        onClose={handleFormClose}
        role={selectedRole}
        onSubmit={handleFormSubmit}
        mode={formMode}
      />
    </Box>
  );
}

export default RoleIndex;