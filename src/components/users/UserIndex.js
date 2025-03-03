import React, { useState, useEffect, useCallback } from 'react';
import { Box,IconButton,Tooltip,Typography} from '@mui/material';
import {Edit as EditIcon,Delete as DeleteIcon} from '@mui/icons-material';
import UserForm from './UserForm';
import GenericDataGrid from '../common/GenericDataGrid';
import UserFilters from './UserFilters';
import SERVER_URL from '../common/BackendServerData'; 

function UserIndex() {
  const [filters, setFilters] = useState({
    username: '',
    email: '',
    roles: []
  });

  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortModel, setSortModel] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchData = useCallback((searchFilters = filters) => {
    const params = new URLSearchParams({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize
    });

    // Add non-empty filters to params
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (key === 'roles' && Array.isArray(value) && value.length > 0) {
        // Handle multiple roles
        value.forEach(role => {
          params.append('filterField', 'roles');
          params.append('filterValue', role);
          params.append('filterOperator', 'equals');
        });
      } else if (value && (!Array.isArray(value) && value.toString().trim())) {
        // Handle other filters
        params.append('filterField', key);
        params.append('filterValue', value.toString().trim());
        params.append('filterOperator', 'contains');
      }
    });

    if (sortModel.length > 0) {
      params.append('sortField', sortModel[0].field);
      params.append('sortOrder', sortModel[0].sort);
    }

    console.log('Fetching users with params:', params.toString());
    setLoading(true);

    const apiUrl = `${SERVER_URL}/api/users/full?${params.toString()}`;
    console.log('Fetch API URL:', apiUrl);

   fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            setUsers([]);
            return null;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data) {
          console.log('Users data received:', data);
          setUsers(data.items || []);
          setTotalUsers(data.total || 0);
        }
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setUsers([]);
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

      console.log('Fetching all users with params:', params.toString());
      setLoading(true);
      
      fetch(`${SERVER_URL}/api/users/full?${params.toString()}`)
        .then(response => {
          if (!response.ok) {
            if (response.status === 404) {
              setUsers([]);
              return null;
            }
            throw new Error(`Failed to fetch users: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data) {
            const formattedUsers = data.items.map(user => ({
              id: user.id,
              username: user.username || '',
              email: user.email || '',
              roles: Array.isArray(user.roles) ? user.roles : []
            }));
            
            setUsers(formattedUsers);
            setTotalUsers(data.total || 0);
            setError(null);
          }
        })
        .catch(err => {
          console.error('Error fetching users:', err);
          setError('Failed to load users');
          setUsers([]);
          setTotalUsers(0);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // Handle search button click
  const handleSearch = useCallback((searchFilters) => {
    // Default to state filters if no parameter is provided
    const effectiveFilters = searchFilters || filters;
    console.log('Search clicked with filters:', effectiveFilters);
    
    // Reset to first page when searching
    setPaginationModel(prevModel => ({
      ...prevModel,
      page: 0
    }));
    
    // Build query parameters with the effective filters
    const params = new URLSearchParams({
      page: 1, // Reset to first page
      pageSize: paginationModel.pageSize
    });
  
    // Add sorting if available
    if (sortModel.length > 0) {
      params.append('sortField', sortModel[0].field);
      params.append('sortOrder', sortModel[0].sort);
    }
  
    Object.entries(effectiveFilters).forEach(([key, value]) => {
      if (key === 'roles' && Array.isArray(value) && value.length > 0) {
        value.forEach(role => {
          params.append('filterField', 'role');
          params.append('filterValue', role);
          params.append('filterOperator', 'equals');
        });
      } else if (value && (!Array.isArray(value) && value.toString().trim())) {
        params.append('filterField', key);
        params.append('filterValue', value.toString().trim());
        params.append('filterOperator', 'contains');
      }
    });
  
    console.log('Searching users with params:', params.toString());
    setLoading(true);
    
    const apiUrl = `${SERVER_URL}/api/users/full?${params.toString()}`;
    console.log('Search API URL:', apiUrl);
    
    fetch(apiUrl)
      .then(response => {
        console.log('Search response status:', response.status);
        if (!response.ok) {
          if (response.status === 404) {
            setUsers([]);
            setTotalUsers(0);
            return null;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data) {
          console.log('Users data received:', data);
          setUsers(data.items || []);
          setTotalUsers(data.total || 0);
        }
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setUsers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters, paginationModel.pageSize, sortModel]);

  useEffect(() => {
    const params = new URLSearchParams({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize
    });
  
    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'roles' && Array.isArray(value) && value.length > 0) {
        // For roles, send each role value as a separate filter parameter.
        value.forEach(role => {
          params.append('filterField', 'role');
          params.append('filterValue', role);
          params.append('filterOperator', 'equals');
        });
      } else if (value && typeof value === 'string' && value.trim()) {
        params.append('filterField', key);
        params.append('filterValue', value.trim());
        params.append('filterOperator', 'contains');
      }
    });
  
    // Add sorting if available
    if (sortModel.length > 0) {
      params.append('sortField', sortModel[0].field);
      params.append('sortOrder', sortModel[0].sort);
    }
  
    console.log('Fetching users with params:', params.toString());
    setLoading(true);
  
    const apiUrl = `${SERVER_URL}/api/users/full?${params.toString()}`;
    console.log('Fetch API URL:', apiUrl);
  
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            setUsers([]);
            setTotalUsers(0);
            return null;
          }
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data) {
          const formattedUsers = data.items.map(user => ({
            id: user.id,
            username: user.username || '',
            email: user.email || '',
            roles: Array.isArray(user.roles) ? user.roles : []
          }));
          setUsers(formattedUsers);
          setTotalUsers(data.total || 0);
          setError(null);
        }
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setUsers([]);
        setTotalUsers(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [paginationModel.page, paginationModel.pageSize, sortModel, filters]);
  
  
 
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
      
      // Create a copy of the form data to avoid modifying the original
      const requestData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        roles: formData.roles.map(role => role.id)
      };
      
      console.log('Submitting user with data:', requestData);
      
      switch (formMode) {
        case 'create':
          response = await fetch(`${SERVER_URL}/api/users/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error creating user:', errorData);
            throw new Error(errorData.detail || 'Failed to create user');
          }
          
          console.log('User created successfully');
          break;
          
        case 'edit':
          response = await fetch(`${SERVER_URL}/api/users/${selectedUser.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error updating user:', errorData);
            throw new Error(errorData.detail || 'Failed to update user');
          }
          
          console.log('User updated successfully');
          break;
          
        case 'delete':
          response = await fetch(`${SERVER_URL}/api/users/${selectedUser.id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error deleting user:', errorData);
            throw new Error(errorData.detail || 'Failed to delete user');
          }
          
          console.log('User deleted successfully');
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
      field: 'username', 
      headerName: 'Username',
      description: 'User account name',
      flex: 1, 
      minWidth: 130,
      filterable: false,
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
      description: 'User email address',
      flex: 1.5, 
      minWidth: 200,
      filterable: false,
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
      description: 'User assigned roles',
      flex: 1, 
      minWidth: 120,
      filterable: false,renderCell: (params) => {
        const roles = params.value || [];
        // Check if roles is an array of objects or strings
        if (roles.length > 0 && typeof roles[0] === 'object') {
          return roles.map(r => r.name).join(', ');
        }
        return roles.join(', ');
      },
      renderHeader: (params) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Roles
          </Typography>
          <Typography variant="caption" color="textSecondary">
            User assigned roles
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
    <>
      <GenericDataGrid
        title="Users Management"
        rows={users}
        columns={columns}
        loading={loading}
        totalRows={totalUsers}
        createButtonText="User"
        onCreateClick={handleCreateClick}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={(newModel) => {
          console.log('Sort model changed:', newModel);
          setSortModel(newModel);
          // Immediately fetch data using the current filters and new sort parameters
          fetchData(filters);
        }}
        showQuickFilter={false}
        CustomFilterComponent={UserFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        paginationMode="server"
        sortingMode="server"
        filterMode="server"
      />

      <UserForm
        open={isFormOpen}
        onClose={handleFormClose}
        user={selectedUser}
        onSubmit={handleFormSubmit}
        mode={formMode}
      />
    </>
  );
}

export default UserIndex;