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
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

// Temporary mock data - replace with API call
const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'Administrator', lastLogin: '2024-02-24' },
  { id: 2, username: 'user1', email: 'user1@example.com', role: 'User', lastLogin: '2024-02-23' },
  // Add more mock data as needed
];

function CustomToolbar() {
  return (
    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
      <Tooltip title="Create new user" arrow placement="right">
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          color="primary"
          size="large"
          onClick={() => {/* Handle new user */}}
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
              onClick={() => {/* Handle edit */}}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton
              color="error"
              size="small"
              onClick={() => {/* Handle delete */}}
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
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 20]}
          onPageSizeChange={setPageSize}
          slots={{
            toolbar: CustomToolbar,
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
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
    </Box>
  );
}

export default UserIndex;