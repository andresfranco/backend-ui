import React, { useState, useEffect } from 'react';
import { Box,Paper,Typography,IconButton,TextField,Stack,Select,MenuItem,FormControl,InputLabel,Button,Tooltip,Chip,OutlinedInput} from '@mui/material';
import {Search as SearchIcon,AddCircleOutline as AddFilterIcon,Close as CloseIcon} from '@mui/icons-material';
import SERVER_URL from '../common/BackendServerData';
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
    type: 'multiselect'
  }
};

function UserFilters({ filters, onFiltersChange, onSearch }) {
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
      initialFilters.push({ id: id, type: 'username' });
    }
    
    return initialFilters;
  }); 
  const [nextFilterId, setNextFilterId] = useState(() => {
    // Initialize nextFilterId based on the number of active filters
    return activeFilters.length + 1;
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [tempFilters, setTempFilters] = useState(() => {
    const initialFilters = { ...filters };
    // Ensure roles is always an array
    if (!Array.isArray(initialFilters.roles)) {
      initialFilters.roles = initialFilters.roles ? [initialFilters.roles] : [];
    }
    return initialFilters;
  });

  // Fetch roles for the dropdown
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/roles/full`);
        if (response.ok) {
          const data = await response.json();
          setAvailableRoles(data.items || []);
        } else {
          console.error('Failed to fetch roles');
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, []);

  // Update tempFilters when filters prop changes
  useEffect(() => {
    if (filters) {
      const updatedFilters = { ...filters };
      // Ensure roles is always an array
      if (!Array.isArray(updatedFilters.roles)) {
        updatedFilters.roles = updatedFilters.roles ? [updatedFilters.roles] : [];
      }
      setTempFilters(updatedFilters);
    }
  }, [filters]);

  // Update activeFilters when filters prop changes
  useEffect(() => {
    if (filters) {
      const updatedFilters = [];
      let id = 1;
      
      // Add active filters for non-empty filter values
      Object.entries(filters).forEach(([type, value]) => {
        if (FILTER_TYPES[type]) {
          const hasValue = Array.isArray(value) ? value.length > 0 : Boolean(value);
          if (hasValue) {
            updatedFilters.push({ id: id++, type });
          }
        }
      });
      
      // If no active filters, add a default one
      if (updatedFilters.length === 0) {
        // Find the first available filter type
        const firstType = Object.keys(FILTER_TYPES)[0];
        updatedFilters.push({ id: id, type: firstType });
      }
      
      setActiveFilters(updatedFilters);
      setNextFilterId(id + 1);
    }
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
    const updatedActiveFilters = activeFilters.filter(f => f.id !== filterId);
    setActiveFilters(updatedActiveFilters);
    
    const removedFilter = activeFilters.find(f => f.id === filterId);
    if (removedFilter) {
      const updatedFilterValues = { ...tempFilters };
      delete updatedFilterValues[removedFilter.type];
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
    // Create a clean copy of filters with only non-empty values
    const cleanFilters = {};
    
    Object.entries(tempFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          cleanFilters[key] = value;
        }
      } else if (value && value.toString().trim() !== '') {
        cleanFilters[key] = value;
      }
    });
    
    console.log('Searching with filters:', cleanFilters);
    
    // Update parent component with new filters
    if (onFiltersChange) {
      onFiltersChange(cleanFilters);
    }
    
    // Trigger search
    if (onSearch) {
      onSearch(cleanFilters);
    }
  };

  const renderFilterInput = (filter) => {
    const filterType = FILTER_TYPES[filter.type];
    
    if (filterType.type === 'multiselect' && filter.type === 'roles') {
      return (
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>Select Roles</InputLabel>
          <Select
            multiple
            value={tempFilters[filter.type] || []}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            input={<OutlinedInput label="Select Roles" />}
            renderValue={(selected) => (
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {selected.map((roleId) => {
                  const role = availableRoles.find(r => r.id === roleId);
                  return role ? (
                    <Chip key={roleId} label={role.name} size="small" sx={{ m: 0.5 }} />
                  ) : null;
                })}
              </Stack>
            )}
          >
            {availableRoles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    
    return (
      <TextField
        fullWidth
        label={filterType.label}
        value={tempFilters[filter.type] || ''}
        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
        sx={{ flex: 1 }}
      />
    );
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Filters
        </Typography>
        <Tooltip title="Add Filter">
          <IconButton 
            onClick={handleAddFilter} 
            disabled={Object.keys(FILTER_TYPES).length <= activeFilters.length}
            color="primary"
          >
            <AddFilterIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Stack spacing={2}>
        {activeFilters.map((filter) => (
          <Box key={filter.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl sx={{ width: 150 }}>
              <InputLabel>Filter Type</InputLabel>
              <Select
                value={filter.type}
                onChange={(e) => handleFilterTypeChange(filter.id, e.target.value)}
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
            
            <Tooltip title="Remove Filter">
              <IconButton 
                onClick={() => handleRemoveFilter(filter.id)}
                disabled={activeFilters.length <= 1}
                color="error"
                sx={{ flexShrink: 0 }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSearch}
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}

export default UserFilters;