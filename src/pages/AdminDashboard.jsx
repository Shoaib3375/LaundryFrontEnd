import React, { useEffect, useState, useCallback, useMemo } from 'react'
import api from '../api'
import CreateCouponForm from '../components/CreateCouponForm'
import PDFGenerator from '../components/PDFGenerator'
import ErrorBoundary from '../components/ErrorBoundary'
import '../styles/print.css'

function AdminDashboard() {
    const [orders, setOrders] = useState([])
    const [statusFilter, setStatusFilter] = useState('All')
    const [logs, setLogs] = useState([])
    const [logOrderId, setLogOrderId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showCouponForm, setShowCouponForm] = useState(false)
    const [coupons, setCoupons] = useState([]);
    const [showCouponList, setShowCouponList] = useState(false);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [perPage] = useState(10)
    const [activeTab, setActiveTab] = useState('orders')
    const [revenueData, setRevenueData] = useState(null)
    const [dashboardStats, setDashboardStats] = useState(null)
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [services, setServices] = useState([])
    const [showServiceForm, setShowServiceForm] = useState(false)
    const [serviceForm, setServiceForm] = useState({ name: '', price: '', category: '', pricing_method: 'per_kg' })
    const [statusChanges, setStatusChanges] = useState({})
    const [totalOrders, setTotalOrders] = useState(0)

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage,
                per_page: perPage,
                include_guest: 'true'
            })

            if (statusFilter !== 'All') {
                params.append('status', statusFilter)
            }

            const res = await api.get(`/orders?${params}`)

            setOrders(res.data.data || [])
            setTotalPages(res.data.pagination?.last_page || 1)
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('token')
                window.location.href = '/login'
                return
            }
            alert('Failed to fetch orders')
        } finally {
            setLoading(false)
        }
    }, [statusFilter, currentPage, perPage])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [statusFilter])

    useEffect(() => {
        if (showCouponForm) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }, [showCouponForm])

    useEffect(() => {
        if (showCouponList) {
            fetchCoupons();
        }
    }, [showCouponList]);

    const cancelOrder = async (id) => {
        if (!window.confirm('Cancel this order?')) return
        try {
            const res = await api.put(`/orders/${id}/cancel`)
            if (res.status === 200 && res.data.success !== false) {
                alert('Order cancelled successfully!')
                fetchOrders()
            } else {
                alert(res.data.message || 'Failed to cancel order')
            }
        } catch (error) {
            console.error('Failed to cancel order:', error)
            alert('Failed to cancel order')
        }
    }

    const handleStatusChange = (orderId, newStatus) => {
        setStatusChanges(prev => ({ ...prev, [orderId]: newStatus }))
    }

    const updateOrderStatus = async (id) => {
        const newStatus = statusChanges[id]
        if (!newStatus) return
        
        try {
            const res = await api.put(`/orders/${id}/status`, { status: newStatus })
            if (res.status === 200 && res.data.success !== false) {
                alert('Order status updated successfully!')
                setStatusChanges(prev => ({ ...prev, [id]: undefined }))
                fetchOrders()
            } else {
                alert(res.data.message || 'Failed to update order')
            }
        } catch (error) {
            console.error('Failed to update order:', error)
            alert('Failed to update order')
        }
    }

    const loadLogs = async (orderId) => {
        try {
            const res = await api.get(`/orders/${orderId}/logs`)
            setLogOrderId(orderId)
            setLogs(res.data.logs || [])
        } catch (err) {
            console.error('Failed to load logs:', err)
            alert('Failed to load logs')
        }
    }

    const fetchCoupons = async () => {
        try {
            const res = await api.get('/coupons');
            setCoupons(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch coupons:', error)
            alert('Failed to fetch coupons')
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const res = await api.get('/admin/dashboard');
            setDashboardStats(res.data.data);
        } catch (error) {
            if (error.response?.status === 403 || error.response?.status === 401) {
                setDashboardStats(null);
            }
        }
    };

    const fetchRevenueData = async () => {
        try {
            const res = await api.get('/admin/revenue');
            setRevenueData(res.data.data);
        } catch (error) {
            if (error.response?.status === 403 || error.response?.status === 401) {
                setRevenueData(null);
            }
        }
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            const res = await api.get(`/orders/${orderId}`);
            setSelectedOrder(res.data.data);
            setShowInvoiceModal(true);
        } catch (error) {
            console.error('Failed to fetch order details:', error)
            alert('Failed to fetch order details')
        }
    };

    useEffect(() => {
        if (activeTab === 'revenue') {
            fetchRevenueData();
            fetchDashboardStats();
            fetchTotalOrders();
        } else if (activeTab === 'services') {
            fetchServices();
        } else if (activeTab === 'orders') {
            fetchTotalOrders();
        }
    }, [activeTab]);

    const fetchServices = async () => {
        try {
            const res = await api.get('/services');
            setServices(res.data.data || res.data || []);
        } catch (error) {
            alert('Failed to fetch services',error);
        }
    };

    const fetchTotalOrders = async () => {
        try {
            const res = await api.get('/admin/orders/count');
            setTotalOrders(res.data.data.total_orders);
        } catch (error) {
            // Fallback: count from regular orders API including guest orders
            try {
                const ordersRes = await api.get('/orders?per_page=1&include_guest=true');
                setTotalOrders(ordersRes.data.pagination?.total || 0);
            } catch {
                setTotalOrders(0);
            }
        }
    };

    const createService = async (e) => {
        e.preventDefault();
        try {
            await api.post('/services', serviceForm);
            alert('Service created successfully!');
            setServiceForm({ name: '', price: '', category: '', pricing_method: 'per_kg' });
            setShowServiceForm(false);
            fetchServices();
        } catch (error) {
            alert('Failed to create service',error);
        }
    };

    const deleteService = async (id) => {
        if (!window.confirm('Delete this service?')) return;
        try {
            await api.delete(`/services/${id}`);
            alert('Service deleted successfully!');
            fetchServices();
        } catch (error) {
            console.error('Failed to delete service:', error)
            alert('Failed to delete service');
        }
    };

    // Memoize filtered orders for performance
    const filteredOrdersCount = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const currentMonthOrders = orders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        });
        
        return {
            pending: currentMonthOrders.filter(o => o.status === 'Pending').length,
            processing: currentMonthOrders.filter(o => o.status === 'Processing').length,
            completed: currentMonthOrders.filter(o => o.status === 'Completed').length,
            cancelled: currentMonthOrders.filter(o => o.status === 'Cancelled').length
        }
    }, [orders])

    return (
        <ErrorBoundary>
            <div className="h-screen flex bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-6 shadow-md flex flex-col space-y-4 h-screen">
                <h2 className="text-xl font-bold text-blue-600 mb-4">Admin Panel</h2>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`text-left px-4 py-2 rounded ${activeTab === 'orders' ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'}`}
                >
                    Orders
                </button>
                <button
                    onClick={() => setActiveTab('revenue')}
                    className={`text-left px-4 py-2 rounded ${activeTab === 'revenue' ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'}`}
                >
                    Revenue Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('services')}
                    className={`text-left px-4 py-2 rounded ${activeTab === 'services' ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'}`}
                >
                    Services
                </button>
                <button className="text-left px-4 py-2 rounded hover:bg-blue-100">User Management</button>
                <button className="text-left px-4 py-2 rounded hover:bg-blue-100">Reports</button>
                <button onClick={() => setShowCouponList(true)} className="text-left px-4 py-2 rounded hover:bg-blue-100">
                    Coupon List
                </button>

                <button
                    onClick={() => setShowCouponForm(true)}
                    className="text-left px-4 py-2 rounded hover:bg-blue-100"
                >
                    + Create Coupon
                </button>
                <div className="flex-1"></div>
                <button
                    onClick={() => {
                        localStorage.removeItem('token')
                        window.location.href = '/login'
                    }}
                    className="text-left text-red-600 px-4 py-2 rounded hover:bg-red-100"
                >
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'orders' ? (
                    /* Modern Orders Management */
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                            <h1 className="text-3xl font-bold mb-2">Order Management</h1>
                            <p className="text-blue-100">Manage and track all customer orders</p>
                        </div>

                        {/* Filter & Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-lg p-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                                    >
                                        <option value="All">🔍 All Orders</option>
                                        <option value="Pending">⏳ Pending</option>
                                        <option value="Processing">🔄 Processing</option>
                                        <option value="Completed">✅ Completed</option>
                                        <option value="Cancelled">❌ Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Quick Stats */}
                            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">Pending Orders</p>
                                            <p className="text-2xl font-bold">{filteredOrdersCount.pending}</p>
                                        </div>
                                        <div className="text-3xl opacity-80">⏳</div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">Processing</p>
                                            <p className="text-2xl font-bold">{filteredOrdersCount.processing}</p>
                                        </div>
                                        <div className="text-3xl opacity-80">🔄</div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">Completed</p>
                                            <p className="text-2xl font-bold">{filteredOrdersCount.completed}</p>
                                        </div>
                                        <div className="text-3xl opacity-80">✅</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Orders Grid */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                                    <span className="text-gray-600 text-lg">Loading orders...</span>
                                </div>
                            ) : orders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <div className="grid grid-cols-1 gap-4 p-6">
                                        {orders.map((order) => (
                                            <div key={order.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                                                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                                                    {/* Order Info */}
                                                    <div className="lg:col-span-1">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="bg-blue-100 rounded-full p-3">
                                                                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">#{order.id}</p>
                                                                <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Customer */}
                                                    <div className="lg:col-span-1">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="bg-green-100 rounded-full p-2">
                                                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900 text-sm">
                                                                    {order.guest_name || order.user?.name || 'N/A'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {order.guest_name ? 'Guest' : 'Registered'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Services */}
                                                    <div className="lg:col-span-1">
                                                        <div className="space-y-1">
                                                            {order.order_items?.length > 0 ? (
                                                                order.order_items.slice(0, 2).map((item, index) => (
                                                                    <div key={index} className="text-sm">
                                                                        <span className="font-medium text-gray-700">{item.service?.name}</span>
                                                                        <span className="text-gray-500 ml-1">x{item.quantity}</span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="text-sm">
                                                                    <span className="font-medium text-gray-700">{order.service?.name}</span>
                                                                    <span className="text-gray-500 ml-1">x{order.quantity}</span>
                                                                </div>
                                                            )}
                                                            {order.order_items?.length > 2 && (
                                                                <p className="text-xs text-blue-600">+{order.order_items.length - 2} more</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Total */}
                                                    <div className="lg:col-span-1">
                                                        <div className="text-center">
                                                            <p className="text-2xl font-bold text-gray-900">৳{order.total_price}</p>
                                                            <p className="text-xs text-gray-500">{order.payment_status || 'Pending'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Status */}
                                                    <div className="lg:col-span-1">
                                                        <div className="space-y-2">
                                                            <select
                                                                value={statusChanges[order.id] || order.status}
                                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                            >
                                                                <option value="Pending">⏳ Pending</option>
                                                                <option value="Processing">🔄 Processing</option>
                                                                <option value="Completed">✅ Completed</option>
                                                                <option value="Cancelled">❌ Cancelled</option>
                                                            </select>
                                                            
                                                            {statusChanges[order.id] && statusChanges[order.id] !== order.status && (
                                                                <button
                                                                    onClick={() => updateOrderStatus(order.id)}
                                                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium"
                                                                >
                                                                    Update Status
                                                                </button>
                                                            )}
                                                            
                                                            <span className={`inline-block w-full text-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                                order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                                order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                Current: {order.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="lg:col-span-1">
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() => fetchOrderDetails(order.id)}
                                                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-xs font-medium flex items-center space-x-1"
                                                            >
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                                                                </svg>
                                                                <span>View</span>
                                                            </button>
                                                            
                                                            <button
                                                                onClick={() => loadLogs(order.id)}
                                                                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-xs font-medium flex items-center space-x-1"
                                                            >
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                                                                </svg>
                                                                <span>Logs</span>
                                                            </button>
                                                            
                                                            <PDFGenerator 
                                                                order={order} 
                                                                fileName={`invoice-${order.id}.pdf`}
                                                            />
                                                            
                                                            {order.status === 'Pending' && (
                                                                <button
                                                                    onClick={() => cancelOrder(order.id)}
                                                                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-xs font-medium flex items-center space-x-1"
                                                                >
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                                                    </svg>
                                                                    <span>Cancel</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                                    <p className="text-gray-500">Orders will appear here when customers place them.</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {orders.length > 0 && totalPages > 1 && (
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-600">
                                            Showing page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                    currentPage === 1
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
                                                }`}
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(prev => prev < totalPages ? prev + 1 : prev)}
                                                disabled={currentPage === totalPages}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                    currentPage === totalPages
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
                                                }`}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status History Modal */}
                        {logOrderId && (
                            <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
                                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-2xl font-bold">Order #{logOrderId} Status History</h2>
                                            <button
                                                onClick={() => setLogOrderId(null)}
                                                className="text-white hover:text-gray-200 transition-colors"
                                            >
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 overflow-y-auto max-h-96">
                                        {logs.length > 0 ? (
                                            <div className="space-y-4">
                                                {logs.map((log) => (
                                                    <div key={log.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="bg-purple-100 rounded-full p-2">
                                                                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">{log.admin?.name || 'System'}</p>
                                                                    <p className="text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                                                    {log.old_status}
                                                                </span>
                                                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                                                </svg>
                                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                                    {log.new_status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                                                    <svg fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                                                    </svg>
                                                </div>
                                                <p className="text-gray-500">No status changes recorded for this order.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'revenue' ? (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                            <h1 className="text-3xl font-bold mb-2">Revenue Dashboard</h1>
                            <p className="text-green-100">Track your business performance and earnings</p>
                        </div>
                        
                        {dashboardStats ? (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                                            <p className="text-3xl font-bold text-blue-600">
                                                {totalOrders || dashboardStats?.total_orders || 0}
                                            </p>
                                        </div>
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                                            <p className="text-3xl font-bold text-green-600">
                                                ৳{dashboardStats?.total_revenue || 
                                                   (revenueData?.monthly ? 
                                                    revenueData.monthly.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2) : 
                                                    '0.00')}
                                            </p>
                                        </div>
                                        <div className="bg-green-100 p-3 rounded-full">
                                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
                                            <p className="text-3xl font-bold text-yellow-600">{dashboardStats.pending_orders || 0}</p>
                                        </div>
                                        <div className="bg-yellow-100 p-3 rounded-full">
                                            <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Completed Orders</h3>
                                            <p className="text-3xl font-bold text-emerald-600">{dashboardStats.completed_orders || 0}</p>
                                        </div>
                                        <div className="bg-emerald-100 p-3 rounded-full">
                                            <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-8 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Daily Revenue Chart</h3>
                                {revenueData?.daily?.length > 0 ? (
                                    <div className="space-y-4">
                                        {(() => {
                                            const maxValue = Math.max(...revenueData.daily.map(item => parseFloat(item.total)));
                                            return revenueData.daily.slice(0, 7).map((item, index) => {
                                                const percentage = (parseFloat(item.total) / maxValue) * 100;
                                                return (
                                                    <div key={index} className="space-y-1">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="font-medium text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                                                            <span className="font-bold text-blue-600">৳{item.total}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                                            <div 
                                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                ) : revenueData === null ? (
                                    <div className="animate-pulse space-y-4">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className="flex justify-between">
                                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No daily data available</p>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Current Month Order Status</h3>
                                {(() => {
                                    const stats = [
                                        { label: 'Completed', value: filteredOrdersCount.completed || 0, color: '#10b981' },
                                        { label: 'Pending', value: filteredOrdersCount.pending || 0, color: '#f59e0b' },
                                        { label: 'Processing', value: filteredOrdersCount.processing || 0, color: '#3b82f6' },
                                        { label: 'Cancelled', value: filteredOrdersCount.cancelled || 0, color: '#ef4444' }
                                    ];
                                    
                                    const total = stats.reduce((sum, stat) => sum + stat.value, 0);
                                    let cumulativePercentage = 0;
                                    
                                    return (
                                        <div className="flex items-center space-x-6">
                                            <div className="relative w-32 h-32">
                                                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                                                    {stats.map((stat, index) => {
                                                        if (stat.value === 0) return null;
                                                        const percentage = total > 0 ? (stat.value / total) * 100 : 0;
                                                        const strokeDasharray = `${percentage} ${100 - percentage}`;
                                                        const strokeDashoffset = -cumulativePercentage;
                                                        cumulativePercentage += percentage;
                                                        
                                                        return (
                                                            <circle
                                                                key={index}
                                                                cx="18"
                                                                cy="18"
                                                                r="15.915"
                                                                fill="transparent"
                                                                stroke={stat.color}
                                                                strokeWidth="3"
                                                                strokeDasharray={strokeDasharray}
                                                                strokeDashoffset={strokeDashoffset}
                                                                className="transition-all duration-500"
                                                            />
                                                        );
                                                    })}
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold text-gray-800">{total}</div>
                                                        <div className="text-xs text-gray-500">Total</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                {stats.map((stat, index) => {
                                                    const percentage = total > 0 ? (stat.value / total) * 100 : 0;
                                                    return (
                                                        <div key={index} className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <div 
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: stat.color }}
                                                                ></div>
                                                                <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-800">
                                                                {stat.value} ({percentage.toFixed(1)}%)
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Revenue Trend</h3>
                            {revenueData?.daily?.length > 0 ? (
                                (() => {
                                    const last30Days = [];
                                    const today = new Date();
                                    for (let i = 29; i >= 0; i--) {
                                        const date = new Date(today);
                                        date.setDate(today.getDate() - i);
                                        const dateStr = date.toISOString().split('T')[0];
                                        const revenueItem = revenueData?.daily?.find(item => item.date === dateStr);
                                        last30Days.push({
                                            date: dateStr,
                                            total: revenueItem ? revenueItem.total : '0'
                                        });
                                    }
                                    const maxValue = Math.max(...last30Days.map(d => parseFloat(d.total)), 1);
                                    
                                    return (
                                        <div className="relative">
                                            <div className="flex items-end justify-between h-48 px-4 overflow-x-auto">
                                                {last30Days.map((item, index) => {
                                                    const value = parseFloat(item.total);
                                                    const height = value > 0 ? (value / maxValue) * 100 : 10;
                                                    const hasRevenue = value > 0;
                                                    
                                                    return (
                                                        <div key={index} className="flex flex-col items-center space-y-2 flex-1 min-w-[20px]">
                                                            <div className="text-xs font-bold text-gray-700">
                                                                {hasRevenue ? `৳${value.toFixed(0)}` : '0'}
                                                            </div>
                                                            <div 
                                                                className={`w-6 rounded-t transition-all duration-700 ${
                                                                    hasRevenue 
                                                                        ? 'bg-gradient-to-t from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700' 
                                                                        : 'bg-transparent'
                                                                }`}
                                                                style={{ height: `${height}%`, minHeight: '4px' }}
                                                            ></div>
                                                            <div className="text-xs text-gray-500 transform -rotate-45 origin-center">
                                                                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-2">
                                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
                                        </svg>
                                    </div>
                                    <p className="text-gray-500">No trend data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'services' ? (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">Services Management</h1>
                            <button
                                onClick={() => setShowServiceForm(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                + Add Service
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {services.map(service => (
                                <div key={service.id} className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                                            <p className="text-gray-600">Category: {service.category}</p>
                                            <p className="text-green-600 font-semibold">৳{service.price} ({service.pricing_method})</p>
                                        </div>
                                        <button
                                            onClick={() => deleteService(service.id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <h2 className="text-xl text-gray-600">Select a tab from the sidebar</h2>
                    </div>
                )}

                {/* Service Form Modal */}
                {showServiceForm && (
                    <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96">
                            <h2 className="text-xl font-bold mb-4">Add New Service</h2>
                            <form onSubmit={createService}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Service Name</label>
                                    <input
                                        type="text"
                                        value={serviceForm.name}
                                        onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={serviceForm.price}
                                        onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <input
                                        type="text"
                                        value={serviceForm.category}
                                        onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}
                                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Pricing Method</label>
                                    <select
                                        value={serviceForm.pricing_method}
                                        onChange={(e) => setServiceForm({...serviceForm, pricing_method: e.target.value})}
                                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="per_kg">Per KG</option>
                                        <option value="per_piece">Per Piece</option>
                                        <option value="fixed">Fixed Price</option>
                                    </select>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Create Service
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowServiceForm(false)}
                                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}




            </main>

            {/* Invoice Modal */}
            {showInvoiceModal && selectedOrder && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50 print:static print:bg-white print:block modal-overlay" onClick={() => setShowInvoiceModal(false)}>
                    <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible print:shadow-none print:rounded-none print:p-0 print:m-0" onClick={(e) => e.stopPropagation()}>
                        <div id="invoice-content" className="print:block">
                            <div className="flex justify-between items-center mb-6 print:block">
                                <h2 className="text-2xl font-bold">Invoice</h2>
                                <button onClick={() => setShowInvoiceModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl print:hidden">
                                    ×
                                </button>
                            </div>
                            
                            <div className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-semibold mb-2">Order Details</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>Order ID:</strong> #{selectedOrder.id}</div>
                                    <div><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleDateString()}</div>
                                    <div><strong>Status:</strong> 
                                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                            selectedOrder.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            selectedOrder.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                            selectedOrder.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div><strong>Payment:</strong> {selectedOrder.payment_status}</div>
                                </div>
                            </div>

                            <div className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                                <div className="text-sm">
                                    <div><strong>Name:</strong> {selectedOrder.guest_name || selectedOrder.user?.name || 'N/A'}</div>
                                    <div><strong>Email:</strong> {selectedOrder.guest_email || selectedOrder.user?.email || 'N/A'}</div>
                                    {selectedOrder.guest_phone && (
                                        <div><strong>Phone:</strong> {selectedOrder.guest_phone}</div>
                                    )}
                                    {selectedOrder.guest_address && (
                                        <div><strong>Address:</strong> {selectedOrder.guest_address}</div>
                                    )}
                                    {!selectedOrder.guest_address && (selectedOrder.delivery_address || selectedOrder.user?.addresses?.[0]) && (
                                        <div><strong>Address:</strong> 
                                            <div className="ml-4 mt-1">
                                                {selectedOrder.delivery_address ? (
                                                    <>
                                                        {selectedOrder.delivery_address.street_address}<br/>
                                                        {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state} {selectedOrder.delivery_address.postal_code}<br/>
                                                        {selectedOrder.delivery_address.type}
                                                    </>
                                                ) : (
                                                    <>
                                                        {selectedOrder.user.addresses[0].street_address}<br/>
                                                        {selectedOrder.user.addresses[0].city}, {selectedOrder.user.addresses[0].state} {selectedOrder.user.addresses[0].postal_code}<br/>
                                                        {selectedOrder.user.addresses[0].type}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-semibold mb-2">Service Details</h3>
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left p-2">Service</th>
                                            <th className="text-left p-2">Category</th>
                                            <th className="text-left p-2">Quantity</th>
                                            <th className="text-left p-2">Unit Price</th>
                                            <th className="text-left p-2">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.order_items?.length > 0 ? (
                                            selectedOrder.order_items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="p-2">{item.service?.name}</td>
                                                    <td className="p-2">{item.service?.category}</td>
                                                    <td className="p-2">{item.quantity}</td>
                                                    <td className="p-2">{item.service?.price}৳</td>
                                                    <td className="p-2">{(parseFloat(item.service?.price) * parseFloat(item.quantity)).toFixed(2)}৳</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td className="p-2">{selectedOrder.service?.name}</td>
                                                <td className="p-2">{selectedOrder.service?.category}</td>
                                                <td className="p-2">{selectedOrder.quantity}</td>
                                                <td className="p-2">{selectedOrder.service?.price}৳</td>
                                                <td className="p-2">{selectedOrder.total_price}৳</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {selectedOrder.note && (
                                <div className="border-b pb-4 mb-4">
                                    <h3 className="text-lg font-semibold mb-2">Special Instructions</h3>
                                    <p className="text-sm text-gray-600">{selectedOrder.note}</p>
                                </div>
                            )}

                            <div className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>{selectedOrder.original_price || selectedOrder.total_price}৳</span>
                                    </div>
                                    {selectedOrder.discount_amount && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount ({selectedOrder.discount_percent}%):</span>
                                            <span>-{selectedOrder.discount_amount}৳</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>{selectedOrder.total_price}৳</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end print:hidden space-x-2">
                                <PDFGenerator 
                                    order={selectedOrder} 
                                    fileName={`invoice-${selectedOrder.id}.pdf`}
                                />
                                <button 
                                    onClick={() => window.print()}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Print Invoice
                                </button>
                                <button 
                                    onClick={() => setShowInvoiceModal(false)}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Coupon Form Modal */}
            {showCouponForm && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <CreateCouponForm 
                            onClose={() => setShowCouponForm(false)}
                            onSuccess={() => {
                                setShowCouponForm(false)
                                alert('Coupon created successfully!')
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Coupon List Modal */}
            {showCouponList && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Coupon List</h2>
                                <button
                                    onClick={() => setShowCouponList(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                    </svg>
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                {coupons.length > 0 ? (
                                    <table className="w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-300 px-4 py-2 text-left">Code</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left">Value</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left">Expires</th>

                                            </tr>
                                        </thead>
                                        <tbody>
                                            {coupons.map((coupon) => (
                                                <tr key={coupon.id}>
                                                    <td className="border border-gray-300 px-4 py-2 font-mono">{coupon.code}</td>
                                                    <td className="border border-gray-300 px-4 py-2">
                                                        {coupon.type === 'percentage' ? `${coupon.discount_percent}%` : `${coupon.discount_percent}%`}
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-2">
                                                        {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                                                    </td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">No coupons found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </ErrorBoundary>
    )
}

export default AdminDashboard