import React from 'react'
import { Navigate } from 'react-router-dom'

const RequireUser = ({ children }) => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (user.is_admin) {
        return <Navigate to="/admin" replace />
    }

    return children
}

export default RequireUser