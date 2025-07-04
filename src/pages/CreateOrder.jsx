// src/pages/CreateOrder.jsx
import React, { useState, useEffect } from 'react'
import api from '../api'

export default function CreateOrder() {
    const [serviceId, setServiceId] = useState('')
    const [services, setServices] = useState([])

    useEffect(() => {
        api.get('/services').then(res => setServices(res.data))
    }, [])

    const submitOrder = async () => {
        try {
            await api.post('/orders', { service_id: serviceId })
            alert("Order created")
        } catch (err) {
            console.error("Order error", err)
        }
    }

    return (
        <div>
            <select value={serviceId} onChange={e => setServiceId(e.target.value)}>
                <option value="">Select Service</option>
                {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
            <button onClick={submitOrder}>Place Order</button>
        </div>
    )
}
