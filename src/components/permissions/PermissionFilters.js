import React, { useState, useEffect } from 'react';
import { Box,Paper,Typography,IconButton,TextField,Stack,Select,MenuItem,FormControl,InputLabel,Button,Tooltip} from '@mui/material';
import {Search as SearchIcon,AddCircleOutline as AddFilterIcon,Close as CloseIcon} from '@mui/icons-material';

// Filter type definitions with more specific handling
const FILTER_TYPES = {
  name: {
    label: 'Permission Name',
    type: 'text',
    placeholder: 'Search by permission name (e.g., CREATE_USER)',
    transform: value => value // Store raw value, transform when searching
  },
  description: {
    label: 'Description',
    type: 'text',
    placeholder: 'Search by description',
    transform: value => value // Store raw value, transform when searching
  }
};

function PermissionFilters({ filters, onFiltersChange, onSearch }) {
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
    const updatedFilters = activeFilters.filter(f => f.id !== filterId);
    setActiveFilters(updatedFilters);
    
    // Clear the removed filter's value
    const removedFilter = activeFilters.find(f => f.id === filterId);
    if (removedFilter) {
      const updatedFilterValues = { ...filters };
      delete updatedFilterValues[removedFilter.type];
      onFiltersChange(updatedFilterValues);
    }
  };

  const handleFilterChange = (filterId, value) => {
    const filter = activeFilters.find(f => f.id === filterId);
    if (filter) {
      // Create a new filters object with the updated value
      const updatedFilters = {
        ...filters,
        [filter.type]: value // Store the raw value, transform only when searching
      };
      
      console.log('Filter changed:', filter.type, value);
      onFiltersChange(updatedFilters);
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
    
    // Clear the old filter value and set up the new filter
    if (oldType) {
      const updatedFilterValues = { ...filters };
      delete updatedFilterValues[oldType];
      onFiltersChange(updatedFilterValues);
    }
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

              <TextField
                type={FILTER_TYPES[filter.type].type}
                label={FILTER_TYPES[filter.type].label}
                placeholder={FILTER_TYPES[filter.type].placeholder}
                size="small"
                value={filters[filter.type] || ''}
                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                sx={{ flex: 1 }}
              />

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
              console.log('Search button clicked with filters:', filters);
              if (onSearch) {
                onSearch();
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

export default PermissionFilters;