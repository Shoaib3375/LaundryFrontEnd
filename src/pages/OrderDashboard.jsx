import React, { useEffect, useState } from 'react'
import api from '../api'

export default function OrdersDashboard() {
    const [orders, setOrders] = useState([])

    useEffect(() => {
        api.get('/orders')
            .then(res => setOrders(res.data))
            .catch(err => console.error('Error loading orders:', err))
    }, [])

    return (
        <div>
            <h2>My Orders</h2>
            <ul>
                {orders.map(order => (
                    <li key={order.id}>{order.service_name} - {order.status}</li>
                ))}
            </ul>
        </div>
    )
}
