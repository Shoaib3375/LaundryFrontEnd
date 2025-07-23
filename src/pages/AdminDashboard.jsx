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
    const [perPage] = useState(10);

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const res =
                statusFilter === 'All'
                    ? await api.get(`/orders?page=${currentPage}&per_page=${perPage}`)
                    : await api.get(`/orders/filter?status=${statusFilter}&page=${currentPage}&per_page=${perPage}`)
            
            const orderList =
                statusFilter === 'All'
                    ? res.data.data.data || []
                    : res.data.data || []
            
            setOrders(orderList)
            
            // Set pagination data
            if (res.data.data.meta) {
                setTotalPages(res.data.data.meta.last_page || 1)
            } else if (res.data.meta) {
                setTotalPages(res.data.meta.last_page || 1)
            } else {
                setTotalPages(1)
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
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

    const handleModalClick = (e, closeModal) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    const cancelOrder = async (id) => {
        if (!window.confirm('Cancel this order?')) return
        try {
            await api.put(`/orders/${id}/cancel`)
            fetchOrders()
        } catch (error) {
            alert('Failed to cancel order')
        }
    }

    const updateOrder = async (id) => {
        if (!window.confirm('Mark order as Completed?')) return
        try {
            await api.put(`/orders/${id}/status`, { status: 'Completed' })
            fetchOrders()
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
            console.error('Log error:', err)
        }
    }

    const fetchCoupons = async () => {
        try {
            const res = await api.get('/coupons');
            setCoupons(res.data.data || []);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-6 shadow-md flex flex-col space-y-4">
                <h2 className="text-xl font-bold text-blue-600 mb-4">Admin Panel</h2>
                <button className="text-left px-4 py-2 rounded hover:bg-blue-100">Orders</button>
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
                                    <td className="border p-2">{order.total_price}৳</td>
                                    <td className="border p-2">{order.status}</td>
                                    <td className="border p-2">{order.payment_status}</td>
                                    <td className="border p-2">{new Date(order.created_at).toLocaleString()}</td>
                                    <td className="border p-2 space-x-2">
                                        {order.status === 'Pending' && (
                                            <button
                                                onClick={() => cancelOrder(order.id)}
                                                className="text-white bg-red-600 hover:bg-red-800 px-3 py-1 rounded"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            onClick={() => loadLogs(order.id)}
                                            className="text-white bg-purple-600 hover:bg-purple-800 px-3 py-1 rounded"
                                        >
                                            Logs
                                        </button>
                                        {order.status !== 'Completed' && (
                                            <button
                                                onClick={() => updateOrder(order.id)}
                                                className="text-green-600 hover:underline"
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
            </main>

            {/* Coupon List Modal */}
            {showCouponList && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50" onClick={(e) => handleModalClick(e, () => setShowCouponList(false))}>
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
                                    {/*<th className="border p-2">Actions</th>*/}
                                </tr>
                                </thead>
                                <tbody>
                                {coupons.map(coupon => (
                                    <tr key={coupon.id} className="hover:bg-gray-100">
                                        <td className="border p-2">{coupon.code}</td>
                                        <td className="border p-2">{coupon.discount_percent}</td>
                                        <td className="border p-2"> {new Date(coupon.expires_at).toLocaleDateString()}</td>
                                        {/*<td className="border p-2">*/}
                                        {/*    <button*/}
                                        {/*        onClick={() => alert('Edit feature coming soon')}*/}
                                        {/*        className="text-blue-600 hover:underline"*/}
                                        {/*    >*/}
                                        {/*        Edit*/}
                                        {/*    </button>*/}
                                        {/*</td>*/}
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