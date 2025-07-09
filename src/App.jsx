// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import RequireAuth from './components/RequireAuth'
import GuestLanding from './pages/GuestLanding' // Add this import

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<GuestLanding />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Signup />} />
                <Route path="/dashboard" element={
                    <RequireAuth>
                        <Dashboard />
                    </RequireAuth>
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default App
