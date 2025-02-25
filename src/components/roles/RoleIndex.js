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
const mockRoles = [
  { id: 1, name: 'Administrator', description: 'Full system access', users: 2, permissions: 'All' },
  { id: 2, name: 'User', description: 'Standard user access', users: 5, permissions: 'Limited' },
  { id: 3, name: 'Manager', description: 'Department management access', users: 3, permissions: 'Extended' },
  // Add more mock data as needed
];

function CustomToolbar() {
  return (
    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
      <Tooltip title="Create new role" arrow placement="right">
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          color="primary"
          size="large"
          onClick={() => {/* Handle new role */}}
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
              onClick={() => {/* Handle edit */}}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Role">
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
        Roles Management
      </Typography>
      <Paper sx={{ height: 'calc(100vh - 180px)', width: '100%' }}>
        <DataGrid
          rows={mockRoles}
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

export default RoleIndex;