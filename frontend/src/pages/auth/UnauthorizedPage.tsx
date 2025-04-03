import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import BlockIcon from '@mui/icons-material/Block';

const UnauthorizedPage: React.FC = () => {
    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    mt: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                }}
            >
                <BlockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />

                <Typography variant="h4" component="h1" gutterBottom>
                    Access Denied
                </Typography>

                <Typography variant="body1" color="text.secondary" paragraph>
                    You don't have permission to access this page. This area is restricted to administrators only.
                </Typography>

                <Button
                    component={Link}
                    to="/"
                    variant="contained"
                    sx={{ mt: 2 }}
                >
                    Back to Home
                </Button>
            </Box>
        </Container>
    );
};

export default UnauthorizedPage;