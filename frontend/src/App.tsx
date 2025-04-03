import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from './theme/theme';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
    return (
        <Router>
            <ThemeProvider theme={theme}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <CssBaseline />
                    <AuthProvider>
                        <AppRoutes />
                    </AuthProvider>
                </LocalizationProvider>
            </ThemeProvider>
        </Router>
    );
};

export default App;
