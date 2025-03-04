import React, { useState, useCallback } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import LanguageForm from './LanguageForm';
import ReusableDataGrid from '../common/ReusableDataGrid';
import LanguageFilters from './LanguageFilters';

function LanguageIndex() {
  const [filters, setFilters] = useState({
    name: '',
    code: '',
    is_default: false
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [gridKey, setGridKey] = useState(0); // Used to force grid refresh

  // Define columns for the grid
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'code', headerName: 'Code', width: 120 },
    { 
      field: 'is_default', 
      headerName: 'Default', 
      width: 120,
      renderCell: (params) => (
        <div>
          {params.value ? 'Yes' : 'No'}
        </div>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit Language">
            <IconButton onClick={() => handleEditClick(params.row)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Language">
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
    setSelectedLanguage(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (language) => {
    setSelectedLanguage(language);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (language) => {
    setSelectedLanguage(language);
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
        title="Languages Management"
        columns={columns}
        apiEndpoint="/api/languages"
        initialFilters={filters}
        FiltersComponent={LanguageFilters}
        createButtonText="Language"
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {isFormOpen && (
        <LanguageForm
          open={isFormOpen}
          onClose={handleFormClose}
          language={selectedLanguage}
          mode={formMode}
        />
      )}
    </Box>
  );
}

export default LanguageIndex;
