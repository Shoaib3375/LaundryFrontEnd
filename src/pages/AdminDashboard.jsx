import React, {useEffect, useState, useCallback} from 'react'
import api from '../api'

export default function AdminDashboard() {
    const [orders, setOrders] = useState([])
    const [statusFilter, setStatusFilter] = useState('All')
    const [logs, setLogs] = useState([])
    const [logOrderId, setLogOrderId] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const res =
                statusFilter === 'All'
                    ? await api.get('/orders')
                    : await api.get(`/orders/filter?status=${statusFilter}`)
            const orderList =
                statusFilter === 'All'
                    ? res.data.data.data || []
                    : res.data.data || []

            setOrders(orderList)
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }, [statusFilter])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

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
            await api.put(`/orders/${id}/status`, {status: 'Completed'})
            fetchOrders()
        } catch (error) {
            alert('Failed to update order')
        }
    }

    const loadLogs = async (orderId) => {
        try {
            const res = await api.get(`/orders/${orderId}/logs`)
            setLogOrderId(orderId)
            setLogs(res.data)
        } catch (err) {
            console.error('Log error:', err)
        }
    }

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-6 shadow-md flex flex-col space-y-4">
                <h2 className="text-xl font-bold text-blue-600 mb-4">Admin Panel</h2>
                <button className="text-left px-4 py-2 rounded hover:bg-blue-100">
                    Orders
                </button>
                <button className="text-left px-4 py-2 rounded hover:bg-blue-100">
                    User Management
                </button>
                <button className="text-left px-4 py-2 rounded hover:bg-blue-100">
                    Reports
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

                {/* Table */}
                <div className="bg-white p-4 rounded shadow">
                    {loading ? (
                        <div className="flex items-center space-x-2 text-blue-600">
                            <div
                                className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
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
                                            className="text-blue-600 hover:underline"
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

                    {/* Order Logs */}
                    {logOrderId && logs.length > 0 && (
                        <div className="mt-6 p-4 border rounded bg-gray-50">
                            <h2 className="text-lg font-semibold mb-2">
                                Logs for Order #{logOrderId}
                            </h2>
                            <ul className="list-disc pl-5 text-sm text-gray-700">
                                {logs.map((log, i) => (
                                    <li key={i}>
                                        [{new Date(log.created_at).toLocaleString()}] {log.status} by{' '}
                                        {log.admin?.name || 'System'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
