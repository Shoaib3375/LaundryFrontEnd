import React, { useEffect, useState, useCallback } from 'react'
import api from '../api'
import CreateCouponForm from '../components/CreateCouponForm'

export default function AdminDashboard() {
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

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage,
                per_page: perPage
            })

            if (statusFilter !== 'All') {
                params.append('status', statusFilter)
            }

            const res = await api.get(`/orders?${params}`)

            setOrders(res.data.data || [])
            setTotalPages(res.data.pagination?.last_page || 1)
        } catch (error) {
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
            alert('Failed to cancel order')
        }
    }

    const updateOrder = async (id) => {
        if (!window.confirm('Mark order as Completed?')) return
        try {
            const res = await api.put(`/orders/${id}/status`, { status: 'Completed' })
            if (res.status === 200 && res.data.success !== false) {
                alert('Order updated successfully!')
                fetchOrders()
            } else {
                alert(res.data.message || 'Failed to update order')
            }
        } catch (error) {
            alert('Failed to update order')
        }
    }

    const loadLogs = async (orderId) => {
        try {
            const res = await api.get(`/orders/${orderId}/logs`)
            setLogOrderId(orderId)
            setLogs(res.data.logs || [])
        } catch (err) {
            alert('Failed to load logs')
        }
    }

    const fetchCoupons = async () => {
        try {
            const res = await api.get('/coupons');
            setCoupons(res.data.data || []);
        } catch (error) {
            alert('Failed to fetch coupons')
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const res = await api.get('/admin/dashboard');
            setDashboardStats(res.data.data);
        } catch (error) {
            alert('Failed to fetch dashboard stats')
        }
    };

    const fetchRevenueData = async () => {
        try {
            const res = await api.get('/admin/revenue');
            setRevenueData(res.data.data);
        } catch (error) {
            alert('Failed to fetch revenue data')
        }
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            const res = await api.get(`/orders/${orderId}`);
            setSelectedOrder(res.data.data);
            setShowInvoiceModal(true);
        } catch (error) {
            alert('Failed to fetch order details')
        }
    };

    useEffect(() => {
        if (activeTab === 'revenue') {
            fetchRevenueData();
            fetchDashboardStats();
        }
    }, [activeTab]);

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-6 shadow-md flex flex-col space-y-4">
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
                <button
                    onClick={() => {
                        localStorage.removeItem('token')
                        window.location.reload()
                    }}
                    className="mt-auto text-left text-red-600 px-4 py-2 rounded hover:bg-red-100"
                >
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6">
                {activeTab === 'revenue' ? (
                    /* Revenue Dashboard */
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">Revenue Dashboard</h1>

                        {/* Stats Cards */}
                        {dashboardStats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Revenue This Month</p>
                                            <p className="text-2xl font-bold">৳{dashboardStats.revenue_this_month || 0}</p>
                                        </div>
                                        <div className="bg-blue-400 p-3 rounded-full">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-100 text-sm font-medium">Today's Orders</p>
                                            <p className="text-2xl font-bold">{dashboardStats.today_orders || 0}</p>
                                        </div>
                                        <div className="bg-green-400 p-3 rounded-full">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM8 15a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100 text-sm font-medium">Completed Orders</p>
                                            <p className="text-2xl font-bold">{dashboardStats.completed_orders || 0}</p>
                                        </div>
                                        <div className="bg-purple-400 p-3 rounded-full">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-orange-100 text-sm font-medium">Today's Revenue</p>
                                            <p className="text-2xl font-bold">৳{dashboardStats.revenue_today || 0}</p>
                                        </div>
                                        <div className="bg-orange-400 p-3 rounded-full">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Daily Revenue Chart */}
                        {revenueData && revenueData.daily && (
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Daily Revenue Trend</h2>
                                <div className="h-64 flex items-end justify-between space-x-2">
                                    {revenueData.daily.map((item, index) => {
                                        const maxRevenue = Math.max(...revenueData.daily.map(r => parseFloat(r.total)))
                                        const height = maxRevenue > 0 ? (parseFloat(item.total) / maxRevenue) * 200 : 0
                                        return (
                                            <div key={index} className="flex flex-col items-center flex-1">
                                                <div className="text-xs text-gray-600 mb-2">৳{item.total}</div>
                                                <div
                                                    className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-t w-full transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
                                                    style={{ height: `${height}px`, minHeight: '4px' }}
                                                ></div>
                                                <div className="text-xs text-gray-500 mt-2">{new Date(item.date).toLocaleDateString()}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Monthly Revenue */}
                        {revenueData && revenueData.monthly && (
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Monthly Revenue</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {revenueData.monthly.map((item, index) => (
                                        <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <h3 className="font-medium text-gray-800">{item.month}</h3>
                                            <p className="text-2xl font-bold text-blue-600 mt-2">৳{item.total}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Orders Management */
                    <div>
                        {/* Filter */}
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-2xl font-semibold">Manage Orders</h1>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="All">All</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Orders Table */}
                        <div className="bg-white p-4 rounded shadow">
                            {loading ? (
                                <div className="flex items-center space-x-2 text-blue-600">
                                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                    <span>Loading orders...</span>
                                </div>
                            ) : orders.length > 0 ? (
                                <table className="w-full border-collapse border text-sm">
                                    <thead>
                                    <tr className="bg-gray-200 text-gray-700">
                                        <th className="border p-2">Service</th>
                                        <th className="border p-2">Category</th>
                                        <th className="border p-2">Qty</th>
                                        <th className="border p-2">Note</th>
                                        <th className="border p-2">Total</th>
                                        <th className="border p-2">Status</th>
                                        <th className="border p-2">Payment</th>
                                        <th className="border p-2">Date</th>
                                        <th className="border p-2">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-100">
                                            <td className="border p-2">{order.service?.name}</td>
                                            <td className="border p-2">{order.service?.category}</td>
                                            <td className="border p-2">{order.quantity}</td>
                                            <td className="border p-2">{order.note || 'N/A'}</td>
                                            <td className="border p-2">{order.total_price}৳</td>
                                            <td className="border p-2">{order.status}</td>
                                            <td className="border p-2">{order.payment_status}</td>
                                            <td className="border p-2">{new Date(order.created_at).toLocaleString()}</td>
                                            <td className="border p-2 space-x-1">
                                                <button
                                                    onClick={() => fetchOrderDetails(order.id)}
                                                    className="text-white bg-blue-600 hover:bg-blue-800 px-2 py-1 rounded text-xs"
                                                >
                                                    Details
                                                </button>
                                                {order.status === 'Pending' && (
                                                    <button
                                                        onClick={() => cancelOrder(order.id)}
                                                        className="text-white bg-red-600 hover:bg-red-800 px-2 py-1 rounded text-xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => loadLogs(order.id)}
                                                    className="text-white bg-purple-600 hover:bg-purple-800 px-2 py-1 rounded text-xs"
                                                >
                                                    Logs
                                                </button>
                                                {order.status !== 'Completed' && (
                                                    <button
                                                        onClick={() => updateOrder(order.id)}
                                                        className="text-green-600 hover:underline text-xs"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-600">No orders found.</p>
                            )}

                            {/* Pagination */}
                            {!loading && orders.length > 0 && (
                                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                    <div className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => prev < totalPages ? prev + 1 : prev)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Logs */}
                            {logOrderId && (
                                <div className="mt-6 p-4 border rounded bg-gray-50">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-semibold">Order #{logOrderId} Status History</h2>
                                        <button
                                            onClick={() => setLogOrderId(null)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {logs.length > 0 ? (
                                        <table className="w-full border-collapse border text-sm">
                                            <thead>
                                            <tr className="bg-gray-200 text-gray-700">
                                                <th className="border p-2">Admin</th>
                                                <th className="border p-2">Old Status</th>
                                                <th className="border p-2">New Status</th>
                                                <th className="border p-2">Date</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {logs.map((log) => (
                                                <tr key={log.id} className="text-sm text-gray-700 hover:bg-gray-100">
                                                    <td className="border p-2">{log.admin?.name || 'System'}</td>
                                                    <td className="border p-2">{log.old_status}</td>
                                                    <td className="border p-2">{log.new_status}</td>
                                                    <td className="border p-2">{new Date(log.created_at).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-600">No logs found for this order.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Coupon List Modal */}
            {showCouponList && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50" onClick={() => setShowCouponList(false)}>
                    <div className="bg-white rounded shadow-lg p-6 w-full max-w-4xl relative max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Coupons</h2>
                            <button
                                onClick={() => setShowCouponList(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        {coupons.length > 0 ? (
                            <table className="w-full text-sm border-collapse border">
                                <thead className="bg-gray-200 text-gray-700">
                                <tr>
                                    <th className="border p-2">Code</th>
                                    <th className="border p-2">Discount (%)</th>
                                    <th className="border p-2">Expires At</th>
                                </tr>
                                </thead>
                                <tbody>
                                {coupons.map(coupon => (
                                    <tr key={coupon.id} className="hover:bg-gray-100">
                                        <td className="border p-2">{coupon.code}</td>
                                        <td className="border p-2">{coupon.discount_percent}</td>
                                        <td className="border p-2"> {new Date(coupon.expires_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-600">No coupons found.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Invoice Modal */}
            {showInvoiceModal && selectedOrder && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50" onClick={() => setShowInvoiceModal(false)}>
                    <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div id="invoice-content">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Invoice</h2>
                            <button onClick={() => setShowInvoiceModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
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
                                <div><strong>Name:</strong> {selectedOrder.user?.name || 'N/A'}</div>
                                <div><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</div>
                                {(selectedOrder.delivery_address || selectedOrder.user?.addresses?.[0]) && (
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
                                        <th className="text-left p-2">Price</th>
                                        <th className="text-left p-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="p-2">{selectedOrder.service?.name}</td>
                                        <td className="p-2">{selectedOrder.service?.category}</td>
                                        <td className="p-2">{selectedOrder.quantity}</td>
                                        <td className="p-2">{selectedOrder.service?.price}৳</td>
                                        <td className="p-2">{selectedOrder.total_price}৳</td>
                                    </tr>
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

                        <div className="flex justify-end">
                            <button 
                                onClick={() => {
                                    const printContent = document.getElementById('invoice-content').innerHTML;
                                    const originalContent = document.body.innerHTML;
                                    const printStyles = `
                                        <style>
                                            @page { size: A5; margin: 10mm; }
                                            body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; }
                                            .text-2xl { font-size: 18px; }
                                            .text-lg { font-size: 16px; }
                                            .text-sm { font-size: 11px; }
                                            .text-xs { font-size: 10px; }
                                            table { width: 100%; border-collapse: collapse; margin: 8px 0; }
                                            th, td { border: 1px solid #ddd; padding: 4px; text-align: left; }
                                            .border-b { border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 8px; }
                                        </style>
                                    `;
                                    document.body.innerHTML = printStyles + printContent;
                                    window.print();
                                    document.body.innerHTML = originalContent;
                                    window.location.reload();
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
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
                <div className="fixed inset-0 bg-transparent flex justify-center items-start pt-50 z-50">
                    <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
                        <CreateCouponForm onClose={() => setShowCouponForm(false)} />
                    </div>
                </div>
            )}
        </div>
    )
}