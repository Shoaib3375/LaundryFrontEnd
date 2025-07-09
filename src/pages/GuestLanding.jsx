import React, { useEffect, useState } from 'react'
import './GuestLanding.css'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function GuestLanding() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedService, setSelectedService] = useState('')

    useEffect(() => {
        // Set minimum date to today
        const pickupDateElement = document.getElementById('pickupDate')
        if (pickupDateElement) {
            pickupDateElement.min = new Date().toISOString().split('T')[0]
        }

        // Smooth scrolling for navigation links
        const handleSmoothScroll = (e) => {
            e.preventDefault()
            const target = document.querySelector(e.target.getAttribute('href'))
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' })
            }
        }

        const navLinks = document.querySelectorAll('a[href^="#"]')
        navLinks.forEach(anchor => {
            anchor.addEventListener('click', handleSmoothScroll)
        })

        // Header scroll effect
        const handleHeaderScroll = () => {
            const header = document.querySelector('header')
            if (header) {
                if (window.scrollY > 100) {
                    header.style.background = 'rgba(255, 255, 255, 0.95)'
                    header.style.color = '#333'
                } else {
                    header.style.background = 'rgba(255, 255, 255, 0.1)'
                    header.style.color = 'white'
                }
            }
        }

        window.addEventListener('scroll', handleHeaderScroll)

        // Cleanup event listeners
        return () => {
            navLinks.forEach(anchor => {
                anchor.removeEventListener('click', handleSmoothScroll)
            })
            window.removeEventListener('scroll', handleHeaderScroll)
        }
    }, [])

    const services = [
        {
            icon: '👔',
            title: 'Dry Cleaning',
            desc: 'Professional dry cleaning for delicate fabrics and formal wear. Expert care for your precious garments.',
            price: '$15 per item',
            type: 'dry-cleaning'
        },
        {
            icon: '👕',
            title: 'Wash & Fold',
            desc: 'Complete wash and fold service for everyday clothing. Fresh, clean, and perfectly folded.',
            price: '$2.50 per lb',
            type: 'wash-fold'
        },
        {
            icon: '👗',
            title: 'Ironing & Pressing',
            desc: 'Professional ironing and pressing service to keep your clothes wrinkle-free and crisp.',
            price: '$5 per item',
            type: 'ironing'
        },
        {
            icon: '🛏️',
            title: 'Bedding & Linens',
            desc: 'Special care for bedding, curtains, and household linens. Deep cleaning and fresh scent.',
            price: '$12 per set',
            type: 'bedding'
        }
    ]

    const timeSlots = [
        { value: '9:00', label: '9:00 AM' },
        { value: '10:00', label: '10:00 AM' },
        { value: '11:00', label: '11:00 AM' },
        { value: '12:00', label: '12:00 PM' },
        { value: '13:00', label: '1:00 PM' },
        { value: '14:00', label: '2:00 PM' },
        { value: '15:00', label: '3:00 PM' },
        { value: '16:00', label: '4:00 PM' },
        { value: '17:00', label: '5:00 PM' }
    ]

    const selectService = (serviceType) => {
        setSelectedService(serviceType)
        const bookingSection = document.getElementById('booking')
        if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const handleBooking = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const bookingData = Object.fromEntries(formData.entries())

        // In a real application, you would send this data to your backend
        console.log('Booking Data:', bookingData)

        // Show success modal
        setIsModalOpen(true)

        // Reset form
        e.target.reset()
        setSelectedService('')
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    // Close modal when clicking outside
    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal()
        }
    }

    return (
        <>
            {/* HEADER */}
            <header>
                <nav className="container">
                    <a href="#" className="logo">🧺 CleanWave</a>
                    <ul className="nav-links">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#services">Services</a></li>
                        <li><a href="#booking">Book Now</a></li>
                        <li><a href="#contact">Contact</a></li>
                        <li><Link to="/login" className="auth-btn">Login</Link></li>
                        <li><Link to="/register" className="auth-btn">Register</Link></li>
                    </ul>

                </nav>
            </header>

            {/* HERO */}
            <section className="hero" id="home">
                <div className="container">
                    <h1>Premium Laundry Service</h1>
                    <p>Fresh, clean, and delivered right to your door. Experience the convenience of professional laundry care.</p>
                    <a href="#booking" className="cta-button">Book Service Now</a>
                </div>
            </section>

            {/* SERVICES */}
            <section className="services" id="services">
                <div className="container">
                    <h2>Our Services</h2>
                    <div className="services-grid">
                        {services.map(({ icon, title, desc, price, type }) => (
                            <div className="service-card" key={type}>
                                <div className="service-icon">{icon}</div>
                                <h3>{title}</h3>
                                <p>{desc}</p>
                                <div className="price">{price}</div>
                                <button
                                    className="cta-button"
                                    onClick={() => selectService(type)}
                                >
                                    Select Service
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BOOKING */}
            <section className="booking-section" id="booking">
                <div className="container">
                    <form className="booking-form" onSubmit={handleBooking}>
                        <h2>Book Your Laundry Service</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input type="text" id="firstName" name="firstName" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input type="text" id="lastName" name="lastName" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" name="email" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input type="tel" id="phone" name="phone" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Pickup Address</label>
                            <textarea id="address" name="address" rows="3" required></textarea>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="service">Service Type</label>
                                <select
                                    name="service"
                                    id="service"
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
                                    required
                                >
                                    <option value="">Select a service</option>
                                    <option value="dry-cleaning">Dry Cleaning</option>
                                    <option value="wash-fold">Wash & Fold</option>
                                    <option value="ironing">Ironing & Pressing</option>
                                    <option value="bedding">Bedding & Linens</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="quantity">Quantity/Weight</label>
                                <input type="number" id="quantity" name="quantity" min="1" required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="pickupDate">Pickup Date</label>
                                <input type="date" id="pickupDate" name="pickupDate" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="pickupTime">Pickup Time</label>
                                <select id="pickupTime" name="pickupTime" required>
                                    <option value="">Select time</option>
                                    {timeSlots.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="notes">Special Instructions</label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows="3"
                                placeholder="Any special care instructions or preferences..."
                            ></textarea>
                        </div>
                        <button type="submit" className="submit-button">Book Service</button>
                    </form>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="features">
                <div className="container">
                    <h2>Why Choose CleanWave?</h2>
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">🚚</div>
                            <h3>Free Pickup & Delivery</h3>
                            <p>Convenient pickup and delivery service right to your doorstep</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">⚡</div>
                            <h3>Fast Turnaround</h3>
                            <p>24-48 hour service for most items with express options available</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🌱</div>
                            <h3>Eco-Friendly</h3>
                            <p>Environmentally conscious cleaning with biodegradable products</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🛡️</div>
                            <h3>Satisfaction Guarantee</h3>
                            <p>100% satisfaction guarantee or we'll re-clean for free</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer id="contact">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h3>Contact Info</h3>
                            <p>📧 info@cleanwave.com</p>
                            <p>📱 (555) 123-4567</p>
                            <p>📍 123 Clean Street, City, State 12345</p>
                        </div>
                        <div className="footer-section">
                            <h3>Service Hours</h3>
                            <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
                            <p>Saturday: 9:00 AM - 6:00 PM</p>
                            <p>Sunday: 10:00 AM - 4:00 PM</p>
                        </div>
                        <div className="footer-section">
                            <h3>Quick Links</h3>
                            <a href="#services">Our Services</a>
                            <a href="#booking">Book Now</a>
                            <a href="#">Pricing</a>
                            <a href="#">FAQ</a>
                        </div>
                    </div>
                    <p>&copy; 2025 CleanWave Laundry Service. All rights reserved.</p>
                </div>
            </footer>

            {/* SUCCESS MODAL */}
            {isModalOpen && (
                <div className="modal" onClick={handleModalClick}>
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>🎉 Booking Confirmed!</h2>
                        <p>Thank you for choosing CleanWave! Your laundry service has been booked successfully.</p>
                        <p>We'll send you a confirmation email shortly with pickup details.</p>
                        <button className="cta-button" onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </>
    )
}