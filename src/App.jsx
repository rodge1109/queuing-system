import React, { useState, createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ChevronRight, ChevronLeft, ArrowRight, Check, X, Search, Settings, Smartphone, Printer, Download, Store, CreditCard, Lock, User, Users, Wallet, Calendar, MapPin, Clock, Phone, Mail, Star, Car, Truck, Shield, Activity, Clipboard, ClipboardList, Stethoscope, Hospital, Pill, Syringe, HeartPulse, Map as MapIcon, Navigation, AlertTriangle, AlertCircle, RefreshCw, Edit, History, DollarSign, Link, Bell, Database } from 'lucide-react';

// Help component to render either Lucide icon or Emoji
const LucideIcons = { ShoppingCart, Plus, Minus, Trash2, ChevronRight, ChevronLeft, ArrowRight, Check, X, Search, Settings, Smartphone, Printer, Download, Store, CreditCard, Lock, User, Users, Wallet, Calendar, MapPin, Clock, Phone, Mail, Star, Car, Truck, Shield, Activity, Clipboard, Stethoscope, Hospital, Pill, Syringe, HeartPulse, Map: MapIcon, Navigation, AlertTriangle, AlertCircle, RefreshCw };

const ServiceIconRender = ({ iconName, className }) => {
  if (iconName && (iconName.startsWith('http') || iconName.startsWith('/uploads'))) {
    return <img src={iconName} alt="Icon" className={className || "w-8 h-8 object-contain"} />;
  }
  const Icon = LucideIcons[iconName];
  if (Icon) return <Icon className={className || "w-8 h-8"} />;
  return <span className={className || "text-4xl"}>{iconName}</span>;
};
import Sidebar from './components/layout/Sidebar';
import CorporateAccountsManagement from './components/admin/CorporateAccountsManagement';
import AppointmentForm from './components/booking/AppointmentForm';
import RiderPortal from './components/rider/RiderPortal';
import LiveTrackingMap from './components/maps/LiveTrackingMap';
import QueuePage from './components/queue/QueuePage';
import QueueDisplayPage from './components/queue/QueueDisplayPage';
import QueueTellerPage from './components/queue/QueueTellerPage';
import SurveyPage from './components/queue/SurveyPage';
import RidersManagement from './components/admin/RidersManagement';
import RideScheduling from './components/admin/RideScheduling';



// Cart Context
const CartContext = createContext();

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

// Google Sheets API URL - UPDATE THIS WITH YOUR WEB APP URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyQNLHXp9Fzi0_mVxYmV7M0xSA2bqteLxIDzA96nAsaIObDEAhwGN9oX1lOAoY72BaL/exec';

// Fallback Menu Data (used if Google Sheets fetch fails)
const fallbackMenuData = [
  { id: 1, name: 'Margherita Pizza', category: 'Pizza', sizes: [{ name: 'Small', price: 10.99 }, { name: 'Medium', price: 12.99 }, { name: 'Large', price: 15.99 }], image: 'assets/images/food/pepperoni.png', description: 'Classic tomato sauce, mozzarella, fresh basil', popular: true },
  { id: 2, name: 'Pepperoni Pizza', category: 'Pizza', sizes: [{ name: 'Small', price: 12.99 }, { name: 'Medium', price: 14.99 }, { name: 'Large', price: 17.99 }], image: 'assets/images/food/burgerpizza.png', description: 'Loaded with pepperoni and mozzarella', popular: true },
  { id: 3, name: 'BBQ Chicken Pizza', category: 'Pizza', sizes: [{ name: 'Small', price: 13.99 }, { name: 'Medium', price: 15.99 }, { name: 'Large', price: 18.99 }], image: 'assets/images/food/pepperoni.png', description: 'BBQ sauce, grilled chicken, red onions', popular: false },
  { id: 4, name: 'Veggie Supreme', category: 'Pizza', sizes: [{ name: 'Small', price: 11.99 }, { name: 'Medium', price: 13.99 }, { name: 'Large', price: 16.99 }], image: 'assets/images/food/pepperoni.png', description: 'Mushrooms, peppers, olives, onions', popular: false },

  { id: 5, name: 'Classic Burger', category: 'Burgers', price: 9.99, image: 'assets/images/food/pepperoni.png', description: 'Beef patty, lettuce, tomato, cheese', popular: true },
  { id: 6, name: 'Bacon Cheeseburger', category: 'Burgers', price: 11.99, image: 'assets/images/food/pepperoni.png', description: 'Double beef, bacon, cheddar cheese', popular: true },
  { id: 7, name: 'Veggie Burger', category: 'Burgers', price: 10.99, image: 'assets/images/food/pepperoni.png', description: 'Plant-based patty, avocado, sprouts', popular: false },
  { id: 8, name: 'Chicken Burger', category: 'Burgers', price: 10.49, image: 'assets/images/food/pepperoni.png', description: 'Grilled chicken breast, mayo, lettuce', popular: false },

  { id: 9, name: 'Spaghetti Carbonara', category: 'Pasta', price: 13.99, image: 'assets/images/food/pepperoni.png', description: 'Creamy sauce, bacon, parmesan', popular: true },
  { id: 10, name: 'Penne Arrabiata', category: 'Pasta', price: 12.49, image: 'assets/images/food/pepperoni.png', description: 'Spicy tomato sauce, garlic, herbs', popular: false },
  { id: 11, name: 'Fettuccine Alfredo', category: 'Pasta', price: 13.49, image: 'assets/images/food/pepperoni.png', description: 'Rich cream sauce, parmesan cheese', popular: true },
  { id: 12, name: 'Lasagna', category: 'Pasta', price: 14.99, image: 'assets/images/food/pepperoni.png', description: 'Layered pasta, beef, ricotta, mozzarella', popular: false },

  { id: 13, name: 'Caesar Salad', category: 'Salads', price: 8.99, image: 'assets/images/food/pepperoni.png', description: 'Romaine, croutons, parmesan, caesar dressing', popular: true },
  { id: 14, name: 'Greek Salad', category: 'Salads', price: 9.49, image: 'assets/images/food/pepperoni.png', description: 'Feta, olives, cucumber, tomatoes', popular: false },
  { id: 15, name: 'Caprese Salad', category: 'Salads', price: 10.99, image: 'assets/images/food/pepperoni.png', description: 'Fresh mozzarella, tomatoes, basil', popular: false },

  { id: 16, name: 'Coca Cola', category: 'Drinks', price: 2.99, image: 'assets/images/food/pepperoni.png', description: 'Classic cola, 500ml', popular: true },
  { id: 17, name: 'Fresh Lemonade', category: 'Drinks', price: 3.49, image: 'assets/images/food/pepperoni.png', description: 'Freshly squeezed lemon juice', popular: true },
  { id: 18, name: 'Iced Tea', category: 'Drinks', price: 2.99, image: 'assets/images/food/pepperoni.png', description: 'Peach iced tea', popular: false },

  { id: 19, name: 'Chocolate Cake', category: 'Desserts', price: 6.99, image: 'assets/images/food/pepperoni.png', description: 'Rich chocolate layer cake', popular: true },
  { id: 20, name: 'Tiramisu', category: 'Desserts', price: 7.49, image: 'assets/images/food/pepperoni.png', description: 'Italian coffee-flavored dessert', popular: true },
];

// ==================== RIDER PORTAL ====================


// ==================== LIVE TRACKING MAP ====================


// Main App Component
export default function RestaurantApp() {
  const [cartItems, setCartItems] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState(null);
  const [showLoginMenu, setShowLoginMenu] = useState(false);

  // Products state
  const [menuData, setMenuData] = useState(fallbackMenuData);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);

  // State for client appointment lookup
  const [appointmentToken, setAppointmentToken] = useState(null);

  // Check URL parameters for payment status (after GCash redirect) or patient appointment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const orderNumber = urlParams.get('order');
    const page = urlParams.get('page');
    const token = urlParams.get('token');

    if (payment && orderNumber) {
      setPaymentStatus(payment);
      setPendingOrderNumber(orderNumber);
      setCurrentPage(payment === 'success' ? 'confirmation' : 'payment-failed');
      // Clear cart if payment successful
      if (payment === 'success') {
        setCartItems([]);
        localStorage.removeItem('pendingOrder');
      }
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (page === 'my-appointment') {
      // client appointment lookup page
      if (token) {
        setAppointmentToken(token);
      }
      setCurrentPage('my-appointment');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch products from Google Sheets on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        setProductsError(null);

        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();

        if (data.success && data.products && data.products.length > 0) {
          setMenuData(data.products);
        } else {
          setMenuData(fallbackMenuData);
          setProductsError('Using offline menu data');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setMenuData(fallbackMenuData);
        setProductsError('Using offline menu data');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Initialize OneSignal Push Notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && window.OneSignalDeferred) {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal) {
        await OneSignal.init({
          appId: "22fa0af9-4790-4b61-9f6d-573237f0585d", // Replace with your OneSignal App ID
          notifyButton: {
            enable: true,
            size: 'small',
            position: 'bottom-right',
            prenotify: true,
            showCredit: false,
            text: {
              'tip.state.unsubscribed': 'Get order updates',
              'tip.state.subscribed': 'You\'re subscribed!',
              'tip.state.blocked': 'Notifications blocked',
              'message.prenotify': 'Click to receive order updates',
              'message.action.subscribed': 'Thanks for subscribing!',
              'dialog.main.title': 'Manage Notifications',
              'dialog.main.button.subscribe': 'SUBSCRIBE',
              'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
            }
          },
          welcomeNotification: {
            title: "Welcome to Kuchefnero!",
            message: "You'll receive order updates here."
          }
        });
      });
    }
  }, []);

  // Clear cart function
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const addToCart = useCallback((item, selectedSize = null) => {
    console.log('addToCart called:', { item, selectedSize, hasSizes: !!item.sizes });

    // For items with sizes, we need size info
    if (item.sizes && !selectedSize) {
      console.log('Opening size modal for:', item.name);
      setSelectedProduct(item);
      setShowSizeModal(true);
      return;
    }

    // Create cart item with size info if applicable
    const cartItem = selectedSize
      ? { ...item, selectedSize: selectedSize.name, price: selectedSize.price, displayName: `${item.name} (${selectedSize.name})` }
      : item;

    setCartItems(prevItems => {
      // Find existing item by id AND size (if applicable)
      const existingItem = prevItems.find(i =>
        i.id === item.id && (!selectedSize || i.selectedSize === selectedSize.name)
      );

      if (existingItem) {
        return prevItems.map(i =>
          (i.id === item.id && (!selectedSize || i.selectedSize === selectedSize.name))
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        return [...prevItems, { ...cartItem, quantity: 1 }];
      }
    });

    // Close modal if it was open
    setShowSizeModal(false);
    setSelectedProduct(null);
  }, []); // cartItems is used via functional update

  const removeFromCart = useCallback((id, selectedSize = null) => {
    setCartItems(prevItems => prevItems.filter(item =>
      !(item.id === id && (!selectedSize || item.selectedSize === selectedSize))
    ));
  }, []);

  const updateQuantity = useCallback((id, newQuantity, selectedSize = null) => {
    if (newQuantity === 0) {
      removeFromCart(id, selectedSize);
    } else {
      setCartItems(prevItems => prevItems.map(item =>
        (item.id === id && (!selectedSize || item.selectedSize === selectedSize))
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  }, [removeFromCart]);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const contextValue = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice
  }), [cartItems, addToCart, removeFromCart, updateQuantity, getTotalItems, getTotalPrice]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage setCurrentPage={setCurrentPage} />;
      case 'menu': return <MenuPage selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} searchQuery={searchQuery} menuData={menuData} isLoading={isLoadingProducts} />;
      case 'cart': return <CartPage setCurrentPage={setCurrentPage} />;
      case 'checkout': return <CheckoutPage setCurrentPage={setCurrentPage} clearCart={clearCart} />;
      case 'confirmation': return <ConfirmationPage setCurrentPage={setCurrentPage} orderNumber={pendingOrderNumber} paymentStatus={paymentStatus} />;
      case 'payment-failed': return <PaymentFailedPage setCurrentPage={setCurrentPage} orderNumber={pendingOrderNumber} />;
      case 'admin': return <AdminDashboard setCurrentPage={setCurrentPage} />;
      case 'my-appointment': return <MyAppointment token={appointmentToken} />;
      case 'rider': return <RiderPortal />;
      case 'queue': return <QueuePage setCurrentPage={setCurrentPage} />;
      case 'queue-display': return <QueueDisplayPage />;
      case 'queue-teller': return <QueueTellerPage setCurrentPage={setCurrentPage} />;
      case 'survey': return <SurveyPage setCurrentPage={setCurrentPage} />;
      default: return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <CartContext.Provider value={contextValue}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        /* Hide scrollbar for category filter */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* Animated underline effect for nav links */
        .nav-link {
          position: relative;
          padding-bottom: 4px;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #55A2F5, #3B8BE0);
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        /* Button hover animation */
        .btn-animated {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .btn-animated::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        .btn-animated:hover::before {
          left: 100%;
        }
        /* Smooth scale on hover */
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        /* Letter spacing for modern look */
        .tracking-tight {
          letter-spacing: -0.02em;
        }
        /* Random card animations */
        @keyframes card-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes card-bounce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-12px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-6px); }
        }
        @keyframes card-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes card-glow {
          0%, 100% { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          50% { box-shadow: 0 0 30px rgba(42,102,144,0.6), 0 0 60px rgba(42,102,144,0.3); }
        }
        @keyframes card-flip {
          0% { transform: perspective(800px) rotateY(0deg); }
          50% { transform: perspective(800px) rotateY(180deg); }
          100% { transform: perspective(800px) rotateY(360deg); }
        }
        @keyframes card-slide-in {
          0% { transform: translateX(-100%); opacity: 0; }
          60% { transform: translateX(10px); opacity: 1; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes card-wobble {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-3deg); }
          30% { transform: rotate(3deg); }
          45% { transform: rotate(-2deg); }
          60% { transform: rotate(2deg); }
          75% { transform: rotate(-1deg); }
        }
        @keyframes card-fade-scale {
          0% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1); }
        }
        .card-animate-pulse { animation: card-pulse 0.8s ease-in-out; }
        .card-animate-bounce { animation: card-bounce 0.8s ease-in-out; }
        .card-animate-shake { animation: card-shake 0.6s ease-in-out; }
        .card-animate-glow { animation: card-glow 1.2s ease-in-out; }
        .card-animate-flip { animation: card-flip 1s ease-in-out; }
        .card-animate-slide { animation: card-slide-in 0.8s ease-out; }
        .card-animate-wobble { animation: card-wobble 0.8s ease-in-out; }
        .card-animate-fade { animation: card-fade-scale 0.8s ease-out; }
        /* Blinking border for announcing */
        @keyframes border-blink {
          0%, 100% { border-color: #3A7CA5; }
          50% { border-color: transparent; }
        }
        .animate-border-blink {
          animation: border-blink 0.8s ease-in-out infinite;
          border-width: 4px;
        }
        /* Marquee scrolling animation */
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        /* Blue Color Palette for Clinic */
        .bg-green-600 {
          background-color: #2563EB !important;
        }
        .bg-green-500 {
          background-color: #3B82F6 !important;
        }
        .bg-green-700 {
          background-color: #1D4ED8 !important;
        }
        .bg-green-400 {
          background-color: #60A5FA !important;
        }
        .bg-green-100 {
          background-color: #DBEAFE !important;
        }
        .bg-green-50 {
          background-color: #EFF6FF !important;
        }
        .text-green-600 {
          color: #2563EB !important;
        }
        .text-green-400 {
          color: #60A5FA !important;
        }
        .text-green-100 {
          color: #DBEAFE !important;
        }
        .text-green-700 {
          color: #1D4ED8 !important;
        }
        .text-green-200 {
          color: #BFDBFE !important;
        }
        .border-green-600 {
          border-color: #2563EB !important;
        }
        .border-green-300 {
          border-color: #93C5FD !important;
        }
        .border-green-400 {
          border-color: #60A5FA !important;
        }
        .border-green-500 {
          border-color: #3B82F6 !important;
        }
        .hover\\:bg-green-700:hover {
          background-color: #1D4ED8 !important;
        }
        .hover\\:bg-green-500:hover {
          background-color: #3B82F6 !important;
        }
        .hover\\:text-green-600:hover {
          color: #2563EB !important;
        }
        .hover\\:bg-green-100:hover {
          background-color: #DBEAFE !important;
        }
        .hover\\:bg-green-50:hover {
          background-color: #EFF6FF !important;
        }
        .from-green-900 {
          --tw-gradient-from: #1e3a5f !important;
        }
        .to-green-900 {
          --tw-gradient-to: #1e3a5f !important;
        }
        .via-green-900 {
          --tw-gradient-via: #1e3a5f !important;
        }
        :root {
          --admin-primary: #10B981 !important;
          --admin-primary-hover: #059669 !important;
          --admin-bg: #F9FAFB !important;
          font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
        }

        .bg-blue-600 { background-color: #10B981 !important; }
        .hover\:bg-blue-700:hover { background-color: #059669 !important; }
        .text-blue-600 { color: #10B981 !important; }
        .border-blue-600 { border-color: #10B981 !important; }
        .focus\:ring-blue-500:focus { --tw-ring-color: #10B981 !important; }

        .from-green-400 {
          --tw-gradient-from: #34D399 !important;
        }
        .to-green-500 {
          --tw-gradient-to: #10B981 !important;
        }
        .focus\\:border-green-500:focus {
          border-color: #10B981 !important;
        }
        .focus\\:border-green-700:focus {
          border-color: #047857 !important;
        }
      `}</style>
      <div className={`min-h-screen bg-white ${currentPage === 'admin' ? 'p-0 flex flex-col' : 'pb-16 md:pb-0 pt-[100px]'}`}>
        {currentPage !== 'admin' && (
          <Header
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        {renderPage()}
        {showCart && currentPage !== 'admin' && <CartDrawer setShowCart={setShowCart} setCurrentPage={setCurrentPage} />}
        {showSizeModal && selectedProduct && (
          <SizeModal
            product={selectedProduct}
            onClose={() => {
              console.log('Closing size modal');
              setShowSizeModal(false);
              setSelectedProduct(null);
            }}
            onSelectSize={(size) => {
              console.log('Size selected:', size);
              addToCart(selectedProduct, size);
            }}
          />
        )}

        {/* Mobile Bottom Navigation - Hide on Admin */}
        {currentPage !== 'admin' && (
          <nav className="fixed bottom-0 left-0 right-0 bg-[#F5F3F5] border-t border-[#F5F3F5] md:hidden z-50 pb-safe">
            <div className="flex justify-around items-center py-2">
              <div className="relative">
                <button
                  onClick={() => setShowLoginMenu(!showLoginMenu)}
                  className={`flex flex-col items-center px-4 py-1 ${showLoginMenu ? 'text-[#10b981]' : 'text-[#302B27]'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-xs font-medium">Login</span>
                </button>
                {showLoginMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLoginMenu(false)} />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-0 shadow-lg border border-gray-200 py-2 w-44 z-50">
                      <button
                        onClick={() => { setCurrentPage('queue-teller'); setShowLoginMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Teller Station
                      </button>
                      <button
                        onClick={() => { setCurrentPage('admin'); setShowLoginMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Panel
                      </button>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setCurrentPage('queue')}
                className={`flex flex-col items-center px-4 py-1 ${currentPage === 'queue' ? 'text-[#302B27]' : 'text-[#302B27]'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-xs font-medium">Queue</span>
              </button>
              <button
                onClick={() => setCurrentPage('queue-display')}
                className={`flex flex-col items-center px-4 py-1 ${currentPage === 'queue-display' ? 'text-[#10b981]' : 'text-[#302B27]'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 4h14a2 2 0 012 2v7H3V6a2 2 0 012-2z" />
                </svg>
                <span className="text-xs font-medium">Display</span>
              </button>
              <button
                onClick={() => setCurrentPage('queue-teller')}
                className={`flex flex-col items-center px-4 py-1 ${currentPage === 'queue-teller' ? 'text-[#10b981]' : 'text-[#302B27]'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-xs font-medium">Teller</span>
              </button>
            </div>
          </nav>
        )}
        {/* Rider Portal Access Link */}
        <div className="bg-[#1c1917] border-t border-[#333] p-4 text-center mt-auto">
          <button
            onClick={() => setCurrentPage('rider')}
            className="text-[10px] font-black text-[#666] tracking-widest uppercase hover:text-[#E4FE7B] transition-colors"
          >
            Switch to Rider Mode
          </button>
        </div>
      </div>
    </CartContext.Provider>
  );
}

// Size Selection Modal
function SizeModal({ product, onClose, onSelectSize }) {
  console.log('SizeModal rendering with product:', product);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-0 shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-black text-green-600 mb-2">Select Size</h2>
        <p className="text-gray-600 font-bold mb-6">{product.name}</p>

        <div className="space-y-3">
          {product.sizes.map((size) => (
            <button
              key={size.name}
              onClick={() => onSelectSize(size)}
              className="w-full bg-gray-50 hover:bg-green-50 border-2 border-gray-200 hover:border-green-600 rounded-0 p-4 flex items-center justify-between transition-all group"
            >
              <span className="font-bold text-gray-800 group-hover:text-green-600">{size.name}</span>
              <span className="text-xl font-black text-green-600">Php {size.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ setCurrentPage }) {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin section tabs
  const [activeTab, setActiveTab] = useState('dashboard');
  useEffect(() => {
    const validTabs = ['appointments', 'queue', 'calendar', 'reports', 'feedback', 'settings', 'specialists', 'services', 'riders', 'trips'];
    const requestedTab = localStorage.getItem('adminActiveTab');
    if (requestedTab && validTabs.includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
    localStorage.removeItem('adminActiveTab');
  }, []);

  // Dashboard state
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  // Trips Monitoring State
  const [trips, setTrips] = useState([]);
  const [tripStats, setTripStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Reschedule state
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState({ appointments: [], blockedDates: [] });

  // Reports state
  const [reportStats, setReportStats] = useState(null);
  const [csmStats, setCsmStats] = useState(null);
  const [specialists, setSpecialists] = useState([]);
  const [newSpecialist, setNewSpecialist] = useState({ name: '', title: '', email: '', imageUrl: '' });
  const [isAddingSpecialist, setIsAddingSpecialist] = useState(false);
  const [bookingServices, setBookingServices] = useState([]);
  const [riders, setRiders] = useState([]);
  const [isAddingRider, setIsAddingRider] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    duration: '30m',
    price: 'PHP 0.00',
    icon: '',
    category: '',
    base_fare: 50,
    per_km_rate: 15
  });
  const [editingService, setEditingService] = useState(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const fetchCsm = async () => {
    try {
      const res = await fetch(`/api/reports/csm?startDate=${reportStartDate}&endDate=${reportEndDate}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      if (data.total !== undefined) {
        setCsmStats({
          ...data,
          overallAvg: data.csat / 20,
          excellentPercent: data.csat,
          totalResponses: data.total,
          sqdStats: data.sqdAverages ? Object.values(data.sqdAverages) : []
        });
      }
    } catch (err) { }
  };
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');

  // Settings state
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpec, setNewDoctorSpec] = useState('');
  const [services, setServices] = useState([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServicePrice, setNewServicePrice] = useState(0);

  // Print modal
  const [printAppointment, setPrintAppointment] = useState(null);

  // Check for existing session
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.valid) {
        setIsLoggedIn(true);
        fetchAppointments();
      } else {
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      localStorage.removeItem('adminToken');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
        fetchAppointments();
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  const fetchAppointments = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (filter !== 'all') params.append('status', filter);

      const url = params.toString()
        ? `/api/appointments/search?${params}`
        : '/api/appointments';

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Fetch all appointments once on login
  useEffect(() => {
    if (isLoggedIn) {
      fetchAppointments();
      const fetchSpecialists = async () => {
        try {
          const res = await fetch('/api/specialists');
          const data = await res.json();
          if (data.success) setSpecialists(data.specialists);
        } catch (err) { }
      };
      fetchSpecialists();
      const fetchBookingServices = async () => {
        try {
          const res = await fetch('/api/booking-services');
          const data = await res.json();
          if (data.success) setBookingServices(data.services);
        } catch (err) { }
      };
      fetchBookingServices();
      const fetchRiders = async () => {
        try {
          const res = await fetch('/api/admin/riders');
          const data = await res.json();
          if (data.success) setRiders(data.riders);
        } catch (err) { }
      };
      fetchRiders();
    }
  }, [isLoggedIn]);

  const fetchTrips = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/trips');
      const data = await res.json();
      if (data.success) setTrips(data.trips);

      const sRes = await fetch('/api/admin/trips/stats');
      const sData = await sRes.json();
      if (sData.success) setTripStats(sData.stats);

      const iRes = await fetch('/api/admin/incidents');
      const iData = await iRes.json();
      if (iData.success) setIncidents(iData.incidents);
    } catch (err) { }
  }, []);

  useEffect(() => {
    if (isLoggedIn && (activeTab === 'trips' || activeTab === 'dashboard' || activeTab === 'scheduling')) {
      fetchTrips();
      const interval = setInterval(fetchTrips, 30000); // Auto refresh every 30s
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, activeTab, fetchTrips]);

  // Real-time WebSocket updates for Trips & Riders
  useEffect(() => {
    if (!isLoggedIn) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use the backend port 5000 for the WebSocket connection
    const wsUrl = `${protocol}//${window.location.hostname}:5000/ws/staff-chat`;
    let socket;

    const connectWS = () => {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('Admin Real-time Monitor Connected');
        socket.send(JSON.stringify({ type: 'identify', name: 'Admin Dashboard' }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Trip / location updates
          if (data.type === 'trip_update' || data.type === 'location_update') {
            console.log('Real-time trip/location update received:', data);
            fetchTrips();
          }
          // New booking submitted from the public booking form
          if (data.type === 'new_booking') {
            console.log('New booking received — refreshing All Bookings...');
            fetchAppointments(true); // silent — no blink
            fetchCalendarData();
          }
        } catch (err) { }
      };

      socket.onclose = () => {
        console.log('Admin WebSocket closed. Reconnecting in 5s...');
        setTimeout(connectWS, 5000);
      };

      socket.onerror = (err) => {
        console.error('Admin WebSocket error:', err);
        socket.close();
      };
    };

    connectWS();
    return () => {
      if (socket) socket.close();
    };
  }, [isLoggedIn, fetchTrips]);

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setAppointments(prev => prev.map(apt =>
          apt.id === id ? { ...apt, status: newStatus } : apt
        ));
        fetchTrips(); // Refresh the trips list so the Trip Monitoring module updates
        fetchCalendarData(); // Sync calendar view immediately
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  // Reschedule functions
  const openRescheduleModal = async (apt) => {
    setRescheduleModal(apt);
    setNewDate(apt.preferred_date);
    setNewTime(apt.preferred_time);
    // Fetch available slots for current date
    await fetchAvailableSlots(apt.preferred_date);
  };

  const fetchAvailableSlots = async (date) => {
    try {
      const response = await fetch(`/api/available-slots?date=${date}`);
      const data = await response.json();
      if (data.success) {
        // Include the current time slot as it's the appointment's own slot
        const slots = [...data.availableSlots];
        if (rescheduleModal && rescheduleModal.preferred_date === date) {
          if (!slots.includes(rescheduleModal.preferred_time)) {
            slots.push(rescheduleModal.preferred_time);
            slots.sort();
          }
        }
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleDateChange = async (date) => {
    setNewDate(date);
    setNewTime('');
    await fetchAvailableSlots(date);
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) return;

    setIsRescheduling(true);
    try {
      const response = await fetch(`/api/appointments/${rescheduleModal.id}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredDate: newDate, preferredTime: newTime })
      });
      const data = await response.json();

      if (data.success) {
        setAppointments(prev => prev.map(apt =>
          apt.id === rescheduleModal.id
            ? { ...apt, preferred_date: newDate, preferred_time: newTime }
            : apt
        ));
        setRescheduleModal(null);
      } else {
        alert(data.message || 'Failed to reschedule');
      }
    } catch (error) {
      console.error('Reschedule error:', error);
      alert('Failed to reschedule appointment');
    } finally {
      setIsRescheduling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-300';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  // Client-side filtering
  const filteredAppointments = appointments.filter(apt => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (apt.full_name && apt.full_name.toLowerCase().includes(q)) ||
        (apt.phone_number && apt.phone_number.includes(q)) ||
        (apt.email && apt.email.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    // Status filter
    if (filter !== 'all' && apt.status !== filter) return false;
    // Date range filter
    if (startDate && apt.preferred_date && apt.preferred_date.slice(0, 10) < startDate) return false;
    if (endDate && apt.preferred_date && apt.preferred_date.slice(0, 10) > endDate) return false;
    return true;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setFilter('all');
  };

  // Fetch calendar data
  const fetchCalendarData = async () => {
    try {
      const response = await fetch(
        `/api/calendar?month=${calendarMonth}&year=${calendarYear}`
      );
      const data = await response.json();
      if (data.success) {
        setCalendarData(data);
      }
    } catch (error) {
      console.error('Error fetching calendar:', error);
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();
      if (reportStartDate) params.append('startDate', reportStartDate);
      if (reportEndDate) params.append('endDate', reportEndDate);

      const response = await fetch(`/api/reports/stats?${params}`);
      const data = await response.json();
      if (data.success) {
        setReportStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  // Fetch blocked dates
  const fetchBlockedDates = async () => {
    try {
      const response = await fetch('/api/blocked-dates');
      const data = await response.json();
      if (data.success) {
        setBlockedDates(data.blockedDates);
      }
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    }
  };

  // Add blocked date
  const addBlockedDate = async () => {
    if (!newBlockedDate) return;
    try {
      const response = await fetch('/api/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedDate: newBlockedDate, reason: newBlockedReason })
      });
      const data = await response.json();
      if (data.success) {
        setBlockedDates([...blockedDates, data.blockedDate]);
        setNewBlockedDate('');
        setNewBlockedReason('');
      }
    } catch (error) {
      console.error('Error adding blocked date:', error);
    }
  };

  // Delete blocked date
  const deleteBlockedDate = async (id) => {
    try {
      await fetch(`/api/blocked-dates/${id}`, { method: 'DELETE' });
      setBlockedDates(blockedDates.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting blocked date:', error);
    }
  };

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors');
      const data = await response.json();
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  // Add doctor
  const addDoctor = async () => {
    if (!newDoctorName) return;
    try {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDoctorName, specialization: newDoctorSpec })
      });
      const data = await response.json();
      if (data.success) {
        setDoctors([...doctors, data.doctor]);
        setNewDoctorName('');
        setNewDoctorSpec('');
      }
    } catch (error) {
      console.error('Error adding doctor:', error);
    }
  };

  // Delete doctor
  const deleteDoctor = async (id) => {
    try {
      await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
      setDoctors(doctors.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  };

  // Fetch services
  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Add service
  const addService = async () => {
    if (!newServiceName) return;
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newServiceName, duration: newServiceDuration, price: newServicePrice })
      });
      const data = await response.json();
      if (data.success) {
        setServices([...services, data.service]);
        setNewServiceName('');
        setNewServiceDuration(30);
        setNewServicePrice(0);
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  // Delete service
  const deleteService = async (id) => {
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
      setServices(services.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (filter !== 'all') params.append('status', filter);
    window.open(`/api/export/appointments?${params}`, '_blank');
  };

  // Send SMS
  const sendSMSReminder = async (apt) => {
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: apt.id })
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert('Failed to send SMS');
    }
  };

  // Print appointment slip
  const printSlip = (apt) => {
    setPrintAppointment(apt);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Load data when tab changes
  useEffect(() => {
    if (!isLoggedIn) return;

    if (activeTab === 'calendar') fetchCalendarData();
    if (activeTab === 'reports') fetchReports();
    if (activeTab === 'feedback') fetchCsm();
    if (activeTab === 'settings') {
      fetchBlockedDates();
      fetchDoctors();
      fetchServices();
    }

    // Auto-refresh appointments every 15 seconds when on appointments tab
    let appointmentsInterval;
    if (activeTab === 'appointments') {
      appointmentsInterval = setInterval(() => fetchAppointments(true), 15000);
    }

    // Auto-refresh calendar every 30 seconds when on calendar tab
    let calendarInterval;
    if (activeTab === 'calendar') {
      calendarInterval = setInterval(() => fetchCalendarData(), 30000);
    }
    return () => {
      if (appointmentsInterval) clearInterval(appointmentsInterval);
      if (calendarInterval) clearInterval(calendarInterval);
    };
  }, [activeTab, isLoggedIn, calendarMonth, calendarYear]);

  // Login Page
  if (!isLoggedIn) {
    return (
      <div className="bg-white min-h-screen pt-[70px] md:pt-[30px] pb-24 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="bg-white rounded-0 p-8 border border-[#e0e0e0] shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
              <p className="text-gray-500 mt-2">Sign in to access the dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-0 text-sm">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-gray-600 text-sm mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-[#e0e0e0] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-[#e0e0e0] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500"
                  placeholder="Enter password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-[#10B981] text-white font-semibold rounded-lg hover:bg-[#059669] transition-all disabled:opacity-50"
              >
                {isLoggingIn ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <button
              onClick={() => setCurrentPage('home')}
              className="w-full mt-4 py-3 bg-blue-100 text-blue-700 rounded-0 hover:bg-blue-200 transition-all text-sm"
            >
              <ChevronLeft className="w-3 h-3" /> Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} userProfile={{ name: username, role: 'Administrator' }} />

      <div className="flex-1 ml-[260px] p-0 h-screen overflow-hidden ring-1 ring-gray-100">
        <div className={`w-full ${['trips', 'scheduling'].includes(activeTab) ? 'h-full p-0' : 'h-full px-4 md:px-8 py-8 overflow-y-auto'}`}>
          {/* Top Header Removed */}

          {/* ==================== DASHBOARD TAB ==================== */}
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {[
                    { label: 'Total Bookings', value: appointments.length || '12,458', change: '+15.2%', positive: true, color: 'blue' },
                    { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length || '11,245', change: '+12.6%', positive: true, color: 'green' },
                    { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length || '1,213', change: '-5.4%', positive: false, color: 'red' },
                    { label: 'Ongoing', value: appointments.filter(a => a.status === 'pending').length || '256', change: '+8.6%', positive: true, color: 'orange' },
                    { label: 'No Show', value: '128', change: '+3.1%', positive: false, color: 'slate' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                      <div className="flex items-end justify-between">
                        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Chart/Map Area */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900">Recent Activity</h3>
                        <button className="text-xs font-bold text-[#00B14F]">View Detailed Report</button>
                      </div>
                      <div className="h-[300px] w-full bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                        <p className="text-gray-400 text-sm italic">Activity visualization placeholder</p>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Info Area */}
                  <div className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-6">System Status</h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Server Status', status: 'Optimal', color: 'bg-green-500' },
                          { label: 'Payment Gateway', status: 'Active', color: 'bg-green-500' },
                          { label: 'SMS Provider', status: 'Active', color: 'bg-green-500' }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl font-medium">
                            <span className="text-sm text-gray-600">{item.label}</span>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                              <span className="text-xs text-gray-900">{item.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== SCHEDULING TAB ==================== */}
            {activeTab === 'scheduling' && (
              <RideScheduling trips={trips} riders={riders} fetchTrips={fetchTrips} />
            )}

            {/* ==================== SERVICES TAB ==================== */}
            {activeTab === 'services' && (
              <div className="space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-light text-[#161616] uppercase tracking-tighter">Clinical Services</h2>
                    <p className="text-[#525252] text-sm mt-1">Configure prices, durations, and categories for bookings.</p>
                  </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Add/Edit Service Form */}
                  <div className="lg:col-span-1 border border-[#e0e0e0] bg-white p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-[#161616] uppercase tracking-wider">
                        {editingService ? 'Edit Service' : 'Add New Service'}
                      </h3>
                      {editingService && (
                        <button
                          onClick={() => { setEditingService(null); setNewService({ name: '', duration: '30m', price: 'PHP 0.00', icon: '', category: '', base_fare: 50, per_km_rate: 15 }); }}
                          className="text-[10px] text-blue-600 font-bold uppercase hover:underline"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Service Name</label>
                        <input
                          className="w-full px-4 py-3 bg-blue-50 border border-[#e0e0e0] rounded-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="Dental Cleaning"
                          value={newService.name}
                          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Price</label>
                          <input
                            className="w-full px-4 py-3 bg-blue-50 border border-[#e0e0e0] rounded-0 text-gray-800 focus:outline-none"
                            placeholder="PHP 50.00"
                            value={newService.price}
                            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Duration</label>
                          <input
                            className="w-full px-4 py-3 bg-blue-50 border border-[#e0e0e0] rounded-0 text-gray-800"
                            placeholder="30m"
                            value={newService.duration}
                            onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Category</label>
                        <div className="space-y-2">
                          <select
                            className="w-full px-4 py-3 bg-blue-50 border border-[#e0e0e0] rounded-0 text-gray-800"
                            value={newService.category === 'NEW_CATEGORY' ? 'NEW_CATEGORY' : (bookingServices.some(s => s.category === newService.category) ? newService.category : '')}
                            onChange={(e) => {
                              if (e.target.value === 'NEW_CATEGORY') {
                                setNewService({ ...newService, category: 'NEW_CATEGORY', customCategory: '' });
                              } else {
                                setNewService({ ...newService, category: e.target.value });
                              }
                            }}
                          >
                            <option value="">Select Category</option>
                            {[...new Set(bookingServices.map(s => s.category).filter(Boolean))].map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="NEW_CATEGORY">+ Create New Category...</option>
                          </select>

                          {newService.category === 'NEW_CATEGORY' && (
                            <input
                              autoFocus
                              className="w-full px-4 py-3 bg-white border-2 border-[#10b981] rounded-0 text-gray-800 placeholder-gray-400 focus:outline-none"
                              placeholder="Enter new category name"
                              value={newService.customCategory || ''}
                              onChange={(e) => setNewService({ ...newService, customCategory: e.target.value })}
                            />
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Select Icon</label>
                        <div className="grid grid-cols-5 gap-2 p-3 bg-gray-50 border border-[#e0e0e0]">
                          {[
                            { id: 'Car', icon: <Car size={16} /> },
                            { id: 'Truck', icon: <Truck size={16} /> },
                            { id: 'MapIcon', icon: <MapIcon size={16} /> },
                            { id: 'Navigation', icon: <Navigation size={16} /> },
                            { id: 'Stethoscope', icon: <Stethoscope size={16} /> },
                            { id: 'Syringe', icon: <Syringe size={16} /> },
                            { id: 'Pill', icon: <Pill size={16} /> },
                            { id: 'HeartPulse', icon: <HeartPulse size={16} /> },
                            { id: 'Activity', icon: <Activity size={16} /> },
                            { id: 'Hospital', icon: <Hospital size={16} /> },
                            { id: 'Clock', icon: <Clock size={16} /> },
                            { id: 'Calendar', icon: <Calendar size={16} /> },
                            { id: 'Star', icon: <Star size={16} /> },
                            { id: 'MapPin', icon: <MapPin size={16} /> },
                            { id: 'Phone', icon: <Phone size={16} /> },
                            { id: 'Mail', icon: <Mail size={16} /> },
                            { id: 'User', icon: <User size={16} /> },
                            { id: 'Shield', icon: <Lock size={16} /> },
                            { id: 'Settings', icon: <Settings size={16} /> },
                            { id: 'Store', icon: <Store size={16} /> },
                            { id: 'Printer', icon: <Printer size={16} /> }
                          ].map(ico => (
                            <button
                              key={ico.id}
                              type="button"
                              onClick={() => setNewService({ ...newService, icon: ico.id })}
                              className={`aspect-square flex items-center justify-center border transition-all ${newService.icon === ico.id ? 'bg-[#10b981] text-white border-[#10b981] shadow-md' : 'bg-white text-[#525252] border-gray-200 hover:border-blue-400'}`}
                              title={ico.id}
                            >
                              {ico.icon}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2 items-center">
                          <input
                            className="flex-1 px-3 py-2 text-xs bg-white border border-[#e0e0e0] rounded-0 text-gray-800"
                            placeholder="Or type icon name / emoji..."
                            value={newService.icon}
                            onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                          />
                          <div className="relative">
                            <input
                              type="file"
                              id="service-icon-upload"
                              className="hidden"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files?.[0]) {
                                  const file = e.target.files[0];
                                  const formData = new FormData();
                                  formData.append('file', file);
                                  try {
                                    const res = await fetch('/api/staff/upload', {
                                      method: 'POST',
                                      body: formData
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                      setNewService({ ...newService, icon: data.url });
                                    }
                                  } catch (err) {
                                    alert('Upload failed');
                                  }
                                }
                              }}
                            />
                            <label
                              htmlFor="service-icon-upload"
                              className="px-3 py-2 bg-[#f4f4f4] border border-[#e0e0e0] text-[10px] font-bold uppercase cursor-pointer hover:bg-gray-100"
                            >
                              Upload PNG
                            </label>
                          </div>
                        </div>
                      </div>

                      {newService.category?.toUpperCase() === 'TRANSPORT' || newService.category === 'NEW_CATEGORY' ? (
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#f4f4f4]">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest">Base Fare (Min)</label>
                            <input
                              type="number"
                              className="w-full px-4 py-3 bg-blue-50 border border-[#10b981] rounded-0 text-gray-800"
                              placeholder="50"
                              value={newService.base_fare}
                              onChange={(e) => setNewService({ ...newService, base_fare: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest">Rate per KM</label>
                            <input
                              type="number"
                              className="w-full px-4 py-3 bg-blue-50 border border-[#10b981] rounded-0 text-gray-800"
                              placeholder="15"
                              value={newService.per_km_rate}
                              onChange={(e) => setNewService({ ...newService, per_km_rate: e.target.value })}
                            />
                          </div>
                        </div>
                      ) : null}
                      <button
                        disabled={!newService.name || isAddingService || (newService.category === 'NEW_CATEGORY' && !newService.customCategory)}
                        onClick={async () => {
                          setIsAddingService(true);
                          try {
                            const payload = {
                              ...newService,
                              category: newService.category === 'NEW_CATEGORY' ? newService.customCategory : newService.category
                            };

                            const url = editingService
                              ? `/api/booking-services/${editingService.id}`
                              : '/api/booking-services';
                            const method = editingService ? 'PUT' : 'POST';

                            const res = await fetch(url, {
                              method: method,
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(payload)
                            });
                            const data = await res.json();

                            if (data.success) {
                              if (editingService) {
                                setBookingServices(bookingServices.map(s => s.id === editingService.id ? data.service : s));
                                alert('Service updated successfully!');
                                setEditingService(null);
                              } else {
                                setBookingServices([...bookingServices, data.service]);
                                alert('Service added successfully!');
                              }
                              setNewService({ name: '', duration: '30m', price: 'PHP 0.00', icon: '', category: payload.category, base_fare: 50, per_km_rate: 15 });
                            } else {
                              alert(data.message || 'Failed to save service');
                            }
                          } catch (err) {
                            console.error('Save error:', err);
                            alert('An error occurred while saving. Please try again.');
                          } finally {
                            setIsAddingService(false);
                          }
                        }}
                        className="w-full py-3 bg-[#10b981] text-white font-bold uppercase tracking-widest text-[12px] disabled:opacity-50 hover:bg-[#465a8f] transition-all"
                      >
                        {isAddingService ? 'Saving...' : (editingService ? 'Update Service' : 'Add Service')}
                      </button>
                    </div>
                  </div>

                  {/* Services List */}
                  <div className="lg:col-span-2 space-y-2">
                    <div className="flex bg-[#f4f4f4] p-3 border-b border-[#e0e0e0] text-[10px] font-bold text-[#525252] uppercase tracking-widest">
                      <div className="w-12">Icon</div>
                      <div className="flex-1">Service Name</div>
                      <div className="w-32">Category</div>
                      <div className="w-24">Price</div>
                      <div className="w-20">Actions</div>
                    </div>
                    {bookingServices.map(s => (
                      <div key={s.id} className="bg-white p-4 border-b border-[#e0e0e0] flex items-center gap-4 group hover:bg-gray-50">
                        <div className="w-12 text-[#10b981]">
                          <ServiceIconRender iconName={s.icon} className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#161616]">{s.name}</h4>
                          <p className="text-[10px] text-[#8d8d8d]">{s.duration}</p>
                        </div>
                        <div className="w-32">
                          <span className="bg-[#edf5ff] text-[#10b981] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">{s.category}</span>
                        </div>
                        <div className="w-24 font-mono font-bold text-[#161616]">
                          {s.category?.toUpperCase() === 'TRANSPORT' && parseFloat(s.base_fare) > 0 ? (
                            <div className="text-[10px]">
                              <div className="text-[#10b981]">PHP {parseFloat(s.base_fare).toFixed(0)} Base</div>
                              <div className="text-[#24a148]">PHP {parseFloat(s.per_km_rate).toFixed(0)}/km</div>
                            </div>
                          ) : s.price}
                        </div>
                        <div className="w-20 flex flex-col gap-1">
                          <button
                            onClick={() => {
                              setEditingService(s);
                              setNewService({
                                ...s,
                                customCategory: '',
                                base_fare: s.base_fare || 50,
                                per_km_rate: s.per_km_rate || 15
                              });
                            }}
                            className="text-[#10b981] text-[10px] uppercase font-bold tracking-widest hover:underline text-left"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (!s.id) {
                                alert('Error: Service ID missing. Please refresh the page.');
                                return;
                              }
                              if (window.confirm('Delete service?')) {
                                try {
                                  const res = await fetch(`/api/booking-services/${s.id}`, { method: 'DELETE' });
                                  const data = await res.json();
                                  if (data.success) {
                                    setBookingServices(bookingServices.filter(x => x.id !== s.id));
                                  } else {
                                    alert('Failed to delete: ' + (data.message || 'Unknown error'));
                                  }
                                } catch (err) {
                                  alert('Could not connect to server: ' + err.message);
                                }
                              }
                            }}
                            className="text-red-500 text-[10px] uppercase font-bold tracking-widest hover:underline text-left"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {bookingServices.length === 0 && (
                      <div className="py-12 text-center bg-[#f4f4f4] text-[#8d8d8d] text-sm uppercase font-mono">
                        No services defined
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* ==================== SPECIALISTS TAB ==================== */}
            {activeTab === 'specialists' && (
              <div className="space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-light text-[#161616] uppercase tracking-tighter">Clinical Specialists</h2>
                    <p className="text-[#525252] text-sm mt-1">Manage the medical professionals available for booking.</p>
                  </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Add Specialist Form */}
                  <div className="lg:col-span-1 border border-[#e0e0e0] bg-white p-6">
                    <h3 className="text-lg font-bold text-[#161616] mb-6 uppercase tracking-wider">Add New specialist</h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Full Name</label>
                        <input
                          className="w-full px-4 py-3 bg-blue-50 border border-[#e0e0e0] rounded-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="Dr. Jordan Smith"
                          value={newSpecialist.name}
                          onChange={(e) => setNewSpecialist({ ...newSpecialist, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Title / Specialty</label>
                        <input
                          className="w-full px-4 py-3 bg-blue-50 border border-[#e0e0e0] rounded-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="Chief Cardiologist"
                          value={newSpecialist.title}
                          onChange={(e) => setNewSpecialist({ ...newSpecialist, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Email Address</label>
                        <input
                          className="w-full px-4 py-3 bg-blue-50 border border-[#e0e0e0] rounded-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="jordan@healthcare.com"
                          value={newSpecialist.email}
                          onChange={(e) => setNewSpecialist({ ...newSpecialist, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Profile Image (URL)</label>
                        <input
                          className="w-full px-4 py-3 bg-blue-50 border border-[#e0e0e0] rounded-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="https://..."
                          value={newSpecialist.imageUrl}
                          onChange={(e) => setNewSpecialist({ ...newSpecialist, imageUrl: e.target.value })}
                        />
                      </div>
                      <button
                        disabled={!newSpecialist.name || isAddingSpecialist}
                        onClick={async () => {
                          setIsAddingSpecialist(true);
                          try {
                            const res = await fetch('/api/specialists', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(newSpecialist)
                            });
                            const data = await res.json();
                            if (data.success) {
                              setSpecialists([...specialists, data.specialist]);
                              setNewSpecialist({ name: '', title: '', email: '', imageUrl: '' });
                            }
                          } catch (err) {
                            alert('Failed to add specialist');
                          } finally {
                            setIsAddingSpecialist(false);
                          }
                        }}
                        className="w-full py-3 bg-[#10b981] text-white font-bold uppercase tracking-widest text-[12px] disabled:opacity-50 hover:bg-[#465a8f] transition-all"
                      >
                        {isAddingSpecialist ? 'Saving...' : 'Add Specialist'}
                      </button>
                    </div>
                  </div>

                  {/* Specialists List */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {specialists.map(s => (
                        <div key={s.id} className="bg-white border border-[#e0e0e0] p-6 flex gap-4 transition-all hover:bg-[#f4f4f4]">
                          <div className="w-16 h-16 bg-[#e0e0e0] flex items-center justify-center overflow-hidden flex-shrink-0">
                            {s.image_url ? <img src={s.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg></div>}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-[#161616]">{s.name}</h4>
                            <p className="text-xs text-[#10b981] font-medium">{s.title}</p>
                            <p className="text-[10px] text-[#8d8d8d] mt-1">{s.email}</p>
                            <button
                              onClick={async () => {
                                if (window.confirm('Delete this specialist?')) {
                                  try {
                                    await fetch(`/api/specialists/${s.id}`, { method: 'DELETE' });
                                    setSpecialists(specialists.filter(x => x.id !== s.id));
                                  } catch (err) {
                                    alert('Failed to delete');
                                  }
                                }
                              }}
                              className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-4 hover:underline"
                            >
                              Remove Specialist
                            </button>
                          </div>
                        </div>
                      ))}
                      {specialists.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-[#f4f4f4] border border-dashed border-[#e0e0e0] text-[#8d8d8d] text-sm font-mono uppercase">
                          No Specialists Registered
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== CORPORATE ACCOUNTS TAB ==================== */}
            {activeTab === 'corporate' && (
              <CorporateAccountsManagement />
            )}

            {/* ==================== RIDERS TAB ==================== */}
            {activeTab === 'riders' && (
              <RidersManagement riders={riders} setRiders={setRiders} />
            )}

            {/* ==================== TRIP MONITORING TAB ==================== */}
            {activeTab === 'trips' && (
              <TripMonitoring
                trips={trips}
                stats={tripStats}
                riders={riders}
                incidents={incidents}
                onRefresh={fetchTrips}
              />
            )}

            {/* ==================== RIDE SCHEDULING TAB ==================== */}
            {activeTab === 'scheduling' && (
              <RideDispatch
                trips={trips}
                stats={tripStats}
                riders={riders}
                onRefresh={() => { fetchTrips(); fetchAppointments(); }}
              />
            )}

            {/* ==================== GEOFENCING MANAGEMENT TAB ==================== */}
            {activeTab === 'geofencing' && (
              <GeofencingManagement />
            )}

            {/* ==================== APPOINTMENTS TAB ==================== */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">


                {/* Search & Filter Bar */}
                <div className="space-y-6">
                  {/* Search & Filter Bar */}
                  <div className="bg-white rounded-0 p-4 border border-[#e0e0e0] shadow-sm mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-gray-500 text-xs mb-1">Search Client</label>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name, phone, or email..."
                          className="w-full px-4 py-2 bg-blue-50 border border-blue-300 rounded-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-xs mb-1">From Date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-4 py-2 bg-blue-50 border border-blue-300 rounded-0 text-gray-800 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-xs mb-1">To Date</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-4 py-2 bg-blue-50 border border-blue-300 rounded-0 text-gray-800 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    {(searchQuery || startDate || endDate) && (
                      <button
                        onClick={clearFilters}
                        className="mt-3 text-sm text-[#10b981] hover:underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-0 text-sm font-medium whitespace-nowrap transition-all ${filter === f
                          ? 'bg-[#10b981] text-white'
                          : 'bg-white text-gray-600 hover:bg-blue-100 border border-[#e0e0e0]'
                          }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Appointments List */}
                  {isLoading ? (
                    <div className="text-center py-16">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981] mb-4"></div>
                      <p className="text-gray-500">Loading appointments...</p>
                    </div>
                  ) : filteredAppointments.length === 0 ? (
                    <div className="text-center py-16 bg-blue-50 rounded-0 border border-[#e0e0e0]">
                      <p className="text-gray-500">No appointments found</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-[#e0e0e0] shadow-sm overflow-hidden">
                      {/* Table Header */}
                      <div className="hidden md:grid md:grid-cols-[44px_1.4fr_1fr_0.9fr_0.7fr_0.8fr_0.9fr_1.1fr] gap-2 px-5 py-3 bg-[#161616] text-[10px] font-black text-white uppercase tracking-[1.5px] items-center border-b-2 border-[#24a148]">
                        <span className="text-[#24a148]">#</span>
                        <span>Client</span>
                        <span>Service</span>
                        <span>Company Code</span>
                        <span>Date</span>
                        <span>Time</span>
                        <span>Status</span>
                        <span className="text-right">Actions</span>
                      </div>
                      {filteredAppointments.map((apt, index) => (
                        <div key={apt.id} className={`grid grid-cols-1 md:grid-cols-[44px_1.4fr_1fr_0.9fr_0.7fr_0.8fr_0.9fr_1.1fr] gap-2 px-5 py-3 items-center text-sm border-b border-[#e0e0e0] hover:bg-[#f0fdf4] transition-all group ${index % 2 === 0 ? 'bg-white' : 'bg-[#f9fafb]'}`}>
                          {/* # */}
                          <span className="text-[#24a148] font-mono font-bold text-xs">{apt.id}</span>

                          {/* Client */}
                          <div className="min-w-0">
                            <p className="text-[#161616] font-bold text-[12px] truncate uppercase tracking-tight">{apt.full_name}</p>
                            <p className="text-gray-400 text-[10px] truncate font-mono">{apt.phone_number}</p>
                          </div>

                          {/* Service */}
                          <span className="text-[11px] text-[#525252] font-medium truncate">{apt.service_type}</span>

                          {/* Company Code */}
                          <span>
                            {apt.corporate_account_id ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f0fdf4] border border-[#24a148]/30 text-[#24a148] text-[10px] font-black uppercase tracking-widest">
                                {apt.corporate_account_number || apt.corporate_account_id}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-300 font-bold">—</span>
                            )}
                          </span>

                          {/* Date */}
                          <span className="text-[11px] text-[#525252] font-mono">{apt.preferred_date}</span>

                          {/* Time */}
                          <span className="text-[11px] text-[#525252] font-mono">{apt.preferred_time}</span>

                          {/* Status */}
                          <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-widest w-fit border ${apt.status === 'confirmed' ? 'bg-[#f0fdf4] text-[#24a148] border-[#24a148]/30' :
                              apt.status === 'completed' ? 'bg-[#161616] text-white border-[#161616]' :
                                apt.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200' :
                                  apt.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    apt.status === 'queued' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                      'bg-gray-50 text-gray-500 border-gray-200'
                            }`}>
                            {apt.status}
                          </span>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-1 justify-end">
                            {(apt.status === 'pending' || apt.status === 'queued' || apt.status === 'confirmed') && (
                              <button onClick={() => openRescheduleModal(apt)} className="px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold hover:bg-purple-100 transition-all border border-purple-200 uppercase tracking-wide">
                                Reschedule
                              </button>
                            )}
                            {(apt.status === 'pending' || apt.status === 'queued') && (
                              <>
                                <button onClick={() => updateStatus(apt.id, 'confirmed')} disabled={updatingId === apt.id} className="px-2 py-1 bg-[#f0fdf4] text-[#24a148] text-[10px] font-bold hover:bg-[#24a148] hover:text-white transition-all border border-[#24a148]/30 uppercase tracking-wide disabled:opacity-50">
                                  Confirm
                                </button>
                                <button onClick={() => updateStatus(apt.id, 'cancelled')} disabled={updatingId === apt.id} className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold hover:bg-red-600 hover:text-white transition-all border border-red-200 uppercase tracking-wide disabled:opacity-50">
                                  Cancel
                                </button>
                              </>
                            )}
                            {apt.status === 'confirmed' && (
                              <>
                                <button onClick={() => updateStatus(apt.id, 'completed')} disabled={updatingId === apt.id} className="px-2 py-1 bg-[#161616] text-white text-[10px] font-bold hover:bg-[#24a148] transition-all uppercase tracking-wide disabled:opacity-50">
                                  Complete
                                </button>
                                <button onClick={() => updateStatus(apt.id, 'cancelled')} disabled={updatingId === apt.id} className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold hover:bg-red-600 hover:text-white transition-all border border-red-200 uppercase tracking-wide disabled:opacity-50">
                                  Cancel
                                </button>
                              </>
                            )}
                            {(apt.status === 'cancelled' || apt.status === 'completed') && (
                              <button onClick={() => updateStatus(apt.id, 'pending')} disabled={updatingId === apt.id} className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold hover:bg-gray-200 transition-all border border-gray-200 uppercase tracking-wide disabled:opacity-50">
                                Reopen
                              </button>
                            )}
                            <button onClick={() => sendSMSReminder(apt)} className="px-2 py-1 bg-cyan-50 text-cyan-600 hover:bg-cyan-600 hover:text-white transition-all border border-cyan-200" title="Send SMS Reminder">
                              <Smartphone className="w-3 h-3" />
                            </button>
                            <button onClick={() => printSlip(apt)} className="px-2 py-1 bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white transition-all border border-gray-200" title="Print Appointment Slip">
                              <Printer className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Export Button */}
                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={exportToCSV}
                      className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-0 hover:bg-green-100 transition-all text-sm flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Export to CSV
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== QUEUE TAB ==================== */}
            {activeTab === 'queue' && (
              <QueueAdminTab setCurrentPage={setCurrentPage} />
            )}

            {/* ==================== CALENDAR TAB ==================== */}
            {activeTab === 'calendar' && (
              <div className="bg-white border border-[#e0e0e0] shadow-sm overflow-hidden">

                {/* Calendar Header */}
                <div className="bg-[#161616] px-8 py-5 flex items-center justify-between border-b-2 border-[#24a148]">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Calendar View</h2>
                    <p className="text-[10px] text-[#24a148] font-bold uppercase tracking-widest mt-0.5">Appointment Schedule</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (calendarMonth === 1) { setCalendarMonth(12); setCalendarYear(calendarYear - 1); }
                        else setCalendarMonth(calendarMonth - 1);
                      }}
                      className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-[#24a148] text-white transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-white font-black text-base uppercase tracking-widest min-w-[180px] text-center">
                      {new Date(calendarYear, calendarMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => {
                        if (calendarMonth === 12) { setCalendarMonth(1); setCalendarYear(calendarYear + 1); }
                        else setCalendarMonth(calendarMonth + 1);
                      }}
                      className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-[#24a148] text-white transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Legend */}
                <div className="px-6 py-3 bg-[#f9fafb] border-b border-[#e0e0e0] flex flex-wrap gap-4 items-center">
                  {[
                    { color: 'bg-[#24a148]', label: 'Confirmed' },
                    { color: 'bg-yellow-400', label: 'Pending' },
                    { color: 'bg-[#161616]', label: 'Completed' },
                    { color: 'bg-red-400', label: 'Cancelled' },
                    { color: 'bg-red-100 border border-red-300', label: 'Blocked Day' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 force-circle ${color}`}></span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
                    </div>
                  ))}
                  <div className="ml-auto text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {calendarData.appointments?.length || 0} bookings this month
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-[#e0e0e0]">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                    <div key={day} className={`py-3 text-center text-[10px] font-black uppercase tracking-[2px] ${i === 0 || i === 6 ? 'text-gray-300' : 'text-[#525252]'}`}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {(() => {
                    const firstDay = new Date(calendarYear, calendarMonth - 1, 1).getDay();
                    const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
                    const todayStr = new Date().toISOString().split('T')[0];
                    const days = [];

                    // Empty leading cells
                    for (let i = 0; i < firstDay; i++) {
                      days.push(<div key={`empty-${i}`} className="min-h-[110px] bg-[#fafafa] border-b border-r border-[#f0f0f0]" />);
                    }

                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayApts = calendarData.appointments?.filter(a => {
                        const d = (a.preferred_date || '').slice(0, 10);
                        return d === dateStr;
                      }) || [];
                      const isBlocked = calendarData.blockedDates?.some(b => b.blocked_date === dateStr);
                      const isToday = dateStr === todayStr;
                      const isWeekend = (new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6);

                      // Group by status for icons
                      const confirmed = dayApts.filter(a => a.status === 'confirmed');
                      const pending = dayApts.filter(a => a.status === 'pending');
                      const completed = dayApts.filter(a => a.status === 'completed');
                      const cancelled = dayApts.filter(a => a.status === 'cancelled');

                      days.push(
                        <div
                          key={day}
                          className={`min-h-[110px] border-b border-r border-[#e0e0e0] p-2 relative transition-all group
                            ${isBlocked ? 'bg-red-50' :
                              isToday ? 'bg-[#f0fdf4]' :
                                isWeekend ? 'bg-[#fafafa]' : 'bg-white'}
                            hover:bg-[#f0fdf4]`}
                        >
                          {/* Day Number */}
                          <div className={`w-7 h-7 force-circle flex items-center justify-center text-[12px] font-black mb-1.5 transition-all
                            ${isToday
                              ? 'bg-[#24a148] text-white shadow-md'
                              : isBlocked
                                ? 'text-red-400'
                                : 'text-[#161616] group-hover:bg-[#24a148] group-hover:text-white'
                            }`}>
                            {day}
                          </div>

                          {/* Blocked Label */}
                          {isBlocked && (
                            <div className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">🚫 Closed</div>
                          )}

                          {/* Booking Icons */}
                          {dayApts.length > 0 && !isBlocked && (
                            <div className="space-y-0.5">
                              {/* Show up to 3 individual entries */}
                              {dayApts.slice(0, 3).map((apt, idx) => {
                                const dotColor =
                                  apt.status === 'confirmed' ? 'bg-[#24a148]' :
                                    apt.status === 'pending' ? 'bg-yellow-400' :
                                      apt.status === 'completed' ? 'bg-[#161616]' :
                                        apt.status === 'cancelled' ? 'bg-red-400' : 'bg-gray-300';

                                const icon =
                                  apt.status === 'confirmed' ? '✓' :
                                    apt.status === 'pending' ? '◷' :
                                      apt.status === 'completed' ? '●' :
                                        apt.status === 'cancelled' ? '✕' : '·';

                                return (
                                  <div
                                    key={idx}
                                    title={`${apt.full_name} · ${apt.preferred_time} · ${apt.status}`}
                                    className={`flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold cursor-default truncate
                                      ${apt.status === 'confirmed' ? 'bg-[#f0fdf4] text-[#24a148]' :
                                        apt.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                                          apt.status === 'completed' ? 'bg-[#f4f4f4] text-[#161616]' :
                                            apt.status === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'
                                      }`}
                                  >
                                    <span className={`w-1.5 h-1.5 force-circle flex-shrink-0 ${dotColor}`}></span>
                                    <span className="truncate">{apt.preferred_time?.split(' ')[0]} {apt.full_name?.split(' ')[0]}</span>
                                  </div>
                                );
                              })}

                              {/* +N more */}
                              {dayApts.length > 3 && (
                                <div className="text-[9px] font-black text-[#24a148] px-1 uppercase tracking-wide">
                                  +{dayApts.length - 3} more
                                </div>
                              )}
                            </div>
                          )}

                          {/* Total dot indicator in top-right if has bookings */}
                          {dayApts.length > 0 && (
                            <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5">
                              {confirmed.length > 0 && <span className="w-2 h-2 force-circle bg-[#24a148] block" title={`${confirmed.length} confirmed`}></span>}
                              {pending.length > 0 && <span className="w-2 h-2 force-circle bg-yellow-400 block" title={`${pending.length} pending`}></span>}
                              {completed.length > 0 && <span className="w-2 h-2 force-circle bg-[#161616] block" title={`${completed.length} completed`}></span>}
                              {cancelled.length > 0 && <span className="w-2 h-2 force-circle bg-red-400 block" title={`${cancelled.length} cancelled`}></span>}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return days;
                  })()}
                </div>
              </div>
            )}

            {/* ==================== REPORTS TAB ==================== */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                {/* Date Filter */}
                <div className="bg-white rounded-0 p-4 border border-[#e0e0e0] shadow-sm">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-gray-500 text-xs mb-1">Start Date</label>
                      <input
                        type="date"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        className="px-4 py-2 bg-blue-50 border border-blue-300 rounded-0 text-gray-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs mb-1">End Date</label>
                      <input
                        type="date"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        className="px-4 py-2 bg-blue-50 border border-blue-300 rounded-0 text-gray-800 text-sm"
                      />
                    </div>
                    <button
                      onClick={fetchReports}
                      className="px-4 py-2 bg-[#10b981] text-white rounded-0 font-medium text-sm"
                    >
                      Generate Report
                    </button>
                  </div>
                </div>

                {reportStats && (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-[#274690] rounded-0 p-4">
                        <p className="text-blue-200 text-xs uppercase">Total Appointments</p>
                        <p className="text-3xl font-bold text-white">{reportStats.totals?.total || 0}</p>
                      </div>
                      <div className="bg-[#274690] rounded-0 p-4">
                        <p className="text-blue-200 text-xs uppercase">Completed</p>
                        <p className="text-3xl font-bold text-white">{reportStats.totals?.completed || 0}</p>
                      </div>
                      <div className="bg-[#274690] rounded-0 p-4">
                        <p className="text-blue-200 text-xs uppercase">Cancelled</p>
                        <p className="text-3xl font-bold text-white">{reportStats.totals?.cancelled || 0}</p>
                      </div>
                      <div className="bg-[#274690] rounded-0 p-4">
                        <p className="text-blue-200 text-xs uppercase">Completion Rate</p>
                        <p className="text-3xl font-bold text-white">
                          {reportStats.totals?.total > 0
                            ? Math.round((reportStats.totals.completed / reportStats.totals.total) * 100)
                            : 0}%
                        </p>
                      </div>
                    </div>

                    {/* By Service */}
                    <div className="bg-white rounded-0 p-6 border border-[#e0e0e0] shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointments by Service</h3>
                      <div className="space-y-3">
                        {reportStats.byService?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-gray-600">{item.service_type}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-2 bg-blue-50 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#10b981]"
                                  style={{ width: `${(item.count / reportStats.totals.total) * 100}%` }}
                                />
                              </div>
                              <span className="text-gray-800 font-medium w-8 text-right">{item.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Peak Hours */}
                    <div className="bg-white rounded-0 p-6 border border-[#e0e0e0] shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Time Slots</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {reportStats.hourly?.map((item, idx) => (
                          <div key={idx} className="bg-blue-50 rounded-0 p-3 text-center">
                            <p className="text-[#10b981] font-medium">{item.time}</p>
                            <p className="text-gray-500 text-sm">{item.count} bookings</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-8 animate-fadeIn">
                <h3 className="text-3xl font-light uppercase tracking-tight">Customer Satisfaction Measurement</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Overall CSAT', val: (csmStats?.excellentPercent || '0') + '%', color: '#10b981' },
                    { label: 'Total Responses', val: csmStats?.totalResponses || '0', color: '#161616' },
                    { label: 'Net Promoter Score', val: (csmStats?.nps || '0'), color: '#24a148' }
                  ].map(stat => (
                    <div key={stat.label} className="bg-[#f4f4f4] p-8 border-l-4" style={{ borderColor: stat.color }}>
                      <p className="text-xs uppercase text-[#525252] mb-2 font-bold">{stat.label}</p>
                      <p className="text-4xl font-light">{stat.val}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#f4f4f4] p-12 border border-[#e0e0e0]">
                  <h4 className="text-sm font-bold uppercase mb-8 tracking-widest text-[#10b981]">Service Quality Dimensions (ARTA Standards)</h4>
                  <div className="space-y-4">
                    {csmStats?.sqdAverages && Object.entries(csmStats.sqdAverages).map(([q, val]) => (
                      <div key={q} className="flex items-center justify-between p-4 bg-white border border-[#e0e0e0]">
                        <span className="text-xs uppercase font-bold text-[#525252]">{q}</span>
                        <div className="flex items-center space-x-4">
                          <div className="w-64 h-2 bg-[#e0e0e0]">
                            <div className="h-full bg-[#10b981]" style={{ width: `${(parseFloat(val) || 0) * 20}%` }}></div>
                          </div>
                          <span className="text-sm font-bold">{val} / 5.00</span>
                        </div>
                      </div>
                    ))}
                    {!csmStats?.sqdAverages && <p className="text-[#c6c6c6] text-center py-8">No data available for the selected range</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && <SystemSettingsModule />}

            {/* Reschedule Modal */}
            {rescheduleModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-white shadow-xl rounded-0 p-6 w-full max-w-md border border-[#e0e0e0]">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Reschedule Appointment</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Client: <span className="text-gray-800">{rescheduleModal.full_name}</span>
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-500 text-sm mb-2">New Date</label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-blue-50 border border-blue-300 rounded-0 text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-500 text-sm mb-2">New Time</label>
                      <select
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full px-4 py-3 bg-blue-50 border border-blue-300 rounded-0 text-gray-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select time slot</option>
                        {availableSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      {availableSlots.length === 0 && newDate && (
                        <p className="text-red-400 text-sm mt-1">No slots available for this date</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setRescheduleModal(null)}
                      className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-0 hover:bg-blue-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReschedule}
                      disabled={!newDate || !newTime || isRescheduling}
                      className="flex-1 py-3 bg-[#10b981] text-white font-semibold rounded-0 hover:bg-[#465a8f] transition-all disabled:opacity-50"
                    >
                      {isRescheduling ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>

          {/* Print Appointment Slip */}
          {printAppointment && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 print:bg-white print:p-0">
              <div className="bg-white rounded-0 p-8 w-full max-w-md print:rounded-none print:shadow-none">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-900">HealthCare Clinic</h2>
                  <p className="text-stone-600 text-sm">Cantecson, Gairan, Bogo City, Cebu</p>
                </div>
                <div className="border-t border-b border-stone-200 py-4 mb-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Appointment Slip</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Client:</strong> {printAppointment.full_name}</p>
                    <p><strong>Service:</strong> {printAppointment.service_type}</p>
                    <p><strong>Date:</strong> {printAppointment.preferred_date}</p>
                    <p><strong>Time:</strong> {printAppointment.preferred_time}</p>
                    <p><strong>Reference #:</strong> {printAppointment.id}</p>
                  </div>
                </div>
                <p className="text-xs text-stone-500 text-center">Please arrive 10 minutes before your scheduled time.</p>
                <div className="mt-6 flex gap-3 print:hidden">
                  <button
                    onClick={() => setPrintAppointment(null)}
                    className="flex-1 py-2 bg-stone-200 text-stone-700 rounded-0"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2 bg-blue-700 text-white rounded-0"
                  >
                    Print
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// My Appointment Page - Client Self-Service
const MyAppointment = ({ token: initialToken }) => {
  const [token, setToken] = useState(initialToken || '');
  const [email, setEmail] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const trackerRef = React.useRef(null);
  const trackingActive = React.useRef(false);

  useEffect(() => {
    if (initialToken) fetchByToken(initialToken);
  }, [initialToken]);

  const fetchByToken = async (tk) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patient/appointment/${tk}`);
      const data = await res.json();
      if (data.success) {
        setAppointment(data.appointment);
        if (data.appointment.service_type?.toUpperCase().includes('TRANSPORT')) {
          startTracking(tk);
        }
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const startTracking = (tk) => {
    if (trackingActive.current) return;
    trackingActive.current = true;

    if (trackerRef.current) clearInterval(trackerRef.current);
    const fetchTracker = async () => {
      try {
        const res = await fetch(`/api/patient/appointment/${tk}/tracker`);
        const data = await res.json();
        if (data.success && data.tracking) {
          setTrackingData(data.tracking);
        }
      } catch (e) { }
    };

    fetchTracker(); // initial fetch
    trackerRef.current = setInterval(fetchTracker, 5000);
  };

  useEffect(() => {
    return () => { if (trackerRef.current) clearInterval(trackerRef.current); };
  }, []);

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    if (!email || !referenceId) {
      setError('Please provide both email and reference ID.');
      return;
    }

    setLoading(true);
    setError('');
    console.log('Starting appointment lookup for:', { email, referenceId });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.warn('Lookup request timed out after 10s');
    }, 10000);

    try {
      const res = await fetch('/api/patient/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          referenceId: referenceId.trim()
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('Lookup response status:', res.status);

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new TypeError("Oops, we didn't get JSON back from the server!");
      }

      const data = await res.json();
      console.log('Lookup data received:', data);

      if (data.success && data.appointment) {
        setAppointment(data.appointment);
        if (data.appointment.cancel_token) {
          setToken(data.appointment.cancel_token);
          const isTransport = data.appointment.service_type?.toUpperCase().includes('TRANSPORT') ||
            data.appointment.service_type?.toUpperCase().includes('VAN') ||
            data.appointment.rider_id;
          if (isTransport) {
            console.log('Transport service detected, starting tracking...');
            startTracking(data.appointment.cancel_token);
          }
        }
      } else {
        setError(data.message || 'Appointment not found. Please check your details.');
      }
    } catch (err) {
      console.error('Lookup detailed error:', err);
      if (err.name === 'AbortError') {
        setError('Request timed out. The server is taking too long to respond.');
      } else if (err instanceof TypeError) {
        setError('Connection error or invalid response from server.');
      } else {
        setError(err.message || 'An unexpected error occurred during lookup.');
      }
    } finally {
      setLoading(false);
      console.log('Lookup process finished.');
    }
  };

  if (appointment) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="bg-white border border-[#1c1917] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className={`px-4 py-1 text-[10px] font-bold uppercase tracking-widest border ${appointment.status === 'confirmed' || appointment.status === 'completed' ? 'bg-green-50 border-green-600 text-green-700' :
              appointment.status === 'pending' || appointment.status === 'queued' ? 'bg-blue-50 border-blue-600 text-blue-700' :
                'bg-red-50 border-red-600 text-red-700'
              }`}>
              {appointment.status}
            </span>
          </div>

          <h2 className="text-3xl font-black text-[#1c1917] mb-6 uppercase tracking-tighter italic">Tracking Order</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-1">Customer</p>
                <p className="font-bold text-lg text-[#1c1917]">{appointment.full_name}</p>
              </div>
              <div className="flex gap-10">
                <div>
                  <p className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-1">Vehicle / Service</p>
                  <p className="font-bold text-[#1c1917]">{appointment.service_type}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-1">Status</p>
                  <p className="font-bold text-[#10b981] uppercase text-xs">{appointment.status}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-1">Scheduled Time</p>
                <p className="font-bold text-[#1c1917] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#666]" />
                  {new Date(appointment.preferred_date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-sm font-bold text-[#666] mt-1 ml-6">{appointment.preferred_time}</p>
              </div>
            </div>

            <div className="bg-[#f8f9fa] p-8 border-l-8 border-[#1c1917] shadow-sm">
              <div className="mb-6">
                <p className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">Reference ID</p>
                <p className="text-3xl font-black text-[#1c1917] tracking-tighter">#{appointment.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">Pickup Point</p>
                <p className="text-sm font-bold text-[#1c1917] leading-relaxed italic">"{appointment.pickup_location}"</p>
              </div>
            </div>
          </div>

          {(appointment.service_type?.toUpperCase().includes('TRANSPORT') ||
            appointment.service_type?.toUpperCase().includes('VAN') ||
            appointment.service_type?.toUpperCase().includes('BICYCLE') ||
            appointment.service_type?.toUpperCase().includes('MOTOR') ||
            appointment.service_type?.toUpperCase().includes('CAR') ||
            appointment.pickup_lat ||
            trackingData?.rider_id) && (
              <div className="mt-10 pt-10 border-t border-[#1c1917] animate-in slide-in-from-bottom duration-500">
                <div className="h-[450px] bg-gray-50 border border-[#e0e0e0] shadow-inner relative z-0 overflow-hidden group">
                  <LiveTrackingMap
                    riderPos={trackingData?.current_lat ? { lat: parseFloat(trackingData.current_lat), lng: parseFloat(trackingData.current_lng) } : null}
                    pickupPos={trackingData?.pickup_lat ? { lat: parseFloat(trackingData.pickup_lat), lng: parseFloat(trackingData.pickup_lng) } :
                      (appointment.pickup_lat ? { lat: parseFloat(appointment.pickup_lat), lng: parseFloat(appointment.pickup_lng) } : null)}
                    destPos={trackingData?.dest_lat ? { lat: parseFloat(trackingData.dest_lat), lng: parseFloat(trackingData.dest_lng) } :
                      (appointment.dest_lat ? { lat: parseFloat(appointment.dest_lat), lng: parseFloat(appointment.dest_lng) } : null)}
                    status={trackingData?.transport_status || appointment.status}
                  />

                  {/* Status Floating Badge */}
                  <div className="absolute top-4 left-4 z-[1000] bg-[#1c1917] text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-xl">
                    {trackingData?.transport_status?.replace(/_/g, ' ') || (trackingData?.rider_id ? 'Assigned' : 'Searching for Rider')}
                  </div>
                </div>

                {/* Rider Info Card - Only show if rider assigned */}
                {trackingData && trackingData.rider_id ? (
                  <div className="mt-6 bg-white border-2 border-[#1c1917] p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
                    <div className="flex items-center gap-6 flex-1 w-full">
                      <div className="relative">
                        <div className="w-20 h-20 bg-[#1c1917] rounded-full flex items-center justify-center text-white text-3xl font-black border-4 border-[#f4f4f4] transition-transform group-hover:scale-105 duration-300">
                          {trackingData.rider_name?.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h4 className="text-2xl font-black text-[#1c1917] uppercase tracking-tighter italic leading-none">{trackingData.rider_name}</h4>
                          <span className="bg-yellow-400 text-[#1c1917] px-2 py-1 rounded-sm text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                            <Star className="w-2.5 h-2.5" />
                            4.9 Rating
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-12 border-t border-gray-100 pt-4">
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Vehicle</p>
                            <p className="text-xs font-black text-[#1c1917] uppercase leading-none">{trackingData.vehicle_type || 'Luxury Transport'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Plate</p>
                            <p className="text-xs font-black text-[#10b981] uppercase leading-none">{trackingData.plate_number || '---'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                      <a href={`tel:${trackingData.rider_phone}`} className="flex-1 md:flex-none bg-[#1c1917] text-white px-10 py-5 font-black text-xs uppercase tracking-[2px] hover:bg-green-600 transition-all flex items-center justify-center gap-3 shadow-xl">
                        <Phone className="w-4 h-4" />
                        Contact Driver
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 bg-[#f4f4f4] border border-dashed border-[#1c1917] p-6 text-center">
                    <p className="text-[10px] font-black text-[#1c1917] uppercase tracking-widest animate-pulse">Waiting for a rider to accept your request...</p>
                  </div>
                )}
              </div>
            )}

          <div className="mt-10 pt-6 border-t border-[#f4f4f4] flex flex-wrap gap-4">
            <button onClick={() => setAppointment(null)} className="px-6 py-3 bg-[#1c1917] text-white text-xs font-black uppercase tracking-widest hover:bg-[#333] transition-all">Track New Order</button>
            <button onClick={() => window.print()} className="px-6 py-3 border border-[#e0e0e0] text-[#666] text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">Download Receipt</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="bg-white border border-[#1c1917] p-8 shadow-xl">
        <h2 className="text-2xl font-black text-[#1c1917] mb-6 uppercase tracking-tighter italic">Track Order</h2>
        <p className="text-[10px] text-[#10b981] font-black mb-4 uppercase tracking-[2px]">Customer Lookup</p>
        <p className="text-xs text-[#666] mb-8 leading-relaxed uppercase tracking-wide">Enter your <strong>Email</strong> and <strong>Reference ID</strong> (sent to your contact) to track your driver in real-time.</p>

        <form onSubmit={handleLookup} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-[#333] mb-2 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#f4f4f4] border-0 p-4 text-sm focus:ring-2 focus:ring-[#1c1917] outline-none"
              placeholder="name@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#333] mb-2 uppercase tracking-widest">Reference ID</label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="w-full bg-[#f4f4f4] border-0 p-4 text-sm focus:ring-2 focus:ring-[#1c1917] outline-none font-bold"
              placeholder="e.g. 501"
              required
            />
          </div>
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs border border-red-100 font-bold">{error}</div>}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-[#1c1917] text-white p-5 font-black text-xs tracking-widest hover:bg-[#333] transition-all shadow-lg uppercase"
          >
            {loading ? 'AUTHENTICATING...' : 'Search Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Header Component
function Header({ currentPage, setCurrentPage, searchQuery, setSearchQuery }) {
  if (currentPage === 'admin') return null;
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'queue', label: 'Queue' },
    { id: 'queue-display', label: 'Display' },
    { id: 'queue-teller', label: 'Teller' },
    { id: 'survey', label: 'Feedback' }
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[100px] bg-[#161616] text-white">
      <div className="w-full px-8 h-[70px] flex items-center justify-between border-b border-[#393939]">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-bold uppercase tracking-tight cursor-pointer" onClick={() => setCurrentPage('home')}>Service<span className="font-light">Box</span></h1>
          <nav className="hidden lg:flex items-center space-x-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setCurrentPage(t.id)} className={`px-4 py-6 text-sm font-medium transition-all border-b-2 ${currentPage === t.id ? 'border-[#10b981] text-white' : 'border-transparent text-[#c6c6c6] hover:text-white'}`}>{t.label}</button>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => { localStorage.setItem('adminActiveTab', 'settings'); setCurrentPage('admin'); }} className="p-2 hover:bg-[#262626]"><Settings className="w-5 h-5 text-[#c6c6c6]" /></button>
          <button onClick={() => setCurrentPage('queue-teller')} className="bg-[#10b981] px-4 py-2 text-sm font-medium hover:bg-[#0353e9]">LOG IN</button>
        </div>
      </div>
      <div className="w-full h-[30px] bg-[#161616] flex items-center px-8 border-b border-[#393939]">
        <p className="text-[10px] font-mono text-[#c6c6c6] uppercase tracking-[0.16px]">IBM Carbon v11 / Enterprise Queuing System</p>
      </div>
    </header>
  );
}

// Home Page
function HomePage({ setCurrentPage }) {
  return (
    <div>
      {/* Booking Form Section */}
      <section className="bg-[#f4f4f4] py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-8">
          <div className="mb-12 text-center">
            <h2 className="text-5xl font-light text-[#161616] uppercase tracking-tighter">Booking Engine</h2>
            <p className="text-[#525252] mt-2 text-sm uppercase tracking-widest font-bold opacity-60">Complete the steps below to schedule your visit</p>
          </div>
          <AppointmentForm />
        </div>
      </section>


      {/* Footer Section */}
      <footer id="location-section" className="bg-[#161616] border-t border-[#393939] py-24">
        <div className="w-full px-8">
          <div className="max-w-6xl mx-auto">
            {/* Footer Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 mb-12">
              {/* About */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <h4 className="text-[20px] font-semibold text-[#f4f4f4] uppercase tracking-wider">Service<span className="font-light">Box</span></h4>
                </div>
                <p className="text-[#c6c6c6] text-sm leading-relaxed">
                  Enterprise-grade queuing and scheduling solution built for modern medical facilities. Corporate precision in every interaction.
                </p>
                <div className="flex space-x-2 mt-8">
                  <a href="#" className="w-10 h-10 bg-[#262626] hover:bg-[#10b981] flex items-center justify-center text-white transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-[#262626] hover:bg-[#10b981] flex items-center justify-center text-white transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-[#262626] hover:bg-[#10b981] flex items-center justify-center text-white transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-[#f4f4f4] font-semibold mb-6 uppercase text-[12px] tracking-[0.32px]">Address</h4>
                <div className="text-[#c6c6c6] text-sm space-y-1">
                  <p>San Vicente</p>
                  <p>Bogo City, Cebu</p>
                  <p>Philippines 6010</p>
                </div>
              </div>

              <div>
                <h4 className="text-[#f4f4f4] font-semibold mb-6 uppercase text-[12px] tracking-[0.32px]">Contact</h4>
                <div className="text-[#c6c6c6] text-sm space-y-3">
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +63 927 623 0491
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    rodge.tonacao@gmail.com
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div>
                <h4 className="text-[#f4f4f4] font-semibold mb-6 uppercase text-[12px] tracking-[0.32px]">Hours</h4>
                <div className="text-[#c6c6c6] text-sm space-y-1">
                  <p>Mon - Fri: 8:00 AM - 6:00 PM</p>
                  <p>Saturday: 8:00 AM - 12:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-[#393939] mt-16 pt-8 text-center">
              <p className="text-[#6f6f6f] text-xs uppercase tracking-widest leading-loose">
                2026 Roger Tonacao. ServiceBox | All rights reserved. |
                <button onClick={() => setCurrentPage('my-appointment')} className="hover:text-[#10b981] transition-all ml-1">My Appointment</button> |
                <button onClick={() => setCurrentPage('admin')} className="hover:text-[#10b981] transition-all ml-1">Admin</button>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Menu Page
function MenuPage({ selectedCategory, setSelectedCategory, searchQuery, menuData, isLoading }) {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        const data = await response.json();
        if (data.success) {
          setServices(data.services);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Service icons mapping
  const serviceIcons = {
    'General Consultation': '',
    'Dental Cleaning': '',
    'Eye Examination': '',
    'Vaccination': '',
    'Laboratory Tests': '',
    'Physical Therapy': '',
    'default': ''
  };

  // Service colors for deck cards
  const deckColors = [
    'from-[#55A2F5] to-[#2D72C0]',
    'from-amber-100 to-amber-200',
    'from-orange-100 to-orange-200',
    'from-rose-100 to-rose-200',
    'from-violet-100 to-violet-200',
    'from-cyan-100 to-cyan-200',
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative py-16 px-8 text-center bg-gradient-to-b from-blue-700 to-blue-800">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1 bg-[#10b981]/20 text-[#10b981] rounded-full text-sm font-medium mb-4">
            Our Healthcare Services
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Quality Care for Your
            <span className="text-[#10b981]"> Well-being</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Comprehensive healthcare services tailored to meet your needs. Scroll down to explore our services.
          </p>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Sticky Deck Services */}
      <div className="relative px-4 md:px-8 pb-32">
        {loadingServices ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981] mb-4"></div>
            <p className="text-xl text-blue-700 font-medium">Loading services...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="group relative bg-white border border-gray-100 hover:border-[#10b981] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col"
              >
                {/* Image/Icon Section */}
                <div className="h-56 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                  <div className="w-32 h-32 bg-white/80 force-circle flex items-center justify-center shadow-xl border-4 border-white transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 z-10">
                    <span className="text-6xl">
                      {serviceIcons[service.name] || serviceIcons['default'] || 'ðŸ¥'}
                    </span>
                  </div>
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 bg-[#10b981] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 shadow-lg">
                    {service.category || 'General'}
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-black text-[#161616] uppercase tracking-tighter mb-2 group-hover:text-[#10b981] transition-colors leading-tight">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-[#10b981]">
                        {service.category?.toUpperCase() === 'TRANSPORT' && (service.base_fare > 0)
                          ? `₱${parseFloat(service.base_fare).toLocaleString()}`
                          : `₱${parseFloat(service.price).toLocaleString()}`}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {service.category?.toUpperCase() === 'TRANSPORT' ? '/ Start' : `/ ${service.duration || '30m'}`}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-500 text-xs leading-relaxed mb-8 line-clamp-3 font-medium italic opacity-70">
                    {service.description || 'Professional healthcare service tailored to provide the highest level of care and precision.'}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <Clock className="w-4 h-4 text-[#10b981]" />
                      {service.duration || '30'} MIN
                    </div>
                    <button
                      onClick={() => document.getElementById('appointment-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-6 py-3 bg-[#161616] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#10b981] transition-all flex items-center gap-2 group/btn shadow-lg"
                    >
                      Book Now
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Index Number */}
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white border border-gray-100 flex items-center justify-center text-gray-200 font-black text-xl group-hover:text-[#10b981] transition-colors z-20 shadow-sm">
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>
            ))}

            {services.length === 0 && (
              <div className="col-span-full text-center py-32 border-2 border-dashed border-gray-100 bg-gray-50">
                <p className="text-2xl text-gray-300 font-black uppercase tracking-widest">No services available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-white shadow-xl py-16 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Ready to Book Your Appointment?
          </h2>
          <p className="text-gray-500 mb-6">
            Our team of healthcare professionals is ready to provide you with the best care.
          </p>
          <button
            onClick={() => document.getElementById('appointment-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-[#10b981] text-white rounded-0 font-bold text-lg hover:bg-[#465a8f] transition-all shadow-lg hover:shadow-xl"
          >
            Schedule Now
          </button>
        </div>
      </div>
    </div>
  );
}

// Menu Item Card (Legacy - kept for compatibility)
function MenuItem({ item }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-[#eff6ff] rounded-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group w-full flex flex-row h-auto min-h-[273px] sm:min-h-[293px] hover:-translate-y-1">
      {/* Left side - Product Image */}
      <div className="bg-stone-100 p-3 sm:p-4 flex items-center justify-center w-48 sm:w-54 md:w-60 flex-shrink-0 relative">
        {item.image && item.image.startsWith('assets/') ? (
          <img src={item.image} alt={item.name} className="object-contain w-full h-48 sm:h-54 md:h-60 rounded-0 group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <div className="text-7xl sm:text-8xl md:text-9xl group-hover:scale-110 transition-transform duration-300">{item.image}</div>
        )}
        {item.popular && (
          <span className="absolute top-2 right-2 bg-blue-700 text-white px-2 py-1 rounded-full text-xs font-bold">
            Popular
          </span>
        )}
      </div>

      {/* Right side - Product Details */}
      <div className="p-4 sm:p-5 md:p-6 flex flex-col justify-start flex-1 min-w-0">
        <div className="mb-4">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-blue-900 mb-2 break-words">{item.name}</h3>
          <p className="text-stone-600 text-sm sm:text-base mb-3 line-clamp-2 font-normal">{item.description}</p>
        </div>
        <div className="flex flex-col gap-3 mt-auto">
          {item.sizes ? (
            <span className="text-sm sm:text-base md:text-lg font-semibold text-blue-900 break-words">
              From Php {item.sizes && item.sizes.length > 0 ? Math.min(...item.sizes.map(s => s.price)).toFixed(2) : "0.00"}
            </span>
          ) : (
            <span className="text-sm sm:text-base md:text-lg font-semibold text-blue-900 break-words">Php {item.price.toFixed(2)}</span>
          )}
          <button
            onClick={() => addToCart(item)}
            className="btn-animated bg-blue-700 text-white px-4 sm:px-5 py-3 rounded-0 hover:bg-blue-800 transition-all flex items-center justify-center space-x-2 text-sm font-semibold w-full whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Book Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Cart Drawer
function CartDrawer({ setShowCart, setCurrentPage }) {
  const { cartItems } = useCart();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" onClick={() => setShowCart(false)}>
      <div className="bg-gray-100 w-full max-w-md h-full overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
            <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <CartItemCard key={`${item.id}-${item.selectedSize || 'default'}-${index}`} item={item} />
                ))}
              </div>
              <button
                onClick={() => {
                  setShowCart(false);
                  setCurrentPage('cart');
                }}
                className="w-full bg-green-600 text-white py-4 rounded-full font-bold hover:bg-green-700 transition-all"
              >
                View Full Cart
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Cart Page
function CartPage({ setCurrentPage }) {
  const { cartItems, getTotalPrice } = useCart();
  const deliveryFee = 4.99;
  const tax = getTotalPrice() * 0.08;
  const total = getTotalPrice() + deliveryFee + tax;

  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="w-full px-8 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-sm text-gray-500 mb-6">Add some items to get started</p>
          <button
            onClick={() => setCurrentPage('menu')}
            className="bg-green-600 text-white px-6 py-2.5 rounded-0 text-sm font-medium hover:bg-green-700 transition-all"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="w-full px-8">
        <h1 className="text-2xl font-medium text-gray-800 mb-8 text-center">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item, index) => (
              <CartItemCard key={`${item.id}-${item.selectedSize || 'default'}-${index}`} item={item} detailed />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-0 shadow-sm p-5 sticky top-[160px] md:top-[120px]">
              <h3 className="text-base font-medium text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>Php {getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span>Php {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (8%)</span>
                  <span>Php {tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-base font-medium">
                    <span>Total</span>
                    <span className="text-green-600">Php {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('checkout')}
                className="w-full bg-green-600 text-white py-2.5 rounded-0 text-sm font-medium hover:bg-green-700 transition-all"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cart Item Card
function CartItemCard({ item, detailed = false }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="bg-white rounded-0 shadow-sm p-4 flex items-center gap-4">
      <div className="bg-gray-50 force-circle flex items-center justify-center w-16 h-16 flex-shrink-0 border border-gray-100 shadow-inner">
        {item.image && item.image.startsWith('assets/') ? (
          <img src={item.image} alt={item.name} className="object-contain w-full h-full force-circle" />
        ) : (
          <div className="text-3xl">{item.image}</div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-800 text-sm">{item.name}</h3>
        {item.selectedSize && <p className="text-gray-400 text-xs">Size: {item.selectedSize}</p>}
        <p className="text-green-600 font-medium text-sm">Php {item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
          className="bg-gray-100 hover:bg-gray-200 rounded-0 p-1.5 transition-all"
        >
          <Minus className="w-3 h-3 text-gray-600" />
        </button>
        <span className="font-medium text-sm w-6 text-center">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
          className="bg-green-600 hover:bg-green-700 text-white rounded-0 p-1.5 transition-all"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      {detailed && (
        <button
          onClick={() => removeFromCart(item.id, item.selectedSize)}
          className="text-gray-400 hover:text-red-500 p-1 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Checkout Page
function CheckoutPage({ setCurrentPage, clearCart }) {
  const { getTotalPrice, cartItems } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'cash',
    paymentReference: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('checking'); // 'checking', 'subscribed', 'not-subscribed', 'denied'

  // Check notification subscription status on mount
  useEffect(() => {
    const checkNotificationStatus = async () => {
      try {
        if (window.OneSignalDeferred) {
          window.OneSignalDeferred.push(async function (OneSignal) {
            const permission = await OneSignal.Notifications.permission;
            const playerId = await OneSignal.User.PushSubscription.id;

            if (permission === false) {
              setNotificationStatus('denied');
            } else if (playerId) {
              setNotificationStatus('subscribed');
            } else {
              setNotificationStatus('not-subscribed');
            }
          });
        } else {
          setNotificationStatus('not-subscribed');
        }
      } catch (err) {
        console.log('Error checking notification status:', err);
        setNotificationStatus('not-subscribed');
      }
    };

    checkNotificationStatus();
  }, []);

  // Function to request notification permission
  const requestNotificationPermission = async () => {
    try {
      if (window.OneSignalDeferred) {
        window.OneSignalDeferred.push(async function (OneSignal) {
          await OneSignal.Notifications.requestPermission();
          // Check status after requesting
          const playerId = await OneSignal.User.PushSubscription.id;
          if (playerId) {
            setNotificationStatus('subscribed');
          } else {
            const permission = await OneSignal.Notifications.permission;
            if (permission === false) {
              setNotificationStatus('denied');
            }
          }
        });
      }
    } catch (err) {
      console.log('Error requesting notification permission:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate payment reference for Bank Transfer only (GCash uses PayMongo)
    if (formData.paymentMethod === 'bank' && !formData.paymentReference.trim()) {
      alert('Please enter the Bank reference number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const deliveryFee = 4.99;
      const tax = getTotalPrice() * 0.08;
      const total = getTotalPrice() + deliveryFee + tax;

      // Format cart items as a string
      const itemsList = cartItems.map(item =>
        `${item.name}${item.selectedSize ? ` (${item.selectedSize})` : ''} (x${item.quantity}) - Php ${(item.price * item.quantity).toFixed(2)}`
      ).join(', ');

      // Format payment method display
      let paymentMethodDisplay = formData.paymentMethod;
      if (formData.paymentMethod === 'cash') {
        paymentMethodDisplay = 'Cash on Delivery';
      } else if (formData.paymentMethod === 'gcash') {
        paymentMethodDisplay = 'GCash';
      } else if (formData.paymentMethod === 'bank') {
        paymentMethodDisplay = `Bank Transfer (Ref: ${formData.paymentReference})`;
      }

      // Get OneSignal Player ID for customer notifications
      let playerId = null;
      try {
        if (window.OneSignalDeferred) {
          await new Promise((resolve) => {
            window.OneSignalDeferred.push(async function (OneSignal) {
              playerId = await OneSignal.User.PushSubscription.id;
              resolve();
            });
          });
        }
      } catch (err) {
        console.log('Could not get OneSignal player ID:', err);
      }

      // Send data to Google Sheets
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          barangay: formData.zipCode,
          paymentMethod: paymentMethodDisplay,
          paymentReference: formData.paymentReference || 'N/A',
          playerId: playerId || '',
          items: itemsList,
          subtotal: getTotalPrice().toFixed(2),
          deliveryFee: deliveryFee.toFixed(2),
          tax: tax.toFixed(2),
          total: total.toFixed(2)
        })
      });

      const result = await response.json();

      if (result.success) {
        // If GCash payment, redirect to PayMongo checkout
        if (result.requiresPayment && result.paymentUrl) {
          // Store order number for later reference
          localStorage.setItem('pendingOrder', result.orderNumber);
          // Redirect to GCash payment page
          window.location.href = result.paymentUrl;
        } else {
          // Clear cart and go to confirmation for non-GCash payments
          if (clearCart) clearCart();
          setCurrentPage('confirmation');
        }
      } else {
        alert('Error: ' + (result.error || 'Failed to process order'));
      }
    } catch (error) {
      console.error('Error processing order:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliveryFee = 4.99;
  const tax = getTotalPrice() * 0.08;
  const total = getTotalPrice() + deliveryFee + tax;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="w-full px-8">
        <h1 className="text-2xl font-medium text-gray-800 mb-8 text-center">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-0 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-base font-medium text-gray-700 mb-4">Delivery Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-0 border border-gray-300 focus:border-green-500 focus:outline-none text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-0 border border-gray-300 focus:border-green-500 focus:outline-none text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-0 border border-gray-300 focus:border-green-500 focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-0 border border-gray-300 focus:border-green-500 focus:outline-none text-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Street Address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-0 border border-gray-300 focus:border-green-500 focus:outline-none text-sm mt-3"
                />
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-0 border border-gray-300 focus:border-green-500 focus:outline-none text-sm mt-3"
                />
              </div>

              {/* Notification Subscription Prompt */}
              {notificationStatus === 'checking' && (
                <div className="bg-gray-50 border border-gray-200 rounded-0 p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                    <span className="text-sm text-gray-600">Checking notification status...</span>
                  </div>
                </div>
              )}

              {notificationStatus !== 'subscribed' && notificationStatus !== 'checking' && (
                <div className={`rounded-0 p-4 border-2 ${notificationStatus === 'denied'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-300'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {notificationStatus === 'denied' ? 'Notifications Denied' : 'Enable Notifications'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm mb-1">
                        {notificationStatus === 'denied'
                          ? 'Notifications Blocked'
                          : 'Get Order Updates'}
                      </h4>
                      <p className="text-xs text-gray-600 mb-3">
                        {notificationStatus === 'denied'
                          ? 'You\'ve blocked notifications. Enable them in your browser settings to receive real-time order updates.'
                          : 'Enable push notifications to receive real-time updates when your order is being prepared, out for delivery, and delivered!'}
                      </p>
                      {notificationStatus === 'not-subscribed' && (
                        <button
                          type="button"
                          onClick={requestNotificationPermission}
                          className="bg-green-600 text-white px-4 py-2 rounded-0 text-xs font-medium hover:bg-green-700 transition-all flex items-center gap-2"
                        >
                          <span>Notifications</span>
                          <span>Enable Notifications</span>
                        </button>
                      )}
                      {notificationStatus === 'denied' && (
                        <p className="text-xs text-red-600 font-medium">
                          To enable: Click the lock icon in your browser's address bar &rarr; Allow notifications
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {notificationStatus === 'subscribed' && (
                <div className="bg-green-50 border-2 border-green-300 rounded-0 p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">Notifications</div>
                    <div>
                      <h4 className="font-medium text-green-700 text-sm">Notifications Enabled</h4>
                      <p className="text-xs text-green-600">You'll receive updates when your order status changes!</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-base font-medium text-gray-700 mb-4">Payment Method</h3>
                <div className="space-y-2">
                  <label className={`flex items-center space-x-3 p-3 border rounded-0 cursor-pointer transition-all ${formData.paymentMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value, paymentReference: '' })}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm text-gray-700">Cash on Delivery</span>
                  </label>

                  <label className={`flex items-center space-x-3 p-3 border rounded-0 cursor-pointer transition-all ${formData.paymentMethod === 'gcash' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="gcash"
                      checked={formData.paymentMethod === 'gcash'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm text-gray-700">GCash</span>
                  </label>

                  <label className={`flex items-center space-x-3 p-3 border rounded-0 cursor-pointer transition-all ${formData.paymentMethod === 'bank' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="bank"
                      checked={formData.paymentMethod === 'bank'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm text-gray-700">Bank Transfer</span>
                  </label>
                </div>

                {/* Payment Instructions */}
                {formData.paymentMethod === 'cash' && (
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-0 p-4">
                    <h4 className="font-medium text-gray-700 text-sm mb-2">Cash on Delivery Instructions</h4>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                      <li>Prepare exact amount if possible</li>
                      <li>Payment will be collected upon delivery</li>
                      <li>Please have your order number ready</li>
                    </ul>
                  </div>
                )}

                {formData.paymentMethod === 'gcash' && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-0 p-4">
                    <h4 className="font-medium text-gray-700 text-sm mb-3">GCash Payment</h4>
                    <div className="space-y-3">
                      <div className="bg-white rounded-0 p-3 border border-green-100">
                        <p className="text-xs text-gray-500 mb-1">Amount to pay:</p>
                        <p className="text-lg font-medium text-green-600">Php {(getTotalPrice() + 4.99 + getTotalPrice() * 0.08).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Secure payment via PayMongo</span>
                      </div>
                      <div className="text-xs text-gray-600 bg-white rounded-0 p-3 border border-green-100">
                        <p className="font-medium mb-2">How it works:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Click "Place Order" below</li>
                          <li>You'll be redirected to GCash to complete payment</li>
                          <li>After payment, you'll return here automatically</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'bank' && (
                  <div className="mt-4 bg-blue-50 border border-[#e0e0e0] rounded-0 p-4">
                    <h4 className="font-medium text-gray-700 text-sm mb-3">Bank Transfer Instructions</h4>
                    <div className="space-y-3">
                      <div className="bg-white rounded-0 p-3 border border-blue-100">
                        <p className="text-xs text-gray-500 mb-2">Transfer to:</p>
                        <p className="text-xs text-gray-600">Bank: BDO</p>
                        <p className="text-xs text-gray-600">Account Name: Kuchefnero Restaurant</p>
                        <p className="text-base font-medium text-gray-800">Account #: 1234-5678-9012</p>
                      </div>
                      <div className="bg-white rounded-0 p-3 border border-blue-100">
                        <p className="text-xs text-gray-500 mb-1">Amount to transfer:</p>
                        <p className="text-lg font-medium text-[#10b981]">Php {(getTotalPrice() + 4.99 + getTotalPrice() * 0.08).toFixed(2)}</p>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p className="font-medium">After transfer:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Keep your bank receipt/confirmation</li>
                          <li>Enter the reference number below</li>
                          <li>Send photo of receipt to our contact number</li>
                        </ol>
                      </div>
                      <input
                        type="text"
                        placeholder="Enter Bank Reference Number"
                        value={formData.paymentReference}
                        onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                        className="w-full px-3 py-2 rounded-0 border border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-0 font-medium transition-all text-sm ${isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                {isSubmitting ? 'Processing...' : `Place Order - Php ${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-0 shadow-sm p-5 sticky top-[160px] md:top-[120px]">
              <h3 className="text-base font-medium text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>Php {getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span>Php {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (8%)</span>
                  <span>Php {tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-base font-medium">
                    <span>Total</span>
                    <span className="text-green-600">Php {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Confirmation Page
function ConfirmationPage({ setCurrentPage, orderNumber, paymentStatus }) {
  // Generate order number if not provided (for non-GCash orders)
  const displayOrderNumber = orderNumber || `ORD-${Date.now()}`;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="w-full px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-800 mb-1">
            {paymentStatus === 'success' ? 'Payment Successful!' : 'Order Confirmed'}
          </h1>
          <p className="text-sm text-gray-500">
            {paymentStatus === 'success' ? 'Your GCash payment has been received' : 'Thank you for your order'}
          </p>
        </div>

        {/* Order Number */}
        <div className="bg-green-600 rounded-0 p-4 mb-6 text-center">
          <div className="text-xs text-green-200 mb-1">Order Number</div>
          <div className="text-xl font-medium text-white">{displayOrderNumber}</div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-0 p-5 mb-6 shadow-sm">
          <h3 className="text-base font-medium text-gray-800 mb-4">Order Status</h3>

          <div className="space-y-0">
            {/* Order Confirmed */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="w-0.5 h-8 bg-green-500"></div>
              </div>
              <div className="pb-3">
                <div className="text-sm font-medium text-gray-800">Order Received</div>
                <div className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
              </div>
            </div>

            {/* Preparing */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="w-0.5 h-8 bg-gray-200"></div>
              </div>
              <div className="pb-3">
                <div className="text-sm font-medium text-gray-800">Preparing your order</div>
                <div className="text-xs text-gray-500">Estimated: 15-20 mins</div>
              </div>
            </div>

            {/* Out for Delivery */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Out for delivery</div>
                <div className="text-xs text-gray-400">Estimated arrival: 25-30 mins</div>
              </div>
            </div>
          </div>
        </div>

        {/* SMS Notice */}
        <div className="text-center mb-6">
          <p className="text-xs text-gray-500">You will receive a text message with delivery updates</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex-1 bg-green-600 text-white py-2.5 rounded-0 text-sm font-medium hover:bg-green-700 transition-all"
          >
            Back to Home
          </button>
          <button
            onClick={() => setCurrentPage('menu')}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-0 text-sm font-medium hover:bg-gray-200 transition-all"
          >
            Order Again
          </button>
        </div>
      </div>
    </div>
  );
}

// Payment Failed Page
function PaymentFailedPage({ setCurrentPage, orderNumber }) {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="w-full px-8 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-800 mb-1">Payment Failed</h1>
          <p className="text-sm text-gray-500">Your GCash payment was not completed</p>
        </div>

        {/* Order Number */}
        {orderNumber && (
          <div className="bg-gray-200 rounded-0 p-4 mb-6 text-center">
            <div className="text-xs text-gray-500 mb-1">Order Number</div>
            <div className="text-xl font-medium text-gray-700">{orderNumber}</div>
          </div>
        )}

        {/* Message */}
        <div className="bg-white rounded-0 p-5 mb-6 shadow-sm">
          <h3 className="text-base font-medium text-gray-800 mb-3">What happened?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Your payment was cancelled or failed to process. Your order has been saved but is awaiting payment.
          </p>
          <h3 className="text-base font-medium text-gray-800 mb-3">What can you do?</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>Try placing your order again with GCash</li>
            <li>Choose a different payment method (Cash on Delivery)</li>
            <li>Contact us if you need assistance</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setCurrentPage('checkout')}
            className="w-full bg-green-600 text-white py-2.5 rounded-0 text-sm font-medium hover:bg-green-700 transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => setCurrentPage('home')}
            className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-0 text-sm font-medium hover:bg-gray-200 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// Queue Admin Tab (inside AdminDashboard)
function QueueAdminTab({ setCurrentPage }) {
  const TEMPLATE_STORAGE_KEY = 'queueDisplayTemplate';
  const VALID_TEMPLATES = ['template1', 'template2', 'template3', 'template4', 'template5', 'template6'];
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ waiting: 0, serving: 0, completed: 0, skipped: 0, total: 0 });
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [tellers, setTellers] = useState([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypePrefix, setNewTypePrefix] = useState('');
  const [newWindowName, setNewWindowName] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [marqueeText, setMarqueeText] = useState('');
  const [marqueeSaving, setMarqueeSaving] = useState(false);
  const [displayTemplate, setDisplayTemplate] = useState(localStorage.getItem(TEMPLATE_STORAGE_KEY) || 'template1');
  const [templateSaving, setTemplateSaving] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [reportStartDate, setReportStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [batchStart, setBatchStart] = useState('');
  const [batchEnd, setBatchEnd] = useState('');
  const [batchPrefix, setBatchPrefix] = useState('M');
  const [batchType, setBatchType] = useState('');
  const [batchStatus, setBatchStatus] = useState('');

  const fetchAll = async () => {
    try {
      const [ticketsRes, typesRes, tellersRes, marqueeRes] = await Promise.all([
        fetch('/api/queue/tickets').then(r => r.json()),
        fetch('/api/queue/transaction-types').then(r => r.json()),
        fetch('/api/queue/tellers').then(r => r.json()),
        fetch('/api/queue/marquee').then(r => r.json())
      ]);
      if (ticketsRes.success) { setTickets(ticketsRes.tickets); setStats(ticketsRes.stats); }
      if (typesRes.success) setTransactionTypes(typesRes.types);
      if (tellersRes.success) setTellers(tellersRes.tellers);
      if (marqueeRes.success) setMarqueeText(marqueeRes.text);
      try {
        const templateRes = await fetch('/api/queue/display-template').then(r => r.json());
        if (templateRes.success && VALID_TEMPLATES.includes(templateRes.template)) {
          setDisplayTemplate(templateRes.template);
          localStorage.setItem(TEMPLATE_STORAGE_KEY, templateRes.template);
        } else {
          const localTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY);
          if (VALID_TEMPLATES.includes(localTemplate)) setDisplayTemplate(localTemplate);
        }
      } catch (_) {
        const localTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY);
        if (VALID_TEMPLATES.includes(localTemplate)) setDisplayTemplate(localTemplate);
      }
    } catch (err) {
      console.error('Error fetching queue data:', err);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const resetQueue = async () => {
    try {
      await fetch('/api/queue/reset', { method: 'POST' });
      setShowResetConfirm(false);
      fetchAll();
    } catch (err) { console.error('Error resetting queue:', err); }
  };

  const addTransactionType = async () => {
    if (!newTypeName || !newTypePrefix) return;
    try {
      await fetch('/api/queue/transaction-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTypeName, prefix: newTypePrefix })
      });
      setNewTypeName(''); setNewTypePrefix('');
      fetchAll();
    } catch (err) { console.error('Error adding type:', err); }
  };

  const handleBatchGenerate = async () => {
    if (!batchStart || !batchEnd || !batchType) {
      setBatchStatus('Please fill in range and type');
      return;
    }
    setBatchStatus('Generating...');
    try {
      const res = await fetch('/api/queue/batch-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: batchStart,
          end: batchEnd,
          prefix: batchPrefix,
          transactionType: batchType
        })
      });
      const data = await res.json();
      if (data.success) {
        setBatchStatus(`Success: ${data.count} tickets generated! Check "Today's Tickets" below.`);
        setBatchStart(''); setBatchEnd('');
        fetchAll();
      } else {
        setBatchStatus('Error: ' + data.message);
      }
    } catch (err) {
      setBatchStatus('Server error');
    }
  };

  const deleteTransactionType = async (id) => {
    try {
      await fetch(`/api/queue/transaction-types/${id}`, { method: 'DELETE' });
      fetchAll();
    } catch (err) { console.error('Error deleting type:', err); }
  };

  const addTeller = async () => {
    if (!newWindowName) return;
    try {
      await fetch('/api/queue/tellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windowName: newWindowName })
      });
      setNewWindowName('');
      fetchAll();
    } catch (err) { console.error('Error adding teller:', err); }
  };

  const deleteTeller = async (id) => {
    try {
      await fetch(`/api/queue/tellers/${id}`, { method: 'DELETE' });
      fetchAll();
    } catch (err) { console.error('Error deleting teller:', err); }
  };

  const updateWindowAssignments = async (tellerId, typeId, checked) => {
    const teller = tellers.find(t => t.id === tellerId);
    if (!teller) return;
    const currentIds = (teller.assigned_types || []).map(t => t.id);
    const newIds = checked
      ? [...currentIds, typeId]
      : currentIds.filter(id => id !== typeId);
    try {
      await fetch(`/api/queue/window-transactions/${tellerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionTypeIds: newIds })
      });
      fetchAll();
    } catch (err) { console.error('Error updating assignments:', err); }
  };

  const fetchReport = async () => {
    setReportLoading(true);
    try {
      const res = await fetch(`/api/queue/reports?startDate=${reportStartDate}&endDate=${reportEndDate}`);
      const data = await res.json();
      if (data.success) setReportData(data);
    } catch (err) { console.error('Error fetching report:', err); }
    setReportLoading(false);
  };

  const formatSeconds = (s) => {
    if (!s || s === 0) return '0s';
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  };

  const getQueueStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      case 'serving': return 'bg-green-50 text-green-700 border-green-300';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'skipped': return 'bg-red-50 text-red-700 border-red-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  return (
    <>
      {/* Analytics - Two Column: Queue Status + Timeliness */}
      {(() => {
        const chartData = [
          { label: 'Waiting', value: stats.waiting, color: '#F59E0B' },
          { label: 'Serving', value: stats.serving, color: '#3B82F6' },
          { label: 'Completed', value: stats.completed, color: '#10B981' },
          { label: 'Skipped', value: stats.skipped, color: '#EF4444' },
        ];
        const total = stats.total || 1;
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        let cumulative = 0;

        const completedTickets = tickets.filter(t => t.status === 'completed' && t.created_at && t.called_at && t.completed_at);
        const hasTimeliness = completedTickets.length > 0;

        let avgWait = 0, avgServe = 0, avgTotal = 0, maxWait = 0, minWait = 0, buckets = [], maxBucket = 1;
        const fmt = (min) => min < 1 ? `${Math.round(min * 60)}s` : `${min.toFixed(1)}m`;

        if (hasTimeliness) {
          const waitTimes = completedTickets.map(t => (new Date(t.called_at) - new Date(t.created_at)) / 60000);
          const serveTimes = completedTickets.map(t => (new Date(t.completed_at) - new Date(t.called_at)) / 60000);
          const totalTimes = completedTickets.map(t => (new Date(t.completed_at) - new Date(t.created_at)) / 60000);
          avgWait = waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length;
          avgServe = serveTimes.reduce((a, b) => a + b, 0) / serveTimes.length;
          avgTotal = totalTimes.reduce((a, b) => a + b, 0) / totalTimes.length;
          maxWait = Math.max(...waitTimes);
          minWait = Math.min(...waitTimes);
          buckets = [
            { label: '< 2 min', count: waitTimes.filter(t => t < 2).length, color: '#10B981' },
            { label: '2-5 min', count: waitTimes.filter(t => t >= 2 && t < 5).length, color: '#3B82F6' },
            { label: '5-10 min', count: waitTimes.filter(t => t >= 5 && t < 10).length, color: '#F59E0B' },
            { label: '> 10 min', count: waitTimes.filter(t => t >= 10).length, color: '#EF4444' },
          ];
          maxBucket = Math.max(...buckets.map(b => b.count), 1);
        }

        return (
          <div className={`grid grid-cols-1 ${hasTimeliness ? 'md:grid-cols-2' : ''} gap-4 mb-6`}>
            {/* Column 1: Queue Status */}
            <div className="bg-white rounded-0 border border-gray-200 shadow-sm p-5">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-shrink-0">
                  <svg width="160" height="160" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="16" />
                    {chartData.map((seg, i) => {
                      const pct = seg.value / total;
                      const dashLen = pct * circumference;
                      const offset = -cumulative * circumference;
                      cumulative += pct;
                      if (seg.value === 0) return null;
                      return (
                        <circle key={i} cx="64" cy="64" r={radius} fill="none" stroke={seg.color} strokeWidth="16"
                          strokeDasharray={`${dashLen} ${circumference - dashLen}`} strokeDashoffset={offset}
                          strokeLinecap="butt" transform="rotate(-90 64 64)" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
                      );
                    })}
                    <text x="64" y="58" textAnchor="middle" fill="#1F2937" fontSize="22" fontWeight="700">{stats.total}</text>
                    <text x="64" y="76" textAnchor="middle" fill="#6B7280" fontSize="10">Total</text>
                  </svg>
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Queue Status</h3>
                  <div className="space-y-3">
                    {chartData.map((seg, i) => {
                      const pct = stats.total > 0 ? Math.round((seg.value / stats.total) * 100) : 0;
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: seg.color }}></span>
                              <span className="text-sm text-gray-600">{seg.label}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{seg.value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: seg.color }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Timeliness */}
            {hasTimeliness && (
              <div className="bg-white rounded-0 border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeliness</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#10b981]">{fmt(avgWait)}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Wait</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{fmt(avgServe)}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Serve</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-700">{fmt(avgTotal)}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Total</p>
                  </div>
                </div>
                <h4 className="text-xs font-semibold text-gray-500 mb-2">Wait Time Distribution</h4>
                <div className="space-y-2">
                  {buckets.map((b, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-16 text-right flex-shrink-0">{b.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                          style={{ width: `${Math.max((b.count / maxBucket) * 100, b.count > 0 ? 8 : 0)}%`, backgroundColor: b.color }}>
                          {b.count > 0 && <span className="text-[10px] font-bold text-white">{b.count}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span>Fastest: {fmt(minWait)}</span>
                  <span>Slowest: {fmt(maxWait)}</span>
                  <span>Served: {completedTickets.length}</span>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Quick Links */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button onClick={() => setCurrentPage('queue-display')} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-0 text-sm font-medium transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          Open Public Display
        </button>
        <button onClick={() => setCurrentPage('queue-teller')} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-0 text-sm font-medium transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          Open Teller View
        </button>
        <button onClick={() => setShowResetConfirm(true)} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-0 text-sm font-medium transition-all border border-red-200 ml-auto">
          Reset Queue
        </button>
      </div>

      {/* Reset Confirm */}
      {showResetConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-0 p-4 mb-6 flex items-center justify-between">
          <p className="text-red-600 text-sm">Are you sure? This will delete all tickets for today.</p>
          <div className="flex gap-2">
            <button onClick={resetQueue} className="bg-red-500 text-white px-4 py-2 rounded-0 text-sm font-medium">Yes, Reset</button>
            <button onClick={() => setShowResetConfirm(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-0 text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      {/* Manual Batch Generation */}
      <div className="bg-white border border-[#e0e0e0] rounded-0 shadow-sm p-4 mb-6">
        <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          Manual Batch Ticket Generation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Prefix</label>
            <input
              type="text"
              value={batchPrefix}
              onChange={e => setBatchPrefix(e.target.value.toUpperCase())}
              className="carbon-input w-full p-2 text-sm"
              placeholder="Ex: M"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Start Num</label>
            <input
              type="number"
              value={batchStart}
              onChange={e => setBatchStart(e.target.value)}
              className="carbon-input w-full p-2 text-sm"
              placeholder="101"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">End Num</label>
            <input
              type="number"
              value={batchEnd}
              onChange={e => setBatchEnd(e.target.value)}
              className="carbon-input w-full p-2 text-sm"
              placeholder="150"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Service Type</label>
            <select
              value={batchType}
              onChange={e => setBatchType(e.target.value)}
              className="carbon-input w-full p-2 text-sm"
            >
              <option value="">Select Service...</option>
              {transactionTypes.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
              <option value="Manual">Manual/Other</option>
            </select>
          </div>
          <button
            onClick={handleBatchGenerate}
            className="w-full bg-[#10b981] text-white py-2 rounded-0 text-sm font-bold hover:bg-blue-700 transition-all uppercase tracking-wider"
          >
            Generate Range
          </button>
        </div>
        {batchStatus && (
          <p className={`mt-3 text-xs font-medium ${batchStatus.includes('Error') ? 'text-red-500' : 'text-blue-600'}`}>
            {batchStatus}
          </p>
        )}
      </div>

      {/* Today's Tickets */}
      <div className="bg-white border border-[#e0e0e0] rounded-0 shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e0e0e0]">
          <h3 className="text-gray-800 font-bold text-lg">Today's Tickets</h3>
          <div className="flex gap-2">
            <button onClick={() => window.open('/api/export/queue-tickets', '_blank')} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-0 text-sm font-medium transition-all border border-[#e0e0e0]">
              Export CSV
            </button>
            <button onClick={fetchAll} className="text-[#10b981] hover:text-blue-800 text-sm transition-all">Refresh</button>
          </div>
        </div>
        {tickets.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No tickets today</p>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-8 gap-3 px-4 py-3 bg-[#10b981] text-xs font-semibold text-white uppercase tracking-wider items-center">
              <span>Ticket</span>
              <span>Name</span>
              <span>Phone</span>
              <span>Transaction</span>
              <span>Status</span>
              <span>Window</span>
              <span>Teller</span>
              <span>Time</span>
            </div>
            {tickets.map((t, index) => (
              <div key={t.id} className={`grid grid-cols-1 md:grid-cols-8 gap-3 px-4 py-3 items-center text-sm border-b border-blue-100 hover:bg-blue-50/50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}`}>
                <div className="font-bold text-blue-700 min-w-0">
                  {t.ticket_number}
                  {t.is_priority && <span className="ml-1 text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full uppercase">{t.priority_type || 'Priority'}</span>}
                </div>
                <span className="text-gray-800 font-medium truncate">{t.customer_name}</span>
                <span className="text-gray-600 truncate">{t.cellphone_number}</span>
                <span className="text-gray-600 truncate">{t.transaction_type}</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium border w-fit ${getQueueStatusColor(t.status)}`}>
                  {t.status}
                </span>
                <span className="text-gray-600">{t.teller_window || '-'}</span>
                <span className="text-gray-600">{t.teller_name || '-'}</span>
                <span className="text-gray-600">{new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transaction Types */}
        <div className="bg-white border border-[#e0e0e0] rounded-0 shadow-sm p-6">
          <h3 className="text-gray-800 font-bold text-lg mb-4">Transaction Types</h3>
          <div className="space-y-2 mb-4">
            {transactionTypes.map(type => (
              <div key={type.id} className="flex items-center justify-between bg-blue-50 rounded-0 p-3">
                <div>
                  <span className="text-gray-800 text-sm font-medium">{type.name}</span>
                  <span className="text-gray-400 text-xs ml-2">({type.prefix})</span>
                </div>
                <button onClick={() => deleteTransactionType(type.id)} className="text-red-400 hover:text-red-600 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
              placeholder="Name"
              className="flex-1 px-3 py-2 rounded-0 border border-[#e0e0e0] bg-blue-50 text-gray-800 text-sm placeholder-gray-400 focus:border-[#10b981] focus:outline-none"
            />
            <input
              type="text"
              value={newTypePrefix}
              onChange={e => setNewTypePrefix(e.target.value.toUpperCase().slice(0, 3))}
              placeholder="Prefix"
              maxLength={3}
              className="w-20 px-3 py-2 rounded-0 border border-[#e0e0e0] bg-blue-50 text-gray-800 text-sm placeholder-gray-400 focus:border-[#10b981] focus:outline-none"
            />
            <button onClick={addTransactionType} className="bg-[#10b981] text-white px-4 py-2 rounded-0 font-semibold text-sm hover:bg-[#465a8f] transition-all">
              Add
            </button>
          </div>
        </div>

        {/* Teller Windows */}
        <div className="bg-white border border-[#e0e0e0] rounded-0 shadow-sm p-6">
          <h3 className="text-gray-800 font-bold text-lg mb-4">Teller Windows</h3>

          <div className="space-y-3 mb-4">
            {tellers.map(teller => {
              const assignedIds = (teller.assigned_types || []).map(t => t.id);
              return (
                <div key={teller.id} className="bg-blue-50 rounded-0 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-800 text-sm font-medium">{teller.window_name}</span>
                    <button onClick={() => deleteTeller(teller.id)} className="text-red-400 hover:text-red-600 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {transactionTypes.map(type => (
                      <label key={type.id} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={assignedIds.includes(type.id)}
                          onChange={(e) => updateWindowAssignments(teller.id, type.id, e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-blue-300 text-[#10b981] focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">{type.name}</span>
                      </label>
                    ))}
                    {assignedIds.length === 0 && <span className="text-xs text-gray-400 italic">Serves all types</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newWindowName}
              onChange={e => setNewWindowName(e.target.value)}
              placeholder="Window name"
              className="flex-1 px-3 py-2 rounded-0 border border-[#e0e0e0] bg-blue-50 text-gray-800 text-sm placeholder-gray-400 focus:border-[#10b981] focus:outline-none"
            />
            <button onClick={addTeller} className="bg-[#10b981] text-white px-4 py-2 rounded-0 font-semibold text-sm hover:bg-[#465a8f] transition-all">
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Marquee Text */}
      <div className="bg-white border border-[#e0e0e0] rounded-0 shadow-sm p-6 mt-6">
        <h3 className="text-gray-800 font-bold text-lg mb-4">Display Marquee Text</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={marqueeText}
            onChange={e => setMarqueeText(e.target.value)}
            placeholder="Enter scrolling text for the queue display..."
            className="flex-1 px-3 py-2 rounded-0 border border-[#e0e0e0] bg-blue-50 text-gray-800 text-sm placeholder-gray-400 focus:border-[#10b981] focus:outline-none"
          />
          <button
            onClick={async () => {
              setMarqueeSaving(true);
              try {
                await fetch('/api/queue/marquee', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ text: marqueeText })
                });
              } catch (err) { console.error('Error saving marquee:', err); }
              setMarqueeSaving(false);
            }}
            disabled={marqueeSaving}
            className="bg-[#10b981] text-white px-4 py-2 rounded-0 font-semibold text-sm hover:bg-[#465a8f] transition-all disabled:opacity-50"
          >
            {marqueeSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-2">This text scrolls at the bottom of the public queue display screen.</p>
      </div>

      {/* Display Template */}
      <div className="bg-white border border-[#e0e0e0] rounded-0 shadow-sm p-6 mt-6">
        <h3 className="text-gray-800 font-bold text-lg mb-4">Display Template</h3>
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <select
            value={displayTemplate}
            onChange={(e) => setDisplayTemplate(e.target.value)}
            className="flex-1 px-3 py-2 rounded-0 border border-[#e0e0e0] bg-blue-50 text-gray-800 text-sm focus:border-[#10b981] focus:outline-none"
          >
            <option value="template1">Template 1 - Classic</option>
            <option value="template2">Template 2 - Split Board</option>
            <option value="template3">Template 3 - Spotlight</option>
            <option value="template4">Template 4 - Corporate Grid</option>
            <option value="template5">Template 5 - Minimal Columns</option>
            <option value="template6">Template 6 - Executive Panel</option>
          </select>
          <button
            onClick={async () => {
              localStorage.setItem(TEMPLATE_STORAGE_KEY, displayTemplate);
              setTemplateSaving(true);
              try {
                const res = await fetch('/api/queue/display-template', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ template: displayTemplate })
                });
                const data = await res.json().catch(() => ({ success: false }));
                if (!res.ok || !data.success) {
                  throw new Error(data.message || 'Failed to save template');
                }
              } catch (err) { console.error('Error saving display template:', err); }
              setTemplateSaving(false);
            }}
            disabled={templateSaving}
            className="bg-[#10b981] text-white px-4 py-2 rounded-0 font-semibold text-sm hover:bg-[#465a8f] transition-all disabled:opacity-50"
          >
            {templateSaving ? 'Saving...' : 'Set as Default'}
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-2">Public display will use this template by default.</p>
      </div>

      {/* Reports Section */}
      <div className="bg-white border border-[#e0e0e0] rounded-0 shadow-sm mt-6 overflow-hidden">
        <button
          onClick={() => setShowReports(!showReports)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-blue-50/50 transition-all"
        >
          <h3 className="text-gray-800 font-bold text-lg">Queue Reports & Analytics</h3>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${showReports ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showReports && (
          <div className="px-6 pb-6 border-t border-blue-100">
            {/* Date Range + Generate */}
            <div className="flex flex-wrap items-end gap-3 mt-4 mb-6">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Start Date</label>
                <input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)}
                  className="px-3 py-2 rounded-0 border border-[#e0e0e0] bg-blue-50 text-gray-800 text-sm focus:border-[#10b981] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">End Date</label>
                <input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)}
                  className="px-3 py-2 rounded-0 border border-[#e0e0e0] bg-blue-50 text-gray-800 text-sm focus:border-[#10b981] focus:outline-none" />
              </div>
              <button onClick={fetchReport} disabled={reportLoading}
                className="bg-[#10b981] text-white px-5 py-2 rounded-0 font-semibold text-sm hover:bg-[#465a8f] transition-all disabled:opacity-50">
                {reportLoading ? 'Loading...' : 'Generate Report'}
              </button>
              <button onClick={() => {
                const params = new URLSearchParams({ startDate: reportStartDate, endDate: reportEndDate });
                window.open(`/api/export/queue-tickets?${params}`, '_blank');
              }}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-0 text-sm font-medium transition-all border border-[#e0e0e0]">
                Export to CSV
              </button>
            </div>

            {reportData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#274690] rounded-0 p-4 flex items-center justify-between">
                    <p className="text-blue-200 text-xs uppercase tracking-wider">Total Tickets</p>
                    <p className="text-3xl font-bold text-white">{reportData.summary.totalTickets}</p>
                  </div>
                  <div className="bg-[#274690] rounded-0 p-4 flex items-center justify-between">
                    <p className="text-blue-200 text-xs uppercase tracking-wider">Avg Wait</p>
                    <p className="text-2xl font-bold text-white">{formatSeconds(reportData.summary.avgWaitTime)}</p>
                  </div>
                  <div className="bg-[#274690] rounded-0 p-4 flex items-center justify-between">
                    <p className="text-blue-200 text-xs uppercase tracking-wider">Avg Serving</p>
                    <p className="text-2xl font-bold text-white">{formatSeconds(reportData.summary.avgServingTime)}</p>
                  </div>
                  <div className="bg-[#274690] rounded-0 p-4 flex items-center justify-between">
                    <p className="text-blue-200 text-xs uppercase tracking-wider">Peak Hour</p>
                    <p className="text-2xl font-bold text-white">{reportData.summary.peakHour !== null ? `${reportData.summary.peakHour}:00` : '-'}</p>
                  </div>
                </div>

                {/* Completion Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-0 p-4 text-center">
                    <p className="text-green-600 text-xs uppercase tracking-wider">Completed</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">{reportData.summary.completed}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-0 p-4 text-center">
                    <p className="text-red-600 text-xs uppercase tracking-wider">Skipped</p>
                    <p className="text-2xl font-bold text-red-700 mt-1">{reportData.summary.skipped}</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-0 p-4 text-center">
                    <p className="text-orange-600 text-xs uppercase tracking-wider">Priority</p>
                    <p className="text-2xl font-bold text-orange-700 mt-1">{reportData.summary.priorityCount}</p>
                  </div>
                </div>

                {/* By Transaction Type */}
                {reportData.byTransactionType.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-gray-800 font-bold text-sm mb-3 uppercase tracking-wider">By Transaction Type</h4>
                    <div className="bg-blue-50/50 rounded-0 overflow-hidden border border-[#e0e0e0]">
                      <div className="grid grid-cols-3 gap-3 px-4 py-2 bg-[#10b981] text-xs font-semibold text-white uppercase tracking-wider">
                        <span>Type</span>
                        <span className="text-center">Count</span>
                        <span className="text-right">Avg Wait</span>
                      </div>
                      {reportData.byTransactionType.map((item, i) => (
                        <div key={item.type} className={`grid grid-cols-3 gap-3 px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}`}>
                          <span className="text-gray-800 font-medium">{item.type}</span>
                          <span className="text-gray-600 text-center">{item.count}</span>
                          <span className="text-gray-600 text-right">{formatSeconds(item.avgWait)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* By Hour - Bar Chart */}
                {reportData.byHour.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-gray-800 font-bold text-sm mb-3 uppercase tracking-wider">Tickets by Hour</h4>
                    <div className="bg-white rounded-0 border border-[#e0e0e0] p-4">
                      {(() => {
                        const maxCount = Math.max(...reportData.byHour.map(h => h.count));
                        return (
                          <div className="space-y-1.5">
                            {reportData.byHour.map(item => (
                              <div key={item.hour} className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 w-12 text-right font-mono">{item.hour}:00</span>
                                <div className="flex-1 bg-blue-100 rounded-full h-6 overflow-hidden">
                                  <div
                                    className="bg-[#10b981] h-full rounded-full flex items-center justify-end pr-2 transition-all"
                                    style={{ width: `${Math.max((item.count / maxCount) * 100, 8)}%` }}
                                  >
                                    <span className="text-white text-xs font-bold">{item.count}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* By Day */}
                {reportData.byDay.length > 1 && (
                  <div>
                    <h4 className="text-gray-800 font-bold text-sm mb-3 uppercase tracking-wider">Daily Breakdown</h4>
                    <div className="bg-blue-50/50 rounded-0 overflow-hidden border border-[#e0e0e0]">
                      <div className="grid grid-cols-3 gap-3 px-4 py-2 bg-[#10b981] text-xs font-semibold text-white uppercase tracking-wider">
                        <span>Date</span>
                        <span className="text-center">Total</span>
                        <span className="text-right">Completed</span>
                      </div>
                      {reportData.byDay.map((item, i) => (
                        <div key={item.date} className={`grid grid-cols-3 gap-3 px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}`}>
                          <span className="text-gray-800 font-medium">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="text-gray-600 text-center">{item.total}</span>
                          <span className="text-gray-600 text-right">{item.completed}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Queue Page







/* ==========================================================================
   RIDERS MANAGEMENT MODULE
   ========================================================================== */






/* ==========================================================================
   END RIDERS MANAGEMENT MODULE
   ========================================================================== */

const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    const data = await response.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (err) {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

function LocationAutocomplete({ value, onChange, onSelect, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = React.useRef(null);

  const search = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
      const data = await res.json();
      setSuggestions(data);
      setShow(true);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => search(val), 800);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => { if (suggestions.length > 0) setShow(true); }}
          onBlur={() => setTimeout(() => setShow(false), 200)}
          placeholder={placeholder}
          className="carbon-input w-full p-4 pr-10"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      {show && suggestions.length > 0 && (
        <div className="absolute z-[2000] w-full bg-white border border-[#e0e0e0] shadow-xl mt-1 max-h-[300px] overflow-y-auto">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelect({
                  address: s.display_name,
                  coords: { lat: parseFloat(s.lat), lng: parseFloat(s.lon) }
                });
                setShow(false);
              }}
              className="w-full text-left p-3 hover:bg-blue-50 border-b border-[#f4f4f4] transition-colors"
            >
              <p className="text-xs font-bold text-[#161616] truncate">{s.display_name.split(',')[0]}</p>
              <p className="text-[10px] text-[#525252] truncate">{s.display_name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Interactive Map Component using Leaflet and OSRM
/* ==========================================================================
   TRIP MONITORING MODULE
   ========================================================================== */

const DraggableGlassPanel = ({ children, initialX, initialY, width, height, className, title }) => {
  const [pos, setPos] = React.useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // Only drag from the header or a handle
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - pos.x,
        y: e.clientY - pos.y
      });
      e.preventDefault();
    }
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Keep panel within viewport bounds
      const maxX = window.innerWidth - (width ? parseInt(width) : 400);
      const maxY = window.innerHeight - (height ? (height.includes('calc') ? 600 : parseInt(height)) : 600);

      setPos({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      className={`absolute z-30 pointer-events-auto ${className}`}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        width: width || 'auto',
        height: height || 'auto',
        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
      }}
    >
      <div className="flex flex-col h-full">
        <div
          onMouseDown={handleMouseDown}
          className="drag-handle cursor-grab active:cursor-grabbing p-2 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-1 border-b border-white/10"
        >
          <div className="flex gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

function TripMonitoring({ trips, stats, riders, incidents, onRefresh }) {
  const availableRiders = riders?.filter(r => r.status === 'online') || [];
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // all, ongoing, completed, sos
  const [searchQuery, setSearchQuery] = useState('');
  const [focusId, setFocusId] = useState(null);

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  const filteredTrips = trips.filter(t => {
    // Stage 1: Status Filtering
    let statusMatch = false;
    if (viewMode === 'all') statusMatch = !['completed', 'cancelled'].includes(t.transport_status);
    else if (viewMode === 'ongoing') statusMatch = ['accepted', 'on_way_to_pickup', 'en_route', 'arrived_at_pickup', 'picked_up'].includes(t.transport_status);
    else if (viewMode === 'completed') statusMatch = t.transport_status === 'completed';
    else if (viewMode === 'sos') statusMatch = t.transport_status === 'sos';
    
    if (!statusMatch) return false;

    // Stage 2: Smart Search Filtering (Rider, Passenger, Plate)
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.rider_name?.toLowerCase().includes(q) ||
      t.full_name?.toLowerCase().includes(q) ||
      t.plate_number?.toLowerCase().includes(q) ||
      t.id.toString().includes(q)
    );
  });

  return (
    <div className="h-full relative flex flex-col min-h-0 overflow-hidden bg-[#f4f4f4] rounded-0">
      {/* BACKGROUND LAYER: Full Screen Map */}
      <div className="absolute inset-0 z-0">
        <MonitoringMap trips={filteredTrips} selectedTrip={selectedTrip} focusId={focusId} />
      </div>

      {/* SEARCH OVERLAY (Top Center) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        <div className="bg-white/70 backdrop-blur-md border border-white/40 shadow-2xl rounded-xl p-1.5 flex items-center gap-2">
          <div className="pl-3 text-gray-400">
            <Search size={16} />
          </div>
          <input 
            type="text"
            placeholder="Search Rider, Passenger or Plate No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400 py-2"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <div className="h-6 w-[1px] bg-gray-300/30 mx-1"></div>
          <button 
            onClick={() => {
              const first = filteredTrips[0];
              if (first) setFocusId(first.id + '_' + Date.now());
            }}
            className="px-4 py-2 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all active:scale-95"
          >
            Locate
          </button>
        </div>
      </div>

      {/* OVERLAY LAYER 1: Metric Cards (Top) */}
      <div className="relative z-20 p-4 pointer-events-none">
        <div className="flex gap-3 pointer-events-auto max-w-full overflow-x-auto scrollbar-hide py-2">
          <MetricCard
            label="Total Trips"
            value={stats?.total || 0}
            icon={<Activity />}
            color="blue"
          />
          <MetricCard
            label="Ongoing"
            value={stats?.ongoing || 0}
            icon={<Navigation />}
            color="cyan"
          />
          <MetricCard
            label="Available"
            value={availableRiders.length}
            icon={<User />}
            color="green"
          />
          <MetricCard
            label="SOS Alerts"
            value={stats?.sos || 0}
            icon={<AlertTriangle />}
            color="red"
            active={stats?.sos > 0}
          />
        </div>
      </div>

      {/* OVERLAY LAYER 2: Sidebar Trip List (Draggable) */}
      <DraggableGlassPanel initialX={16} initialY={160} width="320px" height="calc(100% - 176px)">
        <div className="h-full bg-white/10 backdrop-blur-3xl border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#002d9c] flex justify-between items-center bg-[#10b981] text-white drag-handle shadow-md">
            <div className="flex gap-1 pointer-events-auto">
              {['all', 'ongoing', 'sos'].map(m => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border transition-all ${viewMode === m ? 'bg-white text-[#10b981] border-white' : 'bg-transparent text-white/80 border-white/30 hover:bg-white/20 hover:text-white'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button onClick={onRefresh} className="p-2 hover:bg-white/20 transition-colors pointer-events-auto" title="Refresh data">
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/20 custom-scrollbar">
            {filteredTrips.map(trip => (
              <div
                key={trip.id}
                onClick={() => setSelectedTripId(trip.id)}
                className={`p-4 cursor-pointer transition-all border-l-4 ${selectedTripId === trip.id ? 'bg-[#10b981]/10 border-[#10b981]' : 'hover:bg-white/40 border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[9px] font-mono text-gray-500">#{trip.id}</p>
                    <p className="text-xs font-bold text-[#161616] tracking-tight">{trip.full_name}</p>
                  </div>
                  <TripStatusBadge status={trip.transport_status} />
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-[9px] text-gray-600">
                    <p className="truncate w-32">Rider: <span className="font-bold">{trip.rider_name || 'Unassigned'}</span></p>
                    <p className="opacity-60">{new Date(trip.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <button className="text-[#10b981] text-[9px] font-bold uppercase tracking-widest hover:underline">View</button>
                </div>
              </div>
            ))}
            {filteredTrips.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-[10px] uppercase font-bold tracking-widest italic bg-white/20">No active trips</div>
            )}
          </div>
        </div>
      </DraggableGlassPanel>

      {/* OVERLAY LAYER 3: Trip Details (Draggable) */}
      {selectedTrip && (
        <DraggableGlassPanel initialX={window.innerWidth - 260 - 440} initialY={160} width="400px" height="calc(100% - 176px)">
          <TripDetailOverlay trip={selectedTrip} onClose={() => setSelectedTripId(null)} />
        </DraggableGlassPanel>
      )}

      {/* Legenda (Bottom Left) */}
      <div className="absolute bottom-8 left-96 ml-4 z-10 bg-white/60 backdrop-blur-sm p-3 border border-white/20 shadow-lg flex items-center gap-4 text-[9px] font-bold uppercase tracking-wider text-gray-600">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 force-circle bg-green-500 shadow-sm shadow-green-500/50"></span> Available</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 force-circle bg-blue-500 shadow-sm shadow-blue-500/50"></span> Ongoing</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 force-circle bg-red-500 shadow-sm shadow-red-500/50 animate-pulse"></span> SOS</span>
      </div>


    </div>
  );
}

function MetricCard({ label, value, icon, color, active }) {
  const colors = {
    blue: 'bg-blue-600/20 text-blue-700',
    green: 'bg-green-600/20 text-green-700',
    red: 'bg-red-600/20 text-red-700',
    cyan: 'bg-cyan-600/20 text-cyan-700',
    gray: 'bg-gray-600/20 text-gray-700'
  };
  return (
    <div className={`p-4 min-w-[160px] bg-white/20 backdrop-blur-2xl border-t border-l border-white/50 border-r border-b border-white/10 ${active ? 'border-red-500 animate-pulse ring-2 ring-red-100' : ''} shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all hover:bg-white/30 group`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 force-circle transition-transform group-hover:scale-110 ${colors[color] || colors.gray}`}>{React.cloneElement(icon, { size: 16 })}</div>
        <p className="text-2xl font-bold text-[#161616] tracking-tighter">{value}</p>
      </div>
      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[2px]">{label}</p>
    </div>
  );
}

function TripStatusBadge({ status }) {
  const cfg = {
    'unassigned': 'bg-gray-50 text-gray-400 border-gray-200',
    'accepted': 'bg-indigo-50 text-indigo-600 border-indigo-200',
    'on_way_to_pickup': 'bg-blue-50 text-blue-600 border-blue-200',
    'en_route': 'bg-blue-50 text-blue-600 border-blue-200',
    'arrived_at_pickup': 'bg-amber-50 text-amber-600 border-amber-200',
    'picked_up': 'bg-cyan-50 text-cyan-600 border-cyan-200',
    'completed': 'bg-green-50 text-green-600 border-green-200',
    'cancelled': 'bg-red-50 text-red-600 border-red-200',
    'sos': 'bg-red-600 text-white border-red-700 animate-pulse'
  };
  return (
    <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border ${cfg[status] || cfg.unassigned}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

function MonitoringMap({ trips, selectedTrip, focusId }) {
  const mapRef = React.useRef(null);
  const leafletMap = React.useRef(null);
  const markersRef = React.useRef(new Map());
  const destMarkersRef = React.useRef(new Map());
  const polylinesRef = React.useRef(new Map());

  // Focus Logic: Fly to the marker when focusId changes
  React.useEffect(() => {
    if (!leafletMap.current || !focusId) return;
    const actualId = focusId.split('_')[0];
    const marker = markersRef.current.get(Number(actualId));
    if (marker) {
      const latLng = marker.getLatLng();
      leafletMap.current.flyTo(latLng, 16, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25
      });
      marker.openPopup();
    }
  }, [focusId]);

  // Helper: Calculate bearing between two points
  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const toDeg = (v) => (v * 180) / Math.PI;
    const φ1 = toRad(lat1), φ2 = toRad(lat2);
    const Δλ = toRad(lon2 - lon1);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  };

  useEffect(() => {
    // Return early if Leaflet is not loaded or missing container
    if (!mapRef.current || !window.L) return;

    try {
      // Initialize map if not already done
      if (!leafletMap.current) {
        leafletMap.current = window.L.map(mapRef.current, {
          zoomControl: false,
          maxZoom: 18
        }).setView([11.0500, 124.0000], 10);

        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CARTO'
        }).addTo(leafletMap.current);

        // Fix for containers that are hidden on load
        setTimeout(() => {
          if (leafletMap.current) leafletMap.current.invalidateSize();
        }, 300);
      }

      // Sync Markers
      // 1. Remove markers for trips no longer present
      const currentTripIds = new Set(trips.map(t => t.id));
      for (const [id, marker] of markersRef.current.entries()) {
        if (!currentTripIds.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
        if (!currentTripIds.has(id) && destMarkersRef.current.has(id)) {
          destMarkersRef.current.get(id).remove();
          destMarkersRef.current.delete(id);
        }
      }

      // 2. Add or update markers
      trips.forEach(trip => {
        // Priority Logic: 
        // 1. If actually MOVING with passenger (en_route, picked_up, sos), follow RIDER GPS.
        // 2. If awaiting pickup (accepted, on_way), anchor to PICKUP POINT for clarity.
        const isActuallyMoving = ['en_route', 'picked_up', 'sos'].includes(trip.transport_status);
        
        let lat = parseFloat(isActuallyMoving ? (trip.rider_lat || trip.current_lat || trip.pickup_lat) : trip.pickup_lat);
        let lng = parseFloat(isActuallyMoving ? (trip.rider_lng || trip.current_lng || trip.pickup_lng) : trip.pickup_lng);

        // Fallback to pickup point if coordinates are missing but trip is active
        if (isActuallyMoving && (isNaN(lat) || isNaN(lng))) {
          lat = parseFloat(trip.pickup_lat);
          lng = parseFloat(trip.pickup_lng);
        }

        // Final safety fallback to map center if even pickup is missing
        if (isNaN(lat) || isNaN(lng)) {
          lat = 11.0500;
          lng = 124.0000;
        }

        if (isNaN(lat) || isNaN(lng)) return;

        const isSOS = trip.transport_status === 'sos';
        const isUnassigned = trip.transport_status === 'unassigned';
        const isEnRoute = ['en_route', 'picked_up'].includes(trip.transport_status);

        if (markersRef.current.has(trip.id)) {
          const marker = markersRef.current.get(trip.id);
          marker.setLatLng([lat, lng]);
          
          // Update rotation
          const dLat = parseFloat(trip.dest_lat || trip.pickup_lat);
          const dLng = parseFloat(trip.dest_lng || trip.pickup_lng);
          if (!isNaN(dLat) && !isNaN(dLng)) {
            const bearing = calculateBearing(lat, lng, dLat, dLng);
            const iconContainer = marker.getElement()?.querySelector('.vehicle-icon-wrapper');
            if (iconContainer) {
              iconContainer.style.transform = `rotate(${bearing}deg)`;
            }
          }
        } else {
          // Custom Icon based on status and vehicle type
          let iconHtml = '';
          const vType = (trip.vehicle_type || 'car').toLowerCase();
          const isSOS = trip.transport_status === 'sos';
          const isAssigned = ['accepted', 'on_way_to_pickup', 'arrived_at_pickup', 'en_route', 'picked_up'].includes(trip.transport_status);
          const iconColor = isSOS ? '#da1e28' : (['picked_up', 'en_route'].includes(trip.transport_status) ? '#0891b2' : '#10b981');

          if (isSOS || isAssigned) {
            const statusText = (trip.transport_status || 'active').replace(/_/g, ' ').toUpperCase();

            // Grab-style Top-down SVG paths
            let svgPath = '';
            let viewBox = "0 0 24 24";

            if (vType.includes('van') || vType.includes('suv')) {
              // Ultra-Clean Pro Van (Grab Style) - Long cabin
              svgPath = `
                <path d="M12 1c-4 0-7 1-7 4v16c0 2 2 2.5 7 2.5s7-0.5 7-2.5v-16c0-3-4-4-7-4z" fill="${iconColor}" />
                <!-- Curved Windshield (Moved forward) -->
                <path d="M5.8 7 Q12 4 18.2 7 Z" fill="#1a1a1a" />
                <!-- Side Windows (Longer cabin) -->
                <rect x="5.5" y="8" width="0.8" height="11" fill="#1a1a1a" />
                <rect x="17.7" y="8" width="0.8" height="11" fill="#1a1a1a" />
                <rect x="7" y="7.5" width="10" height="11.5" rx="1" fill="black" opacity="0.15" />
                <!-- Curved Rear Window (Moved backward) -->
                <path d="M7.5 19.5 Q12 22 16.5 19.5 Z" fill="#1a1a1a" />
                <rect x="4.2" y="6.5" width="1.2" height="2.5" rx="0.5" fill="${iconColor}" />
                <rect x="18.6" y="6.5" width="1.2" height="2.5" rx="0.5" fill="${iconColor}" />
                <!-- Emphasized Brake Lights -->
                <rect x="6" y="21.5" width="4.5" height="1" rx="0.3" fill="#ff3333" />
                <rect x="13.5" y="21.5" width="4.5" height="1" rx="0.3" fill="#ff3333" />
              `;
            } else {
              // Ultra-Clean Pro Car (Grab Style) - Long cabin
              svgPath = `
                <path d="M12 1.5C8 1.5 6 3 6 5.5v14c0 2.5 2 3 6 3s6-0.5 6-3v-14c0-2.5-2-4-6-4z" fill="${iconColor}" />
                <!-- Curved Windshield (Moved forward) -->
                <path d="M6.8 8 Q12 5 17.2 8 Z" fill="#1a1a1a" />
                <!-- Side Windows (Longer cabin) -->
                <rect x="6.5" y="9" width="0.8" height="8" fill="#1a1a1a" />
                <rect x="16.7" y="9" width="0.8" height="8" fill="#1a1a1a" />
                <rect x="7.8" y="8.5" width="8.4" height="8" rx="1.5" fill="black" opacity="0.15" />
                <!-- Curved Rear Window (Moved backward) -->
                <path d="M8 17.5 Q12 20 16 17.5 Z" fill="#1a1a1a" />
                <circle cx="5" cy="8" r="1.2" fill="${iconColor}" />
                <circle cx="19" cy="8" r="1.2" fill="${iconColor}" />
                <!-- Emphasized Brake Lights -->
                <rect x="7" y="20.5" width="3.5" height="1" rx="0.3" fill="#ff3333" />
                <rect x="13.5" y="20.5" width="3.5" height="1" rx="0.3" fill="#ff3333" />
              `;
            }

            iconHtml = `
               <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translateY(-50%);">
                 <!-- Ultra-Minimalist Badge -->
                 <div style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #161616; padding: 6px 10px; border-radius: 4px; font-size: 9px; font-weight: 500; white-space: nowrap; margin-bottom: 8px; border: 1px solid rgba(255, 255, 255, 0.5); border-top: 3px solid ${iconColor}; box-shadow: 0 4px 15px rgba(0,0,0,0.1); min-width: 140px; pointer-events: auto; font-family: 'Inter', sans-serif;">
                   <!-- Header: Rider & Plate -->
                   <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                     <span style="color: #161616; font-weight: 700;">${(trip.rider_name || 'RIDER').toUpperCase()}</span>
                     <span style="opacity: 0.5; font-size: 8px;">${trip.plate_number || '---'}</span>
                   </div>
                   
                   <!-- Body: Details -->
                   <div style="display: flex; flex-direction: column; gap: 2px; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 4px; margin-bottom: 4px;">
                     <div style="display: flex; align-items: center; gap: 5px;">
                       <span style="opacity: 0.4;">👤</span>
                       <span style="color: #161616;">${trip.full_name || '---'}</span>
                     </div>
                     <div style="display: flex; align-items: center; gap: 5px;">
                       <span style="opacity: 0.4;">🏁</span>
                       <span style="max-width: 110px; overflow: hidden; text-overflow: ellipsis; color: #161616;">${trip.destination_location || 'UNSET'}</span>
                     </div>
                   </div>

                   <!-- Footer: Status & Speed -->
                   <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px; border-top: 1px solid rgba(0,0,0,0.05);">
                     <span style="color: ${iconColor}; font-weight: 700;">${statusText}</span>
                     <span style="color: #161616; opacity: 0.7;">${trip.speed || Math.floor(Math.random() * 15 + 35)} KM/H</span>
                   </div>
                   
                   <!-- Pointer Arrow pointing towards the icon -->
                   <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid rgba(255, 255, 255, 0.7);"></div>
                 </div>
                 
                 <!-- Dynamic Status Pulse Effect (Ripple) -->
                 <div class="force-circle animate-marker-pulse" style="position: absolute; bottom: 0; width: 60px; height: 60px; background: ${iconColor}; opacity: 0.2; border-radius: 50% !important; z-index: -1;"></div>
                 
                 <!-- SOS Pulse Effect (Deeper red if SOS) -->
                 ${isSOS ? '<div class="force-circle" style="position: absolute; bottom: 0; width: 70px; height: 70px; background: rgba(218, 30, 40, 0.3); border-radius: 50% !important; animation: markerPulse 1.5s infinite; z-index: -2;"></div>' : ''}
                 
                 <!-- Detailed Top-Down Vehicle Icon -->
                 <div class="vehicle-icon-wrapper" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);">
                   <svg viewBox="${viewBox}" width="36" height="36" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>
                 </div>
               </div>
             `;
          } else {
            iconHtml = `<div class="force-circle" style="width: 14px; height: 14px; background: #8d8d8d; border-radius: 50% !important; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`;
          }

          const markerIcon = window.L.divIcon({
            html: iconHtml,
            className: 'custom-marker',
            iconSize: [44, 52],
            iconAnchor: [22, 52]
          });

          const marker = window.L.marker([lat, lng], { icon: markerIcon }).addTo(leafletMap.current);
          marker.bindPopup(`
            <div class="p-1">
              <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Active Trip</p>
              <h4 class="font-bold text-gray-900">${trip.full_name}</h4>
              <p class="text-[10px] text-gray-500">${trip.rider_name || 'Awaiting Rider'}</p>
              <div class="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full ${isSOS ? 'bg-red-500' : isEnRoute ? 'bg-blue-500' : 'bg-gray-400'}"></span>
                <span class="text-[9px] font-bold uppercase">${trip.transport_status?.replace('_', ' ')}</span>
              </div>
            </div>
          `);
          markersRef.current.set(trip.id, marker);
        }

        // 2.5 Handle Destination Pin
        const dLat = Number(trip.dest_lat);
        const dLng = Number(trip.dest_lng);
        
        if (!isNaN(dLat) && !isNaN(dLng) && dLat !== 0) {
          if (destMarkersRef.current.has(trip.id)) {
            destMarkersRef.current.get(trip.id).setLatLng([dLat, dLng]);
          } else {
            console.log(`[MAP] Adding Dest Pin for Trip #${trip.id} at ${dLat}, ${dLng}`);
            const destIcon = window.L.divIcon({
              html: `
                <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
                  <!-- Label -->
                  <div style="background: #da1e28; color: white; padding: 3px 10px; font-size: 10px; font-weight: 800; border-radius: 4px; white-space: nowrap; margin-bottom: 5px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 1px solid white;">
                    ${(trip.destination_location || 'DEST').split(',')[0].toUpperCase()}
                  </div>
                  <!-- SVG Pin -->
                  <div style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">
                    <svg viewBox="0 0 24 24" width="40" height="40">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#da1e28" stroke="white" stroke-width="1.5"/>
                    </svg>
                  </div>
                  <!-- Redundant Base Circle for visibility -->
                  <div class="force-circle" style="position: absolute; bottom: 0; width: 12px; height: 12px; background: #da1e28; border: 2px solid white; border-radius: 50% !important; z-index: -1;"></div>
                </div>
              `,
              className: 'custom-dest-pin',
              iconSize: [120, 100],
              iconAnchor: [60, 95]
            });
            const dMarker = window.L.marker([dLat, dLng], { 
              icon: destIcon, 
              zIndexOffset: 5000 
            }).addTo(leafletMap.current);
            destMarkersRef.current.set(trip.id, dMarker);
          }
        } else if (destMarkersRef.current.has(trip.id)) {
          destMarkersRef.current.get(trip.id).remove();
          destMarkersRef.current.delete(trip.id);
        }

        // 3. Handle Routes
        const showRoute = ['accepted', 'on_way_to_pickup', 'en_route', 'picked_up'].includes(trip.transport_status);
        if (showRoute) {
          const startLat = lat;
          const startLng = lng;
          
          // The route should always point to the final destination now 
          // because the car stays at pickup during the initial phase.
          const endLat = parseFloat(trip.dest_lat);
          const endLng = parseFloat(trip.dest_lng);

          // Only draw if we have a valid target coordinate that is different from start
          if (!isNaN(startLat) && !isNaN(startLng) && !isNaN(endLat) && !isNaN(endLng) && (Math.abs(startLat - endLat) > 0.0001 || Math.abs(startLng - endLng) > 0.0001)) {
            const routeId = `${trip.id}_${startLat.toFixed(5)}_${startLng.toFixed(5)}_${endLat.toFixed(5)}_${endLng.toFixed(5)}`;
            
            if (!polylinesRef.current.has(trip.id) || polylinesRef.current.get(trip.id).routeId !== routeId) {
              fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`)
                .then(r => r.json())
                .then(data => {
                  if (data.routes && data.routes[0]) {
                    if (polylinesRef.current.has(trip.id)) {
                      polylinesRef.current.get(trip.id).line.remove();
                    }

                    const coordinates = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                    const polyline = window.L.polyline(coordinates, {
                      color: trip.transport_status === 'sos' ? '#da1e28' : '#24a148',
                      weight: 4,
                      opacity: 0.5,
                      dashArray: trip.transport_status === 'accepted' ? '10, 10' : null,
                      lineJoin: 'round'
                    }).addTo(leafletMap.current);

                    polylinesRef.current.set(trip.id, { line: polyline, routeId });
                  }
                }).catch(e => console.error("OSRM Error:", e));
            }
          }
        } else if (polylinesRef.current.has(trip.id)) {
          polylinesRef.current.get(trip.id).line.remove();
          polylinesRef.current.delete(trip.id);
        }
      });

      // Handle Selection
      if (selectedTrip) {
        const sLat = parseFloat(selectedTrip.current_lat || selectedTrip.pickup_lat);
        const sLng = parseFloat(selectedTrip.current_lng || selectedTrip.pickup_lng);
        if (!isNaN(sLat) && !isNaN(sLng)) {
          leafletMap.current.setView([sLat, sLng], 15);
          const marker = markersRef.current.get(selectedTrip.id);
          if (marker) marker.openPopup();
        }
      }
    } catch (err) {
      console.error("MonitoringMap Error:", err);
    }

    // Cleanup function
    return () => {
      // We don't remove markersRef because they are tied to leafletMap.current
      // But we can remove the map if the component unmounts
    };
  }, [trips, selectedTrip]);

  // Handle tab/visibility changes
  useEffect(() => {
    if (leafletMap.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (leafletMap.current) leafletMap.current.invalidateSize();
      });
      resizeObserver.observe(mapRef.current);

      // Force immediate after small delay
      setTimeout(() => { if (leafletMap.current) leafletMap.current.invalidateSize(); }, 500);

      return () => resizeObserver.disconnect();
    }
  }, []);

  // Handle unmount cleanup specifically
  useEffect(() => {
    return () => {
      if (leafletMap.current) {
        try {
          // Clear all pointers first
          markersRef.current.clear();
          leafletMap.current.remove();
          leafletMap.current = null;
        } catch (e) {
          console.warn("Map cleanup fail:", e);
        }
      }
    };
  }, []);

  return (
    <div ref={mapRef} className="w-full h-full bg-gray-50 flex items-center justify-center overflow-hidden">
      {!window.L && (
        <div className="text-center">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Loading map engine...</p>
        </div>
      )}
    </div>
  );
}
function TripDetailOverlay({ trip, onClose }) {
  return (
    <div className="h-full bg-[#161616]/40 backdrop-blur-[40px] border border-white/20 shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#161616]/60 text-white">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#10b981]">Trip Intelligence</h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Passenger Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#10b981] text-white flex items-center justify-center font-bold text-xl">
              {trip.full_name?.charAt(0)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#161616]">{trip.full_name}</h4>
              <p className="text-xs text-gray-500">{trip.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/40 border border-white/20">
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <TripStatusBadge status={trip.transport_status} />
            </div>
            <div className="p-3 bg-white/40 border border-white/20">
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact</p>
              <p className="text-xs font-bold text-gray-800">{trip.phone_number}</p>
            </div>
          </div>
        </section>

        {/* Route Details */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-bold text-[#525252] uppercase tracking-widest border-b border-white/20 pb-2">Active Route</h4>
          <div className="space-y-4 border-l-2 border-gray-100 ml-2 pl-4">
            <div className="relative">
              <div className="absolute -left-[21px] top-0 w-2 h-2 rounded-full border-2 border-[#10b981] bg-white"></div>
              <p className="text-[9px] font-bold text-gray-400 uppercase">Pickup Location</p>
              <p className="text-xs text-gray-700">{trip.pickup_location}</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[21px] bottom-0 w-2 h-2 bg-[#da1e28]"></div>
              <p className="text-[9px] font-bold text-gray-400 uppercase">Destination</p>
              <p className="text-xs text-gray-700">{trip.destination_location}</p>
            </div>
          </div>
        </section>

        {/* Vehicle & Rider */}
        <section className="p-4 bg-[#161616] text-white space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Assigned Driver</h4>
              <p className="text-sm font-bold mt-1 text-blue-400">{trip.rider_name || 'PENDING ASSIGNMENT'}</p>
            </div>
            <Car className="text-gray-600" size={20} />
          </div>
          {trip.rider_name && (
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <p className="text-[8px] font-bold uppercase text-gray-500">Vehicle</p>
                <p className="text-[10px]">{trip.vehicle_type}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase text-gray-500">Plate</p>
                <p className="text-[10px]">{trip.plate_number}</p>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="p-6 border-t border-white/20 bg-white/40">
        <div className="grid grid-cols-2 gap-3">
          <button className="py-3 px-4 border border-[#10b981] text-[#10b981] text-[9px] font-bold uppercase tracking-widest hover:bg-[#10b981] hover:text-white transition-all">Force Complete</button>
          <button className={`py-3 px-4 text-white text-[9px] font-bold uppercase tracking-widest transition-all ${trip.transport_status === 'sos' ? 'bg-[#da1e28] hover:bg-red-700' : 'bg-gray-800 hover:bg-black'}`}>
            {trip.transport_status === 'sos' ? 'SOS RESPONSE' : 'SECURITY ALERT'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   END TRIP MONITORING MODULE
   ========================================================================== */
/* ==========================================================================
   RIDE SCHEDULING / DISPATCH MODULE
   ========================================================================== */

function DispatchMap({ trips, riders, selectedBooking }) {
  const mapRef = React.useRef(null);
  const leafletMap = React.useRef(null);
  const markersRef = React.useRef(new Map());
  const destMarkersRef = React.useRef(new Map());
  const polylinesRef = React.useRef(new Map());
  const [leafletReady, setLeafletReady] = React.useState(!!window.L);

  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const toDeg = (v) => (v * 180) / Math.PI;
    const φ1 = toRad(lat1), φ2 = toRad(lat2);
    const Δλ = toRad(lon2 - lon1);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  };

  React.useEffect(() => {
    if (window.L) { setLeafletReady(true); return; }
    const interval = setInterval(() => {
      if (window.L) { setLeafletReady(true); clearInterval(interval); }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!leafletReady || !mapRef.current || leafletMap.current) return;
    leafletMap.current = window.L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([11.0500, 124.0000], 12);
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(leafletMap.current);
    setTimeout(() => { if (leafletMap.current) leafletMap.current.invalidateSize(); }, 500);
  }, [leafletReady]);

  React.useEffect(() => {
    if (!leafletMap.current || !leafletReady) return;

    try {
      const currentIds = new Set();

      // 1. RENDER RIDERS
      riders.forEach(rider => {
        const id = `rider-${rider.id}`;
        currentIds.add(id);
        const lat = parseFloat(rider.current_lat);
        const lng = parseFloat(rider.current_lng);
        if (isNaN(lat) || !lng) return;

        if (markersRef.current.has(id)) {
          markersRef.current.get(id).setLatLng([lat, lng]);
        } else {
          const iconColor = rider.status === 'online' ? '#10b981' : '#8d8d8d';
          const m = window.L.marker([lat, lng], {
            icon: window.L.divIcon({
              html: `<div class="force-circle" style="width: 14px; height: 14px; background: white; border: 3px solid ${iconColor}; border-radius: 50% !important; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
              className: '', iconSize: [14, 14], iconAnchor: [7, 7]
            })
          }).addTo(leafletMap.current).bindPopup(`<b>${rider.name}</b><br/>${rider.vehicle_type}<br/>Status: ${rider.status}`);
          markersRef.current.set(id, m);
        }
      });

      // 2. RENDER TRIPS
      trips.forEach(trip => {
        const id = `trip-${trip.id}`;
        currentIds.add(id);
        
        const isActuallyMoving = ['en_route', 'picked_up', 'sos'].includes(trip.transport_status);
        const lat = parseFloat(isActuallyMoving ? (trip.rider_lat || trip.current_lat || trip.pickup_lat) : trip.pickup_lat);
        const lng = parseFloat(isActuallyMoving ? (trip.rider_lng || trip.current_lng || trip.pickup_lng) : trip.pickup_lng);
        if (isNaN(lat) || isNaN(lng)) return;

        if (markersRef.current.has(id)) {
          const m = markersRef.current.get(id);
          m.setLatLng([lat, lng]);
          
          // Rotation
          const dLat = parseFloat(trip.dest_lat);
          const dLng = parseFloat(trip.dest_lng);
          if (!isNaN(dLat)) {
            const bearing = calculateBearing(lat, lng, dLat, dLng);
            const iconWrap = m.getElement()?.querySelector('.vehicle-icon-wrapper');
            if (iconWrap) iconWrap.style.transform = `rotate(${bearing}deg)`;
          }
        } else {
          const isPending = !trip.rider_id;
          const iconColor = isPending ? '#f1c21b' : '#10b981';
          const statusText = (trip.transport_status || 'PENDING').toUpperCase();

          const m = window.L.marker([lat, lng], {
            icon: window.L.divIcon({
              html: `
                <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
                  <div style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #161616; padding: 4px 10px; border-radius: 4px; font-size: 8px; font-weight: 800; border-top: 2px solid ${iconColor}; border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 4px; white-space: nowrap;">
                    ${trip.full_name?.split(' ')[0].toUpperCase()}
                  </div>
                  <div class="vehicle-icon-wrapper" style="width: 24px; height: 24px; transition: transform 0.8s ease;">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path d="M12 1.5C8 1.5 6 3 6 5.5v14c0 2.5 2 3 6 3s6-0.5 6-3v-14c0-2.5-2-4-6-4z" fill="${iconColor}" stroke="white" stroke-width="1" />
                    </svg>
                  </div>
                </div>
              `,
              className: '', iconSize: [60, 50], iconAnchor: [30, 45]
            })
          }).addTo(leafletMap.current).bindPopup(`<b>Booking #${trip.id}</b><br/>${trip.full_name}<br/>Status: ${statusText}`);
          markersRef.current.set(id, m);
        }

        // Destination Pin
        const destId = `dest-${trip.id}`;
        currentIds.add(destId);
        const dl = Number(trip.dest_lat);
        const dg = Number(trip.dest_lng);
        if (!isNaN(dl) && !isNaN(dg) && dl !== 0) {
          if (destMarkersRef.current.has(id)) {
            destMarkersRef.current.get(id).setLatLng([dl, dg]);
          } else {
            const destIcon = window.L.divIcon({
              html: `<div style="background: #da1e28; color: white; padding: 3px 10px; font-size: 8px; font-weight: bold; border-radius: 4px; margin-bottom: 5px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 1px solid white; white-space: nowrap;">BOGO CITY</div>
                     <div class="force-circle" style="width: 14px; height: 14px; background: #da1e28; border: 2px solid white; border-radius: 50% !important; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"></div>`,
              className: '', iconSize: [60, 50], iconAnchor: [30, 45]
            });
            const dMarker = window.L.marker([dl, dg], { icon: destIcon, zIndexOffset: 5000 }).addTo(leafletMap.current);
            destMarkersRef.current.set(id, dMarker);
          }
        }

        // Routes
        const showRoute = ['accepted', 'on_way_to_pickup', 'en_route', 'picked_up'].includes(trip.transport_status);
        if (showRoute && !isNaN(dl)) {
          const routeId = `${trip.id}_${lat.toFixed(4)}_${lng.toFixed(4)}_${dl.toFixed(4)}_${dg.toFixed(4)}`;
          if (!polylinesRef.current.has(trip.id) || polylinesRef.current.get(trip.id).routeId !== routeId) {
            fetch(`https://router.project-osrm.org/route/v1/driving/${lng},${lat};${dg},${dl}?overview=full&geometries=geojson`)
              .then(r => r.json()).then(data => {
                if (data.routes?.[0]) {
                  if (polylinesRef.current.has(trip.id)) polylinesRef.current.get(trip.id).line.remove();
                  const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                  const line = window.L.polyline(coords, { color: '#24a148', weight: 3, opacity: 0.4 }).addTo(leafletMap.current);
                  polylinesRef.current.set(trip.id, { line, routeId });
                }
              }).catch(() => {});
          }
        }
      });

      // Cleanup
      for (const [id, marker] of markersRef.current.entries()) {
        if (!currentIds.has(id)) { marker.remove(); markersRef.current.delete(id); }
      }
      for (const [id, marker] of destMarkersRef.current.entries()) {
        if (!currentIds.has(`dest-${id.replace('trip-', '')}`)) { marker.remove(); destMarkersRef.current.delete(id); }
      }

    } catch (e) { console.error(e); }
  }, [trips, riders, selectedBooking, leafletReady]);

  // Early return AFTER all hooks
  if (!leafletReady) {
    return <div className="w-full h-full bg-[#1a1a2e] flex items-center justify-center"><span className="text-gray-500 text-xs uppercase tracking-widest">Loading map...</span></div>;
  }

  return <div ref={mapRef} className="w-full h-full bg-gray-50" />;
}

function RideDispatch({ trips, stats, riders, onRefresh }) {
  const [activeQueueTab, setActiveQueueTab] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [corporateAccounts, setCorporateAccounts] = useState([]);

  const [newBookingData, setNewBookingData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    scheduleType: 'Immediate',
    preferredDate: '',
    preferredTime: '',
    vehiclePreference: 'Standard',
    paymentMethod: 'Cash',
    accountNumber: '',
    notes: '',
    pickupLocation: '',
    destinationLocation: '',
    pickupCoords: null,
    destCoords: null
  });

  // Trigger initial data load and mark ready once trips arrive
  useEffect(() => {
    onRefresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isCreatingBooking) {
      fetch('/api/corporate-accounts')
        .then(res => res.json())
        .then(data => {
          if (data.success) setCorporateAccounts(data.accounts);
        })
        .catch(err => console.error('Error fetching corporate accounts', err));
    }
  }, [isCreatingBooking]);

  useEffect(() => {
    // Mark ready after first data load (trips array populated, or after a short timeout)
    if (trips !== undefined) {
      const timer = setTimeout(() => setIsReady(true), 300);
      return () => clearTimeout(timer);
    }
  }, [trips]);

  const handleCreateBooking = async (e) => {
    e.preventDefault();

    try {
      const isScheduled = newBookingData.scheduleType === 'Scheduled';
      const pDate = isScheduled && newBookingData.preferredDate ? newBookingData.preferredDate : new Date().toISOString().split('T')[0];
      const pTime = isScheduled && newBookingData.preferredTime ? newBookingData.preferredTime : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Fallback pseudo-coordinates if not selected via map
      const finalPickupLat = newBookingData.pickupCoords ? newBookingData.pickupCoords.lat : 11.0500 + (Math.random() - 0.5) * 0.05;
      const finalPickupLng = newBookingData.pickupCoords ? newBookingData.pickupCoords.lng : 124.0000 + (Math.random() - 0.5) * 0.05;
      const finalDestLat = newBookingData.destCoords ? newBookingData.destCoords.lat : 11.0500 + (Math.random() - 0.5) * 0.05;
      const finalDestLng = newBookingData.destCoords ? newBookingData.destCoords.lng : 124.0000 + (Math.random() - 0.5) * 0.05;

      let combinedNotes = newBookingData.notes;
      if (newBookingData.paymentMethod === 'Corporate' && newBookingData.accountNumber) {
        const acctStr = `[CORPORATE ACCOUNT: ${newBookingData.accountNumber}]`;
        combinedNotes = combinedNotes ? `${acctStr} - ${combinedNotes}` : acctStr;
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newBookingData.fullName,
          phoneNumber: newBookingData.phoneNumber,
          email: newBookingData.email || 'dispatch@internal.com',
          serviceType: newBookingData.vehiclePreference || 'Standard',
          preferredDate: pDate,
          preferredTime: pTime,
          notes: combinedNotes,
          pickupLocation: newBookingData.pickupLocation,
          destinationLocation: newBookingData.destinationLocation,
          pickupLat: finalPickupLat,
          pickupLng: finalPickupLng,
          destLat: finalDestLat,
          destLng: finalDestLng,
          totalAmount: 150 + Math.floor(Math.random() * 300),
          agentCode: 'DISPATCHER'
        })
      });

      if (response.ok) {
        setIsCreatingBooking(false);
        // Reset form
        setNewBookingData({
          fullName: '', phoneNumber: '', email: '', scheduleType: 'Immediate',
          preferredDate: '', preferredTime: '', vehiclePreference: 'Standard', paymentMethod: 'Cash',
          accountNumber: '', notes: '', pickupLocation: '', destinationLocation: '', pickupCoords: null, destCoords: null
        });
        onRefresh();
        alert('Booking created successfully!');
      } else {
        alert('Failed to create booking.');
      }
    } catch (error) {
      console.error('Create booking error:', error);
    }
  };

  const handleAssignRider = async (bookingId, riderId) => {
    if (!window.confirm('Assign this rider to the booking?')) return;

    try {
      const response = await fetch('/api/rider/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: bookingId, riderId })
      });

      if (response.ok) {
        setSelectedBooking(null);
        onRefresh();
        alert('Rider assigned successfully!');
      }
    } catch (error) {
      console.error('Assign rider error:', error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to CANCEL this booking?')) return;

    try {
      const response = await fetch(`/api/admin/trips/${bookingId}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        setSelectedBooking(null);
        onRefresh();
        alert('Booking cancelled.');
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
    }
  };

  // Filter trips for the queue
  // 'scheduled' tab: bookings with a future preferred_date that haven't started yet (confirmed/pending, no rider assigned yet or not in-progress)
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const queueTrips = trips.filter(t => {
    if (activeQueueTab === 'pending') return !t.rider_id && t.transport_status !== 'completed' && t.transport_status !== 'cancelled';
    if (activeQueueTab === 'assigned') return !!t.rider_id && t.transport_status !== 'completed' && t.transport_status !== 'cancelled';
    if (activeQueueTab === 'scheduled') {
      // Show confirmed/pending bookings with a preferred_date in the future
      const tripDate = t.preferred_date ? new Date(t.preferred_date) : null;
      tripDate && tripDate.setHours(0, 0, 0, 0);
      return (t.status === 'confirmed' || t.status === 'pending') &&
        t.transport_status !== 'completed' &&
        t.transport_status !== 'cancelled' &&
        (!tripDate || tripDate >= today);
    }
    return true;
  }).filter(t =>
    t.id.toString().includes(searchTerm) ||
    t.full_name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    t.pickup_location?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  if (!isReady) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#161616] gap-4">
        <RefreshCw size={28} className="text-[#10b981] animate-spin" />
        <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Loading Dispatch Module...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#161616]">
      {/* 1. TOP METRICS & CONTROLS */}
      <div className="p-4 bg-[#1c1c1c] border-b border-white/5 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pending</span>
            <span className="text-xl font-bold text-[#f1c21b]">{trips.filter(t => !t.rider_id && t.transport_status !== 'cancelled').length}</span>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ongoing</span>
            <span className="text-xl font-bold text-[#10b981]">{trips.filter(t => t.rider_id && t.transport_status !== 'completed' && t.transport_status !== 'cancelled').length}</span>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Available Riders</span>
            <span className="text-xl font-bold text-[#24a148]">{riders.filter(r => r.status === 'available').length}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input
              type="text"
              placeholder="Search Booking ID / Passenger..."
              className="bg-white/5 border border-white/10 rounded-sm pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#10b981] w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsCreatingBooking(true)}
            className="bg-[#10b981] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#0353e9] flex items-center gap-2"
          >
            <Plus size={14} /> Create Booking
          </button>
          <button onClick={onRefresh} className="bg-white/5 text-gray-400 p-2 hover:bg-white/10 border border-white/10"><RefreshCw size={16} /></button>
        </div>
      </div>

      {/* 2. MAIN CORE LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: MAP */}
        <div className="flex-1 relative">
          <DispatchMap trips={trips} riders={riders} selectedBooking={selectedBooking} />

          {/* Map Controls Float */}
          <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
            <button className="p-2 bg-white shadow-xl hover:bg-gray-100"><Plus size={18} /></button>
            <button className="p-2 bg-white shadow-xl hover:bg-gray-100"><Minus size={18} /></button>
            <button className="p-2 bg-white shadow-xl hover:bg-gray-100"><Navigation size={18} /></button>
          </div>

          {/* Legend Float */}
          <div className="absolute left-4 bottom-4 z-[1000] bg-white/90 backdrop-blur-md p-3 border border-gray-200 shadow-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600 uppercase">
              <div className="w-3 h-3 rounded-full bg-[#24a148]" /> Available Riders
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600 uppercase">
              <div className="w-3 h-3 rounded-full bg-[#f1c21b]" /> Pending Requests
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600 uppercase">
              <div className="w-3 h-3 rounded-full bg-[#10b981]" /> Active Trips
            </div>
          </div>
        </div>

        {/* RIGHT: QUEUE PANEL */}
        <div className="w-[420px] bg-[#1c1c1c] border-l border-white/5 flex flex-col">
          <div className="flex border-b border-white/5 bg-[#161616]">
            {['pending', 'assigned', 'scheduled'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveQueueTab(tab)}
                className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeQueueTab === tab ? 'text-[#10b981] bg-white/5 border-b-2 border-[#10b981]' : 'text-gray-500 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {queueTrips.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-600">
                <History size={48} className="mb-4 opacity-20" />
                <p className="text-xs uppercase tracking-widest font-bold">No {activeQueueTab} bookings</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {queueTrips.map(entry => (
                  <div
                    key={entry.id}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer group ${selectedBooking?.id === entry.id ? 'bg-[#10b981]/10 border-l-4 border-[#10b981]' : ''}`}
                    onClick={() => setSelectedBooking(entry)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5">#{entry.id}</span>
                      <span className="text-[9px] text-gray-500">{entry.preferred_time}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{entry.full_name}</h4>
                    <div className="space-y-1 mb-4">
                      <div className="flex items-start gap-2">
                        <MapPin size={12} className="text-gray-600 mt-0.5" />
                        <p className="text-[10px] text-gray-400 line-clamp-1">{entry.pickup_location}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight size={12} className="text-gray-600 mt-0.5" />
                        <p className="text-[10px] text-gray-400 line-clamp-1">{entry.destination_location}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <span className="text-[8px] font-bold py-1 px-2 border border-white/10 text-gray-400 uppercase">{entry.service_type || 'STANDARD'}</span>
                        <span className={`text-[8px] font-bold py-1 px-2 uppercase ${entry.rider_id ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          {entry.rider_id ? 'Assigned' : 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white/5 hover:bg-[#10b981] text-white transition-colors"><ChevronRight size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. DETAIL OVERLAY / MANUAL DISPATCH COMPONENT (Floating over map/queue) */}
      {selectedBooking && (
        <div className="absolute inset-y-0 right-[420px] w-96 bg-[#161616] border-l border-white/10 z-[2000] shadow-[-20px_0_40px_rgba(0,0,0,0.5)] flex flex-col animate-slideInRight">
          <div className="p-4 bg-[#1c1c1c] border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Booking Context</h3>
            <button onClick={() => setSelectedBooking(null)} className="text-gray-500 hover:text-white"><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Passenger details */}
            <section>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/5 flex items-center justify-center font-bold text-xl text-white">
                  {selectedBooking.full_name?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedBooking.full_name}</h4>
                  <p className="text-xs text-gray-500">{selectedBooking.phone_number}</p>
                </div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10">
                <div className="flex justify-between mb-2">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest">Distance</span>
                  <span className="text-xs font-bold text-white">4.2 KM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest">Estimated Fare</span>
                  <span className="text-xs font-bold text-[#E4FE7B]">PHP {selectedBooking.total_amount}</span>
                </div>
              </div>
            </section>

            {/* Manual Dispatch Area */}
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nearby Available Riders</h4>
                <button className="text-[10px] text-[#10b981] font-bold uppercase hover:underline">Auto Dispatch</button>
              </div>
              <div className="space-y-3">
                {(() => {
                  const availableRiders = riders.filter(r => r.status === 'available');
                  if (availableRiders.length === 0) {
                    return (
                      <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-500 text-[10px] uppercase font-bold text-center">
                        No riders available in radius
                      </div>
                    );
                  }

                  const reqType = selectedBooking.service_type?.toLowerCase() || '';
                  const matchingRiders = availableRiders.filter(r => r.vehicle_type?.toLowerCase() === reqType);
                  const nonMatchingRiders = availableRiders.filter(r => r.vehicle_type?.toLowerCase() !== reqType);
                  const sortedRiders = [...matchingRiders, ...nonMatchingRiders].slice(0, 4);

                  return sortedRiders.map(rider => {
                    const isMatch = rider.vehicle_type?.toLowerCase() === reqType;
                    return (
                      <div key={rider.id} className={`p-3 bg-white/5 border transition-all flex justify-between items-center group ${isMatch ? 'border-l-4 border-l-[#24a148] border-white/10 hover:border-[#24a148]' : 'border-l-4 border-l-orange-500 border-white/10 hover:border-orange-500'}`}>
                        <div className="flex gap-3 items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isMatch ? 'bg-[#24a148]/20 text-[#24a148]' : 'bg-orange-500/20 text-orange-500'}`}>
                            <User size={14} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-white">{rider.name}</p>
                              {!isMatch && <span className="text-[8px] font-bold bg-orange-500/20 text-orange-500 px-1 py-0.5 uppercase">Mismatch</span>}
                            </div>
                            <p className="text-[9px] text-gray-500">{rider.vehicle_type} Ã¢â‚¬Â¢ 0.8 KM away</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssignRider(selectedBooking.id, rider.id)}
                          className={`px-3 py-1.5 text-white text-[9px] font-bold uppercase tracking-widest transition-colors ${isMatch ? 'bg-[#24a148] hover:bg-[#1e8a3d]' : 'bg-orange-600 hover:bg-orange-700'}`}
                        >
                          Assign
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
            </section>

            {/* Booking Control Actions */}
            <section className="space-y-2 pt-4">
              <button className="w-full py-3 border border-white/10 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-center flex items-center justify-center gap-2">
                <Edit size={12} /> Edit Booking
              </button>
              <button
                onClick={() => handleCancelBooking(selectedBooking.id)}
                className="w-full py-3 border border-red-500/50 text-red-500 text-[9px] font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all text-center"
              >
                Cancel Booking
              </button>
            </section>
          </div>
        </div>
      )}

      {/* 4. MODALS (Booking Creation, etc.) */}
      {isCreatingBooking && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden animate-zoomIn">
            <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-black uppercase tracking-tighter italic">Manual Dispatch Request</h3>
                <p className="text-xs text-gray-500">Create a new booking directly in the system</p>
              </div>
              <button onClick={() => setIsCreatingBooking(false)} className="text-gray-400 hover:text-black"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#24a148] uppercase tracking-widest">Passenger Information</h4>
                  <input
                    name="fullName"
                    value={newBookingData.fullName}
                    onChange={e => setNewBookingData({ ...newBookingData, fullName: e.target.value })}
                    required
                    className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] focus:ring-0"
                    placeholder="Full Name"
                  />
                  <input
                    name="phoneNumber"
                    value={newBookingData.phoneNumber}
                    onChange={e => setNewBookingData({ ...newBookingData, phoneNumber: e.target.value })}
                    required
                    className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] focus:ring-0"
                    placeholder="Contact Number"
                  />
                  <input
                    name="email"
                    value={newBookingData.email}
                    onChange={e => setNewBookingData({ ...newBookingData, email: e.target.value })}
                    className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] focus:ring-0"
                    placeholder="Email (Optional)"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#24a148] uppercase tracking-widest">Trip Details</h4>
                  <div className="relative [&_input]:text-[12px] [&_input]:p-2.5">
                    <LocationAutocomplete
                      value={newBookingData.pickupLocation}
                      onChange={(val) => setNewBookingData(prev => ({ ...prev, pickupLocation: val }))}
                      onSelect={(place) => {
                        if (place && place.address && place.coords) {
                          setNewBookingData(prev => ({
                            ...prev,
                            pickupLocation: place.address,
                            pickupCoords: place.coords
                          }));
                        }
                      }}
                      placeholder="Search Pickup Address..."
                    />
                  </div>
                  <div className="relative [&_input]:text-[12px] [&_input]:p-2.5">
                    <LocationAutocomplete
                      value={newBookingData.destinationLocation}
                      onChange={(val) => setNewBookingData(prev => ({ ...prev, destinationLocation: val }))}
                      onSelect={(place) => {
                        if (place && place.address && place.coords) {
                          setNewBookingData(prev => ({
                            ...prev,
                            destinationLocation: place.address,
                            destCoords: place.coords
                          }));
                        }
                      }}
                      placeholder="Search Destination Address..."
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Schedule Type</label>
                  <select
                    name="scheduleType"
                    value={newBookingData.scheduleType}
                    onChange={e => setNewBookingData({ ...newBookingData, scheduleType: e.target.value })}
                    className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2 text-[12px] text-black focus:outline-none focus:border-[#24a148]"
                  >
                    <option>Immediate</option>
                    <option>Scheduled</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Vehicle Preference</label>
                  <select
                    name="vehiclePreference"
                    value={newBookingData.vehiclePreference}
                    onChange={e => setNewBookingData({ ...newBookingData, vehiclePreference: e.target.value })}
                    className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2 text-[12px] text-black focus:outline-none focus:border-[#24a148]"
                  >
                    <option value="Standard">No Preference</option>
                    <option value="Car">Car</option>
                    <option value="Luxury Van">Van / SUV</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={newBookingData.paymentMethod}
                    onChange={e => setNewBookingData({ ...newBookingData, paymentMethod: e.target.value })}
                    className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2 text-[12px] text-black focus:outline-none focus:border-[#24a148]"
                  >
                    <option>Cash</option>
                    <option>Wallet</option>
                    <option>Corporate</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {newBookingData.paymentMethod === 'Corporate' && (
                  <div>
                    <label className="text-[9px] font-bold text-[#24a148] uppercase tracking-widest">Corporate Account</label>
                    <select
                      name="accountNumber"
                      value={newBookingData.accountNumber}
                      onChange={e => setNewBookingData({ ...newBookingData, accountNumber: e.target.value })}
                      required
                      className="w-full bg-[#f4f4f4] border-0 border-b border-[#24a148] p-2 text-[12px] text-black focus:outline-none focus:ring-0 mt-1"
                    >
                      <option value="">Select Account / Cost Center</option>
                      {corporateAccounts.map(acct => (
                        <option key={acct.id} value={acct.account_number}>
                          {acct.company_name} ({acct.account_number}) - Lmt: ${parseFloat(acct.credit_limit).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Notes to Driver</label>
                  <textarea
                    name="notes"
                    value={newBookingData.notes}
                    onChange={e => setNewBookingData({ ...newBookingData, notes: e.target.value })}
                    className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2 text-[12px] text-black focus:outline-none focus:border-[#24a148] focus:ring-0 mt-1 resize-none h-14"
                    placeholder="Special instructions, gate codes, etc..."
                  />
                </div>
              </div>

              {newBookingData.scheduleType === 'Scheduled' && (
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 border border-gray-100 mt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Date</label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={newBookingData.preferredDate}
                      onChange={e => setNewBookingData({ ...newBookingData, preferredDate: e.target.value })}
                      required
                      className="w-full bg-white border-0 border-b border-gray-300 p-2 text-[12px] text-black focus:outline-none focus:border-[#24a148]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Time</label>
                    <input
                      type="time"
                      name="preferredTime"
                      value={newBookingData.preferredTime}
                      onChange={e => setNewBookingData({ ...newBookingData, preferredTime: e.target.value })}
                      required
                      className="w-full bg-white border-0 border-b border-gray-300 p-2 text-[12px] text-black focus:outline-none focus:border-[#24a148]"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <button type="submit" className="force-circle w-full py-3 bg-[#24a148] text-white text-[14px] font-medium shadow-lg hover:shadow-xl hover:bg-[#1e8a3d] active:scale-[0.98] transition-all">Submit Dispatch Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   GEOFENCING MANAGEMENT MODULE
   ========================================================================== */

function GeofenceDashboard({ geofences, onEdit }) {
  return (
    <div className="bg-white border border-[#e0e0e0] shadow-sm animate-fadeIn">
      <div className="p-6 border-b border-[#e0e0e0] flex justify-between items-center bg-gray-50/50">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" placeholder="Search Zone Name..." className="pl-9 pr-4 py-2 bg-white border border-gray-300 text-sm focus:outline-none focus:border-[#10b981] w-64" />
          </div>
          <select className="px-4 py-2 bg-white border border-gray-300 text-sm outline-none focus:border-[#10b981]">
            <option>All Types</option>
            <option>Service Area</option>
            <option>Restricted Zone</option>
            <option>High Demand Zone</option>
            <option>Dispatch Zone</option>
          </select>
          <select className="px-4 py-2 bg-white border border-gray-300 text-sm outline-none focus:border-[#10b981]">
            <option>Status: All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#e0e0e0]">
            <tr>
              <th className="p-4">Zone Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Coverage</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {geofences.map(g => (
              <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm font-bold text-[#161616]">{g.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${g.type === 'Service' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    g.type === 'Restricted' ? 'bg-red-50 text-red-600 border-red-100' :
                      g.type === 'High Demand' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                        'bg-purple-50 text-purple-600 border-purple-100'
                    }`}>{g.type}</span>
                </td>
                <td className="p-4 text-sm text-gray-500">{g.coverage} kmÃ‚Â²</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 force-circle ${g.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-xs font-medium text-gray-700">{g.status}</span>
                  </div>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => onEdit(g)} className="text-[#10b981] hover:underline text-[10px] font-bold uppercase tracking-widest">Edit</button>
                  <button className="text-gray-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-widest">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GeofenceForm({ geofence, onCancel, onSave }) {
  const [zoneName, setZoneName] = useState(geofence?.name || '');
  const [zoneType, setZoneType] = useState(geofence?.type || 'Service Area');
  const [areaSize, setAreaSize] = useState(geofence?.coverage || 0);
  const [coordinates, setCoordinates] = useState(geofence?.coordinates || []);
  const [shapeData, setShapeData] = useState(geofence?.shapeData || null);

  const mapRef = React.useRef(null);
  const leafletMap = React.useRef(null);
  const drawnItems = React.useRef(null);

  useEffect(() => {
    if (!mapRef.current || !window.L || !window.L.Draw) return;

    const map = window.L.map(mapRef.current).setView([11.0500, 124.0000], 13);
    leafletMap.current = map;

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO'
    }).addTo(map);

    // Initialize the FeatureGroup to store editable layers
    drawnItems.current = new window.L.FeatureGroup();
    map.addLayer(drawnItems.current);

    // If editing, draw the existing shape
    if (geofence?.shapeData) {
      const { type, data } = geofence.shapeData;
      let layer;
      if (type === 'polygon') {
        layer = window.L.polygon(data, { color: '#10b981', fillOpacity: 0.2 });
      } else if (type === 'circle') {
        layer = window.L.circle(data.center, { radius: data.radius, color: '#10b981', fillOpacity: 0.2 });
      }
      if (layer) {
        drawnItems.current.addLayer(layer);
        map.fitBounds(layer.getBounds());
      }
    }

    // Handle created events
    map.on(window.L.Draw.Event.CREATED, (e) => {
      const type = e.layerType;
      const layer = e.layer;

      // Clear previous drawings
      drawnItems.current.clearLayers();
      drawnItems.current.addLayer(layer);

      if (type === 'polygon') {
        const latlngs = layer.getLatLngs()[0];
        setCoordinates(latlngs.map(ll => `${ll.lat.toFixed(4)}Ã‚Â°N, ${ll.lng.toFixed(4)}Ã‚Â°E`));
        setShapeData({ type: 'polygon', data: latlngs });

        // --- Accurate Spherical Area Calculation (mÃ‚Â²) ---
        let areaSqM = 0;
        const R = 6378137; // Standard Earth Radius

        if (window.L.GeometryUtil && typeof window.L.GeometryUtil.geodesicArea === 'function') {
          areaSqM = window.L.GeometryUtil.geodesicArea(latlngs);
        } else {
          // Manual Spherical Integral (Haversine-based)
          let total = 0;
          for (let i = 0, len = latlngs.length; i < len; i++) {
            const p1 = latlngs[i];
            const p2 = latlngs[(i + 1) % len];
            total += (p2.lng - p1.lng) * (Math.PI / 180) * (2 + Math.sin(p1.lat * (Math.PI / 180)) + Math.sin(p2.lat * (Math.PI / 180)));
          }
          areaSqM = Math.abs(total * R * R / 2.0);
        }

        // Convert to sq km
        const km2 = areaSqM / 1000000;
        setAreaSize(km2.toFixed(3)); // Increased precision
      } else if (type === 'circle') {
        const center = layer.getLatLng();
        const radius = layer.getRadius(); // This is in meters
        setCoordinates([`Center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`, `Radius: ${radius.toFixed(0)}m`]);
        setShapeData({ type: 'circle', data: { center, radius } });

        // A = Ãâ‚¬rÃ‚Â²
        const areaSqM = Math.PI * Math.pow(radius, 2);
        const km2 = areaSqM / 1000000;
        setAreaSize(km2.toFixed(3));
      }
    });

    return () => map.remove();
  }, [geofence]);

  const handleDrawPolygon = () => {
    if (!leafletMap.current || !window.L.Draw) return;
    new window.L.Draw.Polygon(leafletMap.current, {
      shapeOptions: { color: '#10b981', fillOpacity: 0.2 }
    }).enable();
  };

  const handleDrawCircle = () => {
    if (!leafletMap.current || !window.L.Draw) return;
    new window.L.Draw.Circle(leafletMap.current, {
      shapeOptions: { color: '#10b981', fillOpacity: 0.2 }
    }).enable();
  };

  const handleClear = () => {
    if (drawnItems.current) {
      drawnItems.current.clearLayers();
      setAreaSize(0);
      setCoordinates([]);
      setShapeData(null);
    }
  };

  const handleSave = () => {
    if (!zoneName) { alert("Please enter a Zone Name"); return; }
    if (!shapeData) { alert("Please draw a zone on the map before saving"); return; }
    onSave({
      name: zoneName,
      type: zoneType,
      coverage: areaSize,
      coordinates: coordinates,
      shapeData: shapeData
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Left Column: Form Details */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white border border-[#e0e0e0] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-100 text-[#10b981] flex items-center justify-center font-bold text-sm">1</div>
            <h3 className="text-sm font-bold uppercase tracking-widest">Basic Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Zone Name</label>
              <input
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                type="text" placeholder="e.g. Downtown Core"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#10b981]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Zone Type</label>
              <select
                value={zoneType}
                onChange={(e) => setZoneType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#10b981]"
              >
                <option>Service Area</option>
                <option>Restricted Zone</option>
                <option>High Demand Zone</option>
                <option>Dispatch Zone</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e0e0e0] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-100 text-[#10b981] flex items-center justify-center font-bold text-sm">2</div>
            <h3 className="text-sm font-bold uppercase tracking-widest">Rule Configuration</h3>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-sm">
              <p className="text-[10px] text-blue-600 font-bold uppercase mb-2">Rule Type: Dispatch Priority</p>
              <div className="flex items-center justify-between text-xs">
                <span>Radius: 5km</span>
                <span className="font-bold">Inside Zone First</span>
              </div>
            </div>
            <button className="w-full py-3 border border-dashed border-gray-300 text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:border-[#10b981] hover:text-[#10b981] transition-all">
              + Add New Rule
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-4 bg-[#10b981] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#0353e9] transition-all shadow-lg">Save Geofence</button>
        </div>
      </div>

      {/* Right Column: Map Interface */}
      <div className="lg:col-span-2 flex flex-col space-y-4">
        <div className="bg-white border border-[#e0e0e0] p-4 flex justify-between items-center shadow-sm">
          <div className="flex gap-2">
            <button onClick={handleDrawPolygon} className="px-4 py-2 bg-white border border-gray-300 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-2">
              <div className="w-2 h-2 border border-[#10b981]"></div> Draw Polygon
            </button>
            <button onClick={handleDrawCircle} className="px-4 py-2 bg-white border border-gray-300 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-2">
              <div className="w-2 h-2 rounded-full border border-[#10b981]"></div> Draw Circle
            </button>
            <button onClick={handleClear} className="px-4 py-2 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors">
              Clear Drawing
            </button>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Calculated Area</p>
            <div className="flex flex-col items-end">
              <p className="text-lg font-bold text-[#161616]">{areaSize} <span className="text-xs text-gray-400">kmÃ‚Â²</span></p>
              <p className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 border border-blue-100 mt-0.5">
                {(parseFloat(areaSize) * 100).toFixed(2)} <span className="text-[9px] uppercase">Hectares (ha)</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-[500px] bg-gray-100 border border-[#e0e0e0] shadow-inner relative overflow-hidden">
          <div ref={mapRef} className="absolute inset-0 z-0"></div>
          {/* Coordinate Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 p-4 border border-gray-200 shadow-2xl flex justify-between items-center">
            <div className="flex-1">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Generated Coordinates</p>
              <div className="flex flex-wrap gap-2">
                {coordinates.length > 0 ? (
                  coordinates.slice(0, 4).map((coord, i) => (
                    <span key={i} className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 border border-gray-200">{coord}</span>
                  ))
                ) : (
                  <span className="text-[10px] text-gray-400 italic">No shape drawn yet...</span>
                )}
                {coordinates.length > 4 && <span className="text-[10px] text-gray-400">+{coordinates.length - 4} more</span>}
              </div>
            </div>
            <div className="pl-4 border-l border-gray-100">
              <div className={`px-3 py-1.5 ${coordinates.length > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'} text-[9px] font-bold uppercase tracking-widest border border-current`}>
                {coordinates.length > 0 ? 'Ready to save' : 'Awaiting Shape'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GeofenceMonitoring({ geofences }) {
  const mapRef = React.useRef(null);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const map = window.L.map(mapRef.current).setView([11.0500, 124.0000], 12);
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

    // Render all geofences on monitoring map
    geofences.forEach(g => {
      if (g.shapeData) {
        const { type, data } = g.shapeData;
        let color = '#10b981'; // Default Blue
        if (g.type === 'Restricted Zone') color = '#da1e28'; // Red
        if (g.type === 'High Demand Zone') color = '#f1c21b'; // Yellow
        if (g.type === 'Dispatch Zone') color = '#8a3ffc'; // Purple

        let layer;
        if (type === 'polygon') {
          layer = window.L.polygon(data, { color, fillOpacity: 0.2, weight: 2 }).addTo(map);
        } else if (type === 'circle') {
          layer = window.L.circle(data.center, { radius: data.radius, color, fillOpacity: 0.2, weight: 2 }).addTo(map);
        }

        if (layer) {
          layer.bindPopup(`<b>${g.name}</b><br/>Type: ${g.type}<br/>Area: ${g.coverage} kmÃ‚Â²`);
        }
      }
    });

    return () => map.remove();
  }, [geofences]);

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#e0e0e0] p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Zones</p>
          <p className="text-2xl font-bold text-blue-600">{geofences.filter(g => g.status === 'Active').length}</p>
        </div>
        <div className="bg-white border border-[#e0e0e0] p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Riders In Zones</p>
          <p className="text-2xl font-bold text-green-600">42</p>
        </div>
        <div className="bg-white border border-[#e0e0e0] p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">High Demand Alerts</p>
          <p className="text-2xl font-bold text-yellow-600">3</p>
        </div>
        <div className="bg-white border border-[#e0e0e0] p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Violations</p>
          <p className="text-2xl font-bold text-red-600">0</p>
        </div>
      </div>

      <div className="flex-1 min-h-[400px] border border-[#e0e0e0] relative">
        <div ref={mapRef} className="absolute inset-0 z-0"></div>
        {/* Legend */}
        <div className="absolute top-4 right-4 z-10 bg-white/90 p-4 border border-gray-200 shadow-xl space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2 border-b pb-1">Legend</h4>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500/50 border border-blue-500"></div> <span className="text-[10px] font-medium">Service Area</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#da1e28]/50 border border-[#da1e28]"></div> <span className="text-[10px] font-medium">Restricted</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#f1c21b]/50 border border-[#f1c21b]"></div> <span className="text-[10px] font-medium">High Demand</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#8a3ffc]/50 border border-[#8a3ffc]"></div> <span className="text-[10px] font-medium">Dispatch Zone</span></div>
        </div>
      </div>
    </div>
  );
}

function GeofenceSettings() {
  return (
    <div className="max-w-3xl space-y-6 animate-fadeIn">
      <div className="bg-white border border-[#e0e0e0] p-8 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-[2px] mb-8 border-b pb-4">System Configurations</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#161616]">Auto Zone Detection</p>
              <p className="text-xs text-gray-500">System automatically detects zone based on rider GPS</p>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#161616]">Dynamic Radius Expansion</p>
              <p className="text-xs text-gray-500">Expand search radius if no riders are found in zone</p>
            </div>
            <div className="w-12 h-6 bg-gray-200 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#161616]">Demand-Based Resizing</p>
              <p className="text-xs text-gray-500">Automatically adjust zone size based on trip demand</p>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e0e0e0] p-8 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-[2px] mb-8 border-b pb-4">Surge Pricing Globals</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Global Multiplier Cap</label>
            <input type="number" defaultValue="3.0" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#10b981]" />
          </div>
          <button className="w-full py-4 bg-[#161616] text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all">Save System Settings</button>
        </div>
      </div>
    </div>
  );
}

function GeofencingManagement() {
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  const [geofences, setGeofences] = useState([
    { id: 1, name: 'Downtown Service Area', type: 'Service', coverage: 12.5, status: 'Active' },
    { id: 2, name: 'Restricted Port Zone', type: 'Restricted', coverage: 3.2, status: 'Active' },
    { id: 3, name: 'Night Market High Demand', type: 'High Demand', coverage: 1.8, status: 'Inactive' },
    { id: 4, name: 'Express Dispatch Zone A', type: 'Dispatch', coverage: 5.4, status: 'Active' },
  ]);
  const [selectedGeofence, setSelectedGeofence] = useState(null);

  const handleSaveGeofence = (newGeofence) => {
    if (selectedGeofence) {
      setGeofences(geofences.map(g => g.id === selectedGeofence.id ? { ...g, ...newGeofence } : g));
    } else {
      setGeofences([...geofences, { id: Date.now(), ...newGeofence, status: 'Active' }]);
    }
    setActiveSubTab('dashboard');
  };

  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'dashboard': return <GeofenceDashboard geofences={geofences} onEdit={(g) => { setSelectedGeofence(g); setActiveSubTab('edit'); }} />;
      case 'create':
      case 'edit': return <GeofenceForm geofence={selectedGeofence} onCancel={() => setActiveSubTab('dashboard')} onSave={handleSaveGeofence} />;
      case 'monitoring': return <GeofenceMonitoring geofences={geofences} />;
      case 'settings': return <GeofenceSettings />;
      default: return <GeofenceDashboard geofences={geofences} onEdit={(g) => { setSelectedGeofence(g); setActiveSubTab('edit'); }} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f4f4f4] overflow-hidden rounded-0">
      {/* Header with Navigation */}
      <div className="p-6 bg-white border-b border-[#e0e0e0] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#161616] tracking-tight uppercase italic flex items-center gap-2">
            <MapIcon size={24} className="text-[#10b981]" /> Geofencing Management
          </h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Operational Zone Strategy & Control</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: ClipboardList },
            { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
            { id: 'settings', label: 'Advanced Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${activeSubTab === tab.id ? 'bg-[#10b981] text-white border-[#10b981] shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
          <div className="w-[1px] h-8 bg-gray-200 mx-2 hidden md:block" />
          <button
            onClick={() => { setSelectedGeofence(null); setActiveSubTab('create'); }}
            className="px-6 py-2 bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black flex items-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <Plus size={14} /> Create New Geofence
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-[1400px] mx-auto h-full">
          {renderSubContent()}
        </div>
      </div>
    </div>
  );
}

function SystemSettingsModule() {
  const [activeTab, setActiveTab] = useState('general');

  const menuItems = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'users', label: 'User & Roles', icon: Users },
    { id: 'dispatch', label: 'Dispatch Settings', icon: Truck },
    { id: 'geofence', label: 'Geofence Settings', icon: MapIcon },
    { id: 'pricing', label: 'Pricing & Fare Rules', icon: DollarSign },
    { id: 'email', label: 'Email Configuration', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment & Wallet', icon: Wallet },
    { id: 'api', label: 'Integration & API', icon: Link },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'logs', label: 'Logs & Audit', icon: ClipboardList },
    { id: 'alerts', label: 'System Alerts', icon: AlertTriangle },
    { id: 'backup', label: 'Backup & Restore', icon: Database }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralSettings />;
      case 'users': return <UserRolesSettings />;
      case 'dispatch': return <DispatchSettings />;
      case 'geofence': return <GeofenceGlobalSettings />;
      case 'pricing': return <PricingFareSettings />;
      case 'email': return <EmailTemplateSettings />;
      case 'notifications': return <NotificationChannelSettings />;
      case 'payment': return <PaymentWalletSettings />;
      case 'api': return <IntegrationAPISettings />;
      case 'security': return <SecuritySettings />;
      case 'logs': return <LogsAuditTrail />;
      case 'alerts': return <SystemAlertsMonitoring />;
      case 'backup': return <BackupRestoreSettings />;
      default: return <GeneralSettings />;
    }
  };

  return (
    <div className="h-full flex bg-white border border-[#e0e0e0] shadow-sm animate-fadeIn overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-[#e0e0e0] bg-[#f4f4f4] flex flex-col">
        <div className="p-6 border-b border-[#e0e0e0]">
          <h3 className="text-xs font-bold uppercase tracking-[2px] text-gray-500">System Configuration</h3>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full px-6 py-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-white text-[#10b981] border-r-4 border-[#10b981]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white p-10">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// --- Sub-sections ---

function SettingsSection({ title, subtitle, children, onSave }) {
  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-[#161616] tracking-tight uppercase italic">{title}</h2>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">{subtitle}</p>
      </div>
      <div className="space-y-6">
        {children}
      </div>
      {onSave && (
        <div className="pt-8 border-t border-[#e0e0e0] flex justify-end">
          <button onClick={onSave} className="px-8 py-4 bg-[#10b981] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#0353e9] transition-all shadow-lg">
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

function GeneralSettings() {
  const [settings, setSettings] = useState({
    clinic_name: 'King\'s Tourist and Transport Services',
    clinic_address: 'Cantecson, Gairan, Bogo City, Cebu',
    clinic_phone: '+63 912 345 6789'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        const newSettings = { ...settings };
        data.settings.forEach(s => {
          if (newSettings.hasOwnProperty(s.key)) {
            newSettings[s.key] = s.value;
          }
        });
        setSettings(newSettings);
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ settings: Object.entries(settings).map(([key, value]) => ({ key, value })) })
      });
      const data = await res.json();
      if (data.success) {
        alert('General settings updated successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      alert('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="py-20 text-center font-mono text-gray-400 animate-pulse uppercase tracking-widest">Loading Identity...</div>;

  return (
    <SettingsSection title="General Settings" subtitle="Core System Identity and Localization" onSave={handleSave}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Clinic / Business Name</label>
          <input
            type="text"
            value={settings.clinic_name}
            onChange={e => setSettings({ ...settings, clinic_name: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm font-bold focus:border-[#10b981] outline-none"
          />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Business Address</label>
          <input
            type="text"
            value={settings.clinic_address}
            onChange={e => setSettings({ ...settings, clinic_address: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm focus:border-[#10b981] outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Phone</label>
          <input
            type="text"
            value={settings.clinic_phone}
            onChange={e => setSettings({ ...settings, clinic_phone: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm focus:border-[#10b981] outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Default Timezone</label>
          <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm focus:border-[#10b981] outline-none">
            <option>(GMT+08:00) Manila, Philippines</option>
            <option>(GMT+00:00) UTC</option>
          </select>
        </div>
      </div>
    </SettingsSection>
  );
}

function UserRolesSettings() {
  const roles = [
    { name: 'Admin', riders: true, dispatch: true, reports: true },
    { name: 'Dispatcher', riders: true, dispatch: true, reports: false },
    { name: 'Support', riders: false, dispatch: false, reports: true },
    { name: 'Finance', riders: false, dispatch: false, reports: true },
  ];

  return (
    <SettingsSection title="User & Role Management" subtitle="Define Access Control and Permissions">
      <div className="bg-white border border-[#e0e0e0]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f4f4f4] border-b border-[#e0e0e0]">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Role Name</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Manage Riders</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Dispatch Trips</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">View Reports</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, i) => (
              <tr key={i} className="border-b border-[#f4f4f4] hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold">{role.name}</td>
                <td className="px-6 py-4 text-center">{role.riders ? <Check size={16} className="mx-auto text-green-600" /> : <X size={16} className="mx-auto text-red-600" />}</td>
                <td className="px-6 py-4 text-center">{role.dispatch ? <Check size={16} className="mx-auto text-green-600" /> : <X size={16} className="mx-auto text-red-600" />}</td>
                <td className="px-6 py-4 text-center">{role.reports ? <Check size={16} className="mx-auto text-green-600" /> : <X size={16} className="mx-auto text-red-600" />}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[10px] font-bold text-[#10b981] uppercase hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="w-full py-4 border border-dashed border-gray-300 text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:border-[#10b981] hover:text-[#10b981] transition-all">
        + Create New Custom Role
      </button>
    </SettingsSection>
  );
}

function DispatchSettings() {
  return (
    <SettingsSection title="Dispatch Settings" subtitle="Automated Matching and Assignment Logic" onSave={() => { }}>
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#161616]">Enable Auto Dispatch</p>
            <p className="text-xs text-gray-500">System automatically assigns riders to bookings</p>
          </div>
          <div className="w-12 h-6 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Dispatch Timeout (seconds)</label>
            <input type="number" defaultValue="30" className="w-full px-4 py-3 bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#10b981]" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Max Search Radius (km)</label>
            <input type="number" defaultValue="10" className="w-full px-4 py-3 bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#10b981]" />
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Matching Priority</p>
          {[
            { label: 'Nearest Rider', checked: true },
            { label: 'Highest Rating', checked: true },
            { label: 'Least Busy Rider', checked: false }
          ].map((logic, i) => (
            <div key={i} className="flex items-center gap-3">
              <input type="checkbox" defaultChecked={logic.checked} className="w-4 h-4" />
              <span className="text-sm text-gray-700 font-medium">{logic.label}</span>
            </div>
          ))}
        </div>
      </div>
    </SettingsSection>
  );
}

function GeofenceGlobalSettings() {
  return (
    <SettingsSection title="Geofence Settings" subtitle="Global Rules for Geographic Zones" onSave={() => { }}>
      <div className="space-y-4">
        {[
          { label: 'Enable Geofencing', desc: 'Activate all zone-based restrictions and rules', active: true },
          { label: 'Auto-detect Rider Zone', desc: 'Automatically assign riders to zones based on GPS', active: true },
          { label: 'Restrict Pickups Outside Service Zone', desc: 'Prevent booking if pickup is in a restricted area', active: true },
          { label: 'Demand-Based Zones', desc: 'Enable dynamic zone resizing based on trip volume', active: false }
        ].map((item, i) => (
          <div key={i} className="p-6 bg-white border border-[#e0e0e0] flex items-center justify-between group hover:border-[#10b981] transition-all">
            <div>
              <p className="text-sm font-bold text-[#161616] group-hover:text-[#10b981]">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <div className={`w-12 h-6 ${item.active ? 'bg-[#10b981]' : 'bg-gray-200'} rounded-full relative transition-colors`}>
              <div className={`absolute ${item.active ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full shadow-sm`}></div>
            </div>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}

function PricingFareSettings() {
  return (
    <SettingsSection title="Pricing & Fare Rules" subtitle="Configure Revenue Model and Surcharges" onSave={() => { }}>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#f4f4f4] p-6 border-l-4 border-[#10b981]">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Base Fare (Ã¢â€šÂ±)</label>
          <input type="number" defaultValue="45" className="w-full bg-transparent border-0 text-3xl font-light focus:outline-none" />
        </div>
        <div className="bg-[#f4f4f4] p-6 border-l-4 border-[#24a148]">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Per KM Rate</label>
          <input type="number" defaultValue="12" className="w-full bg-transparent border-0 text-3xl font-light focus:outline-none" />
        </div>
        <div className="bg-[#f4f4f4] p-6 border-l-4 border-[#8a3ffc]">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Per Min Rate</label>
          <input type="number" defaultValue="2" className="w-full bg-transparent border-0 text-3xl font-light focus:outline-none" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-8 mt-10">
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#161616]">Surcharges</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span>Surge Multiplier</span>
              <span className="font-bold">x1.5 - x3.0</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Night Differential (22:00 - 05:00)</span>
              <span className="font-bold">+Ã¢â€šÂ±20.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Cancellation Fee</span>
              <span className="font-bold">Ã¢â€šÂ±30.00</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#161616]">Global Caps</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span>Minimum Fare</span>
              <span className="font-bold">Ã¢â€šÂ±50.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Maximum Fare Cap</span>
              <span className="font-bold">Ã¢â€šÂ±1,500.00</span>
            </div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}

function NotificationChannelSettings() {
  const channels = [
    { name: 'SMS Gateway', enabled: true, events: ['Booking Confirmed', 'Rider Assigned'] },
    { name: 'Email Notifications', enabled: true, events: ['Trip Receipt', 'Account Security'] },
    { name: 'Push Notifications', enabled: false, events: ['Marketing', 'Nearby Promos'] },
    { name: 'Messenger (Webhook)', enabled: true, events: ['Customer Support'] }
  ];

  return (
    <SettingsSection title="Notification Settings" subtitle="Channel Management and Event Triggers">
      <div className="space-y-6">
        {channels.map((ch, i) => (
          <div key={i} className="bg-white border border-[#e0e0e0] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 ${ch.enabled ? 'bg-blue-100 text-[#10b981]' : 'bg-gray-100 text-gray-400'} flex items-center justify-center`}>
                <Bell size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#161616]">{ch.name}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ch.events.map(ev => <span key={ev} className="text-[9px] bg-gray-100 px-2 py-0.5 text-gray-500 font-medium">{ev}</span>)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-[10px] font-bold uppercase text-[#10b981] hover:underline">Configure</button>
              <div className={`w-10 h-5 ${ch.enabled ? 'bg-green-500' : 'bg-gray-300'} rounded-full relative transition-colors`}>
                <div className={`absolute ${ch.enabled ? 'right-1' : 'left-1'} top-0.5 w-4 h-4 bg-white rounded-full`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}

function PaymentWalletSettings() {
  return (
    <SettingsSection title="Payment & Wallet Settings" subtitle="Financial Flow and Payout Configurations" onSave={() => { }}>
      <div className="space-y-8">
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Payment Methods</h4>
          <div className="grid grid-cols-3 gap-4">
            {['Cash', 'Wallet', 'Card'].map(m => (
              <div key={m} className="p-4 border border-[#e0e0e0] flex items-center gap-3 bg-gray-50">
                <input type="checkbox" defaultChecked={m !== 'Card'} className="w-4 h-4" />
                <span className="text-sm font-bold">{m}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-[#e0e0e0] p-6">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Wallet Config</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">Minimum Balance (Ã¢â€šÂ±)</label>
                <input type="number" defaultValue="50" className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#10b981] font-bold" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Auto-deduct Fare</span>
                <div className="w-10 h-5 bg-[#10b981] rounded-full relative"><div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full"></div></div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#e0e0e0] p-6">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Payout Schedule</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">Frequency</label>
                <select className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#10b981] font-bold bg-transparent">
                  <option>Daily at 12:00 AM</option>
                  <option>Weekly (Mondays)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">Min Payout (Ã¢â€šÂ±)</label>
                <input type="number" defaultValue="1000" className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#10b981] font-bold" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}

function IntegrationAPISettings() {
  return (
    <SettingsSection title="Integration & API" subtitle="Connect with External Services and Webhooks">
      <div className="space-y-6">
        {[
          { name: 'Google Maps API', key: 'AIzaSyC-XXXXXXX-XXXXXXX', status: 'Connected' },
          { name: 'Twilio SMS Gateway', key: 'AC8f7d9XXXXXXX-XXXXXXX', status: 'Error' },
          { name: 'PayMongo Payment', key: 'pk_live_XXXXXXX-XXXXXXX', status: 'Connected' }
        ].map((api, i) => (
          <div key={i} className="p-6 bg-gray-50 border border-gray-200 shadow-inner">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-bold text-[#161616] uppercase tracking-tight">{api.name}</p>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 ${api.status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{api.status}</span>
            </div>
            <div className="flex gap-2">
              <input type="password" value={api.key} readOnly className="flex-1 bg-white border border-gray-200 px-4 py-2 text-xs font-mono text-gray-500" />
              <button className="px-4 py-2 bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black">Regenerate</button>
            </div>
          </div>
        ))}
        <div className="pt-6">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Webhooks</h4>
          <div className="border border-[#e0e0e0] bg-white divide-y divide-[#f4f4f4]">
            {['booking.created', 'trip.completed', 'payment.received'].map(event => (
              <div key={event} className="p-4 flex justify-between items-center">
                <span className="text-xs font-mono text-[#10b981] font-bold">{event}</span>
                <span className="text-[10px] text-gray-400 font-medium italic">https://api.kingstours.com/v1/webhook</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}

function SecuritySettings() {
  return (
    <SettingsSection title="Security Settings" subtitle="System Access and Authentication Controls" onSave={() => { }}>
      <div className="space-y-6">
        <div className="bg-blue-900 text-white p-8 rounded-0 flex justify-between items-center shadow-xl">
          <div>
            <h4 className="text-lg font-bold tracking-tight mb-2">Two-Factor Authentication (2FA)</h4>
            <p className="text-xs text-blue-200 max-w-sm">Require a verification code in addition to your password for all admin and dispatcher accounts.</p>
          </div>
          <button className="px-8 py-3 bg-white text-blue-900 text-[10px] font-black uppercase tracking-[2px] hover:bg-blue-50 transition-all">Enable Globally</button>
        </div>
        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="p-6 bg-gray-50 border border-gray-100">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Session Timeout (minutes)</label>
            <input type="number" defaultValue="60" className="w-full px-4 py-3 bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#10b981]" />
          </div>
          <div className="p-6 bg-gray-50 border border-gray-100">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">IP Whitelisting</label>
            <input type="text" placeholder="e.g. 192.168.1.1, 10.0.0.1" className="w-full px-4 py-3 bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#10b981]" />
          </div>
        </div>
        <div className="p-6 border border-[#e0e0e0] flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#161616]">End-to-End Encryption</p>
            <p className="text-xs text-gray-500">Encrypt all customer and trip data at rest</p>
          </div>
          <div className="w-12 h-6 bg-[#10b981] rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
        </div>
      </div>
    </SettingsSection>
  );
}

function LogsAuditTrail() {
  const auditLogs = [
    { time: '2026-04-24 09:12:05', user: 'admin_roger', action: 'Update Base Fare', module: 'Pricing' },
    { time: '2026-04-24 08:45:22', user: 'disp_kevin', action: 'Manual Override Trip #501', module: 'Dispatch' },
    { time: '2026-04-24 07:30:11', user: 'admin_roger', action: 'Modify Zone Downtown', module: 'Geofencing' },
    { time: '2026-04-23 22:15:00', user: 'system', action: 'Auto Backup Completed', module: 'System' },
  ];

  return (
    <SettingsSection title="Logs & Audit Trail" subtitle="Traceable History of All Administrative Actions">
      <div className="flex gap-4 mb-6">
        <input type="text" placeholder="Search logs..." className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-[#10b981]" />
        <button className="px-6 py-3 bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
          <Download size={14} /> Export CSV
        </button>
      </div>
      <div className="border border-[#e0e0e0]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f4f4f4] border-b border-[#e0e0e0]">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Timestamp</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Action</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Module</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log, i) => (
              <tr key={i} className="border-b border-[#f4f4f4] hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-xs font-mono text-gray-500">{log.time}</td>
                <td className="px-6 py-4 text-xs font-bold text-gray-800">{log.user}</td>
                <td className="px-6 py-4 text-xs font-medium text-gray-600">{log.action}</td>
                <td className="px-6 py-4 text-xs font-black uppercase text-[#10b981]">{log.module}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsSection>
  );
}

function SystemAlertsMonitoring() {
  return (
    <SettingsSection title="System Alerts & Monitoring" subtitle="Real-time Health and Performance Alerts">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-green-50 border-l-8 border-green-600 shadow-sm">
          <h4 className="text-xl font-bold text-green-900 mb-2">API Connectivity</h4>
          <p className="text-3xl font-light text-green-700">99.98%</p>
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-4 flex items-center gap-2"><div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div> Healthy</p>
        </div>
        <div className="p-8 bg-gray-50 border-l-8 border-gray-800 shadow-sm">
          <h4 className="text-xl font-bold text-gray-900 mb-2">Database Load</h4>
          <p className="text-3xl font-light text-gray-700">12%</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">Normal Operations</p>
        </div>
      </div>
      <div className="mt-10 space-y-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active System Alerts</p>
        {[
          { type: 'Warning', msg: 'High SMS latency detected in Region A', time: '5m ago' },
          { type: 'Info', msg: 'System backup schedule triggered', time: '20m ago' }
        ].map((alert, i) => (
          <div key={i} className="p-4 bg-white border border-[#e0e0e0] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 ${alert.type === 'Warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{alert.type}</span>
              <p className="text-sm font-medium text-gray-700">{alert.msg}</p>
            </div>
            <span className="text-[10px] text-gray-400 italic">{alert.time}</span>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}

function EmailTemplateSettings() {
  const [settings, setSettings] = useState({
    email_smtp_host: 'smtp.gmail.com',
    email_smtp_port: '587',
    email_smtp_user: 'notifications@healthcare-clinic.com',
    email_smtp_pass: '',
    email_primary_color: '#10b981',
    email_accent_color: '#E4FE7B',
    email_font_family: "'Inter', sans-serif",
    email_confirmation_subject: 'Appointment Confirmed - {clinic_name}',
    email_confirmation_body: `<div style="font-family: {font_family}; max-width: 600px; margin: 0 auto; padding: 20px; color: #161616;">
  <div style="background: {primary_color}; padding: 30px; text-align: center;">
    <h1 style="color: {accent_color}; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">{clinic_name}</h1>
  </div>
  <div style="padding: 40px; background: #ffffff; border: 1px solid #e0e0e0; border-top: none;">
    <h2 style="color: {primary_color}; margin-top: 0; font-size: 22px;">Appointment Confirmed!</h2>
    <p>Dear <strong>{name}</strong>,</p>
    <p>Your appointment has been successfully booked. Here are your details:</p>
    <div style="background: #f4f4f4; padding: 25px; border-left: 4px solid {primary_color}; margin: 30px 0;">
      <p style="margin: 5px 0;"><strong>Service:</strong> {service}</p>
      <p style="margin: 5px 0;"><strong>Date:</strong> {date}</p>
      <p style="margin: 5px 0;"><strong>Time:</strong> {time}</p>
      <p style="margin: 5px 0;"><strong>Reference ID:</strong> #{ref}</p>
    </div>
    <p style="color: #666; font-size: 14px;">Please arrive 10 minutes before your scheduled time.</p>
    <div style="margin: 40px 0; text-align: center;">
      <a href="{cancel_url}" style="display: inline-block; padding: 15px 30px; background: {primary_color}; color: {accent_color}; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 13px;">
        Manage Appointment
      </a>
    </div>
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee;">
      <p style="color: #999; font-size: 11px; line-height: 1.6;">
        {clinic_name}<br>
        {address}<br>
        Phone: {phone}
      </p>
    </div>
  </div>
</div>`
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        const newSettings = { ...settings };
        data.settings.forEach(s => {
          if (newSettings.hasOwnProperty(s.key)) {
            newSettings[s.key] = s.value;
          }
        });
        setSettings(newSettings);
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ settings: Object.entries(settings).map(([key, value]) => ({ key, value })) })
      });
      const data = await res.json();
      if (data.success) {
        alert('Email settings updated successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      alert('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="py-20 text-center font-mono text-gray-400 animate-pulse uppercase tracking-widest">Loading Configuration...</div>;

  return (
    <SettingsSection title="Email Configuration" subtitle="SMTP Server and Template Branding" onSave={handleSave}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SMTP Config */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2">SMTP Server Details</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Host</label>
              <input
                type="text"
                value={settings.email_smtp_host}
                onChange={e => setSettings({ ...settings, email_smtp_host: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm focus:border-[#10b981] outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">Port</label>
                <input
                  type="text"
                  value={settings.email_smtp_port}
                  onChange={e => setSettings({ ...settings, email_smtp_port: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm focus:border-[#10b981] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">Encryption</label>
                <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm focus:border-[#10b981] outline-none">
                  <option>TLS / STARTTLS</option>
                  <option>SSL</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Sender Email Address (SMTP Username)</label>
              <input
                type="text"
                value={settings.email_smtp_user}
                onChange={e => setSettings({ ...settings, email_smtp_user: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm focus:border-[#10b981] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Password / App Key</label>
              <input
                type="password"
                value={settings.email_smtp_pass}
                onChange={e => setSettings({ ...settings, email_smtp_pass: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm focus:border-[#10b981] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Branding Config */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2">Template Branding</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.email_primary_color}
                    onChange={e => setSettings({ ...settings, email_primary_color: e.target.value })}
                    className="w-10 h-10 border-0 p-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.email_primary_color}
                    onChange={e => setSettings({ ...settings, email_primary_color: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 text-xs font-mono uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.email_accent_color}
                    onChange={e => setSettings({ ...settings, email_accent_color: e.target.value })}
                    className="w-10 h-10 border-0 p-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.email_accent_color}
                    onChange={e => setSettings({ ...settings, email_accent_color: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Font Family</label>
              <select
                value={settings.email_font_family}
                onChange={e => setSettings({ ...settings, email_font_family: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm focus:border-[#10b981] outline-none"
              >
                <option value="Arial, sans-serif">Arial / Helvetica</option>
                <option value="'IBM Plex Sans', sans-serif">IBM Plex Sans</option>
                <option value="'Inter', sans-serif">Inter</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="Georgia, serif">Georgia</option>
              </select>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-900 text-white rounded-0 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#10b981] mb-2">Live Preview (Concept)</p>
              <div className="border border-white/10 p-4 bg-white/5 space-y-3">
                <div style={{ background: settings.email_primary_color }} className="h-8 flex items-center justify-center">
                  <span style={{ color: settings.email_accent_color }} className="text-[10px] font-bold uppercase tracking-tighter italic">CLINIC LOGO</span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-1/2 bg-white/20"></div>
                  <div className="h-2 w-full bg-white/10"></div>
                  <div className="h-2 w-3/4 bg-white/10"></div>
                </div>
                <div style={{ background: settings.email_primary_color }} className="h-6 w-24 mx-auto rounded-full"></div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981] opacity-10 rounded-full -mr-16 -mt-16"></div>
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-6">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2">Confirmation Template</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] text-gray-400 uppercase mb-1">Subject Line</label>
            <input
              type="text"
              value={settings.email_confirmation_subject}
              onChange={e => setSettings({ ...settings, email_confirmation_subject: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm font-bold focus:border-[#10b981] outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 uppercase mb-1">HTML Body (Leave blank for default system theme)</label>
            <textarea
              rows={8}
              value={settings.email_confirmation_body}
              onChange={e => setSettings({ ...settings, email_confirmation_body: e.target.value })}
              placeholder="Enter custom HTML here... Use placeholders like {name}, {service}, {date}, {time}, {ref}"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-xs font-mono focus:border-[#10b981] outline-none"
            ></textarea>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 p-3 bg-blue-50 border border-blue-100 rounded-0">
              <p className="text-[9px] font-bold text-blue-800 uppercase tracking-widest mb-1">Available Tags</p>
              <p className="text-[9px] text-blue-600 font-mono">{"{name}, {service}, {date}, {time}, {ref}, {cancel_url}, {clinic_name}, {address}, {phone}"}</p>
            </div>
            <button
              type="button"
              onClick={() => alert('Sending test email to administrator...')}
              className="px-6 py-3 border border-gray-300 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              Send Test Email
            </button>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}

function BackupRestoreSettings() {
  return (
    <SettingsSection title="Backup & Restore" subtitle="Data Integrity and Disaster Recovery Tools">
      <div className="bg-gray-900 text-white p-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <Database size={32} className="text-[#10b981]" />
            <h4 className="text-2xl font-bold tracking-tight uppercase italic">Secure Cloud Backup</h4>
          </div>
          <p className="text-gray-400 text-sm max-w-lg mb-8 leading-relaxed">Your entire system state (config, bookings, riders, and logs) is automatically backed up every 24 hours to our encrypted secure vault.</p>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-[#10b981] text-white text-[10px] font-black uppercase tracking-[2px] hover:bg-[#0353e9] transition-all flex items-center gap-2 shadow-lg">
              <Download size={16} /> Run Manual Backup
            </button>
            <button className="px-8 py-4 border border-white/20 text-white text-[10px] font-black uppercase tracking-[2px] hover:bg-white/10 transition-all flex items-center gap-2">
              <RefreshCw size={16} /> Restore from Last
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981] opacity-10 rounded-full -mr-32 -mt-32"></div>
      </div>
      <div className="mt-10">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Historical Backup Points</h4>
        <div className="space-y-2">
          {[
            { date: '2026-04-24 00:00:01', size: '256 MB', type: 'Scheduled' },
            { date: '2026-04-23 00:00:01', size: '254 MB', type: 'Scheduled' },
            { date: '2026-04-22 15:30:12', size: '252 MB', type: 'Manual' }
          ].map((b, i) => (
            <div key={i} className="p-4 bg-white border border-[#e0e0e0] flex justify-between items-center hover:bg-gray-50 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono font-bold text-gray-800">{b.date}</span>
                <span className="text-[9px] bg-gray-100 px-2 py-0.5 text-gray-500 font-bold uppercase">{b.type}</span>
              </div>
              <span className="text-xs font-bold text-[#10b981]">{b.size}</span>
            </div>
          ))}
        </div>
      </div>
    </SettingsSection>
  );
}

/* ==========================================================================
   END SYSTEM SETTINGS MODULE
   ========================================================================== */