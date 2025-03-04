import React, { useState, useCallback } from 'react';
import { Box, IconButton, Tooltip, Avatar } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Image as ImageIcon } from '@mui/icons-material';
import PortfolioForm from './PortfolioForm';
import PortfolioImageForm from './PortfolioImageForm';
import ReusableDataGrid from '../common/ReusableDataGrid';
import PortfolioFilters from './PortfolioFilters';
import SERVER_URL from '../common/BackendServerData';

function PortfolioIndex() {
  const [filters, setFilters] = useState({
    title: '',
    language_id: ''
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImageFormOpen, setIsImageFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [gridKey, setGridKey] = useState(0); // Used to force grid refresh

  // Define columns for the grid
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'image', 
      headerName: 'Image', 
      width: 100,
      renderCell: (params) => {
        const mainImage = params.row.images?.find(img => img.category === 'main');
        return (
          <Avatar
            src={mainImage ? `${SERVER_URL}/static/${mainImage.image_path}` : ''}
            alt={params.row.title}
            variant="rounded"
            sx={{ width: 60, height: 60 }}
          />
        );
      }
    },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'subtitle', headerName: 'Subtitle', flex: 1 },
    { 
      field: 'language', 
      headerName: 'Language', 
      width: 120,
      valueGetter: (params) => params.row.language?.name || '',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Manage Images">
            <IconButton onClick={() => handleImagesClick(params.row)} size="small" color="primary">
              <ImageIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Portfolio">
            <IconButton onClick={() => handleEditClick(params.row)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Portfolio">
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
    setSelectedPortfolio(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (portfolio) => {
    setSelectedPortfolio(portfolio);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (portfolio) => {
    setSelectedPortfolio(portfolio);
    setFormMode('delete');
    setIsFormOpen(true);
  };

  // Handle images button click
  const handleImagesClick = (portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsImageFormOpen(true);
  };

  // Handle form close
  const handleFormClose = (refreshData) => {
    setIsFormOpen(false);
    if (refreshData) {
      // Refresh the grid by incrementing the key
      setGridKey(prevKey => prevKey + 1);
    }
  };

  // Handle image form close
  const handleImageFormClose = (refreshData) => {
    setIsImageFormOpen(false);
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
        title="Portfolios Management"
        columns={columns}
        apiEndpoint="/api/portfolios"
        initialFilters={filters}
        FiltersComponent={PortfolioFilters}
        createButtonText="Portfolio"
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {isFormOpen && (
        <PortfolioForm
          open={isFormOpen}
          onClose={handleFormClose}
          portfolio={selectedPortfolio}
          mode={formMode}
        />
      )}

      {isImageFormOpen && (
        <PortfolioImageForm
          open={isImageFormOpen}
          onClose={handleImageFormClose}
          portfolio={selectedPortfolio}
        />
      )}
    </Box>
  );
}

export default PortfolioIndex;
