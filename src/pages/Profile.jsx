import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Profile() {
    const [profile, setProfile] = useState(null)
    const [addresses, setAddresses] = useState([])
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)
    const [profileForm, setProfileForm] = useState({ name: '', email: '' })
    const [addressForm, setAddressForm] = useState({
        type: 'home',
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        is_default: false
    })

    useEffect(() => {
        fetchProfile()
    }, [])

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

    if (!profile) return <div>Loading...</div>

    return (
        <div className="min-h-screen flex bg-gray-100">
            <aside className="w-64 bg-white p-6 shadow-md flex flex-col space-y-4">
                <h2 className="text-xl font-bold text-blue-600 mb-4">eLaundry Panel</h2>
                <button className="text-left px-4 py-2 rounded hover:bg-blue-100">Dashboard</button>
                <button className="text-left px-4 py-2 rounded bg-blue-100 text-blue-600">Profile</button>
                <button className="text-left px-4 py-2 rounded hover:bg-blue-100">My Orders</button>
                <button onClick={() => {
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    window.location.reload()
                }} className="mt-auto text-left text-red-600 px-4 py-2 rounded hover:bg-red-100">Logout</button>
            </aside>

            <main className="flex-1 p-6">
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

                {/* Address Form Modal */}
                {showAddressForm && (
                    <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
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