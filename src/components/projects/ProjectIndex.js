import React, { useState, useCallback } from 'react';
import { Box, IconButton, Tooltip, Avatar, Chip, Stack } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Image as ImageIcon } from '@mui/icons-material';
import ProjectForm from './ProjectForm';
import ProjectImageForm from './ProjectImageForm';
import ReusableDataGrid from '../common/ReusableDataGrid';
import ProjectFilters from './ProjectFilters';
import SERVER_URL from '../common/BackendServerData';

function ProjectIndex() {
  const [filters, setFilters] = useState({
    title: '',
    section_id: '',
    category_id: ''
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImageFormOpen, setIsImageFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
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
    { 
      field: 'section', 
      headerName: 'Section', 
      width: 180,
      valueGetter: (params) => params.row.section?.title || '',
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 150,
      valueGetter: (params) => params.row.category?.name || '',
    },
    { 
      field: 'skills', 
      headerName: 'Skills', 
      width: 200,
      renderCell: (params) => {
        const skills = params.row.skills || [];
        return (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {skills.map(skill => (
              <Chip 
                key={skill.id} 
                label={skill.name} 
                size="small" 
                sx={{ m: 0.5 }}
              />
            ))}
          </Stack>
        );
      }
    },
    { field: 'order', headerName: 'Order', width: 80 },
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
          <Tooltip title="Edit Project">
            <IconButton onClick={() => handleEditClick(params.row)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Project">
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
    setSelectedProject(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (project) => {
    setSelectedProject(project);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (project) => {
    setSelectedProject(project);
    setFormMode('delete');
    setIsFormOpen(true);
  };

  // Handle images button click
  const handleImagesClick = (project) => {
    setSelectedProject(project);
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
        title="Projects Management"
        columns={columns}
        apiEndpoint="/api/projects"
        initialFilters={filters}
        FiltersComponent={ProjectFilters}
        createButtonText="Project"
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {isFormOpen && (
        <ProjectForm
          open={isFormOpen}
          onClose={handleFormClose}
          project={selectedProject}
          mode={formMode}
        />
      )}

      {isImageFormOpen && (
        <ProjectImageForm
          open={isImageFormOpen}
          onClose={handleImageFormClose}
          project={selectedProject}
        />
      )}
    </Box>
  );
}

export default ProjectIndex;
