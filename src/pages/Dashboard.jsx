import React, { useEffect, useState, useCallback, useRef } from 'react'
import api from '../api'

const Dashboard = () => {
    const [orders, setOrders] = useState([])
    const [services, setServices] = useState([])
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showForm, setShowForm] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [form, setForm] = useState({ service_id: '', quantity: 1, note: '', coupon_code: '' })
    const [couponStatus, setCouponStatus] = useState(null)
    const [discountedPrice, setDiscountedPrice] = useState(0)
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
            // Calculate the final price
            const finalPrice = couponStatus?.valid ? discountedPrice : totalPrice
            
            console.log('Order creation details:')
            console.log('Original price:', totalPrice)
            console.log('Coupon valid:', couponStatus?.valid)
            console.log('Discounted price:', discountedPrice)
            console.log('Final price to send:', finalPrice)
            
            // Prepare order data
            const orderData = { 
                service_id: form.service_id,
                quantity: form.quantity,
                note: form.note,
                total_price: finalPrice
            }
            
            // Add coupon information if valid
            if (couponStatus?.valid && form.coupon_code) {
                orderData.coupon_code = form.coupon_code
                orderData.discount_percent = couponStatus.couponData.discount_percent
                orderData.original_price = totalPrice
                orderData.discount_amount = totalPrice - finalPrice
                
                console.log('Coupon applied:')
                console.log('- Code:', form.coupon_code)
                console.log('- Discount %:', couponStatus.couponData.discount_percent)
                console.log('- Discount amount:', totalPrice - finalPrice)
            }
            
            console.log('Final order data:', orderData)
            
            const res = await api.post('/orders', orderData)
            
            if (res.status === 200 || res.status === 201 || res.data.success) {
                alert(`Order created successfully! ${couponStatus?.valid ? `Saved ${totalPrice - finalPrice}৳ with coupon!` : ''}`)
                setShowForm(false)
                setForm({ service_id: '', quantity: 1, note: '', coupon_code: '' })
                setCouponStatus(null)
                setDiscountedPrice(0)
                fetchOrders()
            } else {
                alert('Failed to create order')
            }
        } catch (err) {
            console.error('Create order error:', err)
            console.error('Error response:', err.response?.data)
            const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to create order'
            alert(errorMessage)
        }
    }

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
            console.error('Cancel order error:', error)
            const errorMessage = error.response?.data?.message || 'Failed to cancel order'
            alert(errorMessage)
        }
    }
    
    const validateCoupon = async () => {
        if (!form.coupon_code.trim()) {
            setCouponStatus(null)
            setDiscountedPrice(0)
            return
        }
        
        try {
            // Use the coupons/validate endpoint
            const res = await api.post('/coupons/validate', {
                code: form.coupon_code,
                amount: totalPrice
            })
            
            // Check if the coupon is valid based on the new response format
            if (res.data.success && res.data.data?.is_valid) {
                // Extract discount percentage from the data object
                const discountPercent = res.data.data.discount_percent
                
                // Calculate discounted price
                const calculatedPrice = totalPrice * (1 - discountPercent / 100)
                const finalPrice = Math.round(calculatedPrice * 100) / 100
                
                setCouponStatus({ 
                    valid: true, 
                    message: `Coupon applied! ${discountPercent}% discount`,
                    couponData: res.data.data
                })
                
                // Set the discounted price
                setDiscountedPrice(finalPrice)
            } else {
                // Invalid coupon
                setCouponStatus({ 
                    valid: false, 
                    message: res.data.message || 'Invalid coupon code' 
                })
                setDiscountedPrice(0)
            }
        } catch (error) {
            console.error('Error validating coupon:', error)
            setCouponStatus({ valid: false, message: 'Error validating coupon' })
            setDiscountedPrice(0)
        }
    }

    const selectedService = services.find(s => s.id === parseInt(form.service_id))
    const totalPrice = selectedService ? selectedService.price * form.quantity : 0
    
    // Update discounted price when total price changes
    useEffect(() => {
        if (couponStatus?.valid && couponStatus.couponData?.discount_percent) {
            const discountPercent = couponStatus.couponData.discount_percent
            const calculatedPrice = totalPrice * (1 - discountPercent / 100)
            const finalPrice = Math.round(calculatedPrice * 100) / 100
            setDiscountedPrice(finalPrice)
        }
    }, [totalPrice])

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
                            <div className="col-span-2">
                                <label className="block text-sm font-medium">Coupon Code</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        name="coupon_code"
                                        value={form.coupon_code}
                                        onChange={handleInputChange}
                                        className="flex-1 border p-2 rounded"
                                        placeholder="Enter coupon code"
                                    />
                                    <button
                                        type="button"
                                        onClick={validateCoupon}
                                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {couponStatus && (
                                    <div className={`mt-1 text-sm ${couponStatus.valid ? 'text-green-600' : 'text-red-600'}`}>
                                        {couponStatus.message}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 font-semibold">
                            {couponStatus?.valid ? (
                                <div>
                                    <span className="text-gray-500 line-through mr-2">{totalPrice}৳</span>
                                    <span className="text-blue-600">{discountedPrice}৳</span>
                                    <span className="ml-2 text-sm text-green-600">(Discounted)</span>
                                </div>
                            ) : (
                                <span>Total: <span className="text-blue-600">{totalPrice}৳</span></span>
                            )}
                        </div>
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
