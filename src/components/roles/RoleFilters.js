import React, { useState, useEffect } from 'react';
import { Box,Paper,Typography,IconButton,TextField,Stack,Select,MenuItem,FormControl,InputLabel,Button,Tooltip,Chip,OutlinedInput} from '@mui/material';
import {Search as SearchIcon,AddCircleOutline as AddFilterIcon,Close as CloseIcon} from '@mui/icons-material';
import SERVER_URL from '../common/BackendServerData';
// Filter type definitions
const FILTER_TYPES = {
  name: {
    label: 'Role Name',
    type: 'text',
    placeholder: 'Search by role name'
  },
  description: {
    label: 'Description',
    type: 'text',
    placeholder: 'Search by description'
  },
  permission: {
    label: 'Permission',
    type: 'multiselect',
    placeholder: 'Filter by permission'
  }
};

function RoleFilters({ filters, onFiltersChange, onSearch }) {
  // Initialize activeFilters based on the filters prop
  const [activeFilters, setActiveFilters] = useState(() => {
    const initialFilters = [];
    let id = 1;
    
    // Create active filters for each non-empty filter in the filters prop
    Object.entries(filters || {}).forEach(([type, value]) => {
      if (FILTER_TYPES[type]) {
        initialFilters.push({ id: id++, type });
      }
    });
    
    // If no filters were created, add a default one
    if (initialFilters.length === 0) {
      initialFilters.push({ id: id, type: 'name' });
    }
    
    return initialFilters;
  });
  
  const [nextFilterId, setNextFilterId] = useState(() => {
    // Initialize nextFilterId based on the number of active filters
    return activeFilters.length + 1;
  });
  const [availablePermissions, setAvailablePermissions] = useState([]);
  // Initialize tempFilters with the current filters
  const [tempFilters, setTempFilters] = useState(() => {
    const initialFilters = { ...filters };
    // Ensure permission is always an array
    if (!Array.isArray(initialFilters.permission)) {
      initialFilters.permission = initialFilters.permission ? [initialFilters.permission] : [];
    }
    return initialFilters;
  });

  // Fetch permissions for the dropdown
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/permissions/full`);
        if (response.ok) {
          const data = await response.json();
          setAvailablePermissions(data.items || []);
        } else {
          console.error('Failed to fetch permissions');
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };

    fetchPermissions();
  }, []);

  // Update tempFilters when filters prop changes
  useEffect(() => {
    const updatedFilters = { ...filters };
    // Ensure permission is always an array
    if (!Array.isArray(updatedFilters.permission)) {
      updatedFilters.permission = updatedFilters.permission ? [updatedFilters.permission] : [];
    }
    setTempFilters(updatedFilters);
  }, [filters]);

  // Update activeFilters when filters prop changes
  useEffect(() => {
    const updatedFilters = [];
    let id = 1;
    let hasActiveFilters = false;
    
    // First, try to maintain existing filter types
    activeFilters.forEach(filter => {
      if (FILTER_TYPES[filter.type]) {
        updatedFilters.push({ id: id++, type: filter.type });
        hasActiveFilters = true;
      }
    });
    
    // If no active filters, add a default one
    if (!hasActiveFilters) {
      updatedFilters.push({ id: id, type: 'name' });
    }
    
    setActiveFilters(updatedFilters);
    setNextFilterId(id + 1);
  }, [filters]);

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
    const updatedActiveFilters = activeFilters.filter(f => f.id !== filterId);
    setActiveFilters(updatedActiveFilters);
    
    const removedFilter = activeFilters.find(f => f.id === filterId);
    if (removedFilter) {
      const updatedFilterValues = { ...tempFilters };
      if (removedFilter.type === 'permission') {
        updatedFilterValues[removedFilter.type] = [];
      } else {
        delete updatedFilterValues[removedFilter.type];
      }
      setTempFilters(updatedFilterValues);
    }
  };

  const handleFilterChange = (filterId, value) => {
    const filter = activeFilters.find(f => f.id === filterId);
    if (filter) {
      const updatedTempFilters = {
        ...tempFilters,
        [filter.type]: value
      };
      setTempFilters(updatedTempFilters);
    }
  };

  const handleFilterTypeChange = (filterId, newType) => {
    // Find the old filter type
    const oldFilter = activeFilters.find(f => f.id === filterId);
    const oldType = oldFilter ? oldFilter.type : null;
    
    // Update the filter type
    setActiveFilters(activeFilters.map(f => 
      f.id === filterId ? { ...f, type: newType } : f
    ));
    
    // Clear the old filter value
    if (oldType) {
      const updatedFilterValues = { ...tempFilters };
      delete updatedFilterValues[oldType];
      setTempFilters(updatedFilterValues);
    }
  };

  const handleSearch = () => {
    console.log('Search button clicked with filters:', tempFilters);
    onFiltersChange(tempFilters);
    if (onSearch) {
      onSearch(tempFilters);
    }
  };

  const renderFilterInput = (filter) => {
    const filterType = FILTER_TYPES[filter.type];
    
    if (filterType.type === 'multiselect' && filter.type === 'permission') {
      return (
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>Select Permissions</InputLabel>
          <Select
            multiple
            value={tempFilters[filter.type] || []}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            input={<OutlinedInput label="Select Permissions" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
            size="small"
          >
            {availablePermissions.map((permission) => (
              <MenuItem key={permission.id} value={permission.name}>
                {permission.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    
    return (
      <TextField
        type={filterType.type}
        label={filterType.label}
        placeholder={filterType.placeholder}
        size="small"
        value={tempFilters[filter.type] || ''}
        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
        sx={{ flex: 1 }}
      />
    );
  };

  return (
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

              {renderFilterInput(filter)}

              <IconButton 
                onClick={() => handleRemoveFilter(filter.id)}
                sx={{ mt: 1 }}
                disabled={activeFilters.length <= 1}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          ))}
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
        <Button
        variant="contained"
        color="primary"
        startIcon={<SearchIcon />}
        onClick={() => {
          console.log('Search button clicked with filters:', tempFilters);
          onFiltersChange(tempFilters);
          if (onSearch) {
            onSearch(tempFilters);
          }
        }}
        sx={{ minWidth: 120 }}
       >
        Search
      </Button>
        </Box>
      </Stack>
    </Paper>
  );
}

export default RoleFilters;