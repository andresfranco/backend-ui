import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';
import AdminPanel from './components/AdminPanel';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  const handleLogin = (username, password) => {
    // Normally, call your FastAPI endpoint here (e.g., POST /auth/login)
    // For now, simulate successful login if both fields are not empty.
    if (username && password) {
      setAuthenticated(true);
    }
  };

  const handleSignUp = (formData) => {
    // Handle signup logic here
    console.log('Sign up:', formData);
  };

  const handleForgotPassword = (email) => {
    // Handle forgot password logic here
    console.log('Forgot password:', email);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={ 
            authenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/signup" element={<SignUp onSignUp={handleSignUp} />} />
          <Route path="/forgot-password" element={<ForgotPassword onSubmit={handleForgotPassword} />} />
          <Route path="/*" element={ 
            !authenticated ? <Navigate to="/login" replace /> : <AdminPanel />
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
