import React, {useState, useEffect} from 'react';
import {
    Package, Clock, Users, BarChart3, CheckCircle, Star, ArrowRight, Menu, X, Smartphone, Shield, Zap, ShoppingCart
} from 'lucide-react';
import {Link} from 'react-router-dom'
import api from '../api'

const LaundryLandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [services, setServices] = useState([]);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orderStep, setOrderStep] = useState(1);
    const [selectedServices, setSelectedServices] = useState([{ service_id: '', quantity: '' }]);
    const [formData, setFormData] = useState({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        guest_address: '',
        note: ''
    });
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [errors, setErrors] = useState({});

    const addService = () => {
        setSelectedServices(prev => [...prev, { service_id: '', quantity: '' }]);
    };

    const removeService = (index) => {
        setSelectedServices(prev => prev.filter((_, i) => i !== index));
    };

    const updateService = (index, field, value) => {
        setSelectedServices(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const handleNextStep = () => {
        const validServices = selectedServices.filter(s => s.service_id && s.quantity && parseFloat(s.quantity) > 0);
        
        if (validServices.length === 0) {
            alert('Please add at least one service with quantity');
            return;
        }
        
        setOrderStep(2);
    };

    const handleBackStep = () => {
        setOrderStep(1);
    };

    useEffect(() => {
        // Create a request without auth token for public services
        fetch(`${import.meta.env.VITE_API_BASE_URL}/services`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log('Services API response:', data);
            const servicesData = data.data || data || [];
            setServices(Array.isArray(servicesData) ? servicesData : []);
        })
        .catch(err => console.error('Services API error:', err));
    }, []);

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        
        const validServices = selectedServices.filter(s => s.service_id && s.quantity && parseFloat(s.quantity) > 0);
        
        if (validServices.length === 0) {
            alert('Please add at least one service with quantity');
            return;
        }

        const servicesArray = validServices.map(s => {
            const service = services.find(srv => srv.id == s.service_id);
            const quantity = parseFloat(s.quantity);
            const unitPrice = parseFloat(service?.price) || 0;
            const totalPrice = unitPrice * quantity;
            
            return {
                service_id: parseInt(s.service_id),
                quantity: quantity,
                unit_price: unitPrice,
                total_price: totalPrice
            };
        });

        const payload = {
            services: servicesArray,
            total_price: totalPrice,
            ...formData
        };
        
        try {
            const response = await api.post('/guest/orders', payload);
            setOrderSuccess(response.data.data);
            setSelectedServices([{ service_id: '', quantity: '' }]);
            setFormData({
                guest_name: '',
                guest_email: '',
                guest_phone: '',
                guest_address: '',
                note: ''
            });
            setShowOrderForm(false);
            setOrderStep(1);
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        }
    };

    const totalPrice = selectedServices.reduce((sum, s) => {
        const service = services.find(srv => srv.id == s.service_id);
        const quantity = parseFloat(s.quantity) || 0;
        const price = parseFloat(service?.price) || 0;
        return sum + (price * quantity);
    }, 0);

    const features = [{
        icon: <Package className="w-8 h-8 text-blue-600"/>,
        title: "Order Management",
        description: "Track every order from pickup to delivery with real-time status updates and automated notifications."
    }, {
        icon: <Users className="w-8 h-8 text-green-600"/>,
        title: "Customer Database",
        description: "Maintain detailed customer profiles with order history, preferences, and contact information."
    }, {
        icon: <BarChart3 className="w-8 h-8 text-purple-600"/>,
        title: "Analytics & Reports",
        description: "Gain insights into your business performance with comprehensive analytics and financial reports."
    }, {
        icon: <Clock className="w-8 h-8 text-orange-600"/>,
        title: "Scheduling System",
        description: "Optimize pickup and delivery schedules with intelligent routing and capacity planning."
    }, {
        icon: <Smartphone className="w-8 h-8 text-pink-600"/>,
        title: "Mobile Ready",
        description: "Access your laundry management system from anywhere with our responsive mobile interface."
    }, {
        icon: <Shield className="w-8 h-8 text-indigo-600"/>,
        title: "Secure & Reliable",
        description: "Your data is protected with enterprise-grade security and automatic backups."
    }];

    const testimonials = [{
        name: "Sarah Johnson",
        role: "Owner, Clean & Fresh Laundry",
        content: "LaundryPro transformed our business operations. We've increased efficiency by 40% and customer satisfaction has never been higher.",
        rating: 5
    }, {
        name: "Michael Chen",
        role: "Manager, Express Wash",
        content: "The automated scheduling and customer management features have saved us countless hours every week. Highly recommended!",
        rating: 5
    }, {
        name: "Emma Rodriguez",
        role: "CEO, Sparkle Cleaners",
        content: "From order tracking to financial reports, LaundryPro handles everything seamlessly. It's like having a digital assistant for our entire operation.",
        rating: 5
    }];

    const pricingPlans = [{
        name: "Starter",
        price: "$29",
        period: "/month",
        features: ["Up to 100 orders/month", "Basic customer management", "Order tracking", "Email support", "Mobile app access"],
        popular: false
    }, {
        name: "Professional",
        price: "$79",
        period: "/month",
        features: ["Up to 500 orders/month", "Advanced analytics", "Automated scheduling", "SMS notifications", "Priority support", "Custom reports"],
        popular: true
    }, {
        name: "Enterprise",
        price: "$199",
        period: "/month",
        features: ["Unlimited orders", "Multi-location support", "API access", "Custom integrations", "24/7 phone support", "Dedicated account manager"],
        popular: false
    }];

    return (<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Package className="w-8 h-8 text-blue-600 mr-3"/>
                        <span
                            className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LaundryPro
              </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features"
                           className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
                        <a href="#order"
                           className="text-gray-700 hover:text-blue-600 transition-colors">Order Now</a>
                        <a href="#pricing"
                           className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</a>

                        <Link
                            to="/login"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                            Register
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700">
                            {isMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (<div className="md:hidden bg-white border-t">
                <div className="px-2 pt-2 pb-3 space-y-1">
                    <a href="#features"
                       className="block px-3 py-2 text-gray-700 hover:text-blue-600">Features</a>
                    <a href="#order"
                       className="block px-3 py-2 text-gray-700 hover:text-blue-600">Order Now</a>
                    <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Pricing</a>
                    <button
                        onClick={() => {
                            setShowOrderForm(true);
                            setOrderStep(1);
                        }}
                        className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full">
                        Order Now
                    </button>
                </div>
            </div>)}
        </nav>

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Streamline Your
                        <span
                            className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Laundry Business
              </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Manage orders, track customers, and grow your laundry business with our comprehensive
                        management system.
                        Built for modern laundry services that want to scale efficiently.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => {
                                setShowOrderForm(true);
                                setOrderStep(1);
                            }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Order Now
                        </button>
                        <a href="#features"
                            className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors text-center">
                            Learn More
                        </a>
                    </div>
                </div>

                {/* Hero Image/Dashboard Preview */}
                <div className="mt-16 relative">
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Total Orders</h3>
                                    <Package className="w-6 h-6 text-blue-600"/>
                                </div>
                                <div className="text-3xl font-bold text-gray-900">1,247</div>
                                <div className="text-sm text-green-600">+12% from last month</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Revenue</h3>
                                    <BarChart3 className="w-6 h-6 text-green-600"/>
                                </div>
                                <div className="text-3xl font-bold text-gray-900">$24,580</div>
                                <div className="text-sm text-green-600">+8% from last month</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Customers</h3>
                                    <Users className="w-6 h-6 text-purple-600"/>
                                </div>
                                <div className="text-3xl font-bold text-gray-900">892</div>
                                <div className="text-sm text-green-600">+15% from last month</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Guest Order Form Modal */}
        {showOrderForm && (
            <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white flex items-center">
                                <ShoppingCart className="w-6 h-6 mr-3" />
                                {orderStep === 1 ? 'Select Services' : 'Contact Information'}
                                <span className="ml-3 text-sm bg-white/20 px-2 py-1 rounded-full">
                                    Step {orderStep} of 2
                                </span>
                            </h2>
                            <button
                                onClick={() => {
                                    setShowOrderForm(false);
                                    setOrderStep(1);
                                }}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {orderStep === 1 ? (
                            // Step 1: Service Selection
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                        <Package className="w-5 h-5 mr-2 text-blue-600" />
                                        Select Services
                                    </label>
                                    
                                    <div className="space-y-3">
                                        {selectedServices.map((service, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                                                <div className="flex gap-3 items-center">
                                                    <div className="flex-1">
                                                        <select
                                                            value={service.service_id}
                                                            onChange={e => updateService(index, 'service_id', e.target.value)}
                                                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                            required
                                                        >
                                                            <option value="">Choose a service...</option>
                                                            {Array.isArray(services) && services.length > 0 ? services.map(s => (
                                                                <option key={s.id} value={s.id}>
                                                                    {s.name} - ৳{s.price} ({s.category})
                                                                </option>
                                                            )) : (
                                                                <option disabled>No services available</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                    
                                                    <div className="w-24">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="0.1"
                                                            placeholder="Qty"
                                                            value={service.quantity}
                                                            onChange={e => updateService(index, 'quantity', e.target.value)}
                                                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-sm"
                                                            required
                                                        />
                                                    </div>
                                                    
                                                    {selectedServices.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeService(index)}
                                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={addService}
                                        className="mt-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 text-sm"
                                    >
                                        <Package className="w-4 h-4" />
                                        <span>Add Service</span>
                                    </button>
                                </div>

                                {/* Service Summary */}
                                {selectedServices.some(s => s.service_id && s.quantity) && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                            <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                                            Selected Services
                                        </h3>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {selectedServices.map((service, index) => {
                                                const serviceData = services.find(s => s.id == service.service_id);
                                                if (!serviceData || !service.quantity) return null;
                                                return (
                                                    <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded-lg">
                                                        <span className="text-gray-700">{serviceData.name} x {service.quantity}</span>
                                                        <span className="font-semibold text-gray-800">{(serviceData.price * service.quantity).toFixed(2)}৳</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between text-lg font-bold text-gray-800">
                                            <span>Total:</span>
                                            <span className="text-blue-600">{totalPrice.toFixed(2)}৳</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowOrderForm(false);
                                            setOrderStep(1);
                                        }}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                                    >
                                        Next: Contact Info
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Step 2: Contact Information
                            <form onSubmit={handleOrderSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Customer Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                            <Users className="w-5 h-5 mr-2 text-green-600" />
                                            Contact Information
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.guest_name}
                                                    onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    required
                                                />
                                                {errors.guest_name && <p className="text-red-500 text-xs mt-1">{errors.guest_name[0]}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    value={formData.guest_phone}
                                                    onChange={(e) => setFormData({...formData, guest_phone: e.target.value})}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    required
                                                />
                                                {errors.guest_phone && <p className="text-red-500 text-xs mt-1">{errors.guest_phone[0]}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    value={formData.guest_email}
                                                    onChange={(e) => setFormData({...formData, guest_email: e.target.value})}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    required
                                                />
                                                {errors.guest_email && <p className="text-red-500 text-xs mt-1">{errors.guest_email[0]}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                                <textarea
                                                    value={formData.guest_address}
                                                    onChange={(e) => setFormData({...formData, guest_address: e.target.value})}
                                                    rows={2}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    required
                                                />
                                                {errors.guest_address && <p className="text-red-500 text-xs mt-1">{errors.guest_address[0]}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
                                                <textarea
                                                    value={formData.note}
                                                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                                                    rows={2}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    placeholder="Any special instructions..."
                                                />
                                                {errors.note && <p className="text-red-500 text-xs mt-1">{errors.note[0]}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div>
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                                <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                                                Order Summary
                                            </h3>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {selectedServices.map((service, index) => {
                                                    const serviceData = services.find(s => s.id == service.service_id);
                                                    if (!serviceData || !service.quantity) return null;
                                                    return (
                                                        <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded-lg">
                                                            <span className="text-gray-700">{serviceData.name} x {service.quantity}</span>
                                                            <span className="font-semibold text-gray-800">{(serviceData.price * service.quantity).toFixed(2)}৳</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between text-lg font-bold text-gray-800">
                                                <span>Total:</span>
                                                <span className="text-blue-600">{totalPrice.toFixed(2)}৳</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleBackStep}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Back to Services
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Order Success Message */}
        {orderSuccess && (
            <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6">
                    <div className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
                        <p className="text-gray-600 mb-4">Your order has been received and is being processed.</p>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
                            <h3 className="font-semibold mb-2">Order Details:</h3>
                            <p><strong>Order ID:</strong> #{orderSuccess.id}</p>
                            <p><strong>Customer:</strong> {orderSuccess.guest_name}</p>
                            <p><strong>Phone:</strong> {orderSuccess.guest_phone}</p>
                            <p><strong>Email:</strong> {orderSuccess.guest_email}</p>
                            <p><strong>Total:</strong> ৳{orderSuccess.total_price}</p>
                            <p><strong>Status:</strong> {orderSuccess.status}</p>
                        </div>
                        
                        <button
                            onClick={() => setOrderSuccess(null)}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Quick Order Section */}
        <section id="order" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Need Laundry Service? Order Now!
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                    Quick and easy ordering - no account required. Get your laundry picked up and delivered.
                </p>
                <button
                    onClick={() => {
                        setShowOrderForm(true);
                        setOrderStep(1);
                    }}
                    className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                >
                    <ShoppingCart className="w-5 h-5" />
                    Place Order Now
                </button>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Everything You Need to
                        <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Manage Your Laundry Business
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Our comprehensive platform provides all the tools you need to streamline operations and grow your business.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                            <div className="mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Trusted by Laundry Businesses Worldwide
                    </h2>
                    <p className="text-xl text-gray-600">
                        See what our customers have to say about LaundryPro
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
                            <div className="flex mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                ))}
                            </div>
                            <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                            <div>
                                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                <div className="text-gray-500 text-sm">{testimonial.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-xl text-gray-600">
                        Choose the plan that fits your business size and needs
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {pricingPlans.map((plan, index) => (
                        <div key={index} className={`bg-white p-8 rounded-2xl shadow-lg relative ${
                            plan.popular ? 'ring-2 ring-blue-600 transform scale-105' : ''
                        }`}>
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                                    <span className="text-gray-600">{plan.period}</span>
                                </div>
                            </div>
                            
                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        <span className="text-gray-600">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            
                            <button className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                                plan.popular 
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                                    : 'border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
                            }`}>
                                Get Started
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center mb-4">
                            <Package className="w-8 h-8 text-blue-400 mr-3"/>
                            <span className="text-xl font-bold">LaundryPro</span>
                        </div>
                        <p className="text-gray-400">
                            Streamline your laundry business with our comprehensive management system.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                        </ul>
                    </div>
                </div>
                
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 LaundryPro. All rights reserved.</p>
                </div>
            </div>
        </footer>
    </div>
    );
};

export default LaundryLandingPage;