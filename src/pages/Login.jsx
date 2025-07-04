// src/pages/Login.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()

        try {
            const res = await api.post('/login', { email, password })
            const token = res.data.data.token

            localStorage.setItem('token', token)

            alert('Login successful')
            navigate('/Dashboard')
        } catch (err) {
            alert('Login failed')
        }
    }

    return (
        <form onSubmit={handleLogin}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            <button type="submit">Login</button>
        </form>
    )
}
