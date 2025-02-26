import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box,
  IconButton,
  Tooltip,
  Typography,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import PermissionForm from './PermissionForm';
import GenericDataGrid from '../common/GenericDataGrid';
import PermissionFilters from './PermissionFilters';

function PermissionIndex() {
  const [filters, setFilters] = useState({
    name: '',
    description: ''
  });

  const [permissions, setPermissions] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortModel, setSortModel] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState(null);

  // Function to fetch data with current filters and pagination
  const fetchData = useCallback(() => {
    // Start building the query parameters
    const params = new URLSearchParams({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize
    });

    // Add sorting if available
    if (sortModel.length > 0) {
      params.append('sortField', sortModel[0].field);
      params.append('sortOrder', sortModel[0].sort);
    }

    // Add filters if they have values - using the exact format expected by the backend
    const currentFilters = filters; // Use the current filters state
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && value.toString().trim()) {
        // Format the value based on the field
        const filterValue = key === 'name' 
          ? value.toString().trim().toUpperCase() 
          : value.toString().trim();
        
        // Add filter parameters in the format expected by the backend
        params.append('filterField', key);
        params.append('filterValue', filterValue);
        params.append('filterOperator', 'contains');
      }
    });

    // Log the query parameters for debugging
    console.log('Fetching permissions with params:', params.toString());
    
    // Set loading state
    setLoading(true);
    
    // Make the API request with the formatted URL
    const apiUrl = `http://127.0.0.1:8000/api/permissions/full?${params.toString()}`;
    console.log('API URL:', apiUrl);
    
    fetch(apiUrl)
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          if (response.status === 404) {
            setPermissions([]);
            setTotalItems(0);
            return null;
          }
          throw new Error(`Failed to fetch permissions: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data) {
          console.log('Received permissions data:', data);
          
          // Map the data to the expected format
          const formattedPermissions = data.items.map(permission => ({
            id: permission.id,
            name: permission.name || '',
            description: permission.description || ''
          }));
          
          // Update state with the fetched data
          setPermissions(formattedPermissions);
          setTotalItems(data.total || 0);
          setError(null);
        }
      })
      .catch(err => {
        console.error('Error fetching permissions:', err);
        setError(`Failed to load permissions: ${err.message}`);
        setPermissions([]);
        setTotalItems(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [paginationModel.page, paginationModel.pageSize, sortModel]); // Remove filters from dependencies

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

      console.log('Fetching all permissions with params:', params.toString());
      setLoading(true);
      
      fetch(`http://127.0.0.1:8000/api/permissions/full?${params.toString()}`)
        .then(response => {
          if (!response.ok) {
            if (response.status === 404) {
              setPermissions([]);
              setTotalItems(0);
              return null;
            }
            throw new Error(`Failed to fetch permissions: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data) {
            const formattedPermissions = data.items.map(permission => ({
              id: permission.id,
              name: permission.name || '',
              description: permission.description || ''
            }));
            
            setPermissions(formattedPermissions);
            setTotalItems(data.total || 0);
            setError(null);
          }
        })
        .catch(err => {
          console.error('Error fetching permissions:', err);
          setError(`Failed to load permissions: ${err.message}`);
          setPermissions([]);
          setTotalItems(0);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // Handle search button click
  const handleSearch = () => {
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

    // Add filters if they have values
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.toString().trim()) {
        // Format the value based on the field
        const filterValue = key === 'name' 
          ? value.toString().trim().toUpperCase() 
          : value.toString().trim();
        
        // Add filter parameters in the format expected by the backend
        params.append('filterField', key);
        params.append('filterValue', filterValue);
        params.append('filterOperator', 'contains');
      }
    });

    console.log('Searching permissions with params:', params.toString());
    setLoading(true);
    
    const apiUrl = `http://127.0.0.1:8000/api/permissions/full?${params.toString()}`;
    console.log('Search API URL:', apiUrl);
    
    fetch(apiUrl)
      .then(response => {
        console.log('Search response status:', response.status);
        if (!response.ok) {
          if (response.status === 404) {
            setPermissions([]);
            setTotalItems(0);
            return null;
          }
          throw new Error(`Failed to fetch permissions: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data) {
          console.log('Received search results:', data);
          
          // Map the data to the expected format
          const formattedPermissions = data.items.map(permission => ({
            id: permission.id,
            name: permission.name || '',
            description: permission.description || ''
          }));
          
          // Update state with the fetched data
          setPermissions(formattedPermissions);
          setTotalItems(data.total || 0);
          setError(null);
        }
      })
      .catch(err => {
        console.error('Error searching permissions:', err);
        setError(`Failed to search permissions: ${err.message}`);
        setPermissions([]);
        setTotalItems(0);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
      
      fetch(`http://127.0.0.1:8000/api/permissions/full?${params.toString()}`)
        .then(response => {
          if (!response.ok) {
            if (response.status === 404) {
              setPermissions([]);
              setTotalItems(0);
              return null;
            }
            throw new Error(`Failed to fetch permissions: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data) {
            const formattedPermissions = data.items.map(permission => ({
              id: permission.id,
              name: permission.name || '',
              description: permission.description || ''
            }));
            
            setPermissions(formattedPermissions);
            setTotalItems(data.total || 0);
            setError(null);
          }
        })
        .catch(err => {
          console.error('Error fetching permissions:', err);
          setError(`Failed to load permissions: ${err.message}`);
          setPermissions([]);
          setTotalItems(0);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    initialFetch();
  }, [paginationModel.page, paginationModel.pageSize, sortModel]);

  const handleCreateClick = () => {
    setFormMode('create');
    setSelectedPermission(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (permission) => {
    setFormMode('edit');
    setSelectedPermission(permission);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (permission) => {
    setFormMode('delete');
    setSelectedPermission(permission);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedPermission(null);
    setFormMode(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      let response;
      switch (formMode) {
        case 'create':
          response = await fetch('http://127.0.0.1:8000/api/permissions/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
          });
          break;
          
        case 'edit':
          response = await fetch(`http://127.0.0.1:8000/api/permissions/${selectedPermission.id}/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
          });
          break;
          
        case 'delete':
          response = await fetch(`http://127.0.0.1:8000/api/permissions/${selectedPermission.id}/`, {
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

      await fetchData();
      handleFormClose();
    } catch (error) {
      console.error('Operation failed:', error);
      setError(error.message);
    }
  };

  const columns = [
    { 
      field: 'name', 
      headerName: 'Permission Name',
      description: 'System permission identifier',
      flex: 1, 
      minWidth: 180,
      renderHeader: (params) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Permission Name
          </Typography>
          <Typography variant="caption" color="textSecondary">
            System permission identifier
          </Typography>
        </Box>
      )
    },
    { 
      field: 'description', 
      headerName: 'Description',
      description: 'Permission description and purpose',
      flex: 2, 
      minWidth: 250,
      renderHeader: (params) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Description
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Permission description and purpose
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
          <Tooltip title="Edit Permission">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleEditClick(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Permission">
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <GenericDataGrid
        title="Permissions Management"
        rows={permissions}
        columns={columns}
        loading={loading}
        totalRows={totalItems}
        createButtonText="Permission"
        onCreateClick={handleCreateClick}
        paginationModel={paginationModel}
        onPaginationModelChange={(newModel) => {
          console.log('Pagination model changed:', newModel);
          setPaginationModel(newModel);
        }}
        sortModel={sortModel}
        onSortModelChange={(newModel) => {
          console.log('Sort model changed:', newModel);
          setSortModel(newModel);
        }}
        showQuickFilter={false}
        CustomFilterComponent={PermissionFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        paginationMode="server"
        sortingMode="server"
        filterMode="server"
      />

      <PermissionForm
        open={isFormOpen}
        onClose={handleFormClose}
        permission={selectedPermission}
        onSubmit={handleFormSubmit}
        mode={formMode}
      />
    </>
  );
}

export default PermissionIndex;