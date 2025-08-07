// src/App.jsx
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'

import RequireAdmin from './components/RequireAdmin'
import RequireUser from './components/RequireUser'
import GuestLanding from './pages/GuestLanding'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<GuestLanding/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Signup/>}/>

                <Route
                    path="/dashboard"
                    element={
                        <RequireUser>
                            <Dashboard/>
                        </RequireUser>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <RequireAdmin>
                            <AdminDashboard/>
                        </RequireAdmin>
                    }
                />


            </Routes>
        </BrowserRouter>
    )
}

export default App
