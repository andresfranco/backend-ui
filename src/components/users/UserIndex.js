import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  IconButton,
  Button,
  Tooltip,
  Chip,
  TextField,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { 
  DataGrid
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  AddCircleOutline as AddFilterIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import UserForm from './UserForm';
import { debounce } from '@mui/material/utils';

// Filter type definitions
const FILTER_TYPES = {
  username: {
    label: 'Username',
    type: 'text'
  },
  email: {
    label: 'Email',
    type: 'text'
  },
  roles: {
    label: 'Roles',
    type: 'roles'
  }
};

const CustomToolbar = React.memo(({ onCreateClick, filters, onFiltersChange, onSearch }) => {
  const [availableRoles, setAvailableRoles] = useState([]);
  const [activeFilters, setActiveFilters] = useState([{ id: 1, type: 'username' }]);
  const [nextFilterId, setNextFilterId] = useState(2);

  // Add role filter condition state
  const [roleFilterCondition, setRoleFilterCondition] = useState('OR');

  // Fetch available roles
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/roles/')
      .then(response => response.json())
      .then(data => {
        setAvailableRoles(data);
      })
      .catch(error => console.error('Error fetching roles:', error));
  }, []);

  const handleAddFilter = () => {
    const unusedFilterTypes = Object.keys(FILTER_TYPES).filter(type => 
      !activeFilters.some(f => f.type === type)
    );

    if (unusedFilterTypes.length > 0) {
      setActiveFilters([...activeFilters, { id: nextFilterId, type: unusedFilterTypes[0] }]);
      setNextFilterId(nextFilterId + 1);
    }
  };

  const handleRemoveFilter = (filterId) => {
    const updatedFilters = activeFilters.filter(f => f.id !== filterId);
    setActiveFilters(updatedFilters);
    
    // Clear the removed filter's value
    const removedFilter = activeFilters.find(f => f.id === filterId);
    if (removedFilter) {
      onFiltersChange({
        ...filters,
        [removedFilter.type]: undefined
      });
    }
  };

  const handleFilterChange = (filterId, value) => {
    const filter = activeFilters.find(f => f.id === filterId);
    if (filter) {
      onFiltersChange({
        ...filters,
        [filter.type]: value,
        ...(filter.type === 'roles' ? { roleFilterCondition } : {})
      });
    }
  };

  const handleFilterTypeChange = (filterId, newType) => {
    setActiveFilters(activeFilters.map(f => 
      f.id === filterId ? { ...f, type: newType } : f
    ));
    
    // Clear the old filter value
    const oldFilter = activeFilters.find(f => f.id === filterId);
    if (oldFilter) {
      onFiltersChange({
        ...filters,
        [oldFilter.type]: undefined
      });
    }
  };

  const handleRoleFilterConditionChange = (event, newCondition) => {
    if (newCondition !== null) {
      setRoleFilterCondition(newCondition);
      // Update filters to include the new condition
      if (filters.roles?.length > 0) {
        onFiltersChange({
          ...filters,
          roleFilterCondition: newCondition
        });
      }
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        </Box>
        
        {/* Filter Section */}
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Filters
              </Typography>
              {Object.keys(FILTER_TYPES).length > activeFilters.length && (
                <Tooltip title="Add filter">
                  <IconButton onClick={handleAddFilter} color="primary">
                    <AddFilterIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Stack spacing={2}>
              {activeFilters.map((filter) => (
                <Box key={filter.id} sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Filter Type</InputLabel>
                    <Select
                      value={filter.type}
                      onChange={(e) => handleFilterTypeChange(filter.id, e.target.value)}
                      size="small"
                      label="Filter Type"
                    >
                      {Object.entries(FILTER_TYPES).map(([type, config]) => (
                        <MenuItem
                          key={type}
                          value={type}
                          disabled={activeFilters.some(f => f.id !== filter.id && f.type === type)}
                        >
                          {config.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {filter.type === 'roles' ? (
                    <Box sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'start' }}>
                      <FormControl sx={{ flex: 1 }}>
                        <InputLabel>Select Roles</InputLabel>
                        <Select
                          multiple
                          value={filters.roles || []}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                          label="Select Roles"
                          size="small"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={availableRoles.find(role => role.id === value)?.name}
                                  size="small"
                                />
                              ))}
                            </Box>
                          )}
                        >
                          {availableRoles.map((role) => (
                            <MenuItem key={role.id} value={role.id}>
                              {role.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {filters.roles?.length > 1 && (
                        <ToggleButtonGroup
                          value={roleFilterCondition}
                          exclusive
                          onChange={handleRoleFilterConditionChange}
                          size="small"
                          sx={{ mt: 1 }}
                        >
                          <ToggleButton value="OR" aria-label="OR condition">
                            OR
                          </ToggleButton>
                          <ToggleButton value="AND" aria-label="AND condition">
                            AND
                          </ToggleButton>
                        </ToggleButtonGroup>
                      )}
                    </Box>
                  ) : (
                    <TextField
                      label={FILTER_TYPES[filter.type].label}
                      size="small"
                      value={filters[filter.type] || ''}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                      sx={{ flex: 1 }}
                    />
                  )}

                  <IconButton 
                    onClick={() => handleRemoveFilter(filter.id)}
                    sx={{ mt: 1 }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              ))}
            </Stack>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={onSearch}
                sx={{ minWidth: 120 }}
              >
                Search
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
});

function UserIndex() {
  // Update filters state to handle role IDs and condition
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

    setLoading(true);
    return fetch(`http://127.0.0.1:8000/api/users/?${params}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
      })
      .then(data => {
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
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [paginationModel.page, paginationModel.pageSize, sortModel]);

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
      renderCell: (params) => {
        if (!params.row?.roles) return null;
        return (
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
        );
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
          rowCount={totalUsers}
          loading={loading}
          pageSizeOptions={[5, 10, 20]}
          paginationMode="server"
          sortingMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={(newModel) => {
            setPaginationModel(newModel);
          }}
          onSortModelChange={(newSortModel) => {
            setSortModel(newSortModel);
          }}
          disableColumnFilter
          disableColumnMenu
          slots={{
            toolbar: CustomToolbar
          }}
          slotProps={{
            toolbar: {
              filters,
              onFiltersChange: setFilters,
              onSearch: handleSearch,
              onCreateClick: handleCreateClick
            }
          }}
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