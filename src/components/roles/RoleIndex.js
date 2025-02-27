import React, { useState, useCallback, useEffect } from 'react';
import { Box,Typography,IconButton,Tooltip} from '@mui/material';
import {Edit as EditIcon,Delete as DeleteIcon,} from '@mui/icons-material';
import RoleForm from './RoleForm';
import GenericDataGrid from '../common/GenericDataGrid';
import RoleFilters from './RoleFilters';
import SERVER_URL from '../common/BackendServerData';

function RoleIndex() {
  const [filters, setFilters] = useState({
    name: '',
    description: '',
    permission: []
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortModel, setSortModel] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchData = useCallback((searchFilters = filters) => {
    const params = new URLSearchParams({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize
    });

    // Add non-empty filters to params
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (key === 'permission' && Array.isArray(value) && value.length > 0) {
        // Handle multiple permissions
        value.forEach(permission => {
          params.append('filterField', 'permission');
          params.append('filterValue', permission);
          params.append('filterOperator', 'equals');
        });
      } else if (value && (!Array.isArray(value) && value.toString().trim())) {
        // Handle other filters
        params.append('filterField', key);
        params.append('filterValue', value.toString().trim());
        params.append('filterOperator', 'contains');
      }
    });

    // Add sorting if available
    if (sortModel.length > 0) {
      params.append('sortField', sortModel[0].field);
      params.append('sortOrder', sortModel[0].sort);
    }

    console.log('Fetching roles with params:', params.toString());
    setLoading(true);
    
    const apiUrl = `${SERVER_URL}/api/roles/full?${params.toString()}`;
    console.log('Fetch API URL:', apiUrl);
    
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            setRoles([]);
            setTotalUsers(0);
            return null;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data) {
          console.log('Roles data received:', data);
          setRoles(data.items || []);
          setTotalUsers(data.total || 0);
        }
      })
      .catch(err => {
        console.error('Error fetching roles:', err);
        setError('Failed to load roles');
        setRoles([]);
        setTotalUsers(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [paginationModel.page, paginationModel.pageSize, sortModel]);

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
    
    // Only auto-refresh if ALL filters are empty
    const hasActiveFilters = Object.values(newFilters).some(value => 
      value && value.toString().trim() !== ''
    );
    
    if (!hasActiveFilters) {
      console.log('All filters are empty, auto-refreshing grid');
      setPaginationModel(prevModel => ({
        ...prevModel,
        page: 0
      }));
      
      // Use the fetchData function with empty filters
      const params = new URLSearchParams({
        page: 1, // Reset to first page
        pageSize: paginationModel.pageSize
      });

      if (sortModel.length > 0) {
        params.append('sortField', sortModel[0].field);
        params.append('sortOrder', sortModel[0].sort);
      }

      console.log('Fetching all roles with params:', params.toString());
      setLoading(true);
      
      fetch(`${SERVER_URL}/api/roles/full?${params.toString()}`)
        .then(response => {
          if (!response.ok) {
            if (response.status === 404) {
              setRoles([]);
              setTotalUsers(0);
              return null;
            }
            throw new Error(`Failed to fetch roles: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data) {
            const formattedRoles = data.items.map(role => ({
              id: role.id,
              name: role.name || '',
              description: role.description || '',
              permissions: Array.isArray(role.permissions) ? role.permissions : [],
              users: typeof role.users === 'number' ? role.users : 
                    Array.isArray(role.users) ? role.users.length : 0
            }));
            
            setRoles(formattedRoles);
            setTotalUsers(data.total || 0);
            setError(null);
          }
        })
        .catch(err => {
          console.error('Error fetching roles:', err);
          setError('Failed to load roles');
          setRoles([]);
          setTotalUsers(0);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // Handle search button click
  const handleSearch = useCallback(() => {
    console.log('Search clicked with filters:', filters);
    
    // Reset to first page when searching
    setPaginationModel(prevModel => ({
      ...prevModel,
      page: 0
    }));
    
    // Build query parameters with current filters
    const params = new URLSearchParams({
      page: 1, // Reset to first page
      pageSize: paginationModel.pageSize
    });

    // Add sorting if available
    if (sortModel.length > 0) {
      params.append('sortField', sortModel[0].field);
      params.append('sortOrder', sortModel[0].sort);
    }

    // Add non-empty filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'permission' && Array.isArray(value) && value.length > 0) {
        // Handle multiple permissions
        value.forEach(permission => {
          params.append('filterField', 'permission');
          params.append('filterValue', permission);
          params.append('filterOperator', 'equals');
        });
      } else if (value && (!Array.isArray(value) && value.toString().trim())) {
        // Handle other filters
        params.append('filterField', key);
        params.append('filterValue', value.toString().trim());
        params.append('filterOperator', 'contains');
      }
    });

    console.log('Searching roles with params:', params.toString());
    setLoading(true);
    
    const apiUrl = `${SERVER_URL}/api/roles/full?${params.toString()}`;
    console.log('Search API URL:', apiUrl);
    
    fetch(apiUrl)
      .then(response => {
        console.log('Search response status:', response.status);
        if (!response.ok) {
          if (response.status === 404) {
            setRoles([]);
            setTotalUsers(0);
            return null;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data) {
          console.log('Roles data received:', data);
          setRoles(data.items || []);
          setTotalUsers(data.total || 0);
        }
      })
      .catch(err => {
        console.error('Error fetching roles:', err);
        setError('Failed to load roles');
        setRoles([]);
        setTotalUsers(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters, paginationModel.pageSize, sortModel]);

  // Fetch data when component mounts or when pagination/sorting changes
  useEffect(() => {
    // Create a function that doesn't depend on filters
    const initialFetch = () => {
      const params = new URLSearchParams({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize
      });

      if (sortModel.length > 0) {
        params.append('sortField', sortModel[0].field);
        params.append('sortOrder', sortModel[0].sort);
      }

      console.log('Initial fetch with params:', params.toString());
      setLoading(true);
      
      fetch(`${SERVER_URL}/api/roles/full?${params.toString()}`)
        .then(response => {
          if (!response.ok) {
            if (response.status === 404) {
              setRoles([]);
              setTotalUsers(0);
              return null;
            }
            throw new Error(`Failed to fetch roles: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data) {
            const formattedRoles = data.items.map(role => ({
              id: role.id,
              name: role.name || '',
              description: role.description || '',
              permissions: Array.isArray(role.permissions) ? role.permissions : [],
              users: typeof role.users === 'number' ? role.users : 
                    Array.isArray(role.users) ? role.users.length : 0
            }));
            
            setRoles(formattedRoles);
            setTotalUsers(data.total || 0);
            setError(null);
          }
        })
        .catch(err => {
          console.error('Error fetching roles:', err);
          setError('Failed to load roles');
          setRoles([]);
          setTotalUsers(0);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    initialFetch();
  }, [paginationModel.page, paginationModel.pageSize, sortModel]);

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

  const handleFormSubmit = async (formData) => {
    try {
      let response;
      
      // Create a copy of the form data to avoid modifying the original
      const requestData = {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions // This is now an array of permission names
      };
      
      console.log('Submitting role with data:', requestData);
      
      switch (formMode) {
        case 'create':
          response = await fetch(`${SERVER_URL}/api/roles/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error creating role:', errorData);
            throw new Error(errorData.detail || 'Failed to create role');
          }
          
          console.log('Role created successfully');
          break;
          
        case 'edit':
          response = await fetch(`${SERVER_URL}/api/roles/${selectedRole.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error updating role:', errorData);
            throw new Error(errorData.detail || 'Failed to update role');
          }
          
          console.log('Role updated successfully');
          break;
          
        case 'delete':
          response = await fetch(`${SERVER_URL}/api/roles/${selectedRole.id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error deleting role:', errorData);
            throw new Error(errorData.detail || 'Failed to delete role');
          }
          
          console.log('Role deleted successfully');
          break;

        default:
          return;
      }

      // Fetch data again to update the grid
      fetchData();
      handleFormClose();
    } catch (error) {
      console.error('Operation failed:', error);
      setError(error.message);
    }
  };

  const columns = [
    { 
      field: 'name', 
      headerName: 'Role Name',
      description: 'Name of the role',
      flex: 1, 
      minWidth: 130,
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
      description: 'Role description and purpose',
      flex: 1.5, 
      minWidth: 200,
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
      description: 'Number of users with this role',
      type: 'number',
      flex: 0.7, 
      minWidth: 110,
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
      headerName: 'Permissions', 
      flex: 1, 
      minWidth: 130,
      renderCell: (params) => {
        const permissions = params.value || [];
        // Check if permissions is an array of objects or strings
        if (permissions.length > 0 && typeof permissions[0] === 'object') {
          return permissions.map(p => p.name).join(', ');
        }
        return permissions.join(', ');
      },
      renderHeader: (params) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Permissions
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Level of access granted
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
    <>
      <GenericDataGrid
        title="Roles Management"
        rows={roles}
        columns={columns}
        loading={loading}
        totalRows={totalUsers}
        createButtonText="Role"
        onCreateClick={handleCreateClick}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        showQuickFilter={false}
        CustomFilterComponent={RoleFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        paginationMode="server"
        sortingMode="server"
        filterMode="server"
      />

      <RoleForm
        open={isFormOpen}
        onClose={handleFormClose}
        role={selectedRole}
        onSubmit={handleFormSubmit}
        mode={formMode}
      />
    </>
  );
}

export default RoleIndex;