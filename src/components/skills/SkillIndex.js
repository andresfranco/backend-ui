import React, { useState, useCallback } from 'react';
import { Box, IconButton, Tooltip, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import SkillForm from './SkillForm';
import ReusableDataGrid from '../common/ReusableDataGrid';
import SkillFilters from './SkillFilters';
import SERVER_URL from '../common/BackendServerData';

function SkillIndex() {
  const [filters, setFilters] = useState({
    name: ''
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [gridKey, setGridKey] = useState(0); // Used to force grid refresh

  // Define columns for the grid
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { 
      field: 'level', 
      headerName: 'Level', 
      width: 120,
      valueGetter: (params) => params.row.level || 0,
      renderCell: (params) => {
        const level = params.row.level || 0;
        let color = 'default';
        
        if (level >= 90) color = 'success';
        else if (level >= 70) color = 'primary';
        else if (level >= 50) color = 'info';
        else if (level >= 30) color = 'warning';
        else color = 'error';
        
        return (
          <Chip 
            label={`${level}%`} 
            color={color} 
            size="small" 
            variant="outlined"
          />
        );
      }
    },
    { field: 'description', headerName: 'Description', flex: 2 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit Skill">
            <IconButton onClick={() => handleEditClick(params.row)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Skill">
            <IconButton onClick={() => handleDeleteClick(params.row)} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Handle create button click
  const handleCreateClick = () => {
    setSelectedSkill(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (skill) => {
    setSelectedSkill(skill);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (skill) => {
    setSelectedSkill(skill);
    setFormMode('delete');
    setIsFormOpen(true);
  };

  // Handle form close
  const handleFormClose = (refreshData) => {
    setIsFormOpen(false);
    if (refreshData) {
      // Refresh the grid by incrementing the key
      setGridKey(prevKey => prevKey + 1);
    }
  };

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2 }}>
      <ReusableDataGrid
        key={gridKey} // Force refresh when key changes
        title="Skills Management"
        columns={columns}
        apiEndpoint="/api/skills"
        initialFilters={filters}
        FiltersComponent={SkillFilters}
        createButtonText="Skill"
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {isFormOpen && (
        <SkillForm
          open={isFormOpen}
          onClose={handleFormClose}
          skill={selectedSkill}
          mode={formMode}
        />
      )}
    </Box>
  );
}

export default SkillIndex;
