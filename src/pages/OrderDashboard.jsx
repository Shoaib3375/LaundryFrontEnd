import React, { useEffect, useState, useCallback } from 'react'
import api from '../api'

export default function OrdersDashboard() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [perPage] = useState(10)

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get(`/orders?page=${currentPage}&per_page=${perPage}`)
            setOrders(res.data.data || [])
            setTotalPages(res.data.pagination?.last_page || 1)
        } catch (error) {
            console.error('Error loading orders:', error)
        } finally {
            setLoading(false)
        }
    }, [currentPage, perPage])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">My Orders</h2>
            
            {loading ? (
                <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span>Loading orders...</span>
                </div>
            ) : orders.length > 0 ? (
                <div className="bg-white rounded shadow">
                    <table className="w-full border-collapse border text-sm">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="border p-2">Service</th>
                                <th className="border p-2">Quantity</th>
                                <th className="border p-2">Total</th>
                                <th className="border p-2">Status</th>
                                <th className="border p-2">Payment</th>
                                <th className="border p-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-100">
                                    <td className="border p-2">{order.service?.name || order.service_name}</td>
                                    <td className="border p-2">{order.quantity}</td>
                                    <td className="border p-2">{order.total_price}৳</td>
                                    <td className="border p-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="border p-2">{order.payment_status}</td>
                                    <td className="border p-2">{new Date(order.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center p-4 border-t">
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
                </div>
            ) : (
                <p className="text-gray-600">No orders found.</p>
            )}
        </div>
    )
}
