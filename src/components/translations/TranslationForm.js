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
  Chip,
  Stack,
  Alert,
  OutlinedInput,
  Tabs,
  Tab
} from '@mui/material';
import SERVER_URL from '../common/BackendServerData';

function TranslationForm({ open, onClose, translation, mode = 'create' }) {
  const [formData, setFormData] = useState({
    identifier: '',
    languages: [],
    translations: {}
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  // Fetch available languages
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/languages`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch languages');
        }
        const data = await response.json();
        setAvailableLanguages(data.items || []);
      } catch (error) {
        console.error('Error fetching languages:', error);
        setApiError('Failed to load languages');
      }
    };

    fetchLanguages();
  }, []);

  // Initialize form data when translation prop changes or mode changes
  useEffect(() => {
    if (mode === 'edit' || mode === 'delete') {
      if (translation) {
        const translationsObj = {};
        
        // Convert translations array to object with language_id as key
        if (translation.translations && Array.isArray(translation.translations)) {
          translation.translations.forEach(trans => {
            translationsObj[trans.language_id] = trans.text;
          });
        }
        
        setFormData({
          id: translation.id,
          identifier: translation.identifier || '',
          languages: translation.languages || [],
          translations: translationsObj
        });
        
        // Set active tab to first language if available
        if (translation.languages && translation.languages.length > 0) {
          setActiveTab(0);
        }
      }
    } else {
      // Reset form for create mode
      setFormData({
        identifier: '',
        languages: [],
        translations: {}
      });
    }
  }, [translation, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Identifier is required';
    }
    if (formData.languages.length === 0) {
      newErrors.languages = 'At least one language is required';
    }
    
    // Check if all selected languages have translations
    formData.languages.forEach(lang => {
      if (!formData.translations[lang.id] || !formData.translations[lang.id].trim()) {
        newErrors[`translation_${lang.id}`] = `Translation for ${lang.name} is required`;
      }
    });
    
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
      let url = `${SERVER_URL}/api/translations`;
      let method = 'POST';
      
      // Create a copy of formData to modify for the API request
      let body = { 
        identifier: formData.identifier,
        languages: formData.languages.map(lang => lang.id),
        translations: Object.entries(formData.translations).map(([langId, text]) => ({
          language_id: parseInt(langId),
          text
        }))
      };
      
      // For edit and delete, use the translation ID in the URL
      if (mode === 'edit' || mode === 'delete') {
        url = `${SERVER_URL}/api/translations/${formData.id}`;
        method = mode === 'edit' ? 'PUT' : 'DELETE';
        
        if (mode === 'edit') {
          body.id = formData.id;
        }
      }
      
      console.log('Sending request:', { url, method, body });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: method !== 'DELETE' ? JSON.stringify(body) : undefined
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to ${mode} translation: ${response.status}`);
      }
      
      // Close the form and refresh data
      onClose(true);
    } catch (error) {
      console.error(`Error ${mode}ing translation:`, error);
      setApiError(error.message || `Failed to ${mode} translation`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLanguageChange = (event) => {
    const selectedLanguageIds = event.target.value;
    const selectedLanguages = availableLanguages.filter(lang => 
      selectedLanguageIds.includes(lang.id)
    );
    
    setFormData(prev => ({
      ...prev,
      languages: selectedLanguages
    }));

    if (errors.languages) {
      setErrors(prev => ({
        ...prev,
        languages: ''
      }));
    }
    
    // If we have languages and no active tab, set to first language
    if (selectedLanguages.length > 0 && activeTab >= selectedLanguages.length) {
      setActiveTab(0);
    }
  };
  
  const handleTranslationChange = (languageId, value) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [languageId]: value
      }
    }));
    
    if (errors[`translation_${languageId}`]) {
      setErrors(prev => ({
        ...prev,
        [`translation_${languageId}`]: ''
      }));
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    onClose(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {mode === 'create' ? 'Create New Translation' : mode === 'edit' ? 'Edit Translation' : 'Delete Translation'}
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
              label="Identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              error={!!errors.identifier}
              helperText={errors.identifier}
              disabled={mode === 'delete'}
            />
            
            <FormControl fullWidth error={!!errors.languages} disabled={mode === 'delete'}>
              <InputLabel id="languages-select-label">Languages</InputLabel>
              <Select
                labelId="languages-select-label"
                id="languages-select"
                multiple
                value={formData.languages.map(lang => lang.id)}
                onChange={handleLanguageChange}
                input={<OutlinedInput label="Languages" />}
                renderValue={(selected) => (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {selected.map((langId) => {
                      const lang = availableLanguages.find(l => l.id === langId);
                      return lang ? (
                        <Chip 
                          key={langId} 
                          label={`${lang.name} (${lang.code})`} 
                          size="small" 
                          sx={{ m: 0.5 }}
                        />
                      ) : null;
                    })}
                  </Stack>
                )}
              >
                {availableLanguages.map((lang) => (
                  <MenuItem key={lang.id} value={lang.id}>
                    {lang.name} ({lang.code})
                  </MenuItem>
                ))}
              </Select>
              {errors.languages && (
                <Typography variant="caption" color="error">
                  {errors.languages}
                </Typography>
              )}
            </FormControl>
            
            {formData.languages.length > 0 && (
              <>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    {formData.languages.map((lang, index) => (
                      <Tab 
                        key={lang.id} 
                        label={`${lang.name} (${lang.code})`} 
                        id={`tab-${index}`}
                        disabled={mode === 'delete'}
                      />
                    ))}
                  </Tabs>
                </Box>
                
                {formData.languages.map((lang, index) => (
                  <Box
                    key={lang.id}
                    role="tabpanel"
                    hidden={activeTab !== index}
                    id={`tabpanel-${index}`}
                    aria-labelledby={`tab-${index}`}
                  >
                    {activeTab === index && (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label={`Translation for ${lang.name}`}
                        value={formData.translations[lang.id] || ''}
                        onChange={(e) => handleTranslationChange(lang.id, e.target.value)}
                        error={!!errors[`translation_${lang.id}`]}
                        helperText={errors[`translation_${lang.id}`]}
                        disabled={mode === 'delete'}
                      />
                    )}
                  </Box>
                ))}
              </>
            )}
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

export default TranslationForm;
