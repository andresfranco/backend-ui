import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import SERVER_URL from '../common/BackendServerData';

function ProjectForm({ open, onClose, project, mode = 'create' }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    url: '',
    github_url: '',
    section_id: '',
    category_id: '',
    skill_ids: [],
    order: 0
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSections, setAvailableSections] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);

  // Fetch available sections, categories, and skills
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sections
        const sectionsResponse = await fetch(`${SERVER_URL}/api/sections`, {
          credentials: 'include'
        });
        if (!sectionsResponse.ok) {
          throw new Error('Failed to fetch sections');
        }
        const sectionsData = await sectionsResponse.json();
        setAvailableSections(sectionsData.items || []);

        // Fetch categories
        const categoriesResponse = await fetch(`${SERVER_URL}/api/categories`, {
          credentials: 'include'
        });
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        setAvailableCategories(categoriesData.items || []);

        // Fetch skills
        const skillsResponse = await fetch(`${SERVER_URL}/api/skills`, {
          credentials: 'include'
        });
        if (!skillsResponse.ok) {
          throw new Error('Failed to fetch skills');
        }
        const skillsData = await skillsResponse.json();
        setAvailableSkills(skillsData.items || []);
      } catch (error) {
        console.error('Error fetching form data:', error);
        setApiError('Failed to load form data');
      }
    };

    fetchData();
  }, []);

  // Initialize form data when project prop changes or mode changes
  useEffect(() => {
    if (mode === 'edit' || mode === 'delete') {
      if (project) {
        setFormData({
          id: project.id,
          title: project.title || '',
          description: project.description || '',
          content: project.content || '',
          url: project.url || '',
          github_url: project.github_url || '',
          section_id: project.section_id || '',
          category_id: project.category_id || '',
          skill_ids: project.skills?.map(skill => skill.id) || [],
          order: project.order || 0
        });
      }
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        description: '',
        content: '',
        url: '',
        github_url: '',
        section_id: '',
        category_id: '',
        skill_ids: [],
        order: 0
      });
    }
  }, [project, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.section_id) {
      newErrors.section_id = 'Section is required';
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let url = `${SERVER_URL}/api/projects`;
      let method = 'POST';
      
      // For edit and delete, use the project ID in the URL
      if (mode === 'edit' || mode === 'delete') {
        url = `${SERVER_URL}/api/projects/${formData.id}`;
        method = mode === 'edit' ? 'PUT' : 'DELETE';
      }
      
      console.log('Sending request:', { url, method, body: formData });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: method !== 'DELETE' ? JSON.stringify(formData) : undefined
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to ${mode} project: ${response.status}`);
      }
      
      // Close the form and refresh data
      onClose(true);
    } catch (error) {
      console.error(`Error ${mode}ing project:`, error);
      setApiError(error.message || `Failed to ${mode} project`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value, 10) || 0 : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSkillsChange = (event) => {
    const {
      target: { value },
    } = event;
    
    // On autofill we get a stringified value.
    const skillIds = typeof value === 'string' ? value.split(',') : value;
    
    setFormData(prev => ({
      ...prev,
      skill_ids: skillIds
    }));
  };

  const handleCancel = (e) => {
    e.preventDefault();
    onClose(false);
  };

  // Get skill names for display in the multi-select
  const getSkillNames = (skillIds) => {
    return availableSkills
      .filter(skill => skillIds.includes(skill.id))
      .map(skill => skill.name);
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {mode === 'create' ? 'Create New Project' : mode === 'edit' ? 'Edit Project' : 'Delete Project'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              disabled={mode === 'delete'}
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={2}
              disabled={mode === 'delete'}
            />
            
            <TextField
              fullWidth
              label="Content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              multiline
              rows={4}
              disabled={mode === 'delete'}
            />
            
            <TextField
              fullWidth
              label="URL"
              name="url"
              value={formData.url}
              onChange={handleChange}
              disabled={mode === 'delete'}
            />
            
            <TextField
              fullWidth
              label="GitHub URL"
              name="github_url"
              value={formData.github_url}
              onChange={handleChange}
              disabled={mode === 'delete'}
            />
            
            <FormControl fullWidth error={!!errors.section_id} disabled={mode === 'delete'}>
              <InputLabel id="section-select-label">Section</InputLabel>
              <Select
                labelId="section-select-label"
                id="section-select"
                name="section_id"
                value={formData.section_id}
                onChange={handleChange}
                label="Section"
              >
                {availableSections.map((section) => (
                  <MenuItem key={section.id} value={section.id}>
                    {section.title}
                  </MenuItem>
                ))}
              </Select>
              {errors.section_id && (
                <Typography variant="caption" color="error">
                  {errors.section_id}
                </Typography>
              )}
            </FormControl>
            
            <FormControl fullWidth error={!!errors.category_id} disabled={mode === 'delete'}>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                label="Category"
              >
                {availableCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category_id && (
                <Typography variant="caption" color="error">
                  {errors.category_id}
                </Typography>
              )}
            </FormControl>
            
            <FormControl fullWidth disabled={mode === 'delete'}>
              <InputLabel id="skills-select-label">Skills</InputLabel>
              <Select
                labelId="skills-select-label"
                id="skills-select"
                multiple
                value={formData.skill_ids}
                onChange={handleSkillsChange}
                input={<OutlinedInput label="Skills" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {getSkillNames(selected).map((skillName) => (
                      <Chip key={skillName} label={skillName} />
                    ))}
                  </Box>
                )}
              >
                {availableSkills.map((skill) => (
                  <MenuItem key={skill.id} value={skill.id}>
                    <Checkbox checked={formData.skill_ids.indexOf(skill.id) > -1} />
                    <ListItemText primary={skill.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Order"
              name="order"
              type="number"
              value={formData.order}
              onChange={handleChange}
              disabled={mode === 'delete'}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color={mode === 'delete' ? 'error' : 'primary'}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ProjectForm;
