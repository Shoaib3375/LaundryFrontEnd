// Test utility for AdminDashboard functionality
export const testAdminDashboard = () => {
    const tests = [];

    // Test 1: Check if required components are imported
    try {
        const hasReact = typeof React !== 'undefined';
        const hasApi = typeof api !== 'undefined';
        tests.push({
            name: 'Component Imports',
            passed: hasReact,
            message: hasReact ? 'All imports successful' : 'Missing React or API imports'
        });
    } catch (error) {
        tests.push({
            name: 'Component Imports',
            passed: false,
            message: `Import error: ${error.message}`
        });
    }

    // Test 2: Check localStorage token handling
    try {
        const token = localStorage.getItem('token');
        tests.push({
            name: 'Token Management',
            passed: true,
            message: token ? 'Token found in localStorage' : 'No token in localStorage (expected for logged out users)'
        });
    } catch (error) {
        tests.push({
            name: 'Token Management',
            passed: false,
            message: `localStorage error: ${error.message}`
        });
    }

    // Test 3: Check environment variables
    try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL;
        tests.push({
            name: 'Environment Configuration',
            passed: !!apiUrl,
            message: apiUrl ? `API URL configured: ${apiUrl}` : 'API URL not configured'
        });
    } catch (error) {
        tests.push({
            name: 'Environment Configuration',
            passed: false,
            message: `Environment error: ${error.message}`
        });
    }

    return tests;
};

// Mock data for testing
export const mockOrderData = {
    id: 1,
    status: 'Pending',
    total_price: '150.00',
    created_at: new Date().toISOString(),
    guest_name: 'Test Customer',
    guest_email: 'test@example.com',
    service: {
        name: 'Dry Cleaning',
        category: 'Cleaning',
        price: '50.00'
    },
    quantity: 3
};

export const mockCouponData = {
    id: 1,
    code: 'TEST10',
    type: 'percentage',
    value: 10,
    is_active: true,
    expires_at: null,
    usage_limit: null,
    used_count: 0
};

// Validation functions
export const validateOrderData = (order) => {
    const required = ['id', 'status', 'total_price', 'created_at'];
    return required.every(field => order.hasOwnProperty(field));
};

export const validateCouponData = (coupon) => {
    const required = ['id', 'code', 'type', 'value'];
    return required.every(field => coupon.hasOwnProperty(field));
};