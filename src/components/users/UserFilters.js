import React, { useState, useEffect } from 'react';
import { 
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  AddCircleOutline as AddFilterIcon,
  Close as CloseIcon
} from '@mui/icons-material';

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

function UserFilters({ filters, onFiltersChange, onSearch }) {
  const [availableRoles, setAvailableRoles] = useState([]);
  const [activeFilters, setActiveFilters] = useState([{ id: 1, type: 'username' }]);
  const [nextFilterId, setNextFilterId] = useState(2);
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
  );
}

export default UserFilters;