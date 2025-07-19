// src/components/CreateCouponForm.jsx
import React, { useState, useEffect } from 'react'
import api from '../api'

const CreateCouponForm = ({ onClose, initialData = null, onSuccess }) => {
    const [code, setCode] = useState('')
    const [discount_percent, setDiscountPercent] = useState('')
    const [expires_at, setExpiresAt] = useState('')

    useEffect(() => {
        if (initialData) {
            setCode(initialData.code || '')
            setDiscountPercent(initialData.discount_percent || '')
            setExpiresAt(initialData.expires_at || '')
        }
    }, [initialData])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (initialData) {
                // update
                await api.put(`/coupons/${initialData.id}`, {
                    code,
                    discount_percent,
                    expires_at,
                })
                alert('Coupon updated successfully!')
            } else {
                // create
                await api.post('/coupons', {
                    code,
                    discount_percent,
                    expires_at,
                })
                alert('Coupon created successfully!')
            }

            if (onSuccess) onSuccess()
            onClose()
        } catch (err) {
            alert('Failed to submit coupon form.')
            console.error(err)
        }
    }

    return (
        <div className="bg-white shadow-md rounded p-6 mb-4 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                    {initialData ? 'Edit Coupon' : 'Create Coupon'}
                </h2>
                <button onClick={onClose} className="cursor-pointer p-2 text-red-500">✖</button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="block text-sm font-medium">Code</label>
                    <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="block text-sm font-medium">Discount (%)</label>
                    <input
                        type="number"
                        className="w-full border p-2 rounded"
                        value={discount_percent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        required
                        min={1}
                        max={100}
                    />
                </div>
                <div className="mb-3">
                    <label className="block text-sm font-medium">Expiration Date</label>
                    <input
                        type="date"
                        className="w-full border p-2 rounded"
                        value={expires_at}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    {initialData ? 'Update Coupon' : 'Create Coupon'}
                </button>
            </form>
        </div>
    )
}

export default CreateCouponForm
