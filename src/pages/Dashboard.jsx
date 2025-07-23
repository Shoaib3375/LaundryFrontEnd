import React, { useEffect, useState, useCallback, useRef } from 'react'
import api from '../api'

const Dashboard = () => {
    const [orders, setOrders] = useState([])
    const [services, setServices] = useState([])
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showForm, setShowForm] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [form, setForm] = useState({ service_id: '', quantity: 1, note: '' })
    const [statusFilter, setStatusFilter] = useState('All')
    const [loading, setLoading] = useState(true)
    const [selectedOrderLogs, setSelectedOrderLogs] = useState(null)
    const [loadingLogs, setLoadingLogs] = useState(false)

    const user = JSON.parse(localStorage.getItem('user'))
    const token = localStorage.getItem('token')
    const notificationRef = useRef(null)
    
    // Handle click outside to close notifications dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const res = statusFilter === 'All'
                ? await api.get('/orders')
                : await api.get(`/orders/filter?status=${statusFilter}`)

            const orderList = statusFilter === 'All'
                ? res.data.data.data || []
                : res.data.data || []

            setOrders(orderList)
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }, [statusFilter])

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications')
            // Handle the response structure: { notifications: [...] }
            const notifs = res.data.notifications || res.data.data || []
            
            // Transform notifications to match the expected format
            const formattedNotifs = notifs.map(n => ({
                id: n.id,
                message: n.data?.message || n.message,
                read_at: n.read_at,
                created_at: n.created_at
            }))
            
            setNotifications(formattedNotifs)
            setUnreadCount(formattedNotifs.filter(n => !n.read_at).length)
        } catch (err) {
            console.error('Failed to load notifications', err)
        }
    }

    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all')
            fetchNotifications()
        } catch (err) {
            console.error('Failed to mark all as read', err)
        }
    }

    useEffect(() => {
        fetchOrders()
        api.get('/services').then(res => setServices(res.data.data || []))
        fetchNotifications()

        // Use the echo instance from echo.js
        import('../echo').then(({ default: echo }) => {
            if (user) {
                echo.private(`user.${user.id}`)
                    .listen('.order.status.updated', (e) => {
                        // Format notification to match API response structure
                        const newNotification = { 
                            id: e.id || `temp-${Date.now()}`,
                            message: e.data?.message || e.message, 
                            read_at: null, 
                            created_at: new Date() 
                        }
                        
                        setNotifications(prev => {
                            // Check if notification with same ID or message already exists
                            const isDuplicate = prev.some(n => 
                                (n.id && n.id === newNotification.id) || 
                                (n.message === newNotification.message && 
                                 // Check if timestamps are close (within 5 seconds)
                                 Math.abs(new Date(n.created_at) - new Date(newNotification.created_at)) < 5000)
                            )
                            
                            return isDuplicate ? prev : [newNotification, ...prev]
                        })
                        
                        // Only increment unread count if not a duplicate
                        setUnreadCount(count => {
                            const isDuplicate = notifications.some(n => 
                                (n.id && n.id === newNotification.id) || 
                                (n.message === newNotification.message && 
                                 Math.abs(new Date(n.created_at) - new Date(newNotification.created_at)) < 5000)
                            )
                            return isDuplicate ? count : count + 1
                        })
                    })
            }
        })

        return () => {
            import('../echo').then(({ default: echo }) => {
                if (user) {
                    echo.leave(`user.${user.id}`)
                }
            })
        }
    }, [fetchOrders, token, user])

    const toggleForm = () => setShowForm(!showForm)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const createOrder = async (e) => {
        e.preventDefault()
        try {
            await api.post('/orders', form)
            alert('Order created!')
            setShowForm(false)
            fetchOrders()
        } catch (err) {
            console.error(err)
            alert('Failed to create order')
        }
    }

    const cancelOrder = async (id) => {
        if (!window.confirm('Cancel this order?')) return
        try {
            await api.put(`/orders/${id}/cancel`)
            fetchOrders()
        } catch (error) {
            alert('Failed to cancel order', error)
        }
    }

    const selectedService = services.find(s => s.id === parseInt(form.service_id))
    const totalPrice = selectedService ? selectedService.price * form.quantity : 0

    return (
        <div className="min-h-screen flex bg-gray-100">
            <aside className="w-64 bg-white p-6 shadow-md flex flex-col space-y-4">
                <h2 className="text-xl font-bold text-blue-600 mb-4">eLaundry Panel</h2>
                <button className="text-left px-4 py-2 rounded hover:bg-blue-100">Dashboard</button>
                <button onClick={toggleForm} className="text-left px-4 py-2 rounded hover:bg-blue-100">
                    {showForm ? '- Hide Form' : '+ Create Order'}
                </button>
                <button className="text-left px-4 py-2 rounded hover:bg-blue-100">My Orders</button>
                <button className="text-left px-4 py-2 rounded hover:bg-blue-100">Settings</button>
                <button onClick={() => {
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    window.location.reload()
                }} className="mt-auto text-left text-red-600 px-4 py-2 rounded hover:bg-red-100">Logout</button>
            </aside>

            <main className="flex-1 p-6">
                {/* Notifications */}
                <div className="flex justify-end items-center mb-4">
                    <div className="relative" ref={notificationRef}>
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)} 
                            className="relative text-blue-600 hover:text-blue-800"
                        >
                            🔔
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-2">{unreadCount}</span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg border rounded z-10">
                                <div className="flex justify-between items-center p-2 border-b">
                                    <h3 className="font-medium">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAllAsRead();
                                            }} 
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                {notifications.length === 0 ? (
                                    <div className="p-3 text-gray-500">No notifications</div>
                                ) : (
                                    <ul className="max-h-60 overflow-auto">
                                        {notifications.map((n, i) => (
                                            <li key={n.id || i} className={`px-4 py-2 text-sm ${n.read_at ? 'text-gray-500' : 'text-black font-medium'}`}>
                                                {n.message}
                                                <div className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Order Form */}
                {showForm && (
                    <form className="bg-white p-4 mb-6 rounded shadow" onSubmit={createOrder}>
                        <h2 className="text-lg font-semibold mb-4">Create Order</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Service</label>
                                <select
                                    name="service_id"
                                    value={form.service_id}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    required
                                >
                                    <option value="">Select a service</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.category}) - {s.price}৳</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    min={1}
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium">Note</label>
                                <textarea
                                    name="note"
                                    value={form.note}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="mt-4 font-semibold">Total: <span className="text-blue-600">{totalPrice}৳</span></div>
                        <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Submit Order</button>
                    </form>
                )}

                {/* Orders Table */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-semibold">Orders</h1>
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

                <div className="bg-white p-4 rounded shadow">
                    {loading ? (
                        <div className="flex items-center space-x-2 text-blue-600">
                            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            <span>Loading orders...</span>
                        </div>
                    ) : Array.isArray(orders) && orders.length > 0 ? (
                        <table className="w-full border-collapse border text-sm">
                            <thead>
                            <tr className="bg-gray-200 text-gray-700">
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
                                <tr key={order.id} className="text-sm text-gray-700 hover:bg-gray-100">
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
                                                className="text-white bg-red-600 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2"
                                            >
                                                Cancel
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
                </div>
            </main>
        </div>
    )
}

export default Dashboard
