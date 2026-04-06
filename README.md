# 🧺 Laundry Hub - Frontend

A modern, high-performance laundry service management system built with **React 19** and **Vite**. This application provides a seamless experience for both customers and administrators to track and manage laundry orders.

---

## ✨ Features

### 👤 Customer Features
- **Modern Landing Page**: High-conversion landing page for guest users.
- **Order Tracking**: Real-time tracking of laundry orders.
- **Service Browsing**: Elegant display of available services and pricing.
- **Profile Management**: Manage user settings and delivery addresses.
- **Dashboard**: Centralized view of current and past orders.

### 🔑 Authentication & Security
- **Secure Login/Signup**: Robust user authentication with Axios-based API communication.
- **Protected Routes**: Ensuring data privacy for logged-in users.
- **Admin Access**: Role-based access control for management features.

### 🛡 Admin Capabilities
- **Comprehensive Dashboard**: Overview of all system activities and order statistics.
- **Order Management**: Update status and manage pending laundry tasks.
- **User Insights**: Manage and view customer information.

### ⚡ Technical Highlights
- **Real-time Updates**: Live notifications and order status changes using **Laravel Echo** and **Pusher**.
- **Modern Styling**: Styled with **Tailwind CSS v4** for a premium, responsive look.
- **Optimized Data Fetching**: Efficient state management and caching using **TanStack React Query v5**.
- **Responsive Design**: Mobile-first approach for all screens.

---

## 🛠 Tech Stack

- **Core**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [TanStack React Query v5](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Real-time**: [Laravel Echo](https://laravel.com/docs/broadcasting), [Pusher JS](https://pusher.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- [NPM](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- Access to the corresponding [Laravel Backend API](https://github.com/Shoaib3375/LaundryManagementSystem)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shoaib3375/LaundryFrontEnd.git
   cd LaundryFrontEnd
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your API and Pusher credentials:
   ```env
   VITE_API_BASE_URL=http://your-backend-api.com/api
   VITE_PUSHER_APP_KEY=your-pusher-key
   VITE_PUSHER_APP_CLUSTER=ap2
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 📦 Available Scripts

- `npm run dev`: Starts the development server with HMR.
- `npm run build`: Bundles the application for production.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run preview`: Previews the production-ready build locally.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Developed with ❤️ by [Shoaib](https://github.com/Shoaib3375)