import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Button,
    Divider,
    Grid,
    Typography,
    List,
    ListItem,
    ListItemText,
    Paper,
    Alert,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    LinearProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Layout from '../../components/common/Layout';
import Loader from '../../components/common/Loader';
import { useOrders } from '../../hooks/useOrders';
import { OrderDTO, OrderStatus } from '../../types/order.types';

const OrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getOrder, payOrder, cancelOrder } = useOrders();
    const [order, setOrder] = useState<OrderDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'pay' | 'cancel' | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [progress, setProgress] = useState<number>(100);
    const [isExpired, setIsExpired] = useState<boolean>(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const orderData = await getOrder(Number(id));
                setOrder(orderData);

                // Calculate initial expiry status if order is pending
                if (orderData.status === OrderStatus.PENDING) {
                    updateExpiryStatus(orderData.expiryTime);
                }
            } catch (err) {
                setError('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, getOrder]);

    // Set up timer for pending orders
    useEffect(() => {
        if (!order || order.status !== OrderStatus.PENDING) return;

        const timer = setInterval(() => {
            updateExpiryStatus(order.expiryTime);
        }, 1000);

        return () => clearInterval(timer);
    }, [order]);

    // Update expiry status and time remaining
    const updateExpiryStatus = (expiryTime: string) => {
        const expiryDate = new Date(expiryTime);
        const now = new Date();

        // Check if expired
        if (now > expiryDate) {
            setIsExpired(true);
            setTimeRemaining('00:00');
            setProgress(0);
            return;
        }

        // Calculate time remaining
        const diffMs = expiryDate.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        setTimeRemaining(`${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`);

        // Calculate progress (assuming 30 min reservation period)
        const totalReservationTimeMs = 30 * 60 * 1000;
        const progressValue = (diffMs / totalReservationTimeMs) * 100;
        setProgress(progressValue);
    };

    const handleOpenActionDialog = (action: 'pay' | 'cancel') => {
        setActionType(action);
        setActionDialogOpen(true);
    };

    const handleCloseActionDialog = () => {
        setActionDialogOpen(false);
        setActionType(null);
    };

    const handleConfirmAction = async () => {
        if (id && actionType) {
            try {
                let updatedOrder;
                if (actionType === 'pay') {
                    updatedOrder = await payOrder(Number(id));
                } else if (actionType === 'cancel') {
                    updatedOrder = await cancelOrder(Number(id));
                }

                if (updatedOrder) {
                    setOrder(updatedOrder);
                }

                handleCloseActionDialog();
            } catch (err) {
                setError(`Failed to ${actionType} order`);
                handleCloseActionDialog();
            }
        }
    };

    const getStatusChip = (status: OrderStatus) => {
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

        switch (status) {
            case OrderStatus.PENDING:
                color = 'warning';
                break;
            case OrderStatus.PAID:
                color = 'info';
                break;
            case OrderStatus.CANCELLED:
                color = 'error';
                break;
            case OrderStatus.COMPLETED:
                color = 'success';
                break;
        }

        return <Chip label={status} color={color} />;
    };

    if (loading) {
        return (
            <Layout title="Order Details">
                <Loader />
            </Layout>
        );
    }

    if (error || !order) {
        return (
            <Layout title="Order Details">
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error || 'Order not found'}
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
        <Layout title={`Order #${order.id}`}>
            <Box sx={{ mb: 3 }}>
                <Button
                    component={Link}
                    to="/orders"
                    startIcon={<ArrowBackIcon />}
                >
                    Back to Orders
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Reservation Timer for Pending Orders */}
            {order.status === OrderStatus.PENDING && (
                <Paper elevation={1} sx={{ mb: 3, p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon sx={{ mr: 1 }} color="action" />
                        <Typography variant="h6">
                            Reservation Timer
                        </Typography>
                    </Box>

                    {isExpired ? (
                        <Alert severity="error">
                            This order's reservation has expired. The items have been released back to inventory.
                            Please create a new order if you still wish to purchase these items.
                        </Alert>
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                                <Typography variant="h4" fontFamily="monospace" fontWeight="bold" sx={{ mr: 2 }}>
                                    {timeRemaining}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    remaining to complete payment
                                </Typography>
                            </Box>

                            <LinearProgress variant="determinate" value={progress} color="info" sx={{ mb: 2, height: 8, borderRadius: 1 }} />

                            <Typography variant="body2" color="text.secondary">
                                Items in this order are reserved until {new Date(order.expiryTime).toLocaleString()}.
                                After this time, the reservation will expire and the items will be available to others.
                            </Typography>
                        </>
                    )}
                </Paper>
            )}

            <Paper elevation={3}>
                <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" gutterBottom>
                                Order Information
                            </Typography>
                            <List disablePadding>
                                <ListItem disablePadding sx={{ pb: 1 }}>
                                    <ListItemText
                                        primary="Order ID"
                                        secondary={`#${order.id}`}
                                        primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1' }}
                                    />
                                </ListItem>

                                <ListItem disablePadding sx={{ pb: 1 }}>
                                    <ListItemText
                                        primary="Created Date"
                                        secondary={new Date(order.createdAt).toLocaleString()}
                                        primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1' }}
                                    />
                                </ListItem>

                                {order.paidAt && (
                                    <ListItem disablePadding sx={{ pb: 1 }}>
                                        <ListItemText
                                            primary="Paid Date"
                                            secondary={new Date(order.paidAt).toLocaleString()}
                                            primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1' }}
                                        />
                                    </ListItem>
                                )}

                                {order.canceledAt && (
                                    <ListItem disablePadding sx={{ pb: 1 }}>
                                        <ListItemText
                                            primary="Canceled Date"
                                            secondary={new Date(order.canceledAt).toLocaleString()}
                                            primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1' }}
                                        />
                                    </ListItem>
                                )}

                                <ListItem disablePadding sx={{ pb: 1 }}>
                                    <ListItemText
                                        primary="Status"
                                        secondary={getStatusChip(order.status)}
                                        primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                                    />
                                </ListItem>

                                <ListItem disablePadding>
                                    <ListItemText
                                        primary="Total Amount"
                                        secondary={`$${order.totalAmount.toFixed(2)}`}
                                        primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', fontWeight: 'bold' }}
                                    />
                                </ListItem>
                            </List>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" gutterBottom>
                                Actions
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {order.status === OrderStatus.PENDING && !isExpired && (
                                    <>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={<PaymentIcon />}
                                            onClick={() => handleOpenActionDialog('pay')}
                                        >
                                            Mark as Paid
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<CancelIcon />}
                                            onClick={() => handleOpenActionDialog('cancel')}
                                        >
                                            Cancel Order
                                        </Button>
                                    </>
                                )}

                                {order.status === OrderStatus.PENDING && isExpired && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<CancelIcon />}
                                        onClick={() => handleOpenActionDialog('cancel')}
                                    >
                                        Cancel Expired Order
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

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
                                {order.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.productName}</TableCell>
                                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                                        <TableCell align="right">{item.quantity}</TableCell>
                                        <TableCell align="right">${item.subtotal.toFixed(2)}</TableCell>
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

                    {order.customerName && (
                        <>
                            <Divider sx={{ my: 3 }} />
                            <Typography variant="h6" gutterBottom>
                                Customer Information
                            </Typography>
                            <Grid container spacing={2}>
                                {order.customerName && (
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Name
                                        </Typography>
                                        <Typography variant="body1">
                                            {order.customerName}
                                        </Typography>
                                    </Grid>
                                )}
                                {order.customerEmail && (
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Email
                                        </Typography>
                                        <Typography variant="body1">
                                            {order.customerEmail}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </>
                    )}
                </Box>
            </Paper>

            {/* Action Confirmation Dialog */}
            <Dialog
                open={actionDialogOpen}
                onClose={handleCloseActionDialog}
            >
                <DialogTitle>
                    {actionType === 'pay' ? 'Pay Order' : 'Cancel Order'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {actionType === 'pay'
                            ? 'Are you sure you want to mark this order as paid?'
                            : 'Are you sure you want to cancel this order? This will release all reserved stock.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseActionDialog}>No</Button>
                    <Button
                        onClick={handleConfirmAction}
                        color={actionType === 'pay' ? 'success' : 'error'}
                        autoFocus
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default OrderDetailsPage;