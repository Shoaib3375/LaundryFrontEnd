import React, { useEffect, useState } from 'react'
import api from '../api'

const Dashboard = () => {
    const [orders, setOrders] = useState([])
    const [statusFilter, setStatusFilter] = useState('All')
    const [logs, setLogs] = useState([])
    const [logOrderId, setLogOrderId] = useState(null)

    useEffect(() => {
        fetchOrders()
    }, [statusFilter])

    const fetchOrders = async () => {
        try {
            const res =
                statusFilter === 'All'
                    ? await api.get('/orders')
                    : await api.get(`/orders/filter?status=${statusFilter}`)
            setOrders(res.data.data || [])
        } catch (error) {
            console.error('Error fetching orders:', error)
        }
    }

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
            await api.put(`/orders/${id}/update`, { status: 'Completed' }) // adjust if your API expects a status
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
        <div className="p-4">
            <div className="flex justify-between mb-4">
                <h1 className="text-xl font-bold">My Orders</h1>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border px-2 py-1"
                >
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {Array.isArray(orders) && orders.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Service</th>
                        <th className="border p-2">Category</th>
                        <th className="border p-2">Quantity</th>
                        <th className="border p-2">Total</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Payment</th>
                        <th className="border p-2">Date</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td className="border p-2">{order.service?.name}</td>
                            <td className="border p-2">{order.service?.category}</td>
                            <td className="border p-2">{order.quantity}</td>
                            <td className="border p-2">{order.total_price}৳</td>
                            <td className="border p-2">{order.status}</td>
                            <td className="border p-2">{order.payment_status}</td>
                            <td className="border p-2">
                                {new Date(order.created_at).toLocaleString()}
                            </td>
                            <td className="border p-2 space-y-1">
                                {order.status === 'Pending' && (
                                    <button
                                        onClick={() => cancelOrder(order.id)}
                                        className="text-red-600 underline mr-2"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    onClick={() => loadLogs(order.id)}
                                    className="text-blue-600 underline mr-2"
                                >
                                    Logs
                                </button>
                                <button
                                    onClick={() => updateOrder(order.id)}
                                    className="text-green-600 underline"
                                >
                                    Complete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>No orders found.</p>
            )}

            {logOrderId && logs.length > 0 && (
                <div className="mt-4 p-4 border rounded bg-gray-50">
                    <h2 className="text-lg font-semibold mb-2">
                        Logs for Order #{logOrderId}
                    </h2>
                    <ul className="list-disc pl-5">
                        {logs.map((log, i) => (
                            <li key={i}>
                                [{new Date(log.created_at).toLocaleString()}] {log.status}{' '}
                                by {log.admin?.name || 'System'}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default Dashboard
