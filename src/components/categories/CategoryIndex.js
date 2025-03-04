import React, { useState, useCallback } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import CategoryForm from './CategoryForm';
import ReusableDataGrid from '../common/ReusableDataGrid';
import CategoryFilters from './CategoryFilters';
import SERVER_URL from '../common/BackendServerData';

function CategoryIndex() {
  const [filters, setFilters] = useState({
    name: ''
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [gridKey, setGridKey] = useState(0); // Used to force grid refresh

  // Define columns for the grid
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit Category">
            <IconButton onClick={() => handleEditClick(params.row)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Category">
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
    setSelectedCategory(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
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
        title="Categories Management"
        columns={columns}
        apiEndpoint="/api/categories"
        initialFilters={filters}
        FiltersComponent={CategoryFilters}
        createButtonText="Category"
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {isFormOpen && (
        <CategoryForm
          open={isFormOpen}
          onClose={handleFormClose}
          category={selectedCategory}
          mode={formMode}
        />
      )}
    </Box>
  );
}

export default CategoryIndex;
