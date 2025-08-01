import React, { useEffect, useState, useCallback, useRef } from 'react'
import api from '../api'

const Dashboard = () => {
    const [orders, setOrders] = useState([])
    const [services, setServices] = useState([])
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showForm, setShowForm] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [form, setForm] = useState({ note: '', coupon_code: '', delivery_address_id: '' })
    const [selectedServices, setSelectedServices] = useState([{ service_id: '', quantity: 1 }])
    const [addresses, setAddresses] = useState([])
    const [couponStatus, setCouponStatus] = useState(null)
    const [discountedPrice, setDiscountedPrice] = useState(0)
    const [statusFilter, setStatusFilter] = useState('All')
    const [loading, setLoading] = useState(true)

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [perPage] = useState(10)
    const [activeTab, setActiveTab] = useState('orders')
    const [profile, setProfile] = useState(null)
    const [profileForm, setProfileForm] = useState({ name: '', email: '' })
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)
    const [addressForm, setAddressForm] = useState({
        type: 'home',
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        is_default: false
    })

    const user = JSON.parse(localStorage.getItem('user'))
    const notificationRef = useRef(null)

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
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }, [statusFilter, currentPage, perPage])

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

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [statusFilter])

    useEffect(() => {
        fetchOrders()
        api.get('/services').then(res => setServices(res.data.data || []))
        fetchProfile()
        fetchNotifications()

    }, [fetchOrders, user])

    const toggleForm = () => setShowForm(!showForm)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const addService = () => {
        setSelectedServices(prev => [...prev, { service_id: '', quantity: 1 }])
    }

    const removeService = (index) => {
        setSelectedServices(prev => prev.filter((_, i) => i !== index))
    }

    const updateService = (index, field, value) => {
        setSelectedServices(prev => {
            const updated = [...prev]
            updated[index][field] = value
            return updated
        })
    }

    const createOrder = async (e) => {
        e.preventDefault()
        
        const validServices = selectedServices.filter(s => s.service_id && s.quantity && parseFloat(s.quantity) > 0)
        
        if (validServices.length === 0) {
            alert('Please add at least one service with quantity')
            return
        }

        try {
            const servicesArray = validServices.map(s => {
                const service = services.find(srv => srv.id == s.service_id)
                const quantity = parseFloat(s.quantity)
                const unitPrice = parseFloat(service?.price) || 0
                const totalPrice = unitPrice * quantity
                
                return {
                    service_id: parseInt(s.service_id),
                    quantity: quantity,
                    unit_price: unitPrice,
                    total_price: totalPrice
                }
            })

            const orderData = {
                services: servicesArray,
                total_price: totalPrice,
                note: form.note,
                delivery_address_id: form.delivery_address_id
            }
            
            if (couponStatus?.valid && form.coupon_code) {
                orderData.coupon_code = form.coupon_code
            }
            
            const res = await api.post('/orders', orderData)
            
            if (res.status === 200 || res.status === 201 || res.data.success) {
                alert('Order created successfully!')
                setShowForm(false)
                setForm({ note: '', coupon_code: '', delivery_address_id: '' })
                setSelectedServices([{ service_id: '', quantity: 1 }])
                setCouponStatus(null)
                setDiscountedPrice(0)
                fetchOrders()
            } else {
                alert('Failed to create order')
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create order'
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
            alert('Failed to cancel order')
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
            setCouponStatus({ valid: false, message: 'Error validating coupon' })
            setDiscountedPrice(0)
        }
    }

    const totalPrice = selectedServices.reduce((sum, s) => {
        const service = services.find(srv => srv.id == s.service_id)
        return sum + (service?.price || 0) * parseFloat(s.quantity || 0)
    }, 0)
    
    // Update discounted price when total price changes
    useEffect(() => {
        if (couponStatus?.valid && couponStatus.couponData?.discount_percent) {
            const discountPercent = couponStatus.couponData.discount_percent
            const calculatedPrice = totalPrice * (1 - discountPercent / 100)
            const finalPrice = Math.round(calculatedPrice * 100) / 100
            setDiscountedPrice(finalPrice)
        }
    }, [totalPrice])

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile')
            setProfile(res.data.data.user)
            setAddresses(res.data.data.addresses || [])
            setProfileForm({
                name: res.data.data.user.name,
                email: res.data.data.user.email
            })
        } catch (error) {
            alert('Failed to fetch profile')
        }
    }

    const updateProfile = async (e) => {
        e.preventDefault()
        try {
            await api.put('/profile', profileForm)
            alert('Profile updated successfully')
            fetchProfile()
        } catch (error) {
            alert('Failed to update profile')
        }
    }

    const saveAddress = async (e) => {
        e.preventDefault()
        try {
            if (editingAddress) {
                await api.put(`/profile/addresses/${editingAddress.id}`, addressForm)
                alert('Address updated successfully')
            } else {
                await api.post('/profile/addresses', addressForm)
                alert('Address added successfully')
            }
            setShowAddressForm(false)
            setEditingAddress(null)
            resetAddressForm()
            fetchProfile()
        } catch (error) {
            alert('Failed to save address')
        }
    }

    const deleteAddress = async (id) => {
        if (!window.confirm('Delete this address?')) return
        try {
            await api.delete(`/profile/addresses/${id}`)
            alert('Address deleted successfully')
            fetchProfile()
        } catch (error) {
            alert('Failed to delete address')
        }
    }

    const editAddress = (address) => {
        setEditingAddress(address)
        setAddressForm({
            type: address.type,
            street_address: address.street_address,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country,
            is_default: address.is_default
        })
        setShowAddressForm(true)
    }

    const resetAddressForm = () => {
        setAddressForm({
            type: 'home',
            street_address: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'US',
            is_default: false
        })
    }

    const cancelAddressForm = () => {
        setShowAddressForm(false)
        setEditingAddress(null)
        resetAddressForm()
    }

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
            <aside className="w-72 bg-white shadow-xl border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">eLaundry</h2>
                    <p className="text-sm text-gray-500 mt-1">Customer Portal</p>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    <button 
                        onClick={() => setActiveTab('orders')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                        </svg>
                        <span>Dashboard</span>
                    </button>
                    
                    <button 
                        onClick={toggleForm} 
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${showForm ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"></path>
                        </svg>
                        <span>{showForm ? 'Hide Order Form' : 'Create New Order'}</span>
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                        <span>Profile & Settings</span>
                    </button>
                </nav>
                
                <div className="p-4 border-t border-gray-200">
                    <button 
                        onClick={() => {
                            localStorage.removeItem('token')
                            localStorage.removeItem('user')
                            window.location.reload()
                        }} 
                        className="w-full text-left text-red-600 px-4 py-3 rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center space-x-3"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"></path>
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name}!</h1>
                        <p className="text-gray-600 mt-1">Manage your laundry orders and profile</p>
                    </div>
                    
                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)} 
                            className="relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-gray-600 hover:text-blue-600"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">{unreadCount}</span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 mt-4 w-80 bg-white shadow-2xl border border-gray-200 rounded-xl z-50 overflow-hidden">
                                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAllAsRead();
                                            }} 
                                            className="text-xs text-blue-600 hover:text-blue-800 bg-white px-2 py-1 rounded-full transition-colors"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">
                                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"></path>
                                        </svg>
                                        No notifications yet
                                    </div>
                                ) : (
                                    <ul className="max-h-64 overflow-auto">
                                        {notifications.map((n, i) => (
                                            <li key={n.id || i} className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${n.read_at ? 'text-gray-500' : 'text-gray-800 bg-blue-50'}`}>
                                                <div className="text-sm">{n.message}</div>
                                                <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
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
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                            <h2 className="text-2xl font-bold text-white flex items-center">
                                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"></path>
                                </svg>
                                Create New Order
                            </h2>
                            <p className="text-blue-100 mt-1">Select services and quantities for your laundry order</p>
                        </div>
                        
                        <form className="p-6" onSubmit={createOrder}>
                        
                            {/* Services Section */}
                            <div className="mb-6">
                                <label className="block text-lg font-semibold text-gray-800 mb-4">Select Services</label>
                                
                                <div className="space-y-3">
                                    {selectedServices.map((service, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                                            <div className="flex gap-3 items-center">
                                                <div className="flex-1">
                                                    <select
                                                        value={service.service_id}
                                                        onChange={e => updateService(index, 'service_id', e.target.value)}
                                                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                        required
                                                    >
                                                        <option value="">Choose a service...</option>
                                                        {services.map(s => (
                                                            <option key={s.id} value={s.id}>
                                                                {s.name} - {s.price}৳ ({s.category})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                
                                                <div className="w-32">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        min="0.1"
                                                        placeholder="Qty"
                                                        value={service.quantity}
                                                        onChange={e => updateService(index, 'quantity', e.target.value)}
                                                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center"
                                                        required
                                                    />
                                                </div>
                                                
                                                {selectedServices.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeService(index)}
                                                        className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                        title="Remove service"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={addService}
                                    className="mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>Add Another Service</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Address</label>
                                    <select
                                        name="delivery_address_id"
                                        value={form.delivery_address_id}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    >
                                        <option value="">Choose delivery address...</option>
                                        {addresses.map(addr => (
                                            <option key={addr.id} value={addr.id}>
                                                {addr.type}: {addr.street_address}, {addr.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Coupon Code (Optional)</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            name="coupon_code"
                                            value={form.coupon_code}
                                            onChange={handleInputChange}
                                            className="flex-1 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter coupon code"
                                        />
                                        <button
                                            type="button"
                                            onClick={validateCoupon}
                                            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {couponStatus && (
                                        <div className={`mt-2 p-2 rounded-lg text-sm ${couponStatus.valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {couponStatus.message}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions (Optional)</label>
                                    <textarea
                                        name="note"
                                        value={form.note}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        rows={3}
                                        placeholder="Any special instructions for your order..."
                                    />
                                </div>
                            </div>
                        
                            {/* Order Summary */}
                            {selectedServices.some(s => s.service_id && s.quantity) && (
                                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        Order Summary
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedServices.map((service, index) => {
                                            const serviceData = services.find(s => s.id == service.service_id)
                                            if (!serviceData || !service.quantity) return null
                                            return (
                                                <div key={index} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg">
                                                    <span className="text-gray-700">{serviceData.name} x {service.quantity}</span>
                                                    <span className="font-semibold text-gray-800">{(serviceData.price * service.quantity).toFixed(2)}৳</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-blue-200">
                                        {couponStatus?.valid ? (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>Subtotal:</span>
                                                    <span className="line-through">{totalPrice.toFixed(2)}৳</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-green-600">
                                                    <span>Discount:</span>
                                                    <span>-{(totalPrice - discountedPrice).toFixed(2)}৳</span>
                                                </div>
                                                <div className="flex justify-between text-lg font-bold text-gray-800">
                                                    <span>Total:</span>
                                                    <span className="text-blue-600">{discountedPrice.toFixed(2)}৳</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between text-lg font-bold text-gray-800">
                                                <span>Total:</span>
                                                <span className="text-blue-600">{totalPrice.toFixed(2)}৳</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            <div className="mt-8 flex justify-end">
                                <button 
                                    type="submit" 
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 text-lg font-semibold"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>Place Order</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'orders' ? (
                    <>
                        {/* Orders Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
                                <p className="text-gray-600 mt-1">Track and manage your laundry orders</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <label className="text-sm font-medium text-gray-700">Filter by status:</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                                >
                                    <option value="All">All Orders</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                            <span className="text-gray-600">Loading your orders...</span>
                        </div>
                    ) : Array.isArray(orders) && orders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Services</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                        </svg>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-gray-900">#{order.id}</div>
                                                        <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    {order.order_items?.length > 0 ? (
                                                        order.order_items.map((item, index) => (
                                                            <div key={index} className="text-sm">
                                                                <span className="font-medium text-gray-900">{item.service?.name}</span>
                                                                <span className="text-gray-500 ml-2">x {item.quantity}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-sm">
                                                            <span className="font-medium text-gray-900">{order.service?.name}</span>
                                                            <span className="text-gray-500 ml-2">x {order.quantity}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-lg font-bold text-gray-900">{order.total_price}৳</div>
                                                <div className="text-xs text-gray-500">{order.payment_status || 'Pending Payment'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                                    order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.status === 'Pending' && (
                                                    <button
                                                        onClick={() => cancelOrder(order.id)}
                                                        className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                            <p className="text-gray-500">Create your first order to get started!</p>
                        </div>
                    )}
                    
                    {/* Pagination */}
                    {!loading && orders.length > 0 && totalPages > 1 && (
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
                    </>
                ) : (
                    /* Profile Section */
                    <div>
                        <h1 className="text-2xl font-semibold mb-6">Profile Settings</h1>

                        {/* Profile Form */}
                        <div className="bg-white p-6 rounded shadow mb-6">
                            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                            <form onSubmit={updateProfile} className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full border p-2 rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full border p-2 rounded"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                        Update Profile
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Addresses */}
                        <div className="bg-white p-6 rounded shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Delivery Addresses</h2>
                                <button
                                    onClick={() => setShowAddressForm(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Add Address
                                </button>
                            </div>

                            {addresses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addresses.map(address => (
                                        <div key={address.id} className="border p-4 rounded">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-medium capitalize">{address.type}</span>
                                                {address.is_default && (
                                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Default</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {address.street_address}<br/>
                                                {address.city}, {address.state} {address.postal_code}<br/>
                                                {address.country}
                                            </p>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => editAddress(address)}
                                                    className="text-blue-600 hover:underline text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteAddress(address.id)}
                                                    className="text-red-600 hover:underline text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600">No addresses added yet.</p>
                            )}
                        </div>
                    </div>
                )}
                {/* Address Form Modal */}
                {showAddressForm && (
                    <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50" onClick={cancelAddressForm}>
                        <div className="bg-white p-6 rounded shadow-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold mb-4">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </h3>
                            <form onSubmit={saveAddress} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select
                                        value={addressForm.type}
                                        onChange={(e) => setAddressForm(prev => ({ ...prev, type: e.target.value }))}
                                        className="w-full border p-2 rounded"
                                    >
                                        <option value="home">Home</option>
                                        <option value="work">Work</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Street Address</label>
                                    <input
                                        type="text"
                                        value={addressForm.street_address}
                                        onChange={(e) => setAddressForm(prev => ({ ...prev, street_address: e.target.value }))}
                                        className="w-full border p-2 rounded"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">City</label>
                                        <input
                                            type="text"
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                                            className="w-full border p-2 rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">State</label>
                                        <input
                                            type="text"
                                            value={addressForm.state}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                                            className="w-full border p-2 rounded"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Postal Code</label>
                                        <input
                                            type="text"
                                            value={addressForm.postal_code}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, postal_code: e.target.value }))}
                                            className="w-full border p-2 rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Country</label>
                                        <input
                                            type="text"
                                            value={addressForm.country}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                                            className="w-full border p-2 rounded"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={addressForm.is_default}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, is_default: e.target.checked }))}
                                            className="mr-2"
                                        />
                                        Set as default address
                                    </label>
                                </div>
                                <div className="flex space-x-2">
                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                        {editingAddress ? 'Update' : 'Add'} Address
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelAddressForm}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Dashboard
