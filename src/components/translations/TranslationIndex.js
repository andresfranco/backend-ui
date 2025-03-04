import React, { useState, useCallback } from 'react';
import { Box, IconButton, Tooltip, Chip, Stack } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import TranslationForm from './TranslationForm';
import ReusableDataGrid from '../common/ReusableDataGrid';
import TranslationFilters from './TranslationFilters';
import SERVER_URL from '../common/BackendServerData';

function TranslationIndex() {
  const [filters, setFilters] = useState({
    identifier: '',
    language_id: ''
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [selectedTranslation, setSelectedTranslation] = useState(null);
  const [gridKey, setGridKey] = useState(0); // Used to force grid refresh

  // Define columns for the grid
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'identifier', headerName: 'Identifier', flex: 1 },
    { 
      field: 'languages', 
      headerName: 'Languages', 
      flex: 1,
      renderCell: (params) => {
        const languages = params.value || [];
        return (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {languages.map(lang => (
              <Chip 
                key={lang.id} 
                label={`${lang.name} (${lang.code})`} 
                size="small" 
                sx={{ m: 0.5 }}
              />
            ))}
          </Stack>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit Translation">
            <IconButton onClick={() => handleEditClick(params.row)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Translation">
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
    setSelectedTranslation(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (translation) => {
    setSelectedTranslation(translation);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (translation) => {
    setSelectedTranslation(translation);
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
        title="Translations Management"
        columns={columns}
        apiEndpoint="/api/translations"
        initialFilters={filters}
        FiltersComponent={TranslationFilters}
        createButtonText="Translation"
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {isFormOpen && (
        <TranslationForm
          open={isFormOpen}
          onClose={handleFormClose}
          translation={selectedTranslation}
          mode={formMode}
        />
      )}
    </Box>
  );
}

export default TranslationIndex;
