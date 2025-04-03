import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    Box,
    Button,
    Paper,
    Typography,
    Grid,
    Alert,
    TextField,
    MenuItem,
    CircularProgress,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import Layout from '../../components/common/Layout';
import { useOrders } from '../../hooks/useOrders';
import { OrderDTO, OrderStatus } from '../../types/order.types';

const EditOrderPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getOrder } = useOrders();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<OrderDTO | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const orderData = await getOrder(Number(id));
                setOrder(orderData);

                // Set status message based on current order status
                if (orderData.status === OrderStatus.PAID ||
                    orderData.status === OrderStatus.COMPLETED ||
                    orderData.status === OrderStatus.CANCELLED) {
                    setStatusMessage(`This order is ${orderData.status.toLowerCase()}. Limited editing is available.`);
                }
            } catch (err) {
                setError('Failed to load order');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, getOrder]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            // Note: In a real application, you would implement the actual update logic here
            // For now, we'll just navigate back to the order details page
            navigate(`/orders/${id}`);
        } catch (err) {
            setError('Failed to update order');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Edit Order">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <CircularProgress />
                </Box>
            </Layout>
        );
    }

    if (!order) {
        return (
            <Layout title="Edit Order">
                <Alert severity="error" sx={{ mb: 3 }}>
                    Order not found
                </Alert>
                <Button
                    component={Link}
                    to="/orders"
                    startIcon={<ArrowBackIcon />}
                >
                    Back to Orders
                </Button>
            </Layout>
        );
    }

    return (
        <Layout title={`Edit Order #${order.id}`}>
            <Box sx={{ mb: 3 }}>
                <Button
                    component={Link}
                    to={`/orders/${id}`}
                    startIcon={<ArrowBackIcon />}
                >
                    Back to Order Details
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {statusMessage && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    {statusMessage}
                </Alert>
            )}

            <Paper elevation={3} sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Order Information
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Order ID"
                                value={`#${order.id}`}
                                InputProps={{
                                    readOnly: true,
                                }}
                                fullWidth
                                disabled
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Order Date"
                                value={new Date(order.createdAt).toLocaleDateString()}
                                InputProps={{
                                    readOnly: true,
                                }}
                                fullWidth
                                disabled
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Status"
                                value={order.status}
                                onChange={(e) => {
                                    setOrder({
                                        ...order,
                                        status: e.target.value as OrderStatus
                                    });
                                }}
                                fullWidth
                                disabled={
                                    saving ||
                                    order.status === OrderStatus.COMPLETED ||
                                    order.status === OrderStatus.CANCELLED
                                }
                            >
                                {Object.values(OrderStatus).map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Total Amount"
                                value={`$${order.totalAmount.toFixed(2)}`}
                                InputProps={{
                                    readOnly: true,
                                }}
                                fullWidth
                                disabled
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Order Items
                            </Typography>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Product</TableCell>
                                            <TableCell align="right">Price</TableCell>
                                            <TableCell align="right">Quantity</TableCell>
                                            <TableCell align="right">Subtotal</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {order.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.productName}</TableCell>
                                                <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                                                <TableCell align="right">{item.quantity}</TableCell>
                                                <TableCell align="right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                                                Total:
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                ${order.totalAmount.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                Note: To modify order items, please cancel this order and create a new one.
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    sx={{ mr: 2 }}
                                    disabled={saving}
                                    component={Link}
                                    to={`/orders/${id}`}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={saving || order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Layout>
    );
};

export default EditOrderPage;