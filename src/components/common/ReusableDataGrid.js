import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, Button, Stack, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SERVER_URL from './BackendServerData';

/**
 * ReusableDataGrid - A configurable grid component that can be used across the application
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The title of the grid
 * @param {Array} props.columns - Column definitions for the grid
 * @param {string} props.apiEndpoint - API endpoint to fetch data from
 * @param {Object} props.initialFilters - Initial filter values
 * @param {React.Component} props.FiltersComponent - Custom filter component
 * @param {string} props.createButtonText - Text for the create button
 * @param {Function} props.onCreateClick - Function to call when create button is clicked
 * @param {Function} props.onEditClick - Function to call when edit button is clicked
 * @param {Function} props.onDeleteClick - Function to call when delete button is clicked
 * @param {number} props.defaultPageSize - Default page size
 * @param {string} props.height - Height of the grid
 * @returns {React.Component} - The reusable grid component
 */
function ReusableDataGrid({
  title,
  columns,
  apiEndpoint,
  initialFilters = {},
  FiltersComponent,
  createButtonText,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  defaultPageSize = 10,
  height = 'calc(100vh - 180px)'
}) {
  // State for data and UI
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [sortModel, setSortModel] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: defaultPageSize,
    page: 0,
  });

  // Reset to first page when initialFilters change
  useEffect(() => {
    setFilters(initialFilters);
    setPaginationModel(prev => ({
      ...prev,
      page: 0
    }));
  }, [initialFilters]);

  /**
   * Fetch data from the API with the current filters, pagination, and sorting
   * @param {Object} searchFilters - Filters to apply to the search
   */
  const fetchData = useCallback((searchFilters = filters) => {
    // Build query parameters
    const params = new URLSearchParams({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize
    });

    // Add sorting if available
    if (sortModel.length > 0) {
      params.append('sortField', sortModel[0].field);
      params.append('sortOrder', sortModel[0].sort);
    }

    // Add filters based on their type
    Object.entries(searchFilters).forEach(([key, value]) => {
      // Handle array values (like multiselect filters)
      if (Array.isArray(value) && value.length > 0) {
        // For roles, we need to send each role ID separately
        if (key === 'roles') {
          value.forEach(item => {
            params.append('filterField', key);
            params.append('filterValue', item);
            params.append('filterOperator', 'equals');
          });
          console.log(`Adding role filters: ${value.join(', ')}`);
        } else {
          // For other array values
          value.forEach(item => {
            params.append('filterField', key);
            params.append('filterValue', item);
            params.append('filterOperator', 'equals');
          });
        }
      } 
      // Handle non-empty string values
      else if (value && (!Array.isArray(value) && value.toString().trim())) {
        params.append('filterField', key);
        params.append('filterValue', value.toString().trim());
        params.append('filterOperator', 'contains');
      }
    });

    console.log(`Fetching data from ${apiEndpoint} with params:`, params.toString());
    setLoading(true);

    const apiUrl = `${SERVER_URL}${apiEndpoint}?${params.toString()}`;
    
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            setData([]);
            setTotalItems(0);
            return null;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(responseData => {
        if (responseData) {
          console.log('Data received:', responseData);
          setData(responseData.items || []);
          setTotalItems(responseData.total || 0);
          setError(null);
        }
      })
      .catch(err => {
        console.error(`Error fetching data from ${apiEndpoint}:`, err);
        setError(`Failed to load data: ${err.message}`);
        setData([]);
        setTotalItems(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiEndpoint, paginationModel.page, paginationModel.pageSize, sortModel, filters]);

  // Initial data load and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData, paginationModel.page, paginationModel.pageSize, sortModel]);

  /**
   * Handle filter changes from the filter component
   * @param {Object} newFilters - New filter values
   */
  const handleFiltersChange = useCallback((newFilters) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
  }, []);

  /**
   * Handle search button click
   */
  const handleSearch = useCallback((searchFilters) => {
    console.log('Search clicked with filters:', searchFilters);
    
    // Reset to first page when searching
    setPaginationModel(prevModel => ({
      ...prevModel,
      page: 0
    }));
    
    // Update filters state and fetch data
    setFilters(searchFilters);
    fetchData(searchFilters);
  }, [fetchData]);

  // Custom toolbar with filters and create button
  const CustomToolbar = () => (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
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
            {`New ${createButtonText}`}
          </Button>
        </Box>

        {FiltersComponent && (
          <FiltersComponent 
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
          />
        )}
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {title && (
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ height, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          loading={loading}
          rowCount={totalItems}
          pageSizeOptions={[5, 10, 20, 50]}
          paginationMode="server"
          sortingMode="server"
          filterMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          slots={{
            toolbar: CustomToolbar,
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
    </Box>
  );
}

export default ReusableDataGrid;
