import React, {useState} from 'react';
import {
    Package, Clock, Users, BarChart3, CheckCircle, Star, ArrowRight, Menu, X, Smartphone, Shield, Zap
} from 'lucide-react';
import {Link} from 'react-router-dom'

const LaundryLandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                        <a href="#testimonials"
                           className="text-gray-700 hover:text-blue-600 transition-colors">Testimonials</a>
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
                    <a href="#testimonials"
                       className="block px-3 py-2 text-gray-700 hover:text-blue-600">Testimonials</a>
                    <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Pricing</a>
                    <button
                        className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full">
                        Get Started
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
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                            Start Free Trial
                        </button>
                        <button
                            className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors">
                            Watch Demo
                        </button>
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
                                <div className="text-3xl font-bold text-blue-600">1,247</div>
                                <div className="text-sm text-gray-600">+23% from last month</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Revenue</h3>
                                    <BarChart3 className="w-6 h-6 text-green-600"/>
                                </div>
                                <div className="text-3xl font-bold text-green-600">$28,540</div>
                                <div className="text-sm text-gray-600">+18% from last month</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Customers</h3>
                                    <Users className="w-6 h-6 text-purple-600"/>
                                </div>
                                <div className="text-3xl font-bold text-purple-600">892</div>
                                <div className="text-sm text-gray-600">+12% from last month</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Everything You Need to Run Your Laundry Business
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        From order management to customer relations, we've got all the tools you need to streamline
                        operations and grow your business.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (<div key={index}
                                                            className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                        <div className="mb-4">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                    </div>))}
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Loved by Laundry Business Owners
                    </h2>
                    <p className="text-xl text-gray-600">
                        See what our customers have to say about LaundryPro
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (<div key={index}
                                                                    className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                        <div className="flex mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current"/>))}
                        </div>
                        <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                        <div className="border-t pt-4">
                            <div className="font-semibold text-gray-900">{testimonial.name}</div>
                            <div className="text-sm text-gray-500">{testimonial.role}</div>
                        </div>
                    </div>))}
                </div>
            </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-xl text-gray-600">
                        Choose the plan that's right for your business
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {pricingPlans.map((plan, index) => (<div key={index}
                                                             className={`relative bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                        {plan.popular && (<div
                            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                        </div>)}
                        <div className="p-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                                <span className="text-gray-600">{plan.period}</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3"/>
                                        <span className="text-gray-600">{feature}</span>
                                    </li>))}
                            </ul>
                            <button
                                className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105' : 'border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'}`}>
                                Get Started
                            </button>
                        </div>
                    </div>))}
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Ready to Transform Your Laundry Business?
                </h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                    Join thousands of laundry businesses that have already streamlined their operations with
                    LaundryPro.
                </p>
                <button
                    className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    Start Your Free Trial Today
                    <ArrowRight className="w-5 h-5 ml-2 inline-block"/>
                </button>
            </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center mb-4">
                            <Package className="w-8 h-8 text-blue-400 mr-3"/>
                            <span className="text-xl font-bold">LaundryPro</span>
                        </div>
                        <p className="text-gray-400">
                            The complete solution for modern laundry business management.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
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
                        <h4 className="font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 LaundryPro. All rights reserved.</p>
                </div>
            </div>
        </footer>
    </div>);
};

export default LaundryLandingPage;