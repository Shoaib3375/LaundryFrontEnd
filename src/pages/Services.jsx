import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Services() {
    const [services, setServices] = useState([])

    useEffect(() => {
        api.get('/services')
            .then(res => setServices(res.data))
            .catch(err => console.error(err))
    }, [])

    return (
        <div>
            <h3>Available Services</h3>
            <ul>
                {services.map(s => (
                    <li key={s.id}>{s.name} - {s.price}৳</li>
                ))}
            </ul>
        </div>
    )
}
