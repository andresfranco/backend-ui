import React, { useState, useCallback } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import ExperienceForm from './ExperienceForm';
import ReusableDataGrid from '../common/ReusableDataGrid';
import ExperienceFilters from './ExperienceFilters';

function ExperienceIndex() {
  const [filters, setFilters] = useState({
    title: '',
    section_id: ''
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [gridKey, setGridKey] = useState(0); // Used to force grid refresh

  // Define columns for the grid
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'company', headerName: 'Company', width: 200 },
    { 
      field: 'date_range', 
      headerName: 'Date Range', 
      width: 200,
      valueGetter: (params) => {
        const startDate = params.row.start_date ? new Date(params.row.start_date).toLocaleDateString() : '';
        const endDate = params.row.end_date ? new Date(params.row.end_date).toLocaleDateString() : 'Present';
        return `${startDate} - ${endDate}`;
      }
    },
    { field: 'location', headerName: 'Location', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEditClick(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDeleteClick(params.row)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Handle create button click
  const handleCreateClick = () => {
    setSelectedExperience(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (experience) => {
    setSelectedExperience(experience);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (experience) => {
    if (window.confirm(`Are you sure you want to delete the experience "${experience.title}"?`)) {
      fetch(`/api/experiences/${experience.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
        .then(response => {
          if (response.ok) {
            // Refresh the grid
            setGridKey(prevKey => prevKey + 1);
          } else {
            console.error('Failed to delete experience');
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  };

  // Handle form close
  const handleFormClose = (refreshNeeded) => {
    setIsFormOpen(false);
    if (refreshNeeded) {
      // Refresh the grid
      setGridKey(prevKey => prevKey + 1);
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2 }}>
      <ReusableDataGrid
        key={gridKey} // Force refresh when key changes
        title="Experiences Management"
        columns={columns}
        apiEndpoint="/api/experiences"
        initialFilters={filters}
        FiltersComponent={ExperienceFilters}
        createButtonText="Experience"
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {isFormOpen && (
        <ExperienceForm
          open={isFormOpen}
          onClose={handleFormClose}
          experience={selectedExperience}
          mode={formMode}
        />
      )}
    </Box>
  );
}

export default ExperienceIndex;
