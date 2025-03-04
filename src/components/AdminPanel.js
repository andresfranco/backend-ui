import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Container,
  Divider,
  Collapse
} from '@mui/material';
import {
  People as PeopleIcon,
  VpnKey as VpnKeyIcon,
  LockPerson as PermissionIcon,
  Language as LanguageIcon,
  Translate as TranslateIcon,
  Work as PortfolioIcon,
  ViewModule as SectionIcon,
  Business as ExperienceIcon,
  Code as ProjectIcon,
  Category as CategoryIcon,
  Psychology as SkillIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import UserIndex from './users/UserIndex';
import RoleIndex from './roles/RoleIndex';
import PermissionIndex from './permissions/PermissionIndex';
import LanguageIndex from './languages/LanguageIndex';
import TranslationIndex from './translations/TranslationIndex';
import PortfolioIndex from './portfolios/PortfolioIndex';
import SectionIndex from './sections/SectionIndex';
import ExperienceIndex from './experiences/ExperienceIndex';
import ProjectIndex from './projects/ProjectIndex';
import CategoryIndex from './categories/CategoryIndex';
import SkillIndex from './skills/SkillIndex';

const drawerWidth = 240;

function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cmsOpen, setCmsOpen] = React.useState(true);

  const handleCmsClick = () => {
    setCmsOpen(!cmsOpen);
  };

  const adminMenuItems = [
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    { text: 'Roles', icon: <VpnKeyIcon />, path: '/roles' },
    { text: 'Permissions', icon: <PermissionIcon />, path: '/permissions' }
  ];

  const cmsMenuItems = [
    { text: 'Languages', icon: <LanguageIcon />, path: '/languages' },
    { text: 'Translations', icon: <TranslateIcon />, path: '/translations' },
    { text: 'Portfolios', icon: <PortfolioIcon />, path: '/portfolios' },
    { text: 'Sections', icon: <SectionIcon />, path: '/sections' },
    { text: 'Experiences', icon: <ExperienceIcon />, path: '/experiences' },
    { text: 'Projects', icon: <ProjectIcon />, path: '/projects' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Skills', icon: <SkillIcon />, path: '/skills' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'primary.main',
            color: 'white'
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" sx={{ color: 'white', mb: 2 }}>
            Admin Panel
          </Typography>
        </Box>
        <List>
          {adminMenuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname.includes(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.dark',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          
          <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
          
          <ListItem 
            button 
            onClick={handleCmsClick}
            sx={{
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            }}
          >
            <ListItemText primary="CMS Management" />
            {cmsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          
          <Collapse in={cmsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {cmsMenuItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  selected={location.pathname.includes(item.path)}
                  sx={{
                    pl: 4,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.dark',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'white' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        <Container maxWidth="xl">
          <Routes>
            <Route path="users" element={<UserIndex />} />
            <Route path="roles" element={<RoleIndex />} />
            <Route path="permissions" element={<PermissionIndex />} />
            <Route path="languages" element={<LanguageIndex />} />
            <Route path="translations" element={<TranslationIndex />} />
            <Route path="portfolios" element={<PortfolioIndex />} />
            <Route path="sections" element={<SectionIndex />} />
            <Route path="experiences" element={<ExperienceIndex />} />
            <Route path="projects" element={<ProjectIndex />} />
            <Route path="categories" element={<CategoryIndex />} />
            <Route path="skills" element={<SkillIndex />} />
            <Route path="/" element={
              <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
                Welcome to the Dashboard
              </Typography>
            } />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

export default AdminPanel;
