import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box,
  IconButton,
  Tooltip,
  Chip,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import UserForm from './UserForm';
import GenericDataGrid from '../common/GenericDataGrid';
import UserFilters from './UserFilters';

function UserIndex() {
  const [filters, setFilters] = useState({
    username: '',
    email: '',
    roles: [],
    roleFilterCondition: 'OR'
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
      if (key === 'roles' || key === 'roleFilterCondition') {
        // Skip roles filter as it's handled client-side
        return;
      }
      if (value && typeof value === 'string' && value.trim()) {
        params.append('filterField', key);
        params.append('filterValue', value.trim());
        params.append('filterOperator', 'contains');
      }
    });

    if (sortModel.length > 0) {
      params.append('sortField', sortModel[0].field);
      params.append('sortOrder', sortModel[0].sort);
    }

    console.log('Fetching users with params:', params.toString());
    setLoading(true);
    
    // Use the /full endpoint like the permissions component
    return fetch(`http://127.0.0.1:8000/api/users/full?${params}`)
      .then(response => {
        console.log('Response status:', response.status);
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
          console.log('Received users data:', data);
          
          // If we have role filters active, filter the results client-side
          let filteredData = data.items;
          if (searchFilters.roles?.length > 0) {
            filteredData = data.items.filter(user => {
              const userRoleIds = user.roles.map(r => r.id);
              
              if (searchFilters.roleFilterCondition === 'AND') {
                // AND condition: user must have ALL selected roles
                return searchFilters.roles.every(roleId => 
                  userRoleIds.includes(roleId)
                );
              } else {
                // OR condition: user must have ANY of the selected roles
                return searchFilters.roles.some(roleId => 
                  userRoleIds.includes(roleId)
                );
              }
            });
          }

          setUsers(filteredData.map(user => ({
            id: user.id,
            username: user.username || '',
            email: user.email || '',
            roles: Array.isArray(user.roles) ? 
              user.roles.map(role => ({
                id: role.id,
                name: role.name || ''
              })) : []
          })));
          setTotalUsers(searchFilters.roles?.length > 0 ? filteredData.length : data.total || 0);
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

  // Handle search button click
  const handleSearch = useCallback(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      await fetchData();
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
      filterable: false,
      valueGetter: (params) => {
        if (!params.row?.roles) return '';
        return params.row.roles.map(role => role.name).join(', ');
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
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.row.roles.map((role) => (
            <Chip
              key={role.id}
              label={role.name}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
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
        onSortModelChange={setSortModel}
        showQuickFilter={false}
        CustomFilterComponent={UserFilters}
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
        paginationMode="server"
        sortingMode="server"
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