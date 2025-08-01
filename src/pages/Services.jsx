import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Services() {
    const [services, setServices] = useState([])
    const [selectedServices, setSelectedServices] = useState([{ service_id: '', quantity: '' }])
    const [isGuest, setIsGuest] = useState(false)
    const [guestInfo, setGuestInfo] = useState({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        guest_address: '',
        note: ''
    })

    useEffect(() => {
        api.get('/services')
            .then(res => setServices(res.data))
            .catch(err => console.error(err))
    }, [])

    const addService = () => {
        setSelectedServices(prev => [...prev, { service_id: '', quantity: '' }])
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

    const createOrder = () => {
        const validServices = selectedServices.filter(s => s.service_id && s.quantity && parseFloat(s.quantity) > 0)
        
        if (validServices.length === 0) {
            alert('Please add at least one service with quantity')
            return
        }

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

        const payload = {
            services: servicesArray,
            total_price: totalPrice,
            ...(isGuest && {
                guest_name: guestInfo.guest_name,
                guest_email: guestInfo.guest_email,
                guest_phone: guestInfo.guest_phone,
                guest_address: guestInfo.guest_address,
                note: guestInfo.note
            })
        }

        const endpoint = isGuest ? '/guest-order' : '/orders'
        
        api.post(endpoint, payload)
            .then(() => {
                alert('Order created successfully!')
                setSelectedServices([{ service_id: '', quantity: '' }])
                if (isGuest) {
                    setGuestInfo({ guest_name: '', guest_email: '', guest_phone: '', guest_address: '', note: '' })
                }
            })
            .catch(err => {
                console.error('Order creation failed:', err.response?.data || err.message)
                alert(`Failed to create order: ${err.response?.data?.message || err.message}`)
            })
    }

    const totalPrice = selectedServices.reduce((sum, s) => {
        const service = services.find(srv => srv.id == s.service_id)
        const quantity = parseFloat(s.quantity) || 0
        const price = parseFloat(service?.price) || 0
        return sum + (price * quantity)
    }, 0)

    return (
        <div>
            <h3>Create Order</h3>
            
            <div style={{ marginBottom: '20px' }}>
                <label>
                    <input
                        type="checkbox"
                        checked={isGuest}
                        onChange={e => setIsGuest(e.target.checked)}
                    />
                    Order as Guest
                </label>
            </div>

            {selectedServices.map((service, index) => (
                <div key={index} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc' }}>
                    <select
                        value={service.service_id}
                        onChange={e => updateService(index, 'service_id', e.target.value)}
                        style={{ marginRight: '10px', padding: '5px' }}
                    >
                        <option value="">Select Service</option>
                        {services.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name} - {s.price}৳ ({s.category})
                            </option>
                        ))}
                    </select>
                    
                    <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="Quantity"
                        value={service.quantity}
                        onChange={e => updateService(index, 'quantity', e.target.value)}
                        style={{ marginRight: '10px', padding: '5px', width: '100px' }}
                        required
                    />
                    
                    {selectedServices.length > 1 && (
                        <button onClick={() => removeService(index)} style={{ padding: '5px', backgroundColor: '#dc3545', color: 'white', border: 'none' }}>
                            Remove
                        </button>
                    )}
                </div>
            ))}
            
            <button onClick={addService} style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
                Add Another Service
            </button>
            
            {selectedServices.length > 0 && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
                    <h4>Order Summary:</h4>
                    {selectedServices.map((service, index) => {
                        const serviceData = services.find(s => s.id == service.service_id)
                        const quantity = parseFloat(service.quantity) || 0
                        const price = parseFloat(serviceData?.price) || 0
                        if (!serviceData || !service.quantity || quantity <= 0) return null
                        return (
                            <div key={index}>
                                {serviceData.name} x {service.quantity} = {(price * quantity).toFixed(2)}৳
                            </div>
                        )
                    })}
                    <div><strong>Total: {totalPrice.toFixed(2)}৳</strong></div>
                    
                    {isGuest && (
                        <div style={{ marginTop: '15px' }}>
                            <h4>Guest Information:</h4>
                            <input
                                type="text"
                                placeholder="Name"
                                value={guestInfo.guest_name}
                                onChange={e => setGuestInfo(prev => ({ ...prev, guest_name: e.target.value }))}
                                style={{ display: 'block', margin: '5px 0', padding: '5px', width: '200px' }}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={guestInfo.guest_email}
                                onChange={e => setGuestInfo(prev => ({ ...prev, guest_email: e.target.value }))}
                                style={{ display: 'block', margin: '5px 0', padding: '5px', width: '200px' }}
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={guestInfo.guest_phone}
                                onChange={e => setGuestInfo(prev => ({ ...prev, guest_phone: e.target.value }))}
                                style={{ display: 'block', margin: '5px 0', padding: '5px', width: '200px' }}
                            />
                            <input
                                type="text"
                                placeholder="Address"
                                value={guestInfo.guest_address}
                                onChange={e => setGuestInfo(prev => ({ ...prev, guest_address: e.target.value }))}
                                style={{ display: 'block', margin: '5px 0', padding: '5px', width: '200px' }}
                            />
                            <textarea
                                placeholder="Note (optional)"
                                value={guestInfo.note}
                                onChange={e => setGuestInfo(prev => ({ ...prev, note: e.target.value }))}
                                style={{ display: 'block', margin: '5px 0', padding: '5px', width: '200px', height: '60px' }}
                            />
                        </div>
                    )}
                    
                    <button onClick={createOrder} style={{ marginTop: '10px', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none' }}>
                        {isGuest ? 'Place Guest Order' : 'Create Order'}
                    </button>
                </div>
            )}
        </div>
    )
}
