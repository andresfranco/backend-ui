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
  Button,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  AddCircleOutline as AddFilterIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import SERVER_URL from '../common/BackendServerData';

// Filter type definitions
const FILTER_TYPES = {
  title: {
    label: 'Title',
    type: 'text'
  },
  company: {
    label: 'Company',
    type: 'text'
  },
  section_id: {
    label: 'Section',
    type: 'select'
  }
};

function ExperienceFilters({ filters, onFiltersChange, onSearch }) {
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
      initialFilters.push({ id: id, type: 'title' });
    }
    
    return initialFilters;
  });
  
  const [nextFilterId, setNextFilterId] = useState(() => {
    // Initialize nextFilterId based on the number of active filters
    return activeFilters.length + 1;
  });
  
  const [tempFilters, setTempFilters] = useState(() => {
    return { ...filters };
  });
  
  const [availableSections, setAvailableSections] = useState([]);

  // Fetch available sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/sections`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch sections');
        }
        const data = await response.json();
        setAvailableSections(data.items || []);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    fetchSections();
  }, []);

  // Update tempFilters when filters prop changes
  useEffect(() => {
    if (filters) {
      setTempFilters({ ...filters });
    }
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
      if (value && value.toString().trim() !== '') {
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
    
    if (filterType.type === 'select' && filter.type === 'section_id') {
      return (
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>Select Section</InputLabel>
          <Select
            value={tempFilters[filter.type] || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            label="Select Section"
          >
            {availableSections.map((section) => (
              <MenuItem key={section.id} value={section.id}>
                {section.title}
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

export default ExperienceFilters;
