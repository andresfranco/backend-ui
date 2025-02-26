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
  Container
} from '@mui/material';
import {
  People as PeopleIcon,
  VpnKey as VpnKeyIcon,
  LockPerson as PermissionIcon
} from '@mui/icons-material';
import UserIndex from './users/UserIndex';
import RoleIndex from './roles/RoleIndex';
import PermissionIndex from './permissions/PermissionIndex';

const drawerWidth = 240;

function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    { text: 'Roles', icon: <VpnKeyIcon />, path: '/roles' },
    { text: 'Permissions', icon: <PermissionIcon />, path: '/permissions' }
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
          {menuItems.map((item) => (
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
