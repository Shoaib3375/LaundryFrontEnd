import React from 'react'
import { Navigate } from 'react-router-dom'

const RequireAdmin = ({ children }) => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (!user.is_admin) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default RequireAdmin