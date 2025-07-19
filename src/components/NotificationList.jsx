// src/components/NotificationList.jsx
import React, { useEffect, useState } from 'react'
import api from '../api'

const NotificationList = () => {
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications')
            setNotifications(res.data.data || res.data)
        } catch (err) {
            console.error('Failed to fetch notifications', err)
        }
    }

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/read`)
            fetchNotifications()
        } catch (err) {
            console.error('Failed to mark notification as read', err)
        }
    }

    const markAllAsRead = async () => {
        try {
            await api.post(`/notifications/read-all`)
            fetchNotifications()
        } catch (err) {
            console.error('Failed to mark all as read', err)
        }
    }

    return (
        <div className="bg-white rounded shadow p-4">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <button onClick={markAllAsRead} className="text-sm text-blue-600">Mark All as Read</button>
            </div>
            <ul>
                {notifications.length === 0 && <li className="text-sm text-gray-500">No notifications.</li>}
                {notifications.map((notification) => (
                    <li
                        key={notification.id}
                        className={`p-2 mb-2 rounded ${notification.read_at ? 'bg-gray-100' : 'bg-blue-100'}`}
                    >
                        <div className="flex justify-between items-center">
                            <span>{notification.message}</span>
                            {!notification.read_at && (
                                <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-sm text-blue-500"
                                >
                                    Mark as Read
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default NotificationList
