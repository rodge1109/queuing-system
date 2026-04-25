import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ChevronRight, ChevronLeft, ArrowRight, Check, X, Search, Settings, Smartphone, Printer, Download, Store, CreditCard, Lock, User, Wallet, Navigation, MapPin, Maximize2, Layers, AlertTriangle, Phone, MessageSquare, ShieldAlert, Building2, Filter, DollarSign, Activity, Clock, AlertCircle, Car, Star, FileText, CheckCircle, XCircle, ExternalLink, LifeBuoy, MessagesSquare, TrendingUp, BarChart3, PieChart, Calendar, Map, Zap, Globe, Coins, Siren, PhoneCall, Share2, History, GanttChartSquare, ShieldCheck, Receipt, Mail, Ticket, ArrowLeftRight, Truck, Bike, Package, Settings2, FileCheck, ArrowUpRight, ArrowDownLeft, RotateCcw, BadgeDollarSign, UserCog, Unlock, Bell, Palette, Fingerprint, Languages, Calculator, Menu, ChevronDown, PlusSquare, ArrowLeft } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';

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

const RiderPortal = () => {
    const [rider, setRider] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [requests, setRequests] = useState([]);
    const [activeJob, setActiveJob] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [locationPulse, setLocationPulse] = useState(null);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/rider/requests');
            const data = await res.json();
            if (data.success) setRequests(data.requests);
        } catch (e) { }
    };

    const login = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/rider/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                setRider(data.rider);
                fetchRequests();
            } else {
                setError('Rider not found or unauthorized');
            }
        } catch (e) {
            setError('Login failed');
        } finally {
            setLoading(false);
        }
    };

    const acceptJob = async (id) => {
        try {
            const res = await fetch('/api/rider/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId: id, riderId: rider.id })
            });
            const data = await res.json();
            if (data.success) {
                const job = requests.find(r => r.id === id);
                setActiveJob({ ...job, transport_status: 'accepted' });
                startTracking();
            }
        } catch (e) { }
    };

    const startTracking = () => {
        if (locationPulse) clearInterval(locationPulse);
        const interval = setInterval(() => {
            navigator.geolocation.getCurrentPosition((pos) => {
                fetch('/api/rider/update-location', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        riderId: rider.id,
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    })
                });
            }, null, { enableHighAccuracy: true });
        }, 5000);
        setLocationPulse(interval);
    };

    const updateStatus = async (newStatus) => {
        try {
            const res = await fetch('/api/rider/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId: activeJob.id, status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                if (newStatus === 'completed') {
                    setActiveJob(null);
                    if (locationPulse) clearInterval(locationPulse);
                    fetchRequests();
                } else {
                    setActiveJob(prev => ({ ...prev, transport_status: newStatus }));
                }
            }
        } catch (e) { }
    };

    if (!rider) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] bg-[#f4f4f4] p-4">
                <div className="w-full max-w-md bg-white border border-[#e0e0e0] p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-[#1c1917] mb-2 uppercase tracking-tight">Rider Portal</h1>
                        <p className="text-sm text-[#666]">Authenticate to track and accept orders</p>
                    </div>
                    <form onSubmit={login} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-[#444] mb-2 uppercase tracking-wide">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Rider Username"
                                required
                                className="w-full bg-[#f4f4f4] border-0 p-3 text-sm focus:ring-2 focus:ring-[#1c1917] outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#444] mb-2 uppercase tracking-wide">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Password"
                                required
                                className="w-full bg-[#f4f4f4] border-0 p-3 text-sm focus:ring-2 focus:ring-[#1c1917] outline-none transition-all"
                            />
                        </div>
                        {error && <div className="p-3 bg-red-50 text-red-600 text-xs border border-red-100">{error}</div>}
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-[#1c1917] text-white p-4 font-bold text-sm tracking-widest hover:bg-[#333] transition-colors disabled:opacity-50"
                        >
                            {loading ? 'AUTHENTICATING...' : 'LOGIN TO DASHBOARD'}
                        </button>
                    </form>
                    <div className="mt-8 pt-6 border-t border-[#f4f4f4] text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Demo Access: rider1 / rider123</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f4f4] pb-24">
            <header className="bg-white border-b border-[#e0e0e0] p-4 flex justify-between items-center sticky top-0 z-50">
                <div>
                    <p className="text-xs font-bold text-[#666] uppercase">Active Rider</p>
                    <h2 className="font-bold text-[#1c1917]">{rider.name}</h2>
                </div>
                <button onClick={() => { setRider(null); if (locationPulse) clearInterval(locationPulse); }} className="text-xs font-bold border border-[#e0e0e0] px-3 py-1 hover:bg-red-50 hover:text-red-600 transition-colors">LOGOUT</button>
            </header>

            {activeJob ? (
                <div className="p-4 space-y-4">
                    <div className="bg-white border border-[#1c1917] border-l-8 overflow-hidden shadow-lg">
                        <div className="p-4 bg-[#1c1917] text-white flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-widest">Active Trip #{activeJob.id}</span>
                            <span className="text-xs font-bold uppercase">{activeJob.transport_status.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                                    <div className="w-0.5 h-full bg-gray-200 border-dashed border-l-2" />
                                    <div className="w-3 h-3 rounded-full bg-red-600" />
                                </div>
                                <div className="flex flex-col gap-8 flex-1">
                                    <div>
                                        <p className="text-[10px] font-bold text-[#666] uppercase">Pickup</p>
                                        <p className="text-sm font-bold text-[#1c1917]">{activeJob.pickup_location}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#666] uppercase">Destination</p>
                                        <p className="text-sm font-bold text-[#1c1917]">{activeJob.destination_location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 grid grid-cols-1 gap-2">
                                {activeJob.transport_status === 'accepted' && (
                                    <button onClick={() => updateStatus('on_way_to_pickup')} className="bg-[#1c1917] text-white p-4 font-black text-sm tracking-widest uppercase">Start Journey</button>
                                )}
                                {activeJob.transport_status === 'on_way_to_pickup' && (
                                    <button onClick={() => updateStatus('arrived_at_pickup')} className="bg-[#24b0a9] text-white p-4 font-black text-sm tracking-widest uppercase">I Have Arrived</button>
                                )}
                                {activeJob.transport_status === 'arrived_at_pickup' && (
                                    <button onClick={() => updateStatus('picked_up')} className="bg-[#E4FE7B] text-[#1c1917] p-4 font-black text-sm tracking-widest uppercase">Client is Onboard</button>
                                )}
                                {activeJob.transport_status === 'picked_up' && (
                                    <button onClick={() => updateStatus('completed')} className="bg-[#da1e28] text-white p-4 font-black text-sm tracking-widest uppercase">Drop-off Finished</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 space-y-4">
                    <div className="flex justify-between items-end mb-4 pt-4">
                        <h3 className="text-2xl font-black text-[#1c1917] uppercase tracking-tighter italic">Available Jobs</h3>
                        <button onClick={fetchRequests} className="text-xs font-bold bg-white border border-[#1c1917] px-4 py-2 hover:bg-[#1c1917] hover:text-white transition-all">REFRESH</button>
                    </div>

                    <div className="grid gap-4">
                        {requests.map(req => (
                            <div key={req.id} className="bg-white border border-[#e0e0e0] p-6 shadow-sm hover:border-[#1c1917] transition-all relative overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="text-[10px] font-bold text-[#999] block mb-1">REFERENCE #{req.id}</span>
                                        <h4 className="text-lg font-black text-[#1c1917]">PHP {(parseFloat(req.total_amount) || 0).toFixed(2)}</h4>
                                    </div>
                                    <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 uppercase">Nearby</div>
                                </div>
                                <div className="space-y-4 mb-6">
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-1" />
                                        <p className="text-xs text-[#1c1917] font-medium">{req.pickup_location}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-600 mt-1" />
                                        <p className="text-xs text-[#1c1917] font-medium">{req.destination_location}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => acceptJob(req.id)}
                                    className="w-full bg-[#1c1917] text-white py-4 text-xs font-black uppercase tracking-widest hover:bg-[#333] transition-colors"
                                >
                                    Accept Job
                                </button>
                            </div>
                        ))}
                    </div>

                    {requests.length === 0 && (
                        <div className="text-center py-20 bg-white border border-dashed border-[#ccc]">
                            <div className="text-4xl mb-4 opacity-20"><svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>
                            <p className="text-sm font-bold text-[#999] uppercase tracking-widest">Scanning for requests...</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ==================== LIVE TRACKING MAP ====================

const LiveTrackingMap = ({ riderPos, pickupPos, destPos, status }) => {
    const mapRef = React.useRef(null);
    const leafletMap = React.useRef(null);
    const riderMarker = React.useRef(null);
    const routeLayer = React.useRef(null);

    useEffect(() => {
        if (!mapRef.current || leafletMap.current) return;
        const L = window.L;
        leafletMap.current = L.map(mapRef.current, { zoomControl: false }).setView([11.0500, 124.0000], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(leafletMap.current);

        setTimeout(() => {
            if (leafletMap.current) leafletMap.current.invalidateSize();
        }, 300);

        return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
    }, []);

    useEffect(() => {
        const L = window.L;
        if (!leafletMap.current || !L) return;

        // Clear prev layers
        leafletMap.current.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                leafletMap.current.removeLayer(layer);
            }
        });

        const markers = [];

        // Rider Marker
        if (riderPos) {
            riderMarker.current = L.marker([riderPos.lat, riderPos.lng], {
                icon: L.icon({
                    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', // Car icon
                    iconSize: [32, 32], iconAnchor: [16, 16]
                })
            }).addTo(leafletMap.current).bindPopup('<b>Driver</b>');
            markers.push([riderPos.lat, riderPos.lng]);
        }

        // Pickup Marker
        if (pickupPos) {
            L.marker([pickupPos.lat, pickupPos.lng], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    iconSize: [25, 41], iconAnchor: [12, 41]
                })
            }).addTo(leafletMap.current).bindPopup('<b>Pickup Point</b>');
            markers.push([pickupPos.lat, pickupPos.lng]);
        }

        // Destination Marker
        if (destPos) {
            L.marker([destPos.lat, destPos.lng], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    iconSize: [25, 41], iconAnchor: [12, 41]
                })
            }).addTo(leafletMap.current).bindPopup('<b>Destination</b>');
            markers.push([destPos.lat, destPos.lng]);
        }

        // Draw lines
        if (riderPos && pickupPos && (status === 'accepted' || status === 'on_way_to_pickup')) {
            L.polyline([[riderPos.lat, riderPos.lng], [pickupPos.lat, pickupPos.lng]], {
                color: '#1c1917', weight: 4, dashArray: '10, 10', opacity: 0.5
            }).addTo(leafletMap.current);
        }

        if (pickupPos && destPos) {
            L.polyline([[pickupPos.lat, pickupPos.lng], [destPos.lat, destPos.lng]], {
                color: '#1c1917', weight: 5, opacity: 0.8
            }).addTo(leafletMap.current);
        }

        if (markers.length > 0) {
            setTimeout(() => {
                if (leafletMap.current) {
                    leafletMap.current.invalidateSize();
                    leafletMap.current.fitBounds(markers, { padding: [50, 50] });
                }
            }, 100);
        }
    }, [riderPos, pickupPos, destPos, status]);

    return <div ref={mapRef} className="w-full h-full" />;
};

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

    // State for patient appointment lookup
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
            // Patient appointment lookup page
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
    const clearCart = () => {
        setCartItems([]);
    };

    const addToCart = (item, selectedSize = null) => {
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

        // Find existing item by id AND size (if applicable)
        const existingItem = cartItems.find(i =>
            i.id === item.id && (!selectedSize || i.selectedSize === selectedSize.name)
        );

        if (existingItem) {
            setCartItems(cartItems.map(i =>
                (i.id === item.id && (!selectedSize || i.selectedSize === selectedSize.name))
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            ));
        } else {
            setCartItems([...cartItems, { ...cartItem, quantity: 1 }]);
        }

        // Close modal if it was open
        setShowSizeModal(false);
        setSelectedProduct(null);
    };

    const removeFromCart = (id, selectedSize = null) => {
        setCartItems(cartItems.filter(item =>
            !(item.id === id && (!selectedSize || item.selectedSize === selectedSize))
        ));
    };

    const updateQuantity = (id, newQuantity, selectedSize = null) => {
        if (newQuantity === 0) {
            removeFromCart(id, selectedSize);
        } else {
            setCartItems(cartItems.map(item =>
                (item.id === id && (!selectedSize || item.selectedSize === selectedSize))
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    const getTotalItems = () => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const contextValue = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getTotalPrice
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'home': return <HomePage setCurrentPage={setCurrentPage} />;
            case 'menu': return <MenuPage selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} searchQuery={searchQuery} menuData={menuData} isLoading={isLoadingProducts} />;
            case 'cart': return <CartPage setCurrentPage={setCurrentPage} />;
            case 'checkout': return <CheckoutPage setCurrentPage={setCurrentPage} clearCart={clearCart} />;
            case 'confirmation': return <ConfirmationPage setCurrentPage={setCurrentPage} orderNumber={pendingOrderNumber} paymentStatus={paymentStatus} />;
            case 'payment-failed': return <PaymentFailedPage setCurrentPage={setCurrentPage} orderNumber={pendingOrderNumber} />;
            case 'admin': return <AdminDashboard setCurrentPage={setCurrentPage} />;
            case 'rider': return <RiderPortal />;
            case 'passenger': return <PassengerApp />;
            case 'my-appointment': return <MyAppointment token={appointmentToken} />;
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
         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
         
         * {
           font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
         }

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
        /* IBM Carbon Color Palette Overrides */
        .bg-green-600 {
          background-color: #0f62fe !important;
        }
        .bg-green-500 {
          background-color: #4589ff !important;
        }
        .bg-green-700 {
          background-color: #0043ce !important;
        }
        .bg-green-400 {
          background-color: #a6c8ff !important;
        }
        .bg-green-100 {
          background-color: #d0e2ff !important;
        }
        .bg-green-50 {
          background-color: #edf5ff !important;
        }
        .text-green-600 {
          color: #0f62fe !important;
        }
        .text-green-400 {
          color: #a6c8ff !important;
        }
        .text-green-100 {
          color: #d0e2ff !important;
        }
        .text-green-700 {
          color: #0043ce !important;
        }
        .text-green-200 {
          color: #c1d5fe !important;
        }
        .border-green-600 {
          border-color: #0f62fe !important;
        }
        .border-green-300 {
          border-color: #c6c6c6 !important;
        }
        .border-green-400 {
          border-color: #a6c8ff !important;
        }
        .border-green-500 {
          border-color: #4589ff !important;
        }
        .hover\\:bg-green-700:hover {
          background-color: #0043ce !important;
        }
        .hover\\:bg-green-500:hover {
          background-color: #4589ff !important;
        }
        .hover\\:text-green-600:hover {
          color: #0f62fe !important;
        }
        .hover\\:bg-green-100:hover {
          background-color: #d0e2ff !important;
        }
        .hover\\:bg-green-50:hover {
          background-color: #edf5ff !important;
        }
        .from-green-900 {
          --tw-gradient-from: #161616 !important;
        }
        .to-green-900 {
          --tw-gradient-to: #161616 !important;
        }
        .via-green-900 {
          --tw-gradient-via: #161616 !important;
        }
        .from-green-400 {
          --tw-gradient-from: #a6c8ff !important;
        }
        .to-green-500 {
          --tw-gradient-to: #4589ff !important;
        }
        .focus\\:border-green-500:focus {
          border-color: #4589ff !important;
        }
        .focus\\:border-green-700:focus {
          border-color: #0043ce !important;
        }
      `}</style>
            <div className={`min-h-screen bg-white ${['admin', 'passenger', 'rider'].includes(currentPage) ? '' : 'pb-16 md:pb-0 pt-[100px]'}`}>
                {!['admin', 'passenger', 'rider'].includes(currentPage) && (
                    <Header
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                )}
                {renderPage()}
                {showCart && <CartDrawer setShowCart={setShowCart} setCurrentPage={setCurrentPage} />}
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

                {/* Mobile Bottom Navigation */}
                {!['admin', 'passenger', 'rider'].includes(currentPage) && (
                    <>
                        <nav className="fixed bottom-0 left-0 right-0 bg-[#F5F3F5] border-t border-[#F5F3F5] md:hidden z-50 pb-safe">
                            <div className="flex justify-around items-center py-2">
                                <div className="relative">
                                    <button
                                        onClick={() => setShowLoginMenu(!showLoginMenu)}
                                        className={`flex flex-col items-center px-4 py-1 ${showLoginMenu ? 'text-[#0f62fe]' : 'text-[#302B27]'}`}
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
                                    className={`flex flex-col items-center px-4 py-1 ${currentPage === 'queue-display' ? 'text-[#0f62fe]' : 'text-[#302B27]'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 4h14a2 2 0 012 2v7H3V6a2 2 0 012-2z" />
                                    </svg>
                                    <span className="text-xs font-medium">Display</span>
                                </button>
                                <button
                                    onClick={() => setCurrentPage('queue-teller')}
                                    className={`flex flex-col items-center px-4 py-1 ${currentPage === 'queue-teller' ? 'text-[#0f62fe]' : 'text-[#302B27]'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span className="text-xs font-medium">Teller</span>
                                </button>
                            </div>
                        </nav>
                        {/* Rider Portal Access Link */}
                        <div className="bg-[#1c1917] border-t border-[#333] p-4 text-center mt-auto">
                            <button
                                onClick={() => setCurrentPage('rider')}
                                className="text-[10px] font-black text-[#666] tracking-widest uppercase hover:text-[#E4FE7B] transition-colors"
                            >
                                Switch to Rider Mode
                            </button>
                        </div>
                    </>
                )}
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
            <div className="bg-white rounded-0 max-w-sm w-full p-8 relative animate-fadeIn border-t-8 border-[#0f62fe]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#8d8d8d] hover:text-[#161616] transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-3xl font-light text-[#161616] mb-2 uppercase tracking-tighter">Select Option</h2>
                <p className="text-sm text-[#525252] mb-8 font-medium uppercase tracking-[0.32px]">{product.name}</p>

                <div className="space-y-3">
                    {product.sizes.map((size) => (
                        <button
                            key={size.name}
                            onClick={() => onSelectSize(size)}
                            className="w-full bg-[#f4f4f4] hover:bg-[#edf5ff] border-l-4 border-l-transparent hover:border-l-[#0f62fe] rounded-0 p-4 flex items-center justify-between transition-all group"
                        >
                            <span className="font-medium text-[#161616] group-hover:text-[#0f62fe]">{size.name}</span>
                            <span className="text-lg font-mono text-[#161616]">Php {size.price.toFixed(2)}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Appointment Form Component
function AppointmentForm() {
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        serviceType: '',
        preferredDate: '',
        preferredTime: '',
        notes: '',
        agentCode: '',
        pickupLocation: '',
        destinationLocation: '',
        pickupCoords: null,
        destCoords: null
    });
    const [confirmedAppointment, setConfirmedAppointment] = useState(null);
    const [mapAction, setMapAction] = useState(null); // For syncing input -> map
    const [distance, setDistance] = useState(0); // in km
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('local'); // local, paypal, stripe

    const calculateFees = () => {
        if (!selectedService) return { subtotal: 0, tax: 0, total: 0 };

        let subtotal = 0;
        const cat = (selectedService.category || '').trim().toUpperCase();

        let base = 0;
        let rate = 0;
        let transportFees = 0;
        let flatPrice = 0;

        // Check if it's a transport service with dynamic pricing
        if (cat === 'TRANSPORT') {
            base = parseFloat((selectedService.base_fare || '0').toString().replace(/[^\d.]/g, '')) || 0;
            rate = parseFloat((selectedService.per_km_rate || '0').toString().replace(/[^\d.]/g, '')) || 0;
            const dist = parseFloat(distance || 0) || 0;

            if (base > 0 || rate > 0) {
                transportFees = base + (dist * rate);
                subtotal = transportFees;
            } else {
                const priceStr = (selectedService.price || '0').toString();
                flatPrice = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
                subtotal = flatPrice;
            }
        } else {
            const priceStr = (selectedService.price || '0').toString();
            flatPrice = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
            subtotal = flatPrice;
        }

        const tax = subtotal * 0.12;
        const total = subtotal + tax;

        return {
            subtotal: parseFloat(subtotal) || 0,
            tax: parseFloat(tax) || 0,
            total: parseFloat(total) || 0,
            base,
            rate,
            transportFees,
            flatPrice,
            isTransport: cat === 'TRANSPORT' && (base > 0 || rate > 0)
        };
    };

    // Fetch available slots when date changes
    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (!formData.preferredDate) {
                setAvailableSlots([]);
                return;
            }

            setLoadingSlots(true);
            try {
                const response = await fetch(`/api/available-slots?date=${formData.preferredDate}`);
                const data = await response.json();
                if (data.success && Array.isArray(data.availableSlots)) {
                    setAvailableSlots(data.availableSlots);
                    // Reset time if previously selected time is no longer available
                    if (formData.preferredTime && !data.availableSlots.includes(formData.preferredTime)) {
                        setFormData(prev => ({ ...prev, preferredTime: '' }));
                    }
                } else {
                    setAvailableSlots([]);
                }
            } catch (error) {
                console.error('Error fetching slots:', error);
                // Fallback to all slots if API fails
                const fallbackSlots = [];
                for (let i = 0; i < 24; i++) {
                    const h = i % 12 || 12;
                    const ampm = i < 12 ? 'AM' : 'PM';
                    fallbackSlots.push(`${h}:00 ${ampm}`);
                }
                setAvailableSlots(fallbackSlots);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchAvailableSlots();
    }, [formData.preferredDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationSelect = useCallback((pickup, dest, dist) => {
        if (pickup && pickup.address) {
            setFormData(prev => ({
                ...prev,
                pickupLocation: pickup.address,
                pickupCoords: pickup.coords || prev.pickupCoords
            }));
        }
        if (dest && dest.address) {
            setFormData(prev => ({
                ...prev,
                destinationLocation: dest.address,
                destCoords: dest.coords || prev.destCoords
            }));
        }
        if (dist !== undefined) {
            setDistance(prev => Math.abs(prev - dist) < 0.01 ? prev : dist);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus({ type: '', message: '' });

        try {
            // Synchronize serviceType and specialist before submitting
            const finalFormData = {
                ...formData,
                serviceType: selectedService?.name,
                specialistId: selectedStaff?.id,
                pickupLocation: formData.pickupLocation,
                destinationLocation: formData.destinationLocation,
                pickupLat: formData.pickupCoords?.lat,
                pickupLng: formData.pickupCoords?.lng,
                destLat: formData.destCoords?.lat,
                destLng: formData.destCoords?.lng,
                totalAmount: calculateFees().total
            };

            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalFormData),
            });

            const data = await response.json();

            if (data.success) {
                setConfirmedAppointment(data.appointment);
                setSubmitStatus({ type: 'success', message: data.message });
                setFormData({
                    fullName: '',
                    phoneNumber: '',
                    email: '',
                    serviceType: '',
                    preferredDate: '',
                    preferredTime: '',
                    notes: '',
                    pickupLocation: '',
                    destinationLocation: '',
                    pickupCoords: null,
                    destCoords: null
                });
            } else {
                setSubmitStatus({ type: 'error', message: data.message });
            }
        } catch (error) {
            setSubmitStatus({ type: 'error', message: 'Failed to connect to server. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const [step, setStep] = useState('service'); // service, staff, datetime, details, summary
    const [selectedService, setSelectedService] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [liveServices, setLiveServices] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
    const [isLoadingStaff, setIsLoadingStaff] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [isLoadingServices, setIsLoadingServices] = useState(false);

    useEffect(() => {
        const fetchStaffAndServices = async () => {
            try {
                setIsLoadingStaff(true);
                setIsLoadingServices(true);

                const [staffRes, servicesRes] = await Promise.all([
                    fetch('/api/specialists'),
                    fetch('/api/booking-services')
                ]);

                const staffData = await staffRes.json();
                const servicesData = await servicesRes.json();

                if (staffData.success) {
                    setStaffMembers([
                        { id: 'any', name: 'Any Staff', email: 'Next available member', image_url: null },
                        ...staffData.specialists
                    ]);
                }

                if (servicesData.success) {
                    setLiveServices(servicesData.services);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setIsLoadingStaff(false);
                setIsLoadingServices(false);
            }
        };
        fetchStaffAndServices();
    }, []);

    const steps = [
        { id: 'service', label: 'Services', icon: <ShoppingCart className="w-4 h-4" /> },
        { id: 'staff', label: 'Staff', icon: <Search className="w-4 h-4" /> },
        { id: 'datetime', label: 'Date & Time', icon: <Settings className="w-4 h-4" /> },
        { id: 'details', label: 'Basic Details', icon: <Settings className="w-4 h-4" /> },
        { id: 'summary', label: 'Summary', icon: <Check className="w-4 h-4" /> }
    ];

    const categories = ['All', ...new Set(liveServices.map(s => (s.category || '').trim().toUpperCase()).filter(Boolean))];
    const filteredServices = activeCategory === 'All'
        ? liveServices
        : liveServices.filter(s => (s.category || '').trim().toUpperCase() === activeCategory.toUpperCase());

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {confirmedAppointment ? (
                <div className="max-w-2xl mx-auto bg-white border border-[#e0e0e0] p-12 relative overflow-hidden animate-in zoom-in duration-300">
                    <div className="absolute top-0 right-0 p-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-[#defbe6] text-[#198038]">
                            <Check className="w-6 h-6" />
                        </div>
                    </div>

                    <h3 className="text-4xl font-light text-[#161616] mb-2 uppercase tracking-tighter">Booking Confirmed</h3>
                    <p className="text-xs text-[#525252] mb-12 uppercase tracking-widest font-bold border-b pb-4 border-[#f4f4f4]">Thank you, {confirmedAppointment.full_name}!</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                        <div className="bg-[#f4f4f4] p-6">
                            <p className="text-[10px] font-bold text-[#525252] uppercase mb-2 tracking-[0.16px]">Reference ID</p>
                            <p className="text-3xl font-mono text-[#161616]">#{confirmedAppointment.id}</p>
                        </div>
                        <div className="bg-[#f4f4f4] p-6">
                            <p className="text-[10px] font-bold text-[#525252] uppercase mb-2 tracking-[0.16px]">Total Amount</p>
                            <p className="text-3xl font-mono text-[#0f62fe]">PHP {(parseFloat(confirmedAppointment.total_amount) || 0).toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {confirmedAppointment.service_type?.toUpperCase().includes('TRANSPORT') && (
                            <button
                                onClick={() => {
                                    setAppointmentToken(confirmedAppointment.cancel_token);
                                    setCurrentPage('my-appointment');
                                    window.scrollTo(0, 0);
                                }}
                                className="w-full py-5 bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-3"
                            >
                                <span>[LIVE]</span> Track Driver Real-Time
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setConfirmedAppointment(null);
                                setStep('service');
                                setSelectedService(null);
                            }}
                            className="w-full py-5 border-2 border-[#1c1917] text-[#1c1917] font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                        >
                            Book Another Service
                        </button>
                    </div>

                    <div className="mt-10 p-4 bg-gray-50 border border-gray-100 text-center">
                        <p className="text-[10px] text-[#999] uppercase tracking-[2px] leading-relaxed">
                            A confirmation has been sent to <strong>{confirmedAppointment.email}</strong>.<br />
                            Please present your Reference ID upon arrival.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="bg-white grid lg:grid-cols-[240px_1fr] min-h-[600px] border border-[#e0e0e0]">
                        {/* Sidebar Stepper */}
                        <div className="bg-[#f4f4f4] border-r border-[#e0e0e0] p-6 hidden lg:block">
                            <div className="space-y-2">
                                {steps.map((s, i) => {
                                    const isActive = step === s.id;
                                    const isCompleted = steps.findIndex(x => x.id === step) > i;
                                    return (
                                        <div key={s.id} className="group flex items-center gap-4 py-3">
                                            <div className={`w-8 h-8 flex items-center justify-center transition-all ${isActive ? 'bg-[#0f62fe] text-white' :
                                                isCompleted ? 'bg-[#24a148] text-white' : 'bg-[#e0e0e0] text-[#525252]'
                                                }`}>
                                                {isCompleted ? <Check className="w-4 h-4" /> : s.icon}
                                            </div>
                                            <span className={`text-sm font-medium uppercase tracking-wider ${isActive ? 'text-[#161616]' : 'text-[#8d8d8d]'}`}>{s.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="p-8 lg:p-12 bg-white flex flex-col h-full">
                            {step === 'service' && (
                                <div className="flex-1">
                                    <h3 className="text-3xl font-light text-[#161616] mb-4 uppercase tracking-tighter">Select Service</h3>

                                    {/* Category Tabs */}
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setActiveCategory(cat)}
                                                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-[#0f62fe] text-white' : 'bg-[#e0e0e0] text-[#525252] hover:bg-gray-300'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredServices.map(s => (
                                            <div
                                                key={s.id}
                                                onClick={() => { setSelectedService(s); setStep('staff'); }}
                                                className={`p-6 border border-[#e0e0e0] border-b-4 transition-all cursor-pointer group hover:bg-[#f4f4f4] ${selectedService?.id === s.id ? 'border-b-[#0f62fe] bg-[#f4f4f4]' : 'border-b-[#e0e0e0] bg-white'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-4xl">{s.icon}</span>
                                                    <div className="text-right">
                                                        <div className="text-xl font-mono text-[#161616] tracking-tight">
                                                            {s.category?.toUpperCase() === 'TRANSPORT' && parseFloat(s.base_fare || 0) > 0
                                                                ? `PHP ${parseFloat(s.base_fare).toLocaleString()}`
                                                                : s.price}
                                                        </div>
                                                        <div className="text-[10px] text-[#525252] uppercase font-bold tracking-widest">
                                                            {s.category?.toUpperCase() === 'TRANSPORT' ? 'Starts At' : s.duration}
                                                        </div>
                                                    </div>
                                                </div>
                                                <h4 className="text-lg font-bold text-[#161616] group-hover:text-[#0f62fe] transition-colors">{s.name}</h4>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 'staff' && (
                                <div className="flex-1">
                                    <h3 className="text-3xl font-light text-[#161616] mb-8 uppercase tracking-tighter">Choose Staff</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {staffMembers.map(m => (
                                            <div
                                                key={m.id}
                                                onClick={() => { setSelectedStaff(m); setStep('datetime'); }}
                                                className={`p-6 bg-[#f4f4f4] border-b-4 transition-all cursor-pointer flex items-center gap-6 group hover:bg-white border-l border-t border-r border-[#e0e0e0] ${selectedStaff?.id === m.id ? 'border-[#0f62fe]' : 'border-transparent'
                                                    }`}
                                            >
                                                <div className="w-16 h-16 bg-[#e0e0e0] flex items-center justify-center overflow-hidden">
                                                    {m.image_url ? <img src={m.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#8d8d8d]"><User className="w-8 h-8" /></div>}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#161616] group-hover:text-[#0f62fe] transition-colors">{m.name}</h4>
                                                    <p className="text-xs text-[#525252]">{m.title || m.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => setStep('service')} className="mt-12 text-[#0f62fe] font-bold uppercase text-[12px] flex items-center gap-2 hover:underline">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Back to Services
                                    </button>
                                </div>
                            )}

                            {step === 'datetime' && (
                                <div className="flex-1">
                                    <h3 className="text-3xl font-light text-[#161616] mb-8 uppercase tracking-tighter">Select date & time</h3>

                                    <div className="grid lg:grid-cols-2 gap-12">
                                        {/* Custom Calendar */}
                                        <div>
                                            <div className="flex items-center justify-between mb-6 bg-[#f4f4f4] p-4">
                                                <button onClick={() => {
                                                    const d = new Date(formData.preferredDate || new Date());
                                                    d.setMonth(d.getMonth() - 1);
                                                    setFormData({ ...formData, preferredDate: d.toISOString().split('T')[0] });
                                                }} className="p-2 hover:bg-white transition-all"><ChevronLeft className="w-4 h-4" /></button>
                                                <span className="font-bold text-sm uppercase tracking-widest text-[#161616]">
                                                    {new Date(formData.preferredDate || new Date()).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                </span>
                                                <button onClick={() => {
                                                    const d = new Date(formData.preferredDate || new Date());
                                                    d.setMonth(d.getMonth() + 1);
                                                    setFormData({ ...formData, preferredDate: d.toISOString().split('T')[0] });
                                                }} className="p-2 hover:bg-white transition-all"><ChevronRight className="w-4 h-4" /></button>
                                            </div>

                                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                                                    <div key={d} className="text-[10px] font-bold text-[#8d8d8d] uppercase p-2">{d}</div>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-7 gap-1">
                                                {(() => {
                                                    const date = new Date(formData.preferredDate || new Date());
                                                    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
                                                    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                                                    const startingDay = firstDay === 0 ? 6 : firstDay - 1;

                                                    const days = [];
                                                    for (let i = 0; i < startingDay; i++) days.push(<div key={`empty-${i}`} className="p-4" />);
                                                    for (let i = 1; i <= daysInMonth; i++) {
                                                        const dayStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                                                        const isSelected = formData.preferredDate === dayStr;
                                                        const isToday = new Date().toISOString().split('T')[0] === dayStr;

                                                        days.push(
                                                            <button
                                                                key={i}
                                                                onClick={() => setFormData({ ...formData, preferredDate: dayStr })}
                                                                className={`p-4 text-sm transition-all border ${isSelected ? 'bg-[#0f62fe] text-white border-[#0f62fe]' :
                                                                    isToday ? 'border-[#0f62fe] text-[#0f62fe] font-bold' : 'border-transparent hover:bg-[#f4f4f4] text-[#161616]'
                                                                    }`}
                                                            >
                                                                {i}
                                                            </button>
                                                        );
                                                    }
                                                    return days;
                                                })()}
                                            </div>
                                        </div>

                                        {/* Time Slots */}
                                        <div>
                                            <h4 className="text-[12px] font-bold text-[#8d8d8d] uppercase tracking-widest mb-6 border-b border-[#e0e0e0] pb-2">Available Slots</h4>

                                            {loadingSlots ? (
                                                <div className="py-12 text-center text-[#8d8d8d] animate-pulse">Checking availability...</div>
                                            ) : availableSlots.length > 0 ? (
                                                <div className="space-y-8 h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                                    {(() => {
                                                        const getHour24 = (s) => {
                                                            const hr = parseInt(s.split(':')[0]);
                                                            const isPM = s.includes('PM');
                                                            if (isPM && hr !== 12) return hr + 12;
                                                            if (!isPM && hr === 12) return 0;
                                                            return hr;
                                                        };

                                                        const earlyMorning = availableSlots.filter(s => getHour24(s) < 6);
                                                        const morning = availableSlots.filter(s => getHour24(s) >= 6 && getHour24(s) < 12);
                                                        const afternoon = availableSlots.filter(s => getHour24(s) >= 12 && getHour24(s) < 18);
                                                        const evening = availableSlots.filter(s => getHour24(s) >= 18);

                                                        const TimeGroup = ({ title, slots }) => slots.length > 0 && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-[#161616] uppercase mb-4 tracking-widest">{title}</p>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {slots.map(s => (
                                                                        <button
                                                                            key={s}
                                                                            onClick={() => setFormData({ ...formData, preferredTime: s })}
                                                                            className={`p-3 text-xs border transition-all ${formData.preferredTime === s ? 'bg-[#0f62fe] text-white border-[#0f62fe]' : 'border-[#e0e0e0] hover:border-[#0f62fe] text-[#161616]'
                                                                                }`}
                                                                        >
                                                                            {s}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );

                                                        return (
                                                            <>
                                                                <TimeGroup title="Early Morning" slots={earlyMorning} />
                                                                <TimeGroup title="Morning" slots={morning} />
                                                                <TimeGroup title="Afternoon" slots={afternoon} />
                                                                <TimeGroup title="Evening & Night" slots={evening} />
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            ) : (
                                                <div className="py-24 text-center">
                                                    <p className="text-[#8d8d8d] text-sm uppercase font-mono">No slots available for this date</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-12 flex justify-between items-center bg-[#f4f4f4] p-6">
                                        <button onClick={() => setStep('staff')} className="text-[#0f62fe] font-bold uppercase text-[12px] flex items-center gap-2 hover:underline">
                                            <ChevronLeft className="w-3 h-3" /> Back to Specialist
                                        </button>
                                        <div className="flex items-center gap-8">
                                            {formData.preferredDate && formData.preferredTime && (
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] text-[#8d8d8d] uppercase font-bold tracking-widest">Selected</p>
                                                    <p className="text-sm font-bold text-[#161616]">{formData.preferredDate} @ {formData.preferredTime}</p>
                                                </div>
                                            )}
                                            <button
                                                disabled={!formData.preferredDate || !formData.preferredTime}
                                                onClick={() => setStep('details')}
                                                className="carbon-btn-primary px-12 py-3 font-bold uppercase tracking-widest text-sm disabled:opacity-50"
                                            >
                                                Next: Patient Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 'details' && (
                                <div className="flex-1">
                                    <h3 className="text-3xl font-light text-[#161616] mb-8 uppercase tracking-tighter">Your Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-1">
                                            <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-[0.32px]">Full Name</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder="Ex. Juan Dela Cruz"
                                                required
                                                className="carbon-input w-full p-4"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-[0.32px]">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                placeholder="09XXXXXXXXX"
                                                required
                                                className="carbon-input w-full p-4"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-1">
                                            <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-[0.32px]">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="juan@example.com"
                                                required
                                                className="carbon-input w-full p-4"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-[0.32px]">Agent Code (Optional)</label>
                                            <input
                                                type="text"
                                                name="agentCode"
                                                value={formData.agentCode}
                                                onChange={handleChange}
                                                placeholder="Ex. AGT-1234"
                                                className="carbon-input w-full p-4"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-1 relative">
                                            <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-[0.32px]">Pickup From</label>
                                            <LocationAutocomplete
                                                value={formData.pickupLocation}
                                                onChange={(val) => setFormData(prev => ({ ...prev, pickupLocation: val }))}
                                                onSelect={(place) => {
                                                    if (place && place.address && place.coords) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            pickupLocation: place.address,
                                                            pickupCoords: place.coords
                                                        }));
                                                        setMapAction({ type: 'MOVE_PICKUP', lat: place.coords.lat, lng: place.coords.lng });
                                                    }
                                                }}
                                                placeholder="Search pickup location..."
                                            />
                                        </div>
                                        <div className="space-y-1 relative">
                                            <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-[0.32px]">Destination To</label>
                                            <LocationAutocomplete
                                                value={formData.destinationLocation}
                                                onChange={(val) => setFormData(prev => ({ ...prev, destinationLocation: val }))}
                                                onSelect={(place) => {
                                                    if (place && place.address && place.coords) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            destinationLocation: place.address,
                                                            destCoords: place.coords
                                                        }));
                                                        setMapAction({ type: 'MOVE_DEST', lat: place.coords.lat, lng: place.coords.lng });
                                                    }
                                                }}
                                                placeholder="Search destination..."
                                            />
                                        </div>
                                    </div>

                                    {selectedService?.category?.toUpperCase() === 'TRANSPORT' && (
                                        <div className="mb-8 animate-fadeIn">
                                            <p className="text-[10px] font-bold text-[#0f62fe] uppercase tracking-widest mb-2 flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-[#0f62fe] rounded-full animate-pulse"></span>
                                                    Interactive Route Picker
                                                </span>
                                                {distance > 0 && <span className="text-[#24a148]">Route Computed: {distance.toFixed(2)} km</span>}
                                            </p>
                                            <TransportMap
                                                mapAction={mapAction}
                                                onLocationSelect={handleLocationSelect}
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-1 mb-12">
                                        <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-[0.32px]">Notes (Optional)</label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Any specific concerns..."
                                            className="carbon-input w-full p-4 resize-none"
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <button onClick={() => setStep('datetime')} className="text-[#0f62fe] font-bold uppercase text-[12px] flex items-center gap-2 hover:underline">
                                            <ChevronLeft className="w-3 h-3" /> Back to Time
                                        </button>
                                        <button
                                            disabled={!formData.fullName || !formData.phoneNumber || !formData.email}
                                            onClick={() => setStep('summary')}
                                            className="carbon-btn-primary px-10 py-3 font-bold uppercase tracking-wider text-sm disabled:opacity-50"
                                        >
                                            Next: Review & Payment
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 'summary' && (() => {
                                const fees = calculateFees();
                                return (
                                    <div className="flex-1">
                                        <h3 className="text-3xl font-light text-[#161616] mb-8 uppercase tracking-tighter">Your Booking Summary</h3>

                                        {/* Header: Service & Date Overview */}
                                        <div className="flex flex-col md:flex-row border border-[#e0e0e0] mb-8">
                                            <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-[#e0e0e0]">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[10px] font-bold text-[#525252] uppercase tracking-[2px]">Service</span>
                                                    <span className="p-2 bg-blue-50 text-[#0f62fe] rounded-full">{selectedService?.icon}</span>
                                                </div>
                                                <div className="text-2xl font-bold text-[#161616] leading-tight mb-1">{selectedService?.name}</div>
                                                <div className="text-sm text-[#525252]">By {selectedStaff?.name}</div>
                                            </div>
                                            <div className="flex-1 p-6">
                                                <div className="text-[10px] font-bold text-[#525252] uppercase tracking-[2px] mb-4 text-center md:text-left">Date & Time</div>
                                                <div className="text-xl font-medium text-[#161616] text-center md:text-left">
                                                    {new Date(formData.preferredDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="text-2xl font-bold text-[#0f62fe] text-center md:text-left mt-1">{formData.preferredTime}</div>
                                            </div>
                                        </div>

                                        {/* Price Breakdown */}
                                        <div className="space-y-4 mb-8 border-b border-[#e0e0e0] pb-8">
                                            {fees.isTransport ? (
                                                <>
                                                    <div className="flex justify-between text-sm text-[#525252]">
                                                        <span>Base Fare</span>
                                                        <span className="font-mono">PHP {fees.base.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm text-[#525252]">
                                                        <span>Distance Rate (PHP {fees.rate}/km)</span>
                                                        <span className="font-mono">PHP {(fees.rate * distance).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-[#0f62fe] italic font-medium px-4 py-2 bg-blue-50">
                                                        <span>Calculated distance: {distance.toFixed(2)} KM</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex justify-between text-sm text-[#525252]">
                                                    <span>Service Price</span>
                                                    <span className="font-mono">PHP {fees.subtotal.toFixed(2)}</span>
                                                </div>
                                            )}

                                            <div className="pt-2 flex justify-between text-sm font-bold text-[#161616]">
                                                <span>Subtotal</span>
                                                <span className="font-mono">PHP {fees.subtotal.toFixed(2)}</span>
                                            </div>

                                            <div className="flex justify-between text-sm text-[#525252]">
                                                <span>Tax (12%)</span>
                                                <span className="font-mono text-[#24a148]">PHP {fees.tax.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Promo Section */}
                                        <div className="pt-4 space-y-4">
                                            <div className="flex gap-2">
                                                <input
                                                    disabled
                                                    placeholder="Select package"
                                                    className="flex-1 bg-white border border-[#e0e0e0] px-4 py-2 text-sm italic text-gray-400"
                                                />
                                                <button disabled className="px-6 py-2 bg-[#fa4d56] text-white text-xs font-bold uppercase opacity-80">Redeem</button>
                                            </div>
                                            {formData.agentCode && (
                                                <div className="text-[10px] text-[#fa4d56] font-medium uppercase tracking-[1px]">Agent Code Applied: {formData.agentCode}</div>
                                            )}
                                            <div className="flex gap-2">
                                                <input
                                                    placeholder="Enter coupon code"
                                                    className="flex-1 border border-[#e0e0e0] px-4 py-2 text-sm focus:border-[#0f62fe] outline-none"
                                                />
                                                <button className="px-8 py-2 border border-[#fa4d56] text-[#fa4d56] text-xs font-bold uppercase hover:bg-[#fa4d56] hover:text-white transition-all">Apply</button>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="flex justify-between items-center mb-12">
                                            <span className="text-lg font-bold text-[#161616] uppercase tracking-tighter">Total Amount Payable</span>
                                            <span className="text-3xl font-bold text-[#fa4d56] font-mono">PHP {fees.total.toFixed(2)}</span>
                                        </div>

                                        {/* Payment Methods */}
                                        <div className="mb-12">
                                            <h4 className="text-[12px] font-bold text-[#525252] uppercase tracking-[1px] mb-6">Select Payment Method</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {[
                                                    { id: 'local', label: 'Pay Locally', icon: <Store className="w-4 h-4 text-[#0f62fe]" /> },
                                                    { id: 'paypal', label: 'PayPal', icon: <CreditCard className="w-4 h-4 text-[#0f62fe]" /> },
                                                    { id: 'stripe', label: 'Stripe', icon: <Lock className="w-4 h-4 text-[#0f62fe]" /> },
                                                ].map(method => (
                                                    <button
                                                        key={method.id}
                                                        onClick={() => setPaymentMethod(method.id)}
                                                        className={`p-4 border flex items-center justify-center gap-3 transition-all ${paymentMethod === method.id
                                                            ? 'border-[#0f62fe] bg-blue-50/50 ring-1 ring-[#0f62fe]'
                                                            : 'border-[#e0e0e0] hover:border-[#8d8d8d]'
                                                            }`}
                                                    >
                                                        <span className="text-xl">{method.icon}</span>
                                                        <span className={`text-[12px] font-bold uppercase ${paymentMethod === method.id ? 'text-[#0f62fe]' : 'text-[#525252]'}`}>
                                                            {method.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Transport Info if exists */}
                                        {(formData.pickupLocation || formData.destinationLocation) && (
                                            <div className="mb-12 p-6 bg-yellow-50/50 border-l-2 border-yellow-400">
                                                <h4 className="text-[10px] font-bold text-yellow-800 uppercase tracking-widest mb-4">Special Logistics</h4>
                                                <div className="grid grid-cols-2 gap-8 text-sm">
                                                    {formData.pickupLocation && (
                                                        <div>
                                                            <div className="text-gray-500 mb-1">Pickup</div>
                                                            <div className="font-bold text-gray-800">{formData.pickupLocation}</div>
                                                        </div>
                                                    )}
                                                    {formData.destinationLocation && (
                                                        <div>
                                                            <div className="text-gray-500 mb-1">Destination</div>
                                                            <div className="font-bold text-gray-800">{formData.destinationLocation}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {submitStatus.message && (
                                            <div className={`mb-8 p-4 text-sm ${submitStatus.type === 'success' ? 'bg-[#24a148]/10 text-[#24a148] border border-[#24a148]/20' : 'bg-[#da1e28]/10 text-[#da1e28] border border-[#da1e28]/20'
                                                }`}>
                                                {submitStatus.message}
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center pt-8 border-t border-[#e0e0e0]">
                                            <button
                                                onClick={() => setStep('details')}
                                                disabled={isSubmitting}
                                                className="text-[#525252] font-bold uppercase text-[12px] flex items-center gap-2 hover:text-[#0f62fe] disabled:opacity-50"
                                            >
                                                <ChevronLeft className="w-3 h-3" /> Go Back
                                            </button>
                                            <button
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className="carbon-btn-primary px-16 py-4 font-bold uppercase tracking-widest text-[13px] disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'Processing...' : 'Book Appointment'}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap justify-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <svg className="w-3 h-3 text-[#0f62fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>Real-time Tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-3 h-3 text-[#0f62fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>Verified Dispatch</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Geofencing and Dynamic Pricing Management View
function PricingZonesView() {
    const [surgeMultiplier, setSurgeMultiplier] = React.useState(1.5);
    const [activeZone, setActiveZone] = React.useState('Downtown Core');

    const zones = [
        { name: 'Downtown Core', rate: '₱50.00', surge: '1.5x', status: 'High Demand' },
        { name: 'Suburban North', rate: '₱35.00', surge: '1.0x', status: 'Stable' },
        { name: 'Airport District', rate: '₱120.00', surge: '2.0x', status: 'Critical' },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-220px)] animate-fadeIn">
            <div className="grid grid-cols-12 gap-8 h-full min-h-0">

                {/* LEFT PANEL: Geofencing Map Workspace */}
                <div className="col-span-8 bg-[#161616] border border-[#393939] relative overflow-hidden flex items-center justify-center">
                    {/* Technical Grid Overlay */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#0f62fe 1px, transparent 1px), linear-gradient(90deg, #0f62fe 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    <div className="absolute top-0 left-0 w-full p-6 bg-black/40 backdrop-blur-md border-b border-white/5 z-10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-[#0f62fe]" />
                            <h4 className="text-[12px] font-bold uppercase tracking-[2.5px] text-white">Geospatial Pricing Layer</h4>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-[#0f62fe] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0353e9]">Draw Polygon</button>
                            <button className="px-4 py-2 bg-[#393939] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#525252]">Clear All</button>
                        </div>
                    </div>

                    {/* Zone Visualizer */}
                    <div className="relative w-full h-full p-20 flex items-center justify-center">
                        <svg className="w-full h-full opacity-60" viewBox="0 0 800 400">
                            {/* Downtown Core */}
                            <polygon points="300,100 500,120 480,280 280,250" fill="#0f62fe" fillOpacity="0.2" stroke="#0f62fe" strokeWidth="2" />
                            <text x="350" y="180" fill="white" className="text-[10px] uppercase font-bold tracking-widest">Downtown Core (1.5x)</text>

                            {/* Airport District */}
                            <polygon points="600,50 750,80 720,200 580,180" fill="#da1e28" fillOpacity="0.2" stroke="#da1e28" strokeWidth="2" />
                            <text x="620" y="130" fill="white" className="text-[10px] uppercase font-bold tracking-widest">Airport (2.0x)</text>
                        </svg>

                        {/* Cursor/Drawing Marker */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <MapPin className="w-6 h-6 text-[#0f62fe] animate-bounce" />
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-6 text-[9px] font-mono text-white/40 uppercase tracking-widest">
                        GEOFENCE_ID: SECURE_ZONE_001 // CALIBRATION: OPTIMAL
                    </div>
                </div>

                {/* RIGHT PANEL: Pricing & Market Controls */}
                <div className="col-span-4 space-y-8 flex flex-col min-h-0">
                    {/* Surge Control Unit */}
                    <div className="bg-[#161616] p-8 text-white space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-[#f1c21b]" />
                                <h4 className="text-[12px] font-bold uppercase tracking-[2px]">Dynamic Surge</h4>
                            </div>
                            <div className="px-3 py-1 bg-[#f1c21b] text-[#161616] text-[10px] font-bold uppercase tracking-widest">Market Pressure</div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-[1.5px]">Global Multiplier</p>
                                <p className="text-6xl font-light tracking-tighter" style={{ color: surgeMultiplier > 2.5 ? '#da1e28' : '#f1c21b' }}>{surgeMultiplier.toFixed(1)}x</p>
                            </div>
                            <input
                                type="range"
                                min="1.0"
                                max="3.5"
                                step="0.1"
                                value={surgeMultiplier}
                                onChange={(e) => setSurgeMultiplier(parseFloat(e.target.value))}
                                className="w-full h-1 bg-[#393939] accent-[#f1c21b] appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] font-mono text-gray-500">
                                <span>1.0X</span><span>2.0X</span><span>3.0X</span><span>3.5X</span>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-900/50 border border-white/5 text-[10px] font-medium leading-relaxed text-gray-400">
                            Higher multipliers increase driver availability in high-demand zones but may impact conversion rates.
                        </div>
                    </div>

                    {/* Zone Pricing List */}
                    <div className="flex-1 bg-white border border-[#e0e0e0] flex flex-col min-h-0">
                        <div className="p-6 border-b border-[#e0e0e0] flex justify-between items-center">
                            <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-[#161616]">Zone Rate Grid</h4>
                            <Coins className="w-4 h-4 text-[#0f62fe]" />
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-[#f4f4f4]">
                            {zones.map(zone => (
                                <div key={zone.name} className="p-6 hover:bg-[#f4f4f4] transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-bold text-[#161616]">{zone.name}</p>
                                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border ${zone.status === 'Critical' ? 'bg-[#fff1f1] text-[#da1e28] border-[#da1e28]' :
                                                zone.status === 'High Demand' ? 'bg-[#edf5ff] text-[#0f62fe] border-[#0f62fe]' : 'bg-[#defbe6] text-[#198038] border-[#24a148]'
                                            }`}>{zone.status}</span>
                                    </div>
                                    <div className="flex gap-4 mt-4">
                                        <div>
                                            <p className="text-[9px] uppercase font-bold text-[#8d8d8d]">Base Rate</p>
                                            <p className="text-sm font-mono font-bold text-[#161616]">{zone.rate}</p>
                                        </div>
                                        <div className="w-[1px] bg-[#e0e0e0]"></div>
                                        <div>
                                            <p className="text-[9px] uppercase font-bold text-[#8d8d8d]">Zone Surge</p>
                                            <p className="text-sm font-mono font-bold text-[#0f62fe]">{zone.surge}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-[#e0e0e0]">
                            <button className="w-full py-3 bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#393939] transition-all">Audit Fee Structures</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Ride Scheduling and Logistics Dispatcher Component
function RideSchedulingView() {
    const [scheduledRides] = React.useState([
        { id: 'SCH-101', user: 'Maria Santos', pickup: 'Downtown Hub', dropoff: 'Central Square', time: '14:30', date: 'Today', status: 'Pending Assignment' },
        { id: 'SCH-102', user: 'Juan Luna', pickup: 'Airport Terminal 3', dropoff: 'Makati Business Dist.', time: '16:00', date: 'Today', status: 'Driver Assigned' },
        { id: 'SCH-103', user: 'Elena Reyes', pickup: 'Quezon City Circle', dropoff: 'BGC High Street', time: '09:00', date: 'Tomorrow', status: 'Pending Assignment' },
    ]);

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Dispatcher Alert Strip */}
            <div className="bg-[#161616] p-6 text-white border-l-8 border-l-[#0f62fe] flex justify-between items-center">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-[#0f62fe] flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="text-[12px] font-bold uppercase tracking-[2px]">Logistics Scheduling Queue</h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">UNASSIGNED TRIPS: 02 // SCHEDULED FOR TODAY: {scheduledRides.filter(r => r.date === 'Today').length}</p>
                    </div>
                </div>
                <button className="bg-[#0f62fe] text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#0353e9] transition-all">Optimize Routes</button>
            </div>

            <div className="grid grid-cols-12 gap-8">

                {/* Ride Ledger */}
                <div className="col-span-12 lg:col-span-8 bg-white border border-[#e0e0e0] overflow-hidden">
                    <div className="p-6 border-b border-[#e0e0e0] bg-[#f4f4f4] flex justify-between items-center">
                        <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-[#161616]">Advanced Booking Register</h4>
                        <Calendar className="w-4 h-4 text-[#0f62fe]" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest">
                                    <th className="px-8 py-5">Schedule ID</th>
                                    <th className="px-8 py-5">Rider Identity</th>
                                    <th className="px-8 py-5">Logistics Path</th>
                                    <th className="px-8 py-5 text-center">Execution Time</th>
                                    <th className="px-8 py-5 text-center">Assign State</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f4f4f4]">
                                {scheduledRides.map((ride) => (
                                    <tr key={ride.id} className="hover:bg-[#f4f4f4] transition-colors group">
                                        <td className="px-8 py-6 font-mono text-xs font-bold text-[#161616]">{ride.id}</td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-[#161616]">{ride.user}</p>
                                            <p className="text-[9px] text-[#8d8d8d] uppercase font-bold tracking-widest">Reserved Booking</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-[#525252] font-medium border border-[#e0e0e0] px-2 py-0.5">FROM: {ride.pickup}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-[#0f62fe] font-bold border border-[#0f62fe]/20 px-2 py-0.5">TO: {ride.dropoff}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <p className="text-sm font-bold text-[#161616] font-mono">{ride.time}</p>
                                            <p className="text-[9px] uppercase font-bold text-[#525252] tracking-widest mt-0.5">{ride.date}</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${ride.status === 'Driver Assigned' ? 'bg-[#defbe6] text-[#198038] border-[#24a148]' : 'bg-[#fff1f1] text-[#da1e28] border-[#da1e28]'
                                                }`}>
                                                {ride.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 border border-[#e0e0e0] text-[#161616] hover:bg-[#f4f4f4] transition-all" title="Modify Schedule">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Dispatch Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="p-8 bg-white border border-[#e0e0e0] space-y-8">
                        <h4 className="text-[11px] font-bold uppercase tracking-[2.5px] text-[#161616] border-b border-[#f4f4f4] pb-4">Smart Assignment</h4>
                        <div className="space-y-6">
                            <p className="text-[10px] text-[#525252] leading-relaxed font-medium">Select a pending trip to find the closest available High-Rating Driver.</p>
                            <div className="space-y-4">
                                {[
                                    { name: 'Antonio R.', rating: '4.9', vehicle: 'Vios - GAZ 1', dist: '1.2 km' },
                                    { name: 'Sarah L.', rating: '4.7', vehicle: 'Mirage - ABC 2', dist: '2.5 km' },
                                ].map(rec => (
                                    <div key={rec.name} className="p-4 bg-[#f4f4f4] border-l-4 border-l-[#0f62fe] flex justify-between items-center group cursor-pointer hover:bg-[#edf5ff] transition-all">
                                        <div>
                                            <p className="text-sm font-bold text-[#161616]">{rec.name}</p>
                                            <p className="text-[9px] text-[#8d8d8d] font-mono mt-0.5">{rec.vehicle} // {rec.dist}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-bold text-[#161616]">{rec.rating}</span>
                                            <Star className="w-3 h-3 text-[#f1c21b] fill-[#f1c21b]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-4 bg-[#161616] text-white text-[10px] font-bold uppercase tracking-[2px] transition-all hover:bg-[#393939] flex items-center justify-center gap-3">
                                <UserPlus className="w-3.5 h-3.5" /> Execute Match
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Unified Profile and System Settings View
function GlobalSettingsView() {
    const [activeCategory, setActiveCategory] = React.useState('profile');

    const menuItems = [
        { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
        { id: 'security', label: 'Account & Security', icon: <Lock className="w-5 h-5" /> },
        { id: 'payments', label: 'Payments & Wallet', icon: <CreditCard className="w-5 h-5" /> },
        { id: 'logistics', label: 'Ride Settings', icon: <Car className="w-5 h-5" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
        { id: 'promos', label: 'Promos & Rewards', icon: <Ticket className="w-5 h-5" /> },
        { id: 'preferences', label: 'App Preferences', icon: <Smartphone className="w-5 h-5" /> },
        { id: 'privacy', label: 'Privacy & Data', icon: <ShieldCheck className="w-5 h-5" /> },
        { id: 'corporate', label: 'Corporate Settings', icon: <Building2 className="w-5 h-5" /> },
        { id: 'help', label: 'Help & Support', icon: <LifeBuoy className="w-5 h-5" /> }
    ];

    const grabStyles = {
        primary: '#00B14F',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        bg: '#f4f7f5'
    };

    const renderCardRow = (label, value, hasChevron = true, onClick = null) => (
        <div
            onClick={onClick}
            className={`flex justify-between items-center py-5 border-b border-[#f0f0f0] last:border-0 cursor-pointer group hover:bg-[#fafafa] px-4 -mx-4 transition-colors`}
        >
            <span className="text-sm font-medium text-[#161616]">{label}</span>
            <div className="flex items-center gap-3">
                <span className="text-sm text-[#8d8d8d]">{value}</span>
                {hasChevron && <ChevronRight className="w-4 h-4 text-[#bdbdbd] group-hover:text-[#00B14F] transition-colors" />}
            </div>
        </div>
    );

    const renderToggleRow = (label, desc, isActive) => (
        <div className="flex justify-between items-center py-5 border-b border-[#f0f0f0] last:border-0 px-4 -mx-4">
            <div>
                <p className="text-sm font-medium text-[#161616]">{label}</p>
                <p className="text-[11px] text-[#8d8d8d] mt-0.5">{desc}</p>
            </div>
            <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${isActive ? 'bg-[#00B14F]' : 'bg-[#e0e0e0]'}`}>
                <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full shadow-sm transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`}></div>
            </div>
        </div>
    );

    return (
        <div className="bg-[#f4f7f5] -m-12 p-12 min-h-screen">
            <div className="max-w-6xl space-y-12">

                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12">
                    {/* Left Nav */}
                    <div className="space-y-2">
                        <div className="bg-white p-6 mb-8 border border-[#e0e0e0] flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#00B14F] rounded-full flex items-center justify-center text-white font-bold text-xl">JD</div>
                            <div>
                                <p className="font-bold text-[#161616]">John Doe</p>
                                <p className="text-[11px] text-[#8d8d8d]">john@email.com</p>
                            </div>
                        </div>

                        <div className="bg-white border border-[#e0e0e0] overflow-hidden">
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveCategory(item.id)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest transition-all border-l-4 ${activeCategory === item.id ? 'bg-[#f4f7f5] border-[#00B14F] text-[#00B14F]' : 'border-transparent text-[#8d8d8d] hover:bg-[#fafafa]'
                                        }`}
                                >
                                    <span className={activeCategory === item.id ? 'text-[#00B14F]' : 'text-[#8d8d8d]'}>{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="pt-8">
                            <button className="w-full py-4 text-[#EF4444] font-bold text-xs uppercase tracking-[2px] bg-white border border-[#e0e0e0] hover:bg-[#fff1f1]">Log Out</button>
                            <p className="text-[9px] text-[#8d8d8d] uppercase font-bold text-center mt-6 tracking-[3px]">App Version 1.0.0</p>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="space-y-8 pb-20">
                        <h2 className="text-2xl font-bold text-[#161616]">{menuItems.find(m => m.id === activeCategory)?.label}</h2>

                        {activeCategory === 'profile' && (
                            <div className="bg-white p-8 border border-[#e0e0e0] space-y-2">
                                {renderCardRow('Personal Information', 'John Alexander Doe')}
                                {renderCardRow('Email Address', 'john@email.com')}
                                {renderCardRow('Phone Number', '+63 917 123 4567')}
                                {renderCardRow('Date of Birth', 'Jan 10, 1990')}
                            </div>
                        )}

                        {activeCategory === 'security' && (
                            <div className="space-y-6">
                                <div className="bg-white p-8 border border-[#e0e0e0]">
                                    {renderCardRow('Change Password', 'Updated 3 months ago')}
                                    {renderToggleRow('Biometrics', 'Unlock with fingerprint or face', true)}
                                    {renderToggleRow('2FA', 'Stronger account protection', true)}
                                    {renderCardRow('Active Devices', '3 devices', true)}
                                </div>
                                <button className="w-full py-4 bg-[#161616] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#333]">Log out all devices</button>
                            </div>
                        )}

                        {activeCategory === 'payments' && (
                            <div className="bg-white p-8 border border-[#e0e0e0]">
                                {renderCardRow('Default Payment', 'GCash (Primary)')}
                                {renderCardRow('Saved Methods', 'GCash / Mastercard')}
                                {renderToggleRow('Auto Top-up', 'Automatically add funds', false)}
                                {renderToggleRow('Receipts Email', 'Get invoices via email', true)}
                                {renderCardRow('Transaction History', 'View All', true)}
                            </div>
                        )}

                        {activeCategory === 'logistics' && (
                            <div className="bg-white p-8 border border-[#e0e0e0]">
                                {renderCardRow('Home Address', '123 Ayala Ave')}
                                {renderCardRow('Work Address', 'IT Park Cebu')}
                                <div className="py-5 border-b border-[#f0f0f0]">
                                    <p className="text-sm font-medium mb-3">Preferred Car Type</p>
                                    <div className="flex gap-2">
                                        {['Economy', 'Comfort', 'Premium'].map(t => (
                                            <button key={t} className={`flex-1 py-3 text-[10px] font-bold uppercase border ${t === 'Economy' ? 'bg-[#00B14F] text-white border-[#00B14F]' : 'bg-white text-[#161616] border-[#e0e0e0]'}`}>{t}</button>
                                        ))}
                                    </div>
                                </div>
                                {renderToggleRow('Women-only rides', 'Prioritize female drivers', false)}
                                {renderToggleRow('Auto-book nearest', 'Fastest assignment', true)}
                            </div>
                        )}

                        {activeCategory === 'notifications' && (
                            <div className="bg-white p-8 border border-[#e0e0e0]">
                                {renderToggleRow('Ride Updates', 'Status of your bookings', true)}
                                {renderToggleRow('Promotions', 'New offers and discounts', true)}
                                {renderToggleRow('Wallet Alerts', 'Top-up and payout news', true)}
                                <div className="flex justify-between items-center py-5 border-b border-[#f0f0f0] last:border-0 px-4 -mx-4 opacity-70">
                                    <div>
                                        <p className="text-sm font-medium text-[#161616]">Security Alerts</p>
                                        <p className="text-[11px] text-[#8d8d8d] mt-0.5">Alerts for suspicious login</p>
                                    </div>
                                    <Lock className="w-4 h-4 text-[#8d8d8d]" />
                                </div>
                            </div>
                        )}

                        {activeCategory === 'promos' && (
                            <div className="bg-white p-8 border border-[#e0e0e0]">
                                {renderCardRow('My Vouchers', '12 Available')}
                                {renderCardRow('Reward Points', '1,250 Points')}
                                {renderCardRow('Cashback History', '₱450 earned')}
                                <div className="pt-6">
                                    <div className="flex gap-3">
                                        <input className="flex-1 bg-[#f4f7f5] border border-[#e0e0e0] px-4 py-3 text-xs placeholder:text-[#8d8d8d]" placeholder="Enter Promo Code" />
                                        <button className="px-8 bg-[#00B14F] text-white text-[10px] font-bold uppercase">Apply</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeCategory === 'preferences' && (
                            <div className="bg-white p-8 border border-[#e0e0e0]">
                                {renderToggleRow('Dark Mode', 'High contrast nocturnal view', true)}
                                {renderCardRow('Language', 'English (International)')}
                                {renderToggleRow('Accessibility Mode', 'Enhanced readability', false)}
                                {renderCardRow('Clear Cache', '142 MB', true)}
                            </div>
                        )}

                        {activeCategory === 'privacy' && (
                            <div className="bg-white p-8 border border-[#e0e0e0]">
                                {renderCardRow('Data Sharing', 'Manage settings')}
                                {renderToggleRow('Location Access', 'Track for better routing', true)}
                                {renderToggleRow('Personalization', 'Better recommendations', true)}
                                <div className="pt-8 space-y-4">
                                    <button className="w-full py-4 bg-[#f4f7f5] text-[#161616] text-[10px] font-bold uppercase">Download My Data</button>
                                    <button className="w-full py-4 text-[#EF4444] border border-[#EF4444] text-[10px] font-bold uppercase hover:bg-[#fff1f1]">Delete Account</button>
                                </div>
                            </div>
                        )}

                        {activeCategory === 'corporate' && (
                            <div className="bg-white p-8 border border-[#e0e0e0]">
                                {renderCardRow('Company Profile', 'Switch to Profile')}
                                {renderCardRow('Billing Account', 'Enterprise Plus')}
                                {renderCardRow('Manage Invoices', '2 Pending')}
                                {renderCardRow('Export Reports', 'Excel/CSV', true)}
                            </div>
                        )}

                        {activeCategory === 'help' && (
                            <div className="bg-white p-8 border border-[#e0e0e0]">
                                {renderCardRow('Help Center', 'Visit Article Library')}
                                {renderCardRow('Chat Support', 'Start Conversation')}
                                {renderCardRow('Report Issue', 'Describe a problem')}
                                {renderCardRow('Safety Center', 'Emergency protocols')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Wallet Transaction and Ledger Management Component
function WalletManagementView() {
    const [activeSubTab, setActiveSubTab] = React.useState('registry');
    const [selectedTx, setSelectedTx] = React.useState(null);
    const [isAdjusting, setIsAdjusting] = React.useState(false);

    const transactions = [
        { id: 'TX-12345', user: 'Maria Santos', type: 'Ride Payment', amount: '-₱245', status: 'Success', date: 'Today' },
        { id: 'TX-12346', user: 'Juan Operator', type: 'System Cashout', amount: '-₱1,000', status: 'Success', date: 'Yesterday' },
        { id: 'TX-12347', user: 'Ana Rivera', type: 'Wallet Top-up', amount: '+₱500', status: 'Pending', date: 'May 10' },
        { id: 'TX-12348', user: 'Mark Logistics', type: 'Refund Applied', amount: '+₱100', status: 'Success', date: 'May 09' },
    ];

    const renderRegistry = () => (
        <div className="space-y-8 animate-fadeIn">
            {/* Transaction Filters and Terminal Actions */}
            <div className="bg-white border border-[#e0e0e0] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d8d8d] w-4 h-4" />
                        <input className="w-full pl-10 pr-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-xs focus:outline-none focus:border-[#0f62fe]" placeholder="Audit ID or Username..." />
                    </div>
                    <select className="px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] text-xs focus:outline-none">
                        <option>All Types</option>
                        <option>Payments</option>
                        <option>Top-ups</option>
                        <option>Refunds</option>
                    </select>
                </div>
                <button
                    onClick={() => setIsAdjusting(true)}
                    className="px-8 py-3 bg-[#161616] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#393939] flex items-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" /> Manual Adjustment
                </button>
            </div>

            {/* Global Wallet KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-1 bg-[#e0e0e0] border border-[#e0e0e0]">
                {[
                    { label: 'Total Volume', value: '₱2.85M', icon: <Activity className="w-4 h-4" /> },
                    { label: 'Total Credits', value: '₱1.1M', color: '#24a148', icon: <ArrowUpRight className="w-4 h-4" /> },
                    { label: 'Total Debits', value: '₱1.45M', color: '#da1e28', icon: <ArrowDownLeft className="w-4 h-4" /> },
                    { label: 'Failed Settlements', value: '0.4%', color: '#da1e28', icon: <AlertCircle className="w-4 h-4" /> },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-8 group relative transition-colors hover:bg-[#fcfcfc]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-[#f4f4f4] text-[#161616]" style={{ color: kpi.color }}>{kpi.icon}</div>
                        </div>
                        <p className="text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-1">{kpi.label}</p>
                        <p className="text-3xl font-light text-[#161616] tracking-tighter">{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Transaction Ledger Table */}
            <div className="bg-white border border-[#e0e0e0] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest">
                            <th className="px-8 py-5">Transaction Audit ID</th>
                            <th className="px-8 py-5">Member / Entity</th>
                            <th className="px-8 py-5">Registry Type</th>
                            <th className="px-8 py-5 text-right">Delta Payload</th>
                            <th className="px-8 py-5 text-center">Settlement</th>
                            <th className="px-8 py-5 text-right">Audit Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f4f4f4]">
                        {transactions.map((tx, idx) => (
                            <tr key={idx} className="hover:bg-[#f4f4f4] transition-colors group cursor-pointer" onClick={() => setSelectedTx(tx)}>
                                <td className="px-8 py-6 font-mono font-bold text-xs text-[#161616] underline decoration-[#0f62fe] decoration-2">{tx.id}</td>
                                <td className="px-8 py-6 text-sm font-bold text-[#161616]">{tx.user}</td>
                                <td className="px-8 py-6 text-[10px] font-bold text-[#525252] uppercase tracking-[1.5px]">{tx.type}</td>
                                <td className={`px-8 py-6 text-right font-mono font-bold ${tx.amount.startsWith('+') ? 'text-[#24a148]' : 'text-[#da1e28]'}`}>{tx.amount}</td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${tx.status === 'Success' ? 'bg-[#defbe6] text-[#198038] border-[#24a148]' : 'bg-[#fcf4d6] text-[#161616] border-[#f1c21b]'
                                        }`}>{tx.status}</span>
                                </td>
                                <td className="px-8 py-6 text-right font-mono text-xs text-[#8d8d8d]">{tx.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Transaction Detail Panel */}
            {selectedTx && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-[#161616]/40 backdrop-blur-sm" onClick={() => setSelectedTx(null)}></div>
                    <div className="relative w-full max-w-lg bg-white shadow-2xl animate-slideInRight flex flex-col h-full border-l-4 border-l-[#0f62fe]">
                        <div className="p-10 bg-[#161616] text-white">
                            <div className="flex justify-between items-start mb-10">
                                <div className="w-12 h-12 bg-[#0f62fe] flex items-center justify-center"><BadgeDollarSign className="w-6 h-6" /></div>
                                <button onClick={() => setSelectedTx(null)} className="p-2 hover:bg-white/10 transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-xs font-bold text-[#8d8d8d] uppercase tracking-[3px] mb-2">Registry Audit // Transaction</p>
                            <h2 className="text-3xl font-light tracking-tighter mb-4">{selectedTx.id}</h2>
                            <p className="text-xs font-bold text-[#24a148] uppercase tracking-[2px]">Logistics Ledger Verified</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 space-y-12 text-[#161616]">
                            <div className="grid grid-cols-1 gap-8 border-b border-[#f4f4f4] pb-10">
                                <div className="flex justify-between">
                                    <span className="text-[10px] uppercase font-bold text-[#8d8d8d] tracking-widest">Type Registry</span>
                                    <span className="text-sm font-bold">{selectedTx.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] uppercase font-bold text-[#8d8d8d] tracking-widest">Entity Account</span>
                                    <span className="text-sm font-bold underline decoration-[#0f62fe]">{selectedTx.user}</span>
                                </div>
                                <div className="bg-[#f4f4f4] p-8 mt-4 flex justify-between items-center">
                                    <span className="text-[11px] uppercase font-bold tracking-[2px]">Settled Amount</span>
                                    <span className={`text-2xl font-mono font-bold ${selectedTx.amount.startsWith('+') ? 'text-[#24a148]' : 'text-[#da1e28]'}`}>{selectedTx.amount}</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#161616] border-b border-[#f4f4f4] pb-4">Internal Meta Registry</p>
                                <p className="text-[11px] text-[#525252] leading-relaxed">
                                    Transaction processed via financial core v1.2. Linked booking identifier: <span className="font-bold underline">BK-90211</span>.
                                    No disputes logged against this entry.
                                </p>
                            </div>
                        </div>

                        <div className="p-10 border-t border-[#f4f4f4] flex gap-3">
                            <button className="flex-1 py-4 bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#393939]">Reverse Payload</button>
                            <button className="flex-1 py-4 border border-[#e0e0e0] text-[#161616] text-[10px] font-bold uppercase tracking-widest hover:bg-[#f4f4f4]">Flag for Audit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Adjustment Modal */}
            {isAdjusting && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#161616]/60 backdrop-blur-md" onClick={() => setIsAdjusting(false)}></div>
                    <div className="relative w-full max-w-md bg-white p-12 border-t-8 border-t-[#0f62fe] animate-fadeIn">
                        <h4 className="text-[12px] font-bold uppercase tracking-[4px] text-[#161616] mb-10">Manual Wallet Calibration</h4>
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-[#8d8d8d] tracking-widest mb-3">Entity Selection</label>
                                <input className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#161616] text-sm focus:outline-none" defaultValue="Juan Operator" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="py-4 bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest outline outline-2 outline-[#0f62fe]">Credit (+)</button>
                                <button className="py-4 border border-[#e0e0e0] text-[#161616] text-[10px] font-bold uppercase tracking-widest hover:bg-[#f4f4f4]">Debit (-)</button>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-[#8d8d8d] tracking-widest mb-3">Amount (₱)</label>
                                <input className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#161616] text-sm font-mono font-bold focus:outline-none" placeholder="100.00" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-[#8d8d8d] tracking-widest mb-3">Rationale for Calibration</label>
                                <textarea className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#161616] text-sm h-24 focus:outline-none resize-none" placeholder="System error compensation..."></textarea>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button className="flex-1 py-4 bg-[#0f62fe] text-white text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-[#0353e9]" onClick={() => setIsAdjusting(false)}>Commit Adjust.</button>
                                <button className="flex-1 py-4 text-[#161616] text-[10px] font-bold uppercase tracking-widest hover:bg-[#f4f4f4]" onClick={() => setIsAdjusting(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderMemberPerspective = () => (
        <div className="max-w-md mx-auto space-y-10 animate-fadeIn">
            <div className="bg-[#161616] p-10 border-l-[12px] border-l-[#0f62fe] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Wallet className="w-32 h-32" /></div>
                <div className="relative z-10 space-y-12">
                    <div className="flex justify-between items-center">
                        <div className="p-2 border border-white/10"><Smartphone className="w-5 h-5 text-[#0f62fe]" /></div>
                        <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#24a148]">Asset: Wallet</p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#8d8d8d]">Operating Balance</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-bold text-[#8d8d8d]">₱</span>
                            <span className="text-5xl font-light tracking-tighter">1,250.75</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Top Up', icon: <Plus className="w-4 h-4" /> },
                            { label: 'Pay', icon: <CreditCard className="w-4 h-4" /> },
                            { label: 'Transfer', icon: <ArrowRight className="w-4 h-4" /> },
                        ].map((act, i) => (
                            <button key={i} className="flex flex-col items-center gap-4 p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                                <div className="text-[#0f62fe] group-hover:scale-110 transition-transform">{act.icon}</div>
                                <span className="text-[9px] font-bold uppercase tracking-widest">{act.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#8d8d8d]">Registry History</p>
                        <div className="space-y-3">
                            {[
                                { type: 'Ride (BK123)', val: '-₱245', color: '#ff4d4d' },
                                { type: 'Top-up (GCash)', val: '+₱500', color: '#24a148' },
                                { type: 'Refund Applied', val: '+₱100', color: '#24a148' },
                            ].map((tx, i) => (
                                <div key={i} className="p-4 bg-white/5 border border-white/10 flex justify-between items-center group cursor-pointer hover:bg-white/10">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold">{tx.type}</p>
                                        <p className="text-[8px] text-[#8d8d8d] uppercase tracking-widest font-mono">Completed // Today</p>
                                    </div>
                                    <span className="font-mono text-sm font-bold" style={{ color: tx.color }}>{tx.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex border-b border-[#e0e0e0]">
                {[
                    { id: 'registry', label: 'Transaction Registry' },
                    { id: 'ledger', label: 'Finance Ledger' },
                    { id: 'member', label: 'Member Perspective' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] transition-all relative ${activeSubTab === tab.id ? 'text-[#0f62fe]' : 'text-[#8d8d8d] hover:text-[#161616]'
                            }`}
                    >
                        {tab.label}
                        {activeSubTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f62fe]"></div>}
                    </button>
                ))}
            </div>

            {activeSubTab === 'registry' && renderRegistry()}
            {activeSubTab === 'member' && renderMemberPerspective()}
            {activeSubTab === 'ledger' && (
                <div className="bg-white border border-[#e0e0e0] p-20 text-center space-y-6">
                    <History className="w-16 h-16 text-[#0f62fe] mx-auto opacity-10" />
                    <div>
                        <h4 className="text-sm font-bold text-[#161616] uppercase tracking-[3px]">Internal Audit hub</h4>
                        <p className="text-[10px] text-[#8d8d8d] uppercase tracking-widest mt-2">Deep immutable ledger and financial reconciliation coming soon</p>
                    </div>
                    <button onClick={() => setActiveSubTab('registry')} className="px-6 py-2 bg-[#f4f4f4] text-[#161616] text-[10px] font-bold uppercase hover:bg-[#e0e0e0]">Return to Registry</button>
                </div>
            )}
        </div>
    );
}

// Vehicle Compliance and Fleet Management View
function VehiclesManagementView() {
    const [activeSubTab, setActiveSubTab] = React.useState('registry');
    const [selectedVehicle, setSelectedVehicle] = React.useState(null);

    const vehicles = [
        { plate: 'ABC 1234', driver: 'Juan Dela Cruz', type: 'Economy', status: 'Approved', docs: 'Verified', expiry: 'Dec 2026' },
        { plate: 'XYZ 7890', driver: 'Mark Anthony', type: 'Economy', status: 'Pending', docs: 'Partial', expiry: '—' },
        { plate: 'DEF 4567', driver: 'Ana Rivera', type: 'Premium', status: 'Rejected', docs: 'Mismatched', expiry: '—' },
    ];

    const renderRegistry = () => (
        <div className="space-y-8 animate-fadeIn">
            {/* Search and Global Actions */}
            <div className="bg-white border border-[#e0e0e0] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d8d8d] w-4 h-4" />
                        <input className="w-full pl-10 pr-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-xs focus:outline-none focus:border-[#0f62fe]" placeholder="Search plate or driver..." />
                    </div>
                    <button className="p-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] hover:bg-[#e0e0e0]"><Filter className="w-4 h-4 text-[#161616]" /></button>
                </div>
                <button className="px-8 py-3 bg-[#0f62fe] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#0353e9] flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Register Vehicle
                </button>
            </div>

            {/* Compliance Health Monitor */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-1 bg-[#e0e0e0] border border-[#e0e0e0]">
                {[
                    { label: 'Fleet Assets', value: '1,245', icon: <Car className="w-4 h-4" /> },
                    { label: 'Active Compliance', value: '1,120', color: '#24a148', icon: <ShieldCheck className="w-4 h-4" /> },
                    { label: 'Pending Review', value: '86', color: '#f1c21b', icon: <FileCheck className="w-4 h-4" /> },
                    { label: 'Critical / Expired', value: '39', color: '#da1e28', icon: <AlertCircle className="w-4 h-4" /> },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-8 group relative transition-colors hover:bg-[#fcfcfc]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-[#f4f4f4] text-[#161616]" style={{ color: kpi.color }}>{kpi.icon}</div>
                        </div>
                        <p className="text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-1">{kpi.label}</p>
                        <p className="text-3xl font-light text-[#161616] tracking-tighter">{kpi.value}</p>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f62fe] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                    </div>
                ))}
            </div>

            {/* Vehicle Registry Ledger */}
            <div className="bg-white border border-[#e0e0e0] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest">
                            <th className="px-8 py-5">Vehicle Plate</th>
                            <th className="px-8 py-5">Primary Driver</th>
                            <th className="px-8 py-5">Logistics Tier</th>
                            <th className="px-8 py-5 text-center">Compliance</th>
                            <th className="px-8 py-5 text-center">Audit State</th>
                            <th className="px-8 py-5 text-right">Maturity (Expiry)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f4f4f4]">
                        {vehicles.map((v, idx) => (
                            <tr key={idx} className="hover:bg-[#f4f4f4] transition-colors group cursor-pointer" onClick={() => setSelectedVehicle(v)}>
                                <td className="px-8 py-6 font-mono font-bold text-sm text-[#161616]">{v.plate}</td>
                                <td className="px-8 py-6 text-sm font-bold text-[#161616]">{v.driver}</td>
                                <td className="px-8 py-6 text-sm text-[#525252] font-medium">{v.type}</td>
                                <td className="px-8 py-6 text-center text-[10px] font-bold text-[#525252] uppercase tracking-widest">{v.docs}</td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${v.status === 'Approved' ? 'bg-[#defbe6] text-[#198038] border-[#24a148]' :
                                            v.status === 'Rejected' ? 'bg-[#fff1f1] text-[#da1e28] border-[#da1e28]' : 'bg-[#fcf4d6] text-[#161616] border-[#f1c21b]'
                                        }`}>
                                        {v.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right font-mono text-xs text-[#8d8d8d]">{v.expiry}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail / Review Drawer */}
            {selectedVehicle && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-[#161616]/40 backdrop-blur-sm" onClick={() => setSelectedVehicle(null)}></div>
                    <div className="relative w-full max-w-xl bg-white shadow-2xl animate-slideInRight flex flex-col h-full border-l-4 border-l-[#0f62fe]">
                        <div className="p-10 bg-[#161616] text-white">
                            <div className="flex justify-between items-start mb-10">
                                <div className="w-12 h-12 bg-[#0f62fe] flex items-center justify-center"><Car className="w-6 h-6" /></div>
                                <button onClick={() => setSelectedVehicle(null)} className="p-2 hover:bg-white/10 transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-xs font-bold text-[#8d8d8d] uppercase tracking-[3px] mb-2">Technical Audit // Asset</p>
                            <h2 className="text-3xl font-light tracking-tighter mb-10">{selectedVehicle.plate}</h2>
                            <div className="flex gap-4">
                                <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest bg-white/10">{selectedVehicle.type}</span>
                                <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest bg-[#24a148]">{selectedVehicle.status}</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 space-y-12">
                            {/* Documentary Evidence */}
                            <div className="space-y-6">
                                <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#161616] border-b border-[#f4f4f4] pb-4">Compliance Evidence</p>
                                <div className="grid grid-cols-2 gap-6">
                                    {['OR/CR Certification', 'Insurance Policy', 'Frontend Inspection', 'Backend Inspection'].map(doc => (
                                        <div key={doc} className="p-4 bg-[#f4f4f4] border border-[#e0e0e0] flex items-center gap-4 group cursor-pointer hover:border-[#0f62fe]">
                                            <div className="w-10 h-10 bg-white border border-[#e0e0e0] flex items-center justify-center text-[#8d8d8d] group-hover:text-[#0f62fe]"><FileText className="w-5 h-5" /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[#161616] uppercase tracking-widest">{doc}</p>
                                                <p className="text-[9px] text-[#24a148] font-bold uppercase mt-0.5">Verified</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Operational Context */}
                            <div className="space-y-6">
                                <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#161616] border-b border-[#f4f4f4] pb-4">Operational Context</p>
                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    <div>
                                        <p className="text-[9px] uppercase font-bold text-[#8d8d8d] tracking-widest mb-1">Operator Connection</p>
                                        <p className="text-sm font-bold text-[#161616]">{selectedVehicle.driver}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase font-bold text-[#8d8d8d] tracking-widest mb-1">Last Inspection</p>
                                        <p className="text-sm font-bold text-[#161616]">Jan 12, 2026</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase font-bold text-[#8d8d8d] tracking-widest mb-1">Cumulative Trips</p>
                                        <p className="text-sm font-bold text-[#161616]">245 Operations</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase font-bold text-[#8d8d8d] tracking-widest mb-1">Serviceability</p>
                                        <p className="text-sm font-bold text-[#24a148]">Fully Eligible</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 border-t border-[#f4f4f4] flex gap-3">
                            <button className="flex-1 py-4 bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#393939] transition-all">Suspend Operationality</button>
                            <button className="flex-1 py-4 border border-[#e0e0e0] text-[#161616] text-[10px] font-bold uppercase tracking-widest hover:bg-[#f4f4f4] transition-all">Recalibrate Details</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderFleetView = () => (
        <div className="space-y-10 animate-fadeIn">
            <div className="bg-white border border-[#e0e0e0] p-10 flex flex-col md:flex-row justify-between items-center gap-10 border-l-8 border-l-[#161616]">
                <div className="flex gap-8">
                    <div className="text-center p-6 bg-[#f4f4f4] min-w-[140px]">
                        <p className="text-[9px] font-bold text-[#8d8d8d] uppercase tracking-widest mb-2">Fleet Scale</p>
                        <p className="text-3xl font-light text-[#161616]">25 Assets</p>
                    </div>
                    <div className="text-center p-6 bg-[#defbe6] min-w-[140px]">
                        <p className="text-[9px] font-bold text-[#198038] uppercase tracking-widest mb-2">Online / Active</p>
                        <p className="text-3xl font-light text-[#198038]">20</p>
                    </div>
                    <div className="text-center p-6 bg-[#f4f4f4] min-w-[140px]">
                        <p className="text-[9px] font-bold text-[#8d8d8d] uppercase tracking-widest mb-2">Idle / Inactive</p>
                        <p className="text-3xl font-light text-[#161616]">05</p>
                    </div>
                </div>
                <button className="px-10 py-4 bg-[#161616] text-white text-[11px] font-bold uppercase tracking-[2px] hover:bg-[#393939] transition-all shadow-xl">Assign Fleet Captain</button>
            </div>

            <div className="bg-white border border-[#e0e0e0] p-10 space-y-8">
                <div className="flex justify-between items-end border-b border-[#f4f4f4] pb-6">
                    <h4 className="text-[12px] font-bold uppercase tracking-[3px] text-[#161616]">Commercial Asset Distribution</h4>
                    <button className="text-[10px] font-bold text-[#0f62fe] uppercase hover:underline">Download Commercial Report</button>
                </div>
                <div className="grid grid-cols-2 gap-x-20 gap-y-8">
                    {[
                        { name: 'Toyota Vios // ABC 1234', driver: 'Juan', status: 'Active', load: '85%' },
                        { name: 'Mitsubishi Mirage // XYZ 7890', driver: 'Mark', status: 'Idle', load: '12%' },
                        { name: 'Honda City // DEF 4567', driver: 'Ana', status: 'Active', load: '92%' },
                        { name: 'Suzuki Swift // GHI 8901', driver: 'Pedro', status: 'Active', load: '78%' },
                    ].map((f, i) => (
                        <div key={i} className="flex justify-between items-center group">
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-[#161616] group-hover:text-[#0f62fe] transition-colors">{f.name}</p>
                                <p className="text-[9px] text-[#8d8d8d] uppercase font-bold font-mono tracking-widest">Op: {f.driver} • {f.status}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-mono font-bold text-[#161616]">{f.load} LOAD</div>
                                <div className="w-24 h-1 bg-[#f4f4f4] mt-1 overflow-hidden">
                                    <div className={`h-full ${parseFloat(f.load) > 80 ? 'bg-[#24a148]' : 'bg-[#0f62fe]'}`} style={{ width: f.load }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderDriverPerspective = () => (
        <div className="max-w-md mx-auto space-y-10 animate-fadeIn">
            {/* Simulated Mobile Device Window */}
            <div className="bg-[#161616] text-white p-10 border-l-[12px] border-l-[#0f62fe] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="flex justify-between items-start mb-12">
                    <div className="p-2 border border-white/10"><Smartphone className="w-5 h-5 text-[#0f62fe]" /></div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest p-1 bg-[#24a148] text-white">Online Perspective</p>
                </div>

                <div className="space-y-12">
                    {/* Active Asset Card */}
                    <div className="p-8 bg-white/5 border border-white/10 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Car className="w-20 h-20" /></div>
                        <div className="relative z-10 space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#8d8d8d]">Active Logistical Asset</p>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-light tracking-tighter">Toyota Vios // White</h3>
                                <p className="text-sm font-mono font-bold text-[#0f62fe]">ABC 1234</p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button className="flex-1 py-3 bg-[#0f62fe] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0353e9]">Go Online</button>
                                <button className="flex-1 py-3 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Switch Asset</button>
                            </div>
                        </div>
                    </div>

                    {/* Asset Registry */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#8d8d8d]">Logistical Inventory</p>
                            <Plus className="w-4 h-4 text-[#0f62fe] cursor-pointer" />
                        </div>
                        <div className="space-y-3">
                            {[
                                { name: 'Toyota Vios', plate: 'ABC 1234', state: 'Approved' },
                                { name: 'Mitsubishi Mirage', plate: 'XYZ 7890', state: 'Pending Approval' },
                            ].map((ma, i) => (
                                <div key={i} className="p-5 bg-white/5 border border-white/10 flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-all">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold group-hover:text-[#0f62fe] transition-colors">{ma.name}</p>
                                        <p className="text-[9px] font-mono text-[#8d8d8d] uppercase tracking-widest">{ma.plate}</p>
                                    </div>
                                    <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 ${ma.state === 'Approved' ? 'bg-[#24a148]/20 text-[#24a148]' : 'bg-[#f1c21b]/20 text-[#f1c21b]'}`}>{ma.state}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Module Navigation */}
            <div className="flex border-b border-[#e0e0e0]">
                {[
                    { id: 'registry', label: 'Technical Registry' },
                    { id: 'fleet', label: 'Commercial Fleet Hub' },
                    { id: 'driver', label: 'Operator Framework' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] transition-all relative ${activeSubTab === tab.id ? 'text-[#0f62fe]' : 'text-[#8d8d8d] hover:text-[#161616]'
                            }`}
                    >
                        {tab.label}
                        {activeSubTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f62fe]"></div>}
                    </button>
                ))}
            </div>

            {activeSubTab === 'registry' && renderRegistry()}
            {activeSubTab === 'fleet' && renderFleetView()}
            {activeSubTab === 'driver' && renderDriverPerspective()}
        </div>
    );
}

// Driver Payouts and Financial Settlement Component
function PayoutManagementView() {
    const [activeSubTab, setActiveSubTab] = React.useState('registry');
    const [selectedPayout, setSelectedPayout] = React.useState(null);

    const payouts = [
        { id: 'PO-10021', driver: 'Juan Dela Cruz', amount: '₱1,000', fee: '₱15', method: 'GCash', status: 'Success', date: 'May 10' },
        { id: 'PO-10022', driver: 'Mark Anthony', amount: '₱2,500', fee: '₱0', method: 'Bank Transfer', status: 'Pending', date: 'May 10' },
        { id: 'PO-10023', driver: 'Ana Rivera', amount: '₱800', fee: '₱15', method: 'Maya', status: 'Failed', date: 'May 09' },
    ];

    const renderRegistry = () => (
        <div className="space-y-8 animate-fadeIn">
            {/* Search and Global Actions */}
            <div className="bg-white border border-[#e0e0e0] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d8d8d] w-4 h-4" />
                        <input className="w-full pl-10 pr-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-xs focus:outline-none focus:border-[#0f62fe]" placeholder="Filter by driver name..." />
                    </div>
                    <button className="p-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] hover:bg-[#e0e0e0] transition-colors"><Filter className="w-4 h-4 text-[#161616]" /></button>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-6 py-3 bg-[#161616] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#393939] flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                    <button
                        onClick={() => setActiveSubTab('batch')}
                        className="flex-1 md:flex-none px-6 py-3 bg-[#0f62fe] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#0353e9] flex items-center justify-center gap-2"
                    >
                        <Zap className="w-4 h-4" /> Batch Execution
                    </button>
                </div>
            </div>

            {/* Financial Settlement KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-1 bg-[#e0e0e0] border border-[#e0e0e0]">
                {[
                    { label: 'Total Payouts', value: '₱1.45M', icon: <ArrowLeftRight className="w-4 h-4" /> },
                    { label: 'Pending Settlement', value: '₱42K', color: '#f1c21b', icon: <Clock className="w-4 h-4" /> },
                    { label: 'Failure Incident', value: '0.8%', color: '#da1e28', icon: <AlertTriangle className="w-4 h-4" /> },
                    { label: 'Fees Collected', value: '₱12.4K', color: '#24a148', icon: <Coins className="w-4 h-4" /> },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-8 group relative overflow-hidden transition-colors hover:bg-[#fcfcfc]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-[#f4f4f4] text-[#161616]" style={{ color: kpi.color }}>{kpi.icon}</div>
                        </div>
                        <p className="text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-1">{kpi.label}</p>
                        <p className="text-3xl font-light text-[#161616] tracking-tighter">{kpi.value}</p>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f62fe] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                    </div>
                ))}
            </div>

            {/* Payout Registry Ledger */}
            <div className="bg-white border border-[#e0e0e0] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest">
                            <th className="px-8 py-5">Payout ID</th>
                            <th className="px-8 py-5">Driver Operator</th>
                            <th className="px-8 py-5 text-right">Settled Amount</th>
                            <th className="px-8 py-5 text-center">Protocol (Method)</th>
                            <th className="px-8 py-5 text-center">Settlement State</th>
                            <th className="px-8 py-5 text-right">Maturity (Date)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f4f4f4]">
                        {payouts.map((p, idx) => (
                            <tr key={idx} className="hover:bg-[#f4f4f4] transition-colors group cursor-pointer" onClick={() => setSelectedPayout(p)}>
                                <td className="px-8 py-6 font-mono text-xs font-bold text-[#161616]">{p.id}</td>
                                <td className="px-8 py-6 text-sm font-bold text-[#161616]">{p.driver}</td>
                                <td className="px-8 py-6 text-right">
                                    <p className="font-mono font-bold text-[#161616] text-sm">{p.amount}</p>
                                    <p className="text-[9px] text-[#8d8d8d] font-bold uppercase tracking-widest mt-0.5">FEE: {p.fee}</p>
                                </td>
                                <td className="px-8 py-6 text-center text-[10px] font-bold text-[#525252] uppercase tracking-widest">{p.method}</td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${p.status === 'Success' ? 'bg-[#defbe6] text-[#198038] border-[#24a148]' :
                                            p.status === 'Failed' ? 'bg-[#fff1f1] text-[#da1e28] border-[#da1e28]' : 'bg-[#fcf4d6] text-[#161616] border-[#f1c21b]'
                                        }`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right font-mono text-xs text-[#8d8d8d]">{p.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Payout Detail Drawer (Portal Style) */}
            {selectedPayout && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-[#161616]/40 backdrop-blur-sm" onClick={() => setSelectedPayout(null)}></div>
                    <div className="relative w-full max-w-md bg-white shadow-2xl animate-slideInRight flex flex-col h-full border-l-4 border-l-[#0f62fe]">
                        <div className="p-8 bg-[#161616] text-white">
                            <div className="flex justify-between items-start mb-10">
                                <div className="w-12 h-12 bg-[#0f62fe] flex items-center justify-center"><ArrowLeftRight className="w-6 h-6" /></div>
                                <button onClick={() => setSelectedPayout(null)} className="p-2 hover:bg-white/10 transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-xs font-bold text-[#8d8d8d] uppercase tracking-[3px] mb-2">Audit Registry // Payout</p>
                            <h2 className="text-3xl font-light tracking-tighter mb-10">{selectedPayout.id}</h2>
                            <div className={`inline-block px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${selectedPayout.status === 'Success' ? 'bg-[#24a148] text-white' : 'bg-[#da1e28] text-white'
                                }`}>{selectedPayout.status}</div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-10">
                            <div className="space-y-6">
                                <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#161616] border-b border-[#f4f4f4] pb-4">Transactional Details</p>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="flex justify-between border-b border-[#f4f4f4] pb-4">
                                        <span className="text-[10px] font-bold text-[#8d8d8d] uppercase tracking-widest">Operator</span>
                                        <span className="text-sm font-bold text-[#161616]">{selectedPayout.driver}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[#f4f4f4] pb-4">
                                        <span className="text-[10px] font-bold text-[#8d8d8d] uppercase tracking-widest">Protocol</span>
                                        <span className="text-sm font-bold text-[#161616]">{selectedPayout.method}</span>
                                    </div>
                                    <div className="flex justify-between py-6 bg-[#f4f4f4] px-6 border-l-4 border-l-[#161616]">
                                        <span className="text-[11px] font-bold text-[#161616] uppercase tracking-[2px]">Net Settlement</span>
                                        <span className="text-xl font-mono font-bold text-[#161616]">{selectedPayout.amount}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#161616] border-b border-[#f4f4f4] pb-4">Execution Timeline</p>
                                <div className="space-y-6 pl-4 border-l-2 border-l-[#e0e0e0]">
                                    {[
                                        { time: '10:01 AM', event: 'Payout requested via Mobile Handset', color: '#161616' },
                                        { time: '10:02 AM', event: 'Audit check completed (Clearance Verified)', color: '#161616' },
                                        { time: '10:04 AM', event: 'Settlement confirmed by Financial Core', color: '#24a148' },
                                    ].map((t, idx) => (
                                        <div key={idx} className="relative">
                                            <div className="absolute -left-[2.3rem] top-1.5 w-4 h-4 bg-white border-2 border-[#161616]" style={{ borderColor: t.color }}></div>
                                            <p className="text-[9px] font-mono font-bold text-[#8d8d8d]">{t.time}</p>
                                            <p className="text-[11px] font-medium text-[#525252] leading-relaxed">{t.event}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-10 border-t border-[#f4f4f4] flex gap-3">
                            <button className="flex-1 py-4 bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#393939] transition-all">Retry Execution</button>
                            <button className="flex-1 py-4 border border-[#e0e0e0] text-[#161616] text-[10px] font-bold uppercase tracking-widest hover:bg-[#f4f4f4] transition-all">Contact Driver</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderBatchExecution = () => (
        <div className="max-w-4xl bg-white border border-[#e0e0e0] p-12 space-y-12 animate-fadeIn">
            <div className="flex items-center gap-6 border-b border-[#f4f4f4] pb-10">
                <div className="w-16 h-16 bg-[#161616] text-white flex items-center justify-center"><GanttChartSquare className="w-8 h-8" /></div>
                <div>
                    <h4 className="text-[12px] font-bold uppercase tracking-[4px] text-[#161616]">Mass Disbursement Engine</h4>
                    <p className="text-[10px] text-[#8d8d8d] font-mono mt-1 uppercase tracking-widest">Protocol: AUTOMATED_BATCH_EXEC_V4</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="p-8 bg-[#f4f4f4] border-l-4 border-l-[#161616] space-y-2">
                        <p className="text-[10px] font-bold text-[#8d8d8d] uppercase tracking-widest">Active Pool Selection</p>
                        <p className="text-3xl font-light text-[#161616] tracking-tighter">120 Drivers</p>
                    </div>
                    <div className="p-8 bg-[#edf5ff] border-l-4 border-l-[#0f62fe] space-y-2">
                        <p className="text-[10px] font-bold text-[#0f62fe] uppercase tracking-widest">Aggregate Settlement</p>
                        <p className="text-3xl font-light text-[#161616] tracking-tighter">₱245,000</p>
                    </div>
                </div>
                <div className="space-y-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#525252]">Execution Schedule</label>
                        <div className="space-y-3">
                            {['Execute Immediately', 'End of Operational Day (23:59)', 'Standard Weekly Cycle'].map((opt, i) => (
                                <label key={i} className={`flex items-center gap-4 p-4 border transition-all cursor-pointer ${i === 0 ? 'bg-[#161616] text-white border-[#161616]' : 'border-[#e0e0e0] hover:bg-[#f4f4f4]'}`}>
                                    <div className={`w-4 h-4 border-2 flex items-center justify-center ${i === 0 ? 'border-white' : 'border-[#e0e0e0]'}`}>
                                        {i === 0 && <div className="w-2 h-2 bg-white"></div>}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <button className="w-full py-5 bg-[#0f62fe] text-white text-[11px] font-bold uppercase tracking-[2.5px] shadow-[0_10px_30px_rgba(15,98,254,0.3)] hover:bg-[#0353e9] transition-all flex items-center justify-center gap-4">
                        <Zap className="w-4 h-4" /> Trigger Disbursement
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Module Navigation */}
            <div className="flex border-b border-[#e0e0e0]">
                {[
                    { id: 'registry', label: 'Payout Registry' },
                    { id: 'batch', label: 'Batch Execution' },
                    { id: 'ledger', label: 'Operator Ledger' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] transition-all relative ${activeSubTab === tab.id ? 'text-[#0f62fe]' : 'text-[#8d8d8d] hover:text-[#161616]'
                            }`}
                    >
                        {tab.label}
                        {activeSubTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f62fe]"></div>}
                    </button>
                ))}
            </div>

            {activeSubTab === 'registry' && renderRegistry()}
            {activeSubTab === 'batch' && renderBatchExecution()}
            {activeSubTab === 'ledger' && (
                <div className="space-y-8 animate-fadeIn">
                    {/* Driver Selection / Search */}
                    <div className="bg-white border border-[#e0e0e0] p-4 flex justify-between items-center bg-[#f4f4f4]">
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d8d8d] w-4 h-4" />
                            <input className="w-full pl-10 pr-4 py-2.5 bg-white border-b-2 border-[#161616] text-xs focus:outline-none" defaultValue="Juan Dela Cruz (DRV-901)" />
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-[#8d8d8d] uppercase tracking-widest">Available Balance</p>
                                <p className="text-xl font-bold text-[#161616]">₱4,820.50</p>
                            </div>
                            <div className="h-10 w-[1px] bg-[#e0e0e0]"></div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-[#8d8d8d] uppercase tracking-widest">Processing (Hold)</p>
                                <p className="text-xl font-bold text-[#da1e28]">₱1,200.00</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Transactional Logic Ledger */}
                        <div className="md:col-span-2 bg-white border border-[#e0e0e0] overflow-hidden">
                            <div className="bg-[#161616] px-8 py-4 text-white text-[10px] font-bold uppercase tracking-widest flex justify-between">
                                <span>Logistics Activity Ledger</span>
                                <span className="text-[#8d8d8d]">Audit Year: 2023</span>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#f4f4f4] border-b border-[#e0e0e0] text-[9px] font-extrabold uppercase text-[#525252]">
                                        <th className="px-8 py-4">Timestamp</th>
                                        <th className="px-8 py-4">Transaction Type</th>
                                        <th className="px-8 py-4 text-right">Delta (Amount)</th>
                                        <th className="px-8 py-4 text-right">Running Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f4f4f4]">
                                    {[
                                        { date: 'May 10, 10:21 AM', type: 'Trip BK123 (Earnings)', amount: '+₱245.00', bal: '₱4,820.50', color: '#24a148' },
                                        { date: 'May 09, 04:15 PM', type: 'System Cashout PO-10021', amount: '-₱1,000.00', bal: '₱4,575.50', color: '#161616' },
                                        { date: 'May 09, 09:12 AM', type: 'Trip BK118 (Earnings)', amount: '+₱180.00', bal: '₱5,575.50', color: '#24a148' },
                                        { date: 'May 08, 08:30 PM', type: 'Safety Adjustment (Penalty)', amount: '-₱50.00', bal: '₱5,395.50', color: '#da1e28' },
                                    ].map((log, i) => (
                                        <tr key={i} className="hover:bg-[#fcfcfc] transition-colors">
                                            <td className="px-8 py-5 text-[10px] font-mono text-[#8d8d8d]">{log.date}</td>
                                            <td className="px-8 py-5 text-xs font-bold text-[#161616]">{log.type}</td>
                                            <td className="px-8 py-5 text-right font-mono font-bold" style={{ color: log.color }}>{log.amount}</td>
                                            <td className="px-8 py-5 text-right font-mono text-sm font-bold text-[#161616]">{log.bal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Driver Wallet Perspective (Simulation) */}
                        <div className="bg-[#161616] p-8 text-white space-y-10 border-l-8 border-l-[#0f62fe]">
                            <div className="space-y-2">
                                <div className="p-2 border-2 border-white/10 inline-block"><Smartphone className="w-5 h-5 text-[#0f62fe]" /></div>
                                <h4 className="text-[10px] font-bold uppercase tracking-[3px] text-[#8d8d8d]">Operator Hub // Wallet Simulation</h4>
                            </div>

                            <div className="p-8 bg-white/5 border border-white/10 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#8d8d8d]">Available to Cash Out</p>
                                    <p className="text-4xl font-light tracking-tighter">₱4,820.50</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="py-3 bg-[#0f62fe] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0353e9]">Cash Out</button>
                                    <button className="py-3 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/20">Earnings</button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[#8d8d8d]">Saved Settlement Protocols</p>
                                <div className="space-y-3">
                                    {[
                                        { name: 'BPI Bank ****1234', status: 'Default', icon: <Building2 className="w-3.5 h-3.5" /> },
                                        { name: 'GCash 0917****123', status: 'Verified', icon: <Smartphone className="w-3.5 h-3.5" /> },
                                    ].map((m, i) => (
                                        <div key={i} className="p-4 bg-white/5 border border-white/10 flex justify-between items-center hover:bg-white/10 cursor-pointer transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="text-[#0f62fe]">{m.icon}</div>
                                                <span className="text-[11px] font-bold group-hover:text-[#0f62fe] transition-colors">{m.name}</span>
                                            </div>
                                            <span className="text-[8px] font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5">{m.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <p className="text-[9px] font-bold text-[#da1e28] uppercase tracking-widest mb-2">Operational Integrity Warning</p>
                                <p className="text-[11px] text-[#8d8d8d] leading-relaxed">System holds ₱1,200.00 in escrow pending dispute resolution on Trip BK201.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Growth Marketing and Promotions Management View
function PromotionsManagementView() {
    const [activeSubTab, setActiveSubTab] = React.useState('dashboard');
    const [wizardStep, setWizardStep] = React.useState(1);

    const promos = [
        { name: 'SUMMER50', type: '% Off', disc: '50%', usage: '1,245', budget: '₱50K', status: 'Active' },
        { name: 'NEWUSER100', type: 'Fixed', disc: '₱100', usage: '876', budget: '₱20K', status: 'Active' },
        { name: 'CORP10', type: '% Off', disc: '10%', usage: '542', budget: '₱15K', status: 'Scheduled' },
    ];

    const renderDashboard = () => (
        <div className="space-y-8 animate-fadeIn">
            {/* Campaign Control Bar */}
            <div className="bg-white border border-[#e0e0e0] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d8d8d] w-4 h-4" />
                        <input className="w-full pl-10 pr-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-xs focus:outline-none focus:border-[#0f62fe]" placeholder="Search campaign or code..." />
                    </div>
                    <button className="p-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] hover:bg-[#e0e0e0] group">
                        <Filter className="w-4 h-4 text-[#161616] group-hover:text-[#0f62fe]" />
                    </button>
                </div>
                <button
                    onClick={() => setActiveSubTab('wizard')}
                    className="px-8 py-3 bg-[#0f62fe] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#0353e9] transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Create Promotion
                </button>
            </div>

            {/* Campaign Health Monitor */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-1 bg-[#e0e0e0] border border-[#e0e0e0]">
                {[
                    { label: 'Active Promotions', value: '12', icon: <Zap className="w-4 h-4" /> },
                    { label: 'Total Redemptions', value: '8.4K', icon: <History className="w-4 h-4" /> },
                    { label: 'Operation Spend', value: '₱245K', color: '#da1e28', icon: <DollarSign className="w-4 h-4" /> },
                    { label: 'Projected ROI', value: '2.4x', color: '#24a148', icon: <TrendingUp className="w-4 h-4" /> },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-8 group hover:bg-[#f4f4f4] transition-colors relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-[#f4f4f4] text-[#161616]" style={{ color: kpi.color }}>{kpi.icon}</div>
                        </div>
                        <p className="text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-1">{kpi.label}</p>
                        <p className="text-3xl font-light text-[#161616] tracking-tighter">{kpi.value}</p>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f62fe] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                    </div>
                ))}
            </div>

            {/* Promotion Ledger */}
            <div className="bg-white border border-[#e0e0e0] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest">
                            <th className="px-8 py-5">Campaign Identity</th>
                            <th className="px-8 py-5">Disc. Type</th>
                            <th className="px-8 py-5 text-right">Value Payload</th>
                            <th className="px-8 py-5 text-center">Unit Usage</th>
                            <th className="px-8 py-5 text-right">Budget Limit</th>
                            <th className="px-8 py-5 text-center">Current State</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f4f4f4]">
                        {promos.map((p, idx) => (
                            <tr key={idx} className="hover:bg-[#f4f4f4] transition-colors group">
                                <td className="px-8 py-6">
                                    <p className="font-bold text-sm text-[#161616]">{p.name}</p>
                                    <p className="text-[9px] text-[#8d8d8d] uppercase font-bold tracking-widest mt-0.5">Campaign Live</p>
                                </td>
                                <td className="px-8 py-6 text-sm text-[#525252] font-medium">{p.type}</td>
                                <td className="px-8 py-6 text-right font-mono font-bold text-[#161616]">{p.disc}</td>
                                <td className="px-8 py-6 text-center text-sm font-mono text-[#525252]">{p.usage}</td>
                                <td className="px-8 py-6 text-right font-mono text-[#161616]">{p.budget}</td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${p.status === 'Active' ? 'bg-[#defbe6] text-[#198038] border-[#24a148]' : 'bg-[#edf5ff] text-[#0f62fe] border-[#0f62fe]'
                                        }`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="text-[#0f62fe] text-[10px] font-bold uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100">Audit Perf.</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderWizard = () => (
        <div className="max-w-4xl space-y-10 animate-fadeIn">
            {/* Wizard Header / Stepper */}
            <div className="flex bg-[#161616] px-8 py-6 overflow-x-auto gap-12 border-l-8 border-l-[#0f62fe]">
                {[
                    { step: 1, label: 'Basic Intel' },
                    { step: 2, label: 'Discount Rules' },
                    { step: 3, label: 'Usage Limits' },
                    { step: 4, label: 'Targeting' },
                    { step: 5, label: 'Schedule' },
                    { step: 6, label: 'Review' },
                ].map((s) => (
                    <div key={s.step} className={`flex items-center gap-3 shrink-0 transition-opacity ${wizardStep === s.step ? 'opacity-100' : 'opacity-40'}`}>
                        <span className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold border ${wizardStep === s.step ? 'bg-[#0f62fe] border-[#0f62fe] text-white' : 'border-white text-white'}`}>{s.step}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-[#e0e0e0] p-10 space-y-12 min-h-[500px]">
                {wizardStep === 1 && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Promotion Name</label>
                                    <input className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] text-sm focus:outline-none focus:border-[#0f62fe]" placeholder="e.g., Summer Campaign 2023" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Voucher Code</label>
                                    <input className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] text-sm font-mono focus:outline-none focus:border-[#0f62fe]" placeholder="SUMMER50" />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Execution Logic (Select One)</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="p-4 border-2 border-[#0f62fe] bg-[#edf5ff] cursor-pointer flex items-center gap-4 group">
                                        <div className="w-4 h-4 border-2 border-[#0f62fe] flex items-center justify-center p-0.5"><div className="w-full h-full bg-[#0f62fe]"></div></div>
                                        <div>
                                            <p className="text-xs font-bold text-[#161616]">Voucher Code Required</p>
                                            <p className="text-[9px] text-[#0f62fe] font-bold uppercase tracking-widest mt-0.5">User must enter specific string</p>
                                        </div>
                                    </div>
                                    <div className="p-4 border border-[#e0e0e0] hover:border-[#0f62fe] cursor-pointer flex items-center gap-4 group">
                                        <div className="w-4 h-4 border border-[#8d8d8d]"></div>
                                        <div>
                                            <p className="text-xs font-bold text-[#161616]">Automated Application</p>
                                            <p className="text-[9px] text-[#8d8d8d] uppercase tracking-widest mt-0.5">Applied to all eligible rides</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {wizardStep === 2 && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-3 gap-8">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Discount Type</label>
                                <select className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] text-sm focus:outline-none focus:border-[#0f62fe]">
                                    <option>Percentage Off (%)</option>
                                    <option>Fixed Amount (₱)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Payload Value</label>
                                <input className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] text-sm font-mono focus:outline-none focus:border-[#0f62fe]" placeholder="50" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Maximum Cap (₱)</label>
                                <input className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] text-sm font-mono focus:outline-none focus:border-[#0f62fe]" placeholder="200" />
                            </div>
                        </div>
                        <div className="pt-4">
                            <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Minimum Fare Eligibility (₱)</label>
                            <input className="w-32 px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] text-sm font-mono focus:outline-none focus:border-[#0f62fe]" placeholder="150" />
                        </div>
                    </div>
                )}

                {wizardStep === 3 && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-10">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Total Campaign Cap</label>
                                <input className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] text-sm font-mono focus:outline-none focus:border-[#0f62fe]" placeholder="5000" />
                                <p className="text-[9px] text-[#8d8d8d] mt-2 italic">Max total redemptions for this campaign</p>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Per User Redemption</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <div className="w-4 h-4 border-2 border-[#0f62fe] rounded-full flex items-center justify-center p-0.5"><div className="w-full h-full bg-[#0f62fe] rounded-full"></div></div>
                                            <span className="text-xs font-bold text-[#161616]">Single Use</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer opacity-40">
                                            <div className="w-4 h-4 border border-[#8d8d8d] rounded-full"></div>
                                            <span className="text-xs font-bold text-[#161616]">Multiple</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Daily Burn Rate (Opt.)</label>
                                    <input className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] text-sm font-mono focus:outline-none focus:border-[#0f62fe]" placeholder="500" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {wizardStep === 4 && (
                    <div className="space-y-10 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-10">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-6">User Group Targeting</label>
                                <div className="space-y-3">
                                    {['New Transacting Users', 'Retained Riders', 'Corporate Enterprise Accounts'].map(g => (
                                        <label key={g} className="flex items-center gap-3 cursor-pointer group">
                                            <CheckSquare className="w-4 h-4 text-[#0f62fe]" />
                                            <span className="text-xs font-bold text-[#161616] group-hover:text-[#0f62fe]">{g}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-6">Logistics Tiers</label>
                                <div className="space-y-3">
                                    {['Economy Class', 'Premium Sedan', 'Bike Logistics'].map(t => (
                                        <label key={t} className="flex items-center gap-3 cursor-pointer group">
                                            <CheckSquare className="w-4 h-4 text-[#0f62fe]" />
                                            <span className="text-xs font-bold text-[#161616] group-hover:text-[#0f62fe]">{t}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-[#f4f4f4]">
                            <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Geographic Zone Isolation</label>
                            <select className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] text-sm focus:outline-none focus:border-[#0f62fe]">
                                <option>Select Cities / Zones (Global Default)</option>
                                <option>Makati Business District Only</option>
                                <option>Cebu Metropolitan Area</option>
                            </select>
                        </div>
                    </div>
                )}

                {wizardStep === 5 && (
                    <div className="space-y-10 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-10">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Activation Timeline</label>
                                <div className="grid grid-cols-1 gap-4">
                                    <input type="date" className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] text-sm font-mono focus:outline-none focus:border-[#0f62fe]" />
                                    <p className="text-center text-[10px] uppercase font-extrabold text-[#8d8d8d]">Until</p>
                                    <input type="date" className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] text-sm font-mono focus:outline-none focus:border-[#0f62fe]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Operational Time Window</label>
                                <div className="p-4 bg-[#f4f4f4] border-l-4 border-l-[#161616]">
                                    <p className="text-[9px] font-bold text-[#8d8d8d] uppercase tracking-widest mb-4">Daily Active range</p>
                                    <div className="flex items-center gap-4">
                                        <input className="w-20 text-center font-mono text-sm bg-white border-b border-[#161616]" defaultValue="06:00" />
                                        <span className="font-bold text-[#161616]">TO</span>
                                        <input className="w-20 text-center font-mono text-sm bg-white border-b border-[#161616]" defaultValue="22:00" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {wizardStep === 6 && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-[#edf5ff] p-10 border-l-8 border-l-[#0f62fe] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><Ticket className="w-32 h-32" /></div>
                            <h4 className="text-[12px] font-bold uppercase tracking-[4.5px] text-[#0f62fe] mb-8">Campaign Integrity Review</h4>
                            <div className="grid grid-cols-2 gap-x-16 gap-y-10 relative z-10">
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase font-bold text-[#525252] tracking-widest mb-1">Architecture</p>
                                    <p className="text-lg font-bold text-[#161616]">SUMMER50 // 50% Reduction</p>
                                    <p className="text-xs text-[#0f62fe] font-bold">MAX PAYLOAD CAP: ₱200</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase font-bold text-[#525252] tracking-widest mb-1">Targeting Payload</p>
                                    <p className="text-sm font-bold text-[#161616]">New Users • All Services • Makati Zone</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase font-bold text-[#525252] tracking-widest mb-1">Temporal Registry</p>
                                    <p className="text-sm font-bold text-[#161616]">May 01, 2023 — May 31, 2023</p>
                                    <p className="text-[10px] font-mono text-[#525252]">Active Window: 06:00 — 22:00 Daily</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase font-bold text-[#525252] tracking-widest mb-1">Consumption Limit</p>
                                    <p className="text-sm font-bold text-[#161616]">5,000 Total Redemptions</p>
                                    <p className="text-[10px] font-mono text-[#525252]">Policy: Single Use Per Identifier</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Wizard Navigation */}
                <div className="flex justify-between border-t border-[#f4f4f4] pt-8">
                    <button
                        onClick={() => wizardStep === 1 ? setActiveSubTab('dashboard') : setWizardStep(wizardStep - 1)}
                        className="px-8 py-3 bg-[#f4f4f4] text-[#161616] text-[10px] font-bold uppercase tracking-widest hover:bg-[#e0e0e0] transition-all"
                    >
                        {wizardStep === 1 ? 'Cancel Execution' : 'Back to Protocol'}
                    </button>
                    <button
                        onClick={() => wizardStep === 6 ? setActiveSubTab('dashboard') : setWizardStep(wizardStep + 1)}
                        className="px-8 py-3 bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#393939] transition-all flex items-center gap-3 shadow-lg"
                    >
                        {wizardStep === 6 ? 'Commit & Publish Campaign' : 'Validate & Next Step'}
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderVouchers = () => (
        <div className="space-y-8 animate-fadeIn">
            {/* Voucher Actions */}
            <div className="bg-white border border-[#e0e0e0] p-4 flex justify-between items-center bg-[#f4f4f4]">
                <div className="flex items-center gap-4">
                    <button className="px-6 py-2.5 bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#393939]">Generate Codes</button>
                    <button className="px-6 py-2.5 border border-[#161616] text-[#161616] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all">Import CSV</button>
                </div>
                <button className="p-3 hover:bg-[#e0e0e0] group transition-all">
                    <Download className="w-4 h-4 text-[#161616] group-hover:text-[#0f62fe]" />
                </button>
            </div>

            <div className="bg-white border border-[#e0e0e0] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest">
                            <th className="px-8 py-5">System Token (Code)</th>
                            <th className="px-8 py-5">Assigned Target</th>
                            <th className="px-8 py-5 text-center">Execution State</th>
                            <th className="px-8 py-5 text-center">Status</th>
                            <th className="px-8 py-5 text-right">Maturity (Expiry)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f4f4f4]">
                        {[
                            { code: 'ABC-7712-X', user: 'Maria Santos', used: 'Yes', status: 'Consumed', expiry: 'May 10' },
                            { code: 'ABC-7713-K', user: 'Pending Assignment', used: 'No', status: 'Active', expiry: 'May 20' },
                            { code: 'ABC-7714-L', user: 'John Doe', used: 'No', status: 'Active', expiry: 'May 20' },
                        ].map((v, i) => (
                            <tr key={i} className="hover:bg-[#f4f4f4] transition-colors">
                                <td className="px-8 py-6 font-mono text-xs font-bold text-[#161616]">{v.code}</td>
                                <td className="px-8 py-6 text-sm font-bold text-[#161616]">{v.user}</td>
                                <td className="px-8 py-6 text-center text-[10px] font-bold text-[#525252]">{v.used === 'Yes' ? 'CONSUMED' : 'UNTOUCHED'}</td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase ${v.status === 'Consumed' ? 'bg-[#f4f4f4] text-[#8d8d8d]' : 'bg-[#e0e0e0] text-[#161616]'}`}>{v.status}</span>
                                </td>
                                <td className="px-8 py-6 text-right font-mono text-xs text-[#8d8d8d]">{v.expiry}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-4 gap-1 bg-[#e0e0e0] border border-[#e0e0e0]">
                {[
                    { label: 'Net Redemptions', value: '14,204', icon: <Ticket className="w-4 h-4" /> },
                    { label: 'Revenue Variance Impact', value: '₱1.2M', icon: <Zap className="w-4 h-4" /> },
                    { label: 'Growth Burn Rate', value: '₱342K', color: '#da1e28', icon: <DollarSign className="w-4 h-4" /> },
                    { label: 'Conversion Velocity', value: '18.4%', color: '#24a148', icon: <TrendingUp className="w-4 h-4" /> },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-8 group overflow-hidden">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#f4f4f4]" style={{ color: kpi.color }}>{kpi.icon}</div>
                            <p className="text-[10px] uppercase font-bold text-[#8d8d8d] tracking-[2px]">{kpi.label}</p>
                        </div>
                        <p className="text-3xl font-light text-[#161616] tracking-tighter">{kpi.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="bg-white border border-[#e0e0e0] p-8">
                    <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-[#161616] mb-8">Redemption Temporal Projection</h4>
                    <div className="h-[200px] flex items-end gap-2 border-b border-[#e0e0e0]">
                        {[30, 45, 60, 40, 80, 55, 90, 75, 40].map((h, i) => (
                            <div key={i} className="flex-1 bg-[#0f62fe] hover:bg-[#0353e9] transition-all" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                    <p className="text-[9px] text-[#8d8d8d] uppercase font-bold mt-4 tracking-widest text-center">Operational Interval (Last 10 Days)</p>
                </div>
                <div className="bg-white border border-[#e0e0e0] p-8">
                    <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-[#161616] mb-8">Top Growth Drivers</h4>
                    <div className="space-y-6">
                        {[
                            { name: 'SUMMER50', share: '45%' },
                            { name: 'NEWUSER100', share: '32%' },
                            { name: 'CORPEXEC', share: '12%' },
                            { name: 'WEEKEND20', share: '11%' },
                        ].map((d, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold uppercase text-[#161616]">
                                    <span>{d.name}</span>
                                    <span>{d.share}</span>
                                </div>
                                <div className="w-full bg-[#f4f4f4] h-1.5">
                                    <div className="bg-[#0f62fe] h-full" style={{ width: d.share }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Module Navigation */}
            <div className="flex border-b border-[#e0e0e0]">
                {[
                    { id: 'dashboard', label: 'Promotion Ledger' },
                    { id: 'vouchers', label: 'Voucher Distribution' },
                    { id: 'analytics', label: 'ROI Analytics' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveSubTab(tab.id); setWizardStep(1); }}
                        className={`px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] transition-all relative ${activeSubTab === tab.id || (activeSubTab === 'wizard' && tab.id === 'dashboard') ? 'text-[#0f62fe]' : 'text-[#8d8d8d] hover:text-[#161616]'
                            }`}
                    >
                        {tab.label}
                        {(activeSubTab === tab.id || (activeSubTab === 'wizard' && tab.id === 'dashboard')) && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f62fe]"></div>}
                    </button>
                ))}
            </div>

            {activeSubTab === 'dashboard' && renderDashboard()}
            {activeSubTab === 'wizard' && renderWizard()}
            {activeSubTab === 'vouchers' && renderVouchers()}
            {activeSubTab === 'analytics' && renderAnalytics()}
        </div>
    );
}

// Corporate Billing and Enterprise Invoicing Component

// Corporate Billing and Enterprise Invoicing Component
function CorporateBillingView() {
    const [activeSubTab, setActiveSubTab] = React.useState('dashboard');
    const [selectedInvoice, setSelectedInvoice] = React.useState(null);

    const billingCycles = [
        { cycle: 'OCT-2023', company: 'TechCorp Solutions', trips: 124, amount: '₱145,200', status: 'Pending', due: 'Nov 05' },
        { cycle: 'OCT-2023', company: 'Global Logistics', trips: 87, amount: '₱92,450', status: 'Paid', due: 'Nov 07' },
        { cycle: 'SEP-2023', company: 'Nexus Retail', trips: 215, amount: '₱312,000', status: 'Overdue', due: 'Oct 05' },
    ];

    const invoiceData = {
        id: 'INV-1024-C001',
        company: 'TechCorp Solutions',
        period: 'Oct 01 - Oct 31, 2023',
        summary: { trips: 124, dist: '1,240 km', amount: '₱145,200' },
        trips: [
            { date: 'Oct 21', rider: 'James Wilson', pickup: 'Downtown Hub', dropoff: 'Tech Plaza', type: 'Premium', fare: '₱245' },
            { date: 'Oct 21', rider: 'Sarah Chen', pickup: 'Airport T3', dropoff: 'Global Tower', type: 'Executive', fare: '₱550' },
        ]
    };

    const renderDashboard = () => (
        <div className="space-y-8">
            {/* Search and Action Bar */}
            <div className="bg-white border border-[#e0e0e0] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d8d8d] w-4 h-4" />
                        <input className="w-full pl-10 pr-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-xs focus:outline-none focus:border-[#0f62fe]" placeholder="Filter by company..." />
                    </div>
                    <button className="p-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] hover:bg-[#e0e0e0]"><Filter className="w-4 h-4 text-[#161616]" /></button>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-6 py-3 bg-[#161616] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#393939] flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Export Ledger
                    </button>
                    <button className="flex-1 md:flex-none px-6 py-3 bg-[#0f62fe] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#0353e9] flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Generate Invoice
                    </button>
                </div>
            </div>

            {/* Financial KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-1 bg-[#e0e0e0] border border-[#e0e0e0]">
                {[
                    { label: 'Billable Trips', value: '426', icon: <History className="w-4 h-4" /> },
                    { label: 'Total Amount', value: '₱549.6K', icon: <DollarSign className="w-4 h-4" /> },
                    { label: 'Pending Clear', value: '₱145.2K', color: '#f1c21b', icon: <Clock className="w-4 h-4" /> },
                    { label: 'Secured Payments', value: '₱404.4K', color: '#24a148', icon: <CheckCircle className="w-4 h-4" /> },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-6 relative group overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-[#f4f4f4] text-[#161616]" style={{ color: kpi.color }}>{kpi.icon}</div>
                        </div>
                        <p className="text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-1">{kpi.label}</p>
                        <p className="text-2xl font-light text-[#161616] tracking-tighter">{kpi.value}</p>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f62fe] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                    </div>
                ))}
            </div>

            {/* Cycle Ledger */}
            <div className="bg-white border border-[#e0e0e0] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest">
                            <th className="px-8 py-5">Billing Cycle</th>
                            <th className="px-8 py-5">Company Entity</th>
                            <th className="px-8 py-5 text-center">Unit Trips</th>
                            <th className="px-8 py-5 text-right">Invoice Amount</th>
                            <th className="px-8 py-5 text-center">Payment State</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f4f4f4]">
                        {billingCycles.map((cycle, idx) => (
                            <tr key={idx} className="hover:bg-[#f4f4f4] transition-colors group">
                                <td className="px-8 py-6 font-mono text-xs font-bold text-[#161616]">{cycle.cycle}</td>
                                <td className="px-8 py-6 text-sm font-bold text-[#161616]">{cycle.company}</td>
                                <td className="px-8 py-6 text-center text-sm font-mono text-[#525252]">{cycle.trips}</td>
                                <td className="px-8 py-6 text-right font-mono font-bold text-[#161616]">{cycle.amount}</td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${cycle.status === 'Paid' ? 'bg-[#defbe6] text-[#198038] border-[#24a148]' :
                                            cycle.status === 'Overdue' ? 'bg-[#fff1f1] text-[#da1e28] border-[#da1e28]' : 'bg-[#fcf4d6] text-[#161616] border-[#f1c21b]'
                                        }`}>
                                        {cycle.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button
                                        onClick={() => { setSelectedInvoice(invoiceData); setActiveSubTab('details'); }}
                                        className="text-[#0f62fe] text-[10px] font-bold uppercase tracking-widest hover:underline"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderInvoiceDetails = () => (
        <div className="space-y-8 animate-fadeIn">
            {/* Invoice Header */}
            <div className="bg-[#161616] p-8 text-white flex justify-between items-start border-l-8 border-l-[#0f62fe]">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Receipt className="w-5 h-5 text-[#0f62fe]" />
                        <p className="text-[12px] font-bold uppercase tracking-[4px]">Invoice Ledger</p>
                    </div>
                    <h2 className="text-3xl font-light tracking-tighter">{invoiceData.id}</h2>
                    <div className="mt-6 flex gap-8">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Company Account</p>
                            <p className="text-sm font-bold">{invoiceData.company}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Billing Period</p>
                            <p className="text-sm font-bold">{invoiceData.period}</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <button className="w-full bg-[#0f62fe] text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#0353e9] flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button className="w-full border border-white/20 text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" /> Send to Enterprise
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Trip Breakdown */}
                <div className="col-span-8 bg-white border border-[#e0e0e0]">
                    <div className="p-6 border-b border-[#e0e0e0] flex justify-between items-center">
                        <h4 className="text-[11px] font-bold uppercase tracking-[2px]">Logistics Breakdown</h4>
                        <p className="text-[10px] font-mono text-[#8d8d8d]">{invoiceData.summary.trips} UNITS</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f4f4f4] text-[#525252] text-[10px] font-bold uppercase tracking-widest">
                                    <th className="px-6 py-4">Execution Date</th>
                                    <th className="px-6 py-4">Rider Identity</th>
                                    <th className="px-6 py-4">Logistics Path</th>
                                    <th className="px-6 py-4 text-right">Settled Fare</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f4f4f4]">
                                {invoiceData.trips.map((trip, i) => (
                                    <tr key={i} className="hover:bg-[#f4f4f4]/50 transition-colors">
                                        <td className="px-6 py-5 text-xs font-mono font-bold text-[#161616]">{trip.date}</td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-[#161616]">{trip.rider}</p>
                                            <p className="text-[9px] text-[#0f62fe] font-bold uppercase tracking-widest">{trip.type}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs text-[#525252] font-medium grow-0">{trip.pickup} → {trip.dropoff}</p>
                                        </td>
                                        <td className="px-6 py-5 text-right font-mono font-bold text-[#161616]">{trip.fare}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Financial Summary Pane */}
                <div className="col-span-4 space-y-6">
                    <div className="bg-[#f4f4f4] p-8 border-t-8 border-t-[#161616]">
                        <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-[#161616] mb-8">Summary of Charges</h4>
                        <div className="space-y-4 font-medium mb-10 pb-6 border-b border-[#e0e0e0]">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#525252]">Base Operational Cost</span>
                                <span className="font-mono text-[#161616]">₱142,000</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[#525252]">System Service Fee</span>
                                <span className="font-mono text-[#161616]">₱4,200</span>
                            </div>
                            <div className="flex justify-between text-sm text-[#da1e28]">
                                <span>Promotional Adjustments</span>
                                <span className="font-mono">-₱1,000</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <p className="text-[10px] uppercase font-bold text-[#8d8d8d] tracking-widest">Total Payable</p>
                            <p className="text-4xl font-light text-[#161616] tracking-tighter">{invoiceData.summary.amount}</p>
                        </div>
                    </div>
                    <button className="w-full py-4 bg-[#24a148] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#198038] transition-all">
                        Mark as Settled
                    </button>
                </div>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="max-w-4xl space-y-10 animate-fadeIn">
            <div className="bg-white border border-[#e0e0e0] p-8">
                <h4 className="text-[12px] font-bold uppercase tracking-[3px] text-[#161616] border-b border-[#f4f4f4] pb-6 mb-8 flex items-center gap-3">
                    <Settings className="w-5 h-5 text-[#0f62fe]" /> Billing Configuration
                </h4>
                <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Billing Frequency</label>
                            <select className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] text-sm focus:outline-none focus:border-[#0f62fe]">
                                <option>Monthly (Standard)</option>
                                <option>Semi-Monthly</option>
                                <option>Weekly (High Volume)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Payment Terms</label>
                            <select className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] text-sm focus:outline-none focus:border-[#0f62fe]">
                                <option>Net 30 Days</option>
                                <option>Net 15 Days</option>
                                <option>Net 7 Days</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="p-6 bg-[#edf5ff] border-l-4 border-l-[#0f62fe]">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0f62fe] mb-2">Automated Execution</p>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="w-10 h-5 bg-[#0f62fe] relative rounded-full">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                </div>
                                <span className="text-xs font-bold text-[#161616]">Enable Auto-Invoicing</span>
                            </label>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-3">Audit Recipient Registry</label>
                            <input className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] text-sm focus:outline-none focus:border-[#0f62fe]" placeholder="Separated by comma (billing@company.com)" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#161616] p-8 text-white">
                <h4 className="text-[12px] font-bold uppercase tracking-[3px] border-b border-white/10 pb-6 mb-8 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#f1c21b]" /> Enterprise Limit Controls
                </h4>
                <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-3">Monthly Operational Budget</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-[#0f62fe]">₱</span>
                                <input className="w-full pl-10 pr-4 py-3 bg-white/5 border-b-2 border-white/20 text-sm focus:outline-none focus:border-[#0f62fe] font-mono" defaultValue="500,000" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-3">Alert Threshold</label>
                            <input type="range" className="w-full bg-white/10 accent-[#0f62fe] h-1" />
                            <div className="flex justify-between text-[9px] font-mono mt-2 text-gray-500">
                                <span>50%</span><span>80% CRITICAL</span><span>100%</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center p-6 bg-white/5 border border-white/10">
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Usage Assessment</p>
                            <p className="text-4xl font-light tracking-tighter">72.4%</p>
                            <p className="text-[9px] font-mono mt-2 text-[#24a148]">UNDER LIMIT // SECURE</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Module Navigation */}
            <div className="flex border-b border-[#e0e0e0]">
                {[
                    { id: 'dashboard', label: 'Billing Dashboard' },
                    { id: 'settings', label: 'Corporate Configuration' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveSubTab(tab.id); setSelectedInvoice(null); }}
                        className={`px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] transition-all relative ${activeSubTab === tab.id ? 'text-[#0f62fe]' : 'text-[#8d8d8d] hover:text-[#161616]'
                            }`}
                    >
                        {tab.label}
                        {activeSubTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f62fe]"></div>}
                    </button>
                ))}
            </div>

            {activeSubTab === 'dashboard' && renderDashboard()}
            {activeSubTab === 'details' && renderInvoiceDetails()}
            {activeSubTab === 'settings' && renderSettings()}
        </div>
    );
}

// Admin SOS Command Center View
function SOSAlertsView() {
    const [activeIncidentId, setActiveIncidentId] = React.useState('BK12345');
    const [incidents] = React.useState([
        { id: 'BK12345', type: 'SOS', loc: 'Makati, Cebu', time: '2 mins ago', level: 'CRITICAL' },
        { id: 'BK12346', type: 'Risk', loc: 'Quezon, Manila', time: '5 mins ago', level: 'WARNING' },
    ]);

    const activeIncident = {
        id: 'BK12345',
        passenger: { name: 'Maria Santos', phone: '0917-234-5678' },
        driver: { name: 'Juan Dela Cruz', phone: '0918-987-6543' },
        vehicle: 'Toyota Vios • ABC1234',
        telemetry: { speed: '32 km/h', deviation: '18%', idle: '0 min' },
        logs: [
            { time: '2:14 PM', event: 'SOS Triggered (Silent Mode)' },
            { time: '2:15 PM', event: 'Driver decelerated to 32 km/h' },
            { time: '2:16 PM', event: 'Route deviation detected (>15%)' },
        ]
    };

    return (
        <div className="flex flex-col h-[calc(100vh-220px)] animate-fadeIn">
            {/* Emergency Header */}
            <div className="bg-[#da1e28] p-4 text-white flex justify-between items-center shadow-[0_4px_20px_rgba(218,30,40,0.3)] z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2"><Siren className="w-5 h-5 text-white" /></div>
                    <h1 className="text-sm font-bold uppercase tracking-[3.5px]">Live SOS Incident Command</h1>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                    <span>Operational Area: {activeIncident.id}</span>
                    <span className="px-3 py-1 bg-white/20">Protocol: ALPHA-RED</span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden bg-[#e0e0e0] gap-[1px]">

                {/* LEFT: Incident Triage List */}
                <div className="w-[350px] bg-white flex flex-col min-w-0">
                    <div className="p-4 bg-[#f4f4f4] border-b border-[#e0e0e0] flex items-center justify-between">
                        <h4 className="text-[10px] font-bold uppercase tracking-[2px] text-[#525252]">Active Emergencies</h4>
                        <GanttChartSquare className="w-4 h-4 text-[#da1e28]" />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {incidents.map(inc => (
                            <div
                                key={inc.id}
                                onClick={() => setActiveIncidentId(inc.id)}
                                className={`p-5 border-b border-[#f4f4f4] cursor-pointer transition-all ${activeIncidentId === inc.id ? 'bg-[#fff1f1] border-l-4 border-l-[#da1e28]' : 'hover:bg-[#f4f4f4]'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-bold text-sm text-[#161616]">{inc.id}</p>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 ${inc.level === 'CRITICAL' ? 'bg-[#da1e28] text-white' : 'bg-[#f1c21b] text-[#161616]'
                                        }`}>{inc.type}</span>
                                </div>
                                <p className="text-[10px] text-[#525252] font-medium leading-tight">{inc.loc}</p>
                                <p className="text-[9px] text-[#8d8d8d] font-mono mt-1">{inc.time}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CENTER: Tactical Map Environment */}
                <div className="flex-1 bg-[#161616] relative flex items-center justify-center min-w-0 overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#da1e28 1.5px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                    {/* Dynamic Signal Layer */}
                    <div className="relative w-full h-full p-20">
                        <svg className="w-full h-full opacity-60" viewBox="0 0 800 400">
                            {/* Standard Route */}
                            <path d="M 100 300 L 400 320 L 700 100" fill="none" stroke="#525252" strokeWidth="2" strokeDasharray="8 4" />
                            {/* Deviation Path */}
                            <path d="M 400 320 L 550 350 L 580 300" fill="none" stroke="#da1e28" strokeWidth="4" className="animate-pulse" />

                            <circle cx="100" cy="300" r="8" fill="#525252" />
                            <circle cx="700" cy="100" r="8" fill="#24a148" />
                            {/* Live Actor Markers */}
                            <circle cx="580" cy="300" r="10" fill="#da1e28" className="animate-ping opacity-30" />
                            <circle cx="580" cy="300" r="6" fill="#da1e28" />
                        </svg>

                        {/* Labels */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-[150px] translate-y-[100px] bg-[#161616] border border-[#da1e28] px-3 py-1.5 text-[9px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#da1e28] rounded-full animate-pulse"></div> Deviation Detected (18%)
                        </div>
                    </div>

                    <div className="absolute top-6 right-6 flex flex-col gap-2">
                        <button className="p-3 bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-white/10"><Layers className="w-4 h-4" /></button>
                        <button className="p-3 bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-white/10"><Maximize2 className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* RIGHT: Incident Detail & Command Console */}
                <div className="w-[420px] bg-white flex flex-col min-w-0">
                    <div className="p-4 bg-[#f4f4f4] border-b border-[#e0e0e0] flex items-center justify-between">
                        <h4 className="text-[10px] font-bold uppercase tracking-[2px] text-[#525252]">Command Panel</h4>
                        <ShieldCheck className="w-4 h-4 text-[#0f62fe]" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Emergency Status */}
                        <div className="border-4 border-[#da1e28] p-4 text-center">
                            <p className="text-[10px] text-[#da1e28] font-bold uppercase tracking-[4px] animate-pulse">INCID_STATUS // SOS_ACTIVE</p>
                        </div>

                        {/* Stakeholder Details */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[9px] text-[#8d8d8d] font-bold uppercase tracking-widest mb-2">Subject (Passenger)</p>
                                <p className="text-sm font-bold text-[#161616] mb-0.5">{activeIncident.passenger.name}</p>
                                <p className="text-xs font-mono text-[#0f62fe]">{activeIncident.passenger.phone}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-[#8d8d8d] font-bold uppercase tracking-widest mb-2">Actor (Driver)</p>
                                <p className="text-sm font-bold text-[#161616] mb-0.5">{activeIncident.driver.name}</p>
                                <p className="text-xs font-mono text-[#0f62fe]">{activeIncident.driver.phone}</p>
                            </div>
                            <div className="col-span-2 p-3 bg-[#f4f4f4] border-l-4 border-l-[#161616]">
                                <p className="text-[9px] text-[#525252] font-bold uppercase tracking-widest mb-1">Unit Logistics</p>
                                <p className="text-sm font-bold text-[#161616]">{activeIncident.vehicle}</p>
                            </div>
                        </div>

                        {/* Live Telemetry Data */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#161616] flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-[#0f62fe]" /> Live Telemetry
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.entries(activeIncident.telemetry).map(([key, val]) => (
                                    <div key={key} className="bg-[#161616] p-3 text-white">
                                        <p className="text-[8px] uppercase font-bold text-gray-500 tracking-widest mb-1">{key}</p>
                                        <p className="text-sm font-bold font-mono">{val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tactical Actions */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#161616]">Deployment Actions</p>
                            <div className="grid grid-cols-1 gap-2">
                                <button className="w-full py-3.5 bg-[#da1e28] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#b91923] flex items-center justify-center gap-3">
                                    <ShieldAlert className="w-4 h-4" /> Dispatch Authorities
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="py-3 border border-[#161616] bg-white text-[#161616] text-[9px] font-bold uppercase tracking-widest hover:bg-[#f4f4f4] flex items-center justify-center gap-2">
                                        <XCircle className="w-3.5 h-3.5" /> Terminate Trip
                                    </button>
                                    <button className="py-3 border border-[#161616] bg-white text-[#161616] text-[9px] font-bold uppercase tracking-widest hover:bg-[#f4f4f4] flex items-center justify-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5" /> Chat Both
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Incident History Log */}
                        <div className="space-y-4 pt-4 border-t border-[#f4f4f4]">
                            <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#161616] flex items-center gap-2">
                                <History className="w-3.5 h-3.5 text-[#8d8d8d]" /> Log Registry
                            </p>
                            <div className="space-y-3">
                                {activeIncident.logs.map((log, i) => (
                                    <div key={i} className="flex gap-4 items-start group">
                                        <span className="text-[10px] font-mono text-[#8d8d8d] w-14 shrink-0 pt-0.5">{log.time}</span>
                                        <div className="w-[1px] h-auto self-stretch bg-[#e0e0e0] group-last:bg-transparent"></div>
                                        <p className="text-[11px] text-[#525252] font-medium leading-relaxed">{log.event}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Geofencing and Dynamic Pricing Management View

// Intelligence and Advanced Analytics View
function IntelligenceReportsView() {
    const [dateRange, setDateRange] = React.useState({ start: '2023-10-01', end: '2023-10-21' });

    const stats = [
        { label: 'Cumulative Revenue', value: '₱1,245,000', change: '+15.2%', positive: true, icon: <DollarSign className="w-5 h-5" /> },
        { label: 'Completed Trips', value: '12,458', change: '+12.6%', positive: true, icon: <Activity className="w-5 h-5" /> },
        { label: 'Active Operators', value: '256', change: '+8.6%', positive: true, icon: <Car className="w-5 h-5" /> },
        { label: 'Velocity Growth', value: '24.8%', change: '+3.1%', positive: true, icon: <TrendingUp className="w-5 h-5" /> },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Analytics Toolbar */}
            <div className="bg-white border border-[#e0e0e0] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f4f4f4] border-b-2 border-[#8d8d8d]">
                        <Calendar className="w-4 h-4 text-[#525252]" />
                        <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="bg-transparent text-xs font-bold uppercase focus:outline-none" />
                        <span className="text-[#8d8d8d] text-xs">TO</span>
                        <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="bg-transparent text-xs font-bold uppercase focus:outline-none" />
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-6 py-3 bg-[#161616] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#393939] transition-all flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Export Datasets
                    </button>
                    <button className="p-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] hover:bg-[#e0e0e0] transition-all">
                        <Settings className="w-4 h-4 text-[#161616]" />
                    </button>
                </div>
            </div>

            {/* Primary KPI Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 bg-[#e0e0e0] border border-[#e0e0e0]">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 group hover:bg-[#f4f4f4] transition-colors relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-[#f4f4f4] text-[#0f62fe]">{stat.icon}</div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.positive ? 'bg-[#defbe6] text-[#198038]' : 'bg-[#fff1f1] text-[#da1e28]'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-[10px] uppercase font-bold text-[#525252] tracking-[2px] mb-1">{stat.label}</p>
                        <p className="text-3xl font-light text-[#161616] tracking-tighter">{stat.value}</p>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f62fe] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                    </div>
                ))}
            </div>

            {/* Analytics Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Revenue Trend - Line Chart */}
                <div className="lg:col-span-8 bg-white border border-[#e0e0e0] p-8">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h4 className="text-[12px] font-bold uppercase tracking-[2.5px] text-[#161616]">Revenue Velocity Trend</h4>
                            <p className="text-[10px] text-[#8d8d8d] font-mono mt-0.5">TIMELINE: LAST 21 OPERATIONAL DAYS</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#0f62fe]"></div>
                                <span className="text-[9px] font-bold uppercase text-[#525252]">Projected</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-[#0f62fe]"></div>
                                <span className="text-[9px] font-bold uppercase text-[#525252]">Actual</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full relative group">
                        <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                            {/* Grid Lines */}
                            {[0, 1, 2, 3, 4].map(i => (
                                <line key={i} x1="0" y1={i * 75} x2="800" y2={i * 75} stroke="#f4f4f4" strokeWidth="1" />
                            ))}

                            {/* Data Path */}
                            <path
                                d="M 0 250 L 100 200 L 200 220 L 300 150 L 400 180 L 500 100 L 600 120 L 700 80 L 800 60"
                                fill="none"
                                stroke="#0f62fe"
                                strokeWidth="3"
                                className="animate-draw"
                                strokeDasharray="1000"
                                strokeDashoffset="1000"
                            />

                            {/* Pulse Point */}
                            <circle cx="800" cy="60" r="6" fill="#0f62fe" className="animate-pulse" />
                        </svg>

                        {/* Technical Axes */}
                        <div className="absolute left-0 bottom-0 top-0 flex flex-col justify-between text-[9px] font-mono text-[#8d8d8d] pr-4 border-r border-[#f4f4f4]">
                            <span>1.5M</span><span>1.0M</span><span>500K</span><span>0.0</span>
                        </div>
                    </div>
                </div>

                {/* Distribution - Pie Chart */}
                <div className="lg:col-span-4 bg-white border border-[#e0e0e0] p-8">
                    <h4 className="text-[12px] font-bold uppercase tracking-[2.5px] text-[#161616] mb-10 text-center">Service Distribution</h4>
                    <div className="relative flex justify-center mb-10">
                        <svg className="w-48 h-48 -rotate-90">
                            <circle cx="96" cy="96" r="80" fill="none" stroke="#f4f4f4" strokeWidth="24" />
                            <circle cx="96" cy="96" r="80" fill="none" stroke="#0f62fe" strokeWidth="24" strokeDasharray="300 502" />
                            <circle cx="96" cy="96" r="80" fill="none" stroke="#24a148" strokeWidth="24" strokeDasharray="150 502" strokeDashoffset="-300" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-[10px] font-bold text-[#525252] uppercase">Core Units</p>
                            <p className="text-xl font-bold text-[#161616]">100%</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[
                            { label: 'Booking Units', val: '64%', color: '#0f62fe' },
                            { label: 'Corporate Accounts', val: '22%', color: '#24a148' },
                            { label: 'On-Demand', val: '14%', color: '#f4f4f4' }
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between p-3 bg-[#f4f4f4]">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-[10px] font-bold uppercase text-[#525252]">{item.label}</span>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-[#161616]">{item.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Volume - Bar Chart */}
                <div className="lg:col-span-12 bg-[#161616] p-8 text-white">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-[#0f62fe]" />
                            <h4 className="text-[12px] font-bold uppercase tracking-[2.5px]">Daily Operational Volume</h4>
                        </div>
                        <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Aggregated // Secure Transmission</p>
                    </div>

                    <div className="flex items-end justify-between h-48 gap-2">
                        {[60, 45, 80, 55, 95, 70, 40, 85, 60, 75, 90, 50, 65, 85, 100].map((h, i) => (
                            <div key={i} className="flex-1 group relative">
                                <div
                                    className="bg-[#0f62fe] transition-all duration-700 hover:bg-[#defbe6]"
                                    style={{ height: `${h}%` }}
                                ></div>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-[#161616] text-[9px] font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-all uppercase whitespace-nowrap">
                                    {h * 15} TRIPS
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 text-[9px] font-mono text-gray-500 uppercase">
                        <span>01 OCT</span><span>07 OCT</span><span>14 OCT</span><span>21 OCT</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Support Tickets and Dispute Management Component
function SupportDisputeView() {
    const [activeSubTab, setActiveSubTab] = React.useState('open');
    const [tickets] = React.useState([
        { id: 'T123', user: 'Maria Santos', issue: 'Payment Processing Failure', priority: 'High', status: 'Open', date: '5 mins ago' },
        { id: 'T124', user: 'Juan Luna', issue: 'Incorrect Fare Calculation', priority: 'Medium', status: 'In Progress', date: '2 hours ago' },
        { id: 'T125', user: 'Elena Reyes', issue: 'App Connectivity Issues', priority: 'Low', status: 'Open', date: '1 day ago' },
        { id: 'T126', user: 'Roberto Gomez', issue: 'Account Suspension Appeal', priority: 'High', status: 'Closed', date: '3 days ago' },
    ]);

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Ticket Status Tabs */}
            <div className="flex border-b border-[#e0e0e0]">
                {['open', 'in progress', 'closed'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={`px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] transition-all relative ${activeSubTab === tab ? 'text-[#0f62fe]' : 'text-[#8d8d8d] hover:text-[#161616]'
                            }`}
                    >
                        {tab}
                        {activeSubTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f62fe]"></div>}
                    </button>
                ))}
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#161616] p-6 text-white border-l-4 border-l-[#da1e28]">
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-2">High Priority Escalations</p>
                    <p className="text-3xl font-light">08</p>
                </div>
                <div className="bg-white p-6 border border-[#e0e0e0] border-l-4 border-l-[#0f62fe]">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#525252] mb-2">Average Response Time</p>
                    <p className="text-3xl font-light text-[#161616]">12m 45s</p>
                </div>
                <div className="bg-white p-6 border border-[#e0e0e0] border-l-4 border-l-[#24a148]">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#525252] mb-2">Resolved (24h)</p>
                    <p className="text-3xl font-light text-[#161616]">142</p>
                </div>
            </div>

            {/* Ticket Queue Ledger */}
            <div className="bg-white border border-[#e0e0e0] overflow-hidden">
                <div className="p-6 border-b border-[#e0e0e0] flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <LifeBuoy className="w-5 h-5 text-[#0f62fe]" />
                        <h4 className="text-[12px] font-bold uppercase tracking-[2px] text-[#161616]">Support Operations</h4>
                    </div>
                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d8d8d] w-4 h-4" />
                        <input className="w-full pl-10 pr-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-sm focus:outline-none focus:border-[#0f62fe] transition-all" placeholder="Search ticket ID, user or issue..." />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest">
                                <th className="px-8 py-5">Ticket ID</th>
                                <th className="px-8 py-5">End User Entity</th>
                                <th className="px-8 py-5">Incident Description</th>
                                <th className="px-8 py-5 text-center">Urgency Tier</th>
                                <th className="px-8 py-5 text-center">Current State</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f4f4f4]">
                            {tickets.map((t) => (activeSubTab === 'open' ? (t.status === 'Open') : (activeSubTab === 'in progress' ? (t.status === 'In Progress') : (t.status === 'Closed'))) && (
                                <tr key={t.id} className="hover:bg-[#f4f4f4] transition-colors group">
                                    <td className="px-8 py-6 font-mono text-sm font-bold text-[#0f62fe]">{t.id}</td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-[#161616]">{t.user}</p>
                                        <p className="text-[10px] text-[#8d8d8d] uppercase tracking-wider font-medium">Verified Account</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm text-[#161616] font-medium">{t.issue}</p>
                                        <p className="text-[10px] text-[#8d8d8d] font-mono mt-1">{t.date}</p>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest ${t.priority === 'High' ? 'text-[#da1e28]' : t.priority === 'Medium' ? 'text-[#f1c21b]' : 'text-[#8d8d8d]'
                                            }`}>
                                            <span className="w-2 h-2 rounded-full" style={{
                                                backgroundColor: t.priority === 'High' ? '#da1e28' : t.priority === 'Medium' ? '#f1c21b' : '#8d8d8d'
                                            }}></span>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${t.status === 'Open' ? 'bg-[#defbe6] text-[#198038] border-[#24a148]' :
                                                t.status === 'In Progress' ? 'bg-[#edf5ff] text-[#0f62fe] border-[#0f62fe]' : 'bg-[#f4f4f4] text-[#8d8d8d] border-[#e0e0e0]'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="text-[#0f62fe] text-[10px] font-bold uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 justify-end">
                                            <MessagesSquare className="w-3 h-3" /> Resolve Incident
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Driver Document Verification Component
function DriverVerificationView() {
    const [verifications] = React.useState([
        { id: 1, name: 'Mark Anthony', docs: ['License', 'NBI', 'OR/CR'], submitted: '10 mins ago', status: 'Pending' },
        { id: 2, name: 'Sarah Miller', docs: ['License', 'NBI'], submitted: '2 hours ago', status: 'Pending' },
        { id: 3, name: 'David Wilson', docs: ['License', 'Medical'], submitted: '5 hours ago', status: 'In Review' },
    ]);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header Signal */}
            <div className="bg-[#161616] p-6 text-white flex justify-between items-center border-l-4 border-l-[#f1c21b]">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#393939] flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#f1c21b]" />
                    </div>
                    <div>
                        <h4 className="text-[12px] font-bold uppercase tracking-[2px]">Compliance Queue</h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">Pending Approvals: {verifications.length}</p>
                    </div>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest border border-white/20 px-4 py-2 hover:bg-white/10 transition-all">Audit Policies</button>
            </div>

            {/* Verification Ledger */}
            <div className="bg-white border border-[#e0e0e0] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f4f4f4] border-b border-[#e0e0e0] uppercase text-[10px] font-bold tracking-widest text-[#525252]">
                                <th className="px-8 py-4">Verification Entity</th>
                                <th className="px-8 py-4">Documentation Payload</th>
                                <th className="px-8 py-4 text-center">Submission Delta</th>
                                <th className="px-8 py-4 text-center">Compliance Status</th>
                                <th className="px-8 py-4 text-right">Verification Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f4f4f4]">
                            {verifications.map((v) => (
                                <tr key={v.id} className="hover:bg-[#f4f4f4]/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#edf5ff] flex items-center justify-center text-[#0f62fe] font-bold border border-[#0f62fe]/10">
                                                {v.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#161616]">{v.name}</p>
                                                <p className="text-[10px] font-mono text-[#8d8d8d]">ID: VR-00{v.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-2">
                                            {v.docs.map((doc, idx) => (
                                                <div key={idx} className="group/doc relative cursor-pointer">
                                                    <div className="bg-white p-2 border border-[#e0e0e0] hover:border-[#0f62fe] transition-all">
                                                        <FileText className="w-4 h-4 text-[#525252] group-hover/doc:text-[#0f62fe]" />
                                                    </div>
                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#161616] text-white text-[9px] px-2 py-1 uppercase opacity-0 group-hover/doc:opacity-100 transition-all whitespace-nowrap z-10">{doc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center text-[11px] font-mono text-[#525252]">{v.submitted}</td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="bg-[#fcf4d6] text-[#161616] border border-[#f1c21b] px-3 py-1 text-[9px] font-bold uppercase tracking-widest">
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 bg-[#24a148] text-white hover:bg-[#198038] transition-all" title="Approve">
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 bg-[#da1e28] text-white hover:bg-[#fa4d56] transition-all" title="Reject">
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 border border-[#e0e0e0] text-[#161616] hover:bg-[#f4f4f4] transition-all" title="Full Review">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Driver Fleet Management Component
function DriverManagerView() {
    const [activeSubTab, setActiveSubTab] = React.useState('all');
    const [drivers] = React.useState([
        { id: 1, name: 'Juan Dela Cruz', vehicle: 'Toyota Vios - GAZ 1234', rating: '4.9', trips: '128', status: 'Active' },
        { id: 2, name: 'Mark Anthony', vehicle: 'Mitsubishi Mirage - ABC 5678', rating: '4.6', trips: '87', status: 'Pending' },
        { id: 3, name: 'Ricardo Ramos', vehicle: 'Honda Civic - XYZ 9012', rating: '4.8', trips: '215', status: 'Approved' },
        { id: 4, name: 'Antonio Solis', vehicle: 'Toyota Avanza - LMN 3456', rating: '3.2', trips: '42', status: 'Suspended' },
    ]);

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Fleet Filter Tabs */}
            <div className="flex border-b border-[#e0e0e0]">
                {['all', 'pending', 'approved', 'suspended'].map(tab => (activeSubTab === tab && <div key={tab} className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f62fe]"></div>,
                    <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={`px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] transition-all relative ${activeSubTab === tab ? 'text-[#0f62fe]' : 'text-[#8d8d8d] hover:text-[#161616]'
                            }`}
                    >
                        {tab}
                        {activeSubTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f62fe]"></div>}
                    </button>
                ))}
            </div>

            {/* Action and Search Strip */}
            <div className="bg-white border border-[#e0e0e0] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2">
                    <button className="bg-[#0f62fe] text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#0353e9] transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Register Driver
                    </button>
                </div>
                <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d8d8d] w-4 h-4" />
                    <input className="w-full pl-10 pr-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-sm focus:outline-none focus:border-[#0f62fe] transition-all" placeholder="Search driver name, vehicle ID or status..." />
                </div>
            </div>

            {/* Driver Ledger Area */}
            <div className="bg-white border border-[#e0e0e0] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest">
                                <th className="px-8 py-5">Operator Identity</th>
                                <th className="px-8 py-5">Vehicle Logistics</th>
                                <th className="px-8 py-5 text-center">Efficiency Rating</th>
                                <th className="px-8 py-5 text-center">Total Trips</th>
                                <th className="px-8 py-5 text-center">Verification Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f4f4f4]">
                            {drivers.map((driver) => (activeSubTab === 'all' || activeSubTab === driver.status.toLowerCase()) && (
                                <tr key={driver.id} className="hover:bg-[#f4f4f4] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#edf5ff] border border-[#0f62fe]/10 flex items-center justify-center text-[#0f62fe] font-bold">
                                                {driver.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#161616] text-sm leading-tight">{driver.name}</p>
                                                <p className="text-[10px] text-[#8d8d8d] font-mono mt-0.5">UID: DRV-00{driver.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Car className="w-3 h-3 text-[#525252]" />
                                            <span className="text-sm text-[#161616] font-medium">{driver.vehicle}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Star className="w-3 h-3 text-[#f1c21b] fill-[#f1c21b]" />
                                            <span className="text-sm font-bold text-[#161616] font-mono">{driver.rating}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center text-sm font-bold text-[#525252] font-mono">{driver.trips}</td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${driver.status === 'Active' || driver.status === 'Approved' ? 'bg-[#defbe6] text-[#198038] border-[#24a148]' :
                                                driver.status === 'Pending' ? 'bg-[#fcf4d6] text-[#161616] border-[#f1c21b]' : 'bg-[#fff1f1] text-[#da1e28] border-[#da1e28]'
                                            }`}>
                                            {driver.status === 'Active' || driver.status === 'Approved' ? '✔ ' : driver.status === 'Pending' ? '⚠ ' : '✖ '}
                                            {driver.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="text-[#0f62fe] text-[10px] font-bold uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100 transition-all">
                                            Audit Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Payments and Financial Management Component
function PaymentsManagementView() {
    const [activeSubTab, setActiveSubTab] = React.useState('transactions');
    const [transactions] = React.useState([
        { id: 'TX123', type: 'Payment', user: 'Maria Santos', amount: '₱245.00', status: 'Success', date: 'Oct 21, 2023' },
        { id: 'TX124', type: 'Refund', user: 'Pedro Dela Cruz', amount: '₱100.00', status: 'Pending', date: 'Oct 21, 2023' },
        { id: 'TX125', type: 'Payment', user: 'Juan Luna', amount: '₱550.00', status: 'Success', date: 'Oct 20, 2023' },
        { id: 'TX126', type: 'Payment', user: 'Elena Reyes', amount: '₱1,200.00', status: 'Failed', date: 'Oct 20, 2023' },
    ]);

    const kpis = [
        { label: 'Total Revenue', value: '₱1.2M', change: '+12.5%', icon: <DollarSign className="w-5 h-5" />, color: '#0f62fe' },
        { label: 'Total Payouts', value: '₱450K', change: '+8.2%', icon: <Activity className="w-5 h-5" />, color: '#161616' },
        { label: 'Pending Clear', value: '₱85K', valueRaw: 85, icon: <Clock className="w-5 h-5" />, color: '#f1c21b' },
        { label: 'Failed Trans.', value: '12', valueRaw: 12, icon: <AlertCircle className="w-5 h-5" />, color: '#da1e28' },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Financial Tabs */}
            <div className="flex border-b border-[#e0e0e0]">
                {['transactions', 'payouts', 'refunds'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={`px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] transition-all relative ${activeSubTab === tab ? 'text-[#0f62fe]' : 'text-[#8d8d8d] hover:text-[#161616]'
                            }`}
                    >
                        {tab}
                        {activeSubTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f62fe]"></div>}
                    </button>
                ))}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 bg-[#e0e0e0] border border-[#e0e0e0]">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-white p-8 group hover:bg-[#f4f4f4] transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-[#f4f4f4] text-[#161616]" style={{ color: kpi.color }}>{kpi.icon}</div>
                            {kpi.change && <span className="text-[10px] font-bold text-[#24a148]">{kpi.change}</span>}
                        </div>
                        <p className="text-[10px] uppercase font-bold text-[#525252] tracking-widest mb-1">{kpi.label}</p>
                        <p className="text-3xl font-light text-[#161616] tracking-tighter">{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Transactions Table */}
            <div className="bg-white border border-[#e0e0e0] overflow-hidden">
                <div className="p-6 border-b border-[#e0e0e0] flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d8d8d] w-4 h-4" />
                        <input className="w-full pl-10 pr-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-sm focus:outline-none focus:border-[#0f62fe] transition-all" placeholder="Search reference, user, or amount..." />
                    </div>
                    <button className="bg-[#161616] text-white px-8 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#393939] transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" /> Generate Ledger
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest">
                                <th className="px-8 py-5">Reference ID</th>
                                <th className="px-8 py-5">Type / Gateway</th>
                                <th className="px-8 py-5">Account User</th>
                                <th className="px-8 py-5 text-right">Settled Amount</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-right">Execution Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f4f4f4]">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-[#f4f4f4] transition-colors group">
                                    <td className="px-8 py-6 font-mono text-sm font-bold text-[#161616]">{tx.id}</td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-medium text-[#161616]">{tx.type}</p>
                                        <p className="text-[9px] text-[#0f62fe] font-bold uppercase tracking-widest">Digital Transfer</p>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-[#525252] font-medium">{tx.user}</td>
                                    <td className="px-8 py-6 text-right font-mono font-bold text-[#161616]">{tx.amount}</td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${tx.status === 'Success' ? 'bg-[#defbe6] text-[#198038] border-[#24a148]' :
                                                tx.status === 'Pending' ? 'bg-[#fcf4d6] text-[#161616] border-[#f1c21b]' : 'bg-[#fff1f1] text-[#da1e28] border-[#da1e28]'
                                            }`}>
                                            {tx.status === 'Success' ? '✔ ' : tx.status === 'Pending' ? '⚠ ' : '✖ '}
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right text-xs text-[#8d8d8d] font-medium">{tx.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Corporate Clients View Specialist Component
function CorporateClientsView() {
    const [clients, setClients] = React.useState([
        { id: 1, company: 'TechCorp Solutions', contact: 'James Wilson', bookings: '1,245', spend: '₱245,000', status: 'Active' },
        { id: 2, company: 'GlobalMkt Group', contact: 'Sarah Jenkins', bookings: '876', spend: '₱178,500', status: 'Active' },
        { id: 3, company: 'Apex Logistics', contact: 'Michael Chen', bookings: '432', spend: '₱92,400', status: 'Pending' },
        { id: 4, company: 'Horizon Dynamics', contact: 'Emma Stone', bookings: '2,156', spend: '₱432,000', status: 'Active' },
    ]);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Top Action Bar */}
            <div className="bg-white border border-[#e0e0e0] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2">
                    <button className="bg-[#0f62fe] text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#0353e9] transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Client
                    </button>
                    <button className="bg-white border border-[#e0e0e0] text-[#161616] px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#f4f4f4] transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                </div>

                <div className="flex flex-1 md:justify-end gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d8d8d] w-4 h-4" />
                        <input className="w-full pl-10 pr-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-sm focus:outline-none focus:border-[#0f62fe] transition-all" placeholder="Search companies..." />
                    </div>
                    <button className="p-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] hover:bg-[#e0e0e0] transition-all">
                        <Filter className="w-4 h-4 text-[#161616]" />
                    </button>
                </div>
            </div>

            {/* Client Table Area */}
            <div className="bg-white border border-[#e0e0e0] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#161616] text-white uppercase tracking-widest text-[10px] font-bold">
                                <th className="px-8 py-5">Company Entity</th>
                                <th className="px-8 py-5">Primary Contact</th>
                                <th className="px-8 py-5 text-right">Bookings</th>
                                <th className="px-8 py-5 text-right">Total Spend</th>
                                <th className="px-8 py-5 text-center">Security Status</th>
                                <th className="px-8 py-5 text-right">Access</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f4f4f4]">
                            {clients.map((client) => (
                                <tr key={client.id} className="hover:bg-[#f4f4f4] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#edf5ff] flex items-center justify-center text-[#0f62fe] border border-[#0f62fe]/10">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#161616] text-sm leading-tight">{client.company}</p>
                                                <p className="text-[10px] text-[#8d8d8d] font-mono mt-0.5">ID: ENT-00{client.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-[#161616] font-medium text-sm">{client.contact}</p>
                                        <p className="text-[10px] text-[#525252] uppercase tracking-wider font-bold">Certified Decision Maker</p>
                                    </td>
                                    <td className="px-8 py-6 text-right font-mono text-[#161616] font-bold">{client.bookings}</td>
                                    <td className="px-8 py-6 text-right font-mono text-[#161616] font-bold">{client.spend}</td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${client.status === 'Active' ? 'bg-[#defbe6] text-[#198038] border-[#24a148]' : 'bg-[#fcf4d6] text-[#161616] border-[#f1c21b]'
                                            }`}>
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="text-[#0f62fe] text-[10px] font-bold uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100 transition-all">
                                            Manage Account
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Trip Monitoring Detailed View
function TripMonitoringView() {
    const trips = [
        { id: 'BK123', status: 'on-trip', risk: 'low', rider: 'Jane Cooper', driver: 'Robert Fox', vehicle: 'Toyota Vios - GAZ 1234', battery: '85%', speed: '45 km/h', eta: '12 mins', start: 'Downtown Hub', end: 'Silicon Valley Office' },
        { id: 'BK124', status: 'delayed', risk: 'medium', rider: 'Arlene McCoy', driver: 'Cody Fisher', vehicle: 'Mitsubishi Mirage - ABC 5678', battery: '42%', speed: '0 km/h', eta: 'Delayed', start: 'City Hospital', end: 'Grand Plaza' },
        { id: 'BK125', status: 'sos', risk: 'high', rider: 'Devon Lane', driver: 'Jane Smith', vehicle: 'Honda Civic - SOS 911', battery: '12%', speed: '82 km/h', eta: 'N/A', start: 'East Side Market', end: 'Unknown' },
    ];

    const [activeTrip, setActiveTrip] = React.useState(trips[0]);
    const mapRef = React.useRef(null);

    React.useEffect(() => {
        if (typeof L === 'undefined') return;

        // Clean up existing map
        if (mapRef.current) {
            mapRef.current.remove();
        }

        const map = L.map('trip-map', {
            center: [14.5995, 120.9842],
            zoom: 13,
            zoomControl: false,
            attributionControl: false
        });

        // Light Mode Tiles (Standard CartoDB Positron)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20
        }).addTo(map);

        // Custom Icon (Blue Accent)
        const customIcon = L.divIcon({
            html: `
        <div class="relative">
          <div class="absolute -inset-4 border border-[#0f62fe] rounded-full animate-ping opacity-20"></div>
          <div class="bg-white p-2 border-2 border-[#0f62fe] shadow-xl">
             <div class="text-[#0f62fe] transform rotate-45">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
             </div>
          </div>
        </div>
      `,
            className: 'custom-leaflet-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        // Add Vehicle Marker
        L.marker([14.5995, 120.9842], { icon: customIcon }).addTo(map);

        // Add Start/End Markers
        const startIcon = L.divIcon({
            html: `<div class="w-3 h-3 bg-[#8d8d8d] border-2 border-white rounded-full shadow-lg"></div>`,
            className: '', iconSize: [12, 12]
        });
        const endIcon = L.divIcon({
            html: `<div class="w-4 h-4 bg-[#24a148] border-2 border-white rounded-full shadow-lg"></div>`,
            className: '', iconSize: [16, 16]
        });

        L.marker([14.6050, 120.9890], { icon: startIcon }).addTo(map);
        L.marker([14.5800, 120.9750], { icon: endIcon }).addTo(map);

        // Simulated Route Line
        const polyline = L.polyline([
            [14.6050, 120.9890],
            [14.5995, 120.9842],
            [14.5800, 120.9750]
        ], {
            color: '#0f62fe',
            weight: 3,
            opacity: 0.6,
            dashArray: '8, 8'
        }).addTo(map);

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [activeTrip]);

    return (
        <div className="flex flex-col h-[calc(100vh-220px)] animate-fadeIn">
            {/* Top Filter Bar */}
            <div className="bg-white border border-[#e0e0e0] p-4 flex flex-col md:flex-row gap-4 items-center mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d8d8d] w-4 h-4" />
                    <input className="w-full pl-10 pr-4 py-2.5 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-sm focus:outline-none focus:border-[#0f62fe] transition-all" placeholder="Search trip ID, driver or rider..." />
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-2.5 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-xs font-bold uppercase tracking-widest focus:outline-none">
                        <option>All Status</option>
                        <option>On-Trip</option>
                        <option>Delayed</option>
                        <option>SOS Emergency</option>
                    </select>
                    <select className="px-4 py-2.5 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-xs font-bold uppercase tracking-widest focus:outline-none">
                        <option>All Risk</option>
                        <option>Low Risk</option>
                        <option>Medium Risk</option>
                        <option>Critical Risk</option>
                    </select>
                    <input type="date" className="px-4 py-2.5 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-xs focus:outline-none" />
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                {/* LEFT PANEL: Trip List */}
                <div className="col-span-3 bg-white border border-[#e0e0e0] flex flex-col min-h-0">
                    <div className="p-4 border-b border-[#e0e0e0] bg-[#161616] text-white flex justify-between items-center px-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-[2px]">Live Fleet</h4>
                        <span className="text-[10px] font-mono text-[#0f62fe]">{trips.length} UNSECURED</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {trips.map(trip => (
                            <div
                                key={trip.id}
                                onClick={() => setActiveTrip(trip)}
                                className={`p-6 cursor-pointer border-b border-[#f4f4f4] transition-all relative ${activeTrip.id === trip.id ? 'bg-[#edf5ff]' : 'hover:bg-[#f4f4f4]'}`}
                            >
                                {activeTrip.id === trip.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0f62fe]"></div>}
                                <div className="flex justify-between items-start mb-3">
                                    <span className="font-mono font-bold text-sm text-[#161616] tracking-tighter">{trip.id}</span>
                                    <div className={`w-3 h-3 rounded-full ${trip.status === 'on-trip' ? 'bg-[#24a148]' :
                                            trip.status === 'delayed' ? 'bg-[#f1c21b]' : 'bg-[#da1e28] animate-pulse shadow-[0_0_8px_rgba(218,30,40,0.6)]'
                                        }`}></div>
                                </div>
                                <div className="text-[11px] font-bold text-[#161616] uppercase tracking-wider mb-1">{trip.driver}</div>
                                <div className="text-[10px] text-[#525252] font-mono">{trip.vehicle}</div>
                                <div className="flex items-center gap-2 mt-4">
                                    {trip.status === 'sos' && <span className="bg-[#da1e28] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest">Emergency</span>}
                                    {trip.risk === 'high' && <span className="bg-[#ffd7d9] text-[#da1e28] text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest border border-[#da1e28]">High Risk</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CENTER PANEL: Live Map Content */}
                <div className="col-span-6 bg-[#161616] border border-[#393939] relative overflow-hidden flex flex-col min-h-0">
                    {/* Technical Terminal Overlay */}
                    <div className="absolute top-0 left-0 w-full p-4 border-b border-white/5 bg-black/40 backdrop-blur-sm z-[1000] flex justify-between items-center pointer-events-none">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-[#0f62fe] rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-mono text-white/60 tracking-[2px] uppercase">Telemetry Active // Session: {activeTrip.id}</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#24a148]">LAT: 14.5995 | LNG: 120.9842 | MAP: LEAFLET_ENGINE_V1</div>
                    </div>

                    {/* Map Visualization */}
                    <div id="trip-map" className="flex-1 w-full relative z-[1]">
                        <div className="absolute inset-0 bg-[#161616] flex items-center justify-center">
                            <div className="text-[#0f62fe] animate-pulse text-[10px] font-mono uppercase tracking-[4px]">Initializing Geospatial Core...</div>
                        </div>
                    </div>

                    {/* Floating Controls Overlay */}
                    <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-md p-4 border border-[#0f62fe] space-y-2">
                            <div className="text-[9px] text-[#0f62fe] font-bold uppercase tracking-widest">Ground Status</div>
                            <div className="flex items-center gap-3">
                                <History className="w-3 h-3 text-[#24a148]" />
                                <span className="text-[11px] text-white font-mono">{activeTrip.speed} // ACTIVE</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[1000]">
                        <button className="w-10 h-10 bg-[#161616]/80 text-white flex items-center justify-center border border-white/10 hover:bg-[#0f62fe] transition-all"><Maximize2 className="w-4 h-4" /></button>
                        <button className="w-10 h-10 bg-[#161616]/80 text-white flex items-center justify-center border border-white/10 hover:bg-[#0f62fe] transition-all"><Layers className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* RIGHT PANEL: Trip Details Console */}
                <div className="col-span-3 bg-white border border-[#e0e0e0] flex flex-col min-h-0">
                    <div className="p-4 border-b border-[#e0e0e0] bg-[#f4f4f4] flex justify-between items-center px-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-[2px] text-[#525252]">Command Center</h4>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 bg-[#24a148] rounded-full"></div>
                            <div className="w-1 h-1 bg-[#24a148] rounded-full"></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                        {/* Entity Block */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-[#edf5ff] border border-[#0f62fe] flex items-center justify-center text-[#0f62fe] relative">
                                    <User className="w-7 h-7" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#24a148] border-2 border-white rounded-full"></div>
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase font-bold text-[#8d8d8d] tracking-[1.5px] mb-1">Authenticated Rider</p>
                                    <p className="text-base font-bold text-[#161616] tracking-tight">{activeTrip.rider}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-[#f4f4f4] border border-[#e0e0e0] flex items-center justify-center text-[#161616]">
                                    <Navigation className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase font-bold text-[#8d8d8d] tracking-[1.5px] mb-1">Active Operator</p>
                                    <p className="text-base font-bold text-[#161616] tracking-tight">{activeTrip.driver}</p>
                                    <p className="text-[10px] text-[#0f62fe] font-mono font-bold mt-1 uppercase">{activeTrip.vehicle}</p>
                                </div>
                            </div>
                        </div>

                        {/* Performance Matrix */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-[#f4f4f4] border-l-4 border-l-[#0f62fe] p-5">
                                <p className="text-[9px] uppercase font-bold text-[#525252] tracking-wider mb-2">Ground Velocity</p>
                                <div className="flex justify-between items-end">
                                    <p className="text-3xl font-mono font-bold text-[#161616] leading-none">{activeTrip.speed.split(' ')[0]}</p>
                                    <span className="text-[10px] font-bold text-[#161616] uppercase">KM/H</span>
                                </div>
                            </div>
                            <div className="bg-[#f4f4f4] border-l-4 border-l-[#24a148] p-5">
                                <p className="text-[9px] uppercase font-bold text-[#525252] tracking-wider mb-2">Energy Storage</p>
                                <div className="flex justify-between items-end">
                                    <p className="text-3xl font-mono font-bold text-[#161616] leading-none">{activeTrip.battery}</p>
                                    <div className="w-12 h-2 bg-[#e0e0e0] mb-2 relative">
                                        <div className="absolute left-0 top-0 h-full bg-[#24a148]" style={{ width: activeTrip.battery }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Incident Alert Console */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-[#161616] uppercase tracking-[2px] border-b border-[#e0e0e0] pb-2">Diagnostic Interface</p>
                            {activeTrip.status === 'sos' ? (
                                <div className="bg-[#da1e28] text-white p-5 space-y-3 animate-pulse shadow-lg">
                                    <div className="flex items-start gap-3">
                                        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-[11px] font-bold uppercase leading-tight tracking-wider">CRITICAL INCIDENT TRIGGERED</p>
                                    </div>
                                    <p className="text-[10px] font-medium leading-relaxed opacity-90">Panic protocols engaged. GPS tethered. External response notified.</p>
                                </div>
                            ) : (
                                <div className="bg-[#f4f4f4] p-5 text-[10px] text-[#8d8d8d] text-center font-mono leading-relaxed">
                                    NOMINAL // STEADY STATE<br />NO INTERVENTION REQUIRED
                                </div>
                            )}
                        </div>

                        {/* Tactical Actions */}
                        <div className="space-y-3 pt-4">
                            <button className="w-full py-4 bg-[#161616] text-white text-[10px] font-bold uppercase tracking-[2.5px] hover:bg-[#393939] transition-all flex items-center justify-center gap-3">
                                <Phone className="w-3.5 h-3.5" /> Direct Audio Link
                            </button>
                            <button className="w-full py-4 border border-[#161616] text-[#161616] text-[10px] font-bold uppercase tracking-[2.5px] hover:bg-[#f4f4f4] transition-all flex items-center justify-center gap-3">
                                <MessageSquare className="w-3.5 h-3.5" /> Push Notification
                            </button>
                            {activeTrip.status === 'sos' && (
                                <button className="w-full py-4 bg-[#da1e28] text-white text-[10px] font-bold uppercase tracking-[2.5px] hover:bg-[#b91923] transition-all shadow-xl flex items-center justify-center gap-3">
                                    <ShieldAlert className="w-3.5 h-3.5" /> Emergency Dispatch
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Admin Dashboard Component
// ==================== PASSENGER APP — PIXEL-PERFECT GRAB-STYLE ====================

// ==================== PASSENGER APP — PIXEL-PERFECT GRAB-STYLE ====================

// Static defaults to prevent re-renders
const PASSENGER_MAP_DEFAULT_CENTER = [14.5995, 120.9842];

function PassengerMap({ center = PASSENGER_MAP_DEFAULT_CENTER, zoom = 14, showRoute = false, pickupCoords = null, destinationCoords = null }) {
    const mapContainer = React.useRef(null);
    const mapInstance = React.useRef(null);
    const [roadRoute, setRoadRoute] = React.useState(null);

    // CSS for circular forced marker
    const markerStyles = `
    @keyframes grabSonar {
      0% { transform: scale(1); opacity: 0.4; }
      100% { transform: scale(2.5); opacity: 0; }
    }
    .grab-marker-circle {
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .grab-sonar {
      position: absolute;
      border-radius: 50% !important;
      background: rgba(0, 177, 79, 0.2);
      animation: grabSonar 2s infinite ease-out;
    }
  `;

    // Fetch road-following route from OSRM
    React.useEffect(() => {
        if (!pickupCoords || !destinationCoords) {
            setRoadRoute(null);
            return;
        }

        const fetchRoute = async () => {
            try {
                // OSRM expects [lon,lat]
                const p1 = `${pickupCoords[1]},${pickupCoords[0]}`;
                const p2 = `${destinationCoords[1]},${destinationCoords[0]}`;
                const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${p1};${p2}?overview=full&geometries=geojson`);
                const data = await res.json();
                if (data.routes && data.routes.length > 0) {
                    // GeoJSON gives [lon, lat], Leaflet needs [lat, lon]
                    const coords = data.routes[0].geometry.coordinates.map(pt => [pt[1], pt[0]]);
                    setRoadRoute(coords);
                }
            } catch (err) {
                console.error('Routing error:', err);
                // Fallback to straight line if API fails
                setRoadRoute([pickupCoords, destinationCoords]);
            }
        };

        fetchRoute();
    }, [pickupCoords, destinationCoords]);

    React.useEffect(() => {
        const L = window.L;
        if (!L || !mapContainer.current) return;

        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }

        const mapCenter = destinationCoords || center;
        const map = L.map(mapContainer.current, {
            center: mapCenter,
            zoom: destinationCoords ? 16 : zoom,
            zoomControl: false,
            attributionControl: false
        });

        mapInstance.current = map;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20
        }).addTo(map);

        const grabIcon = L.divIcon({
            html: `
        <div class="grab-marker-circle" style="position: relative; width: 36px; height: 36px;">
          <div class="grab-sonar" style="width: 36px; height: 36px;"></div>
          <div class="grab-marker-circle" style="position: relative; z-index: 10; background: white; width: 32px; height: 32px; border: 2.5px solid #00B14F; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
             <div style="color: #00B14F; transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
             </div>
          </div>
        </div>
      `,
            className: 'custom-leaflet-marker',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        const userPos = pickupCoords || center;
        L.marker(userPos, { icon: grabIcon }).addTo(map);

        if (showRoute && pickupCoords && destinationCoords) {
            const startIcon = L.divIcon({
                html: `
          <div class="relative flex items-center justify-center w-5 h-5">
            <div class="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
            <div class="w-3 h-3 bg-white border-[3px] border-blue-500 rounded-full shadow-lg relative z-10"></div>
          </div>
        `,
                className: 'custom-start-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const endIcon = L.divIcon({
                html: `
          <div class="relative flex items-center justify-center" style="width: 32px; height: 42px;">
            <div class="absolute" style="bottom: 0; left: 50%; transform: translateX(-50%); width: 32px; height: 32px; background: rgba(239, 68, 68, 0.2); border-radius: 50% !important;" class="animate-ping"></div>
            <svg width="32" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="relative z-10 drop-shadow-xl" style="display: block; margin-bottom: -1px;">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#EF4444" stroke="white" stroke-width="1.5"/>
              <circle cx="12" cy="10" r="3.5" fill="white"/>
            </svg>
          </div>
        `,
                className: 'custom-end-marker',
                iconSize: [32, 42],
                iconAnchor: [16, 42]
            });

            L.marker(pickupCoords, { icon: startIcon }).addTo(map);
            L.marker(destinationCoords, { icon: endIcon }).addTo(map);

            if (roadRoute) {
                L.polyline(roadRoute, {
                    color: '#00B14F',
                    weight: 4,
                    opacity: 0.8,
                    lineCap: 'round',
                    lineJoin: 'round'
                }).addTo(map);

                const bounds = L.latLngBounds(roadRoute);
                map.fitBounds(bounds, { padding: [100, 100] });
            } else {
                // Simple line if route not yet fetched
                L.polyline([pickupCoords, destinationCoords], {
                    color: '#00B14F',
                    weight: 4,
                    opacity: 0.4,
                    dashArray: '8, 8'
                }).addTo(map);
            }
        }

        const timer = setTimeout(() => {
            if (mapInstance.current) {
                mapInstance.current.invalidateSize();
            }
        }, 200);

        return () => {
            clearTimeout(timer);
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        }
    }, [center, zoom, showRoute, pickupCoords, destinationCoords, roadRoute]);

    return (
        <div ref={mapContainer} className="w-full h-full z-0">
            <style>{markerStyles}</style>
        </div>
    );
}

// Sub-components
const PButton = ({ children, onClick, disabled, className = '' }) => (
    <button onClick={onClick} disabled={disabled} className={`h-[56px] px-6 bg-[#00B14F] text-white text-[17px] font-bold rounded-[12px] flex items-center justify-center active:scale-[0.96] transition-all disabled:opacity-50 shadow-lg shadow-[#00B14F]/20 ${className}`}>{children}</button>
);

const PCard = ({ children, className = '' }) => (
    <div className={`bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.06)] ${className}`}>{children}</div>
);

const HomeView = ({ navigate }) => {
    const [activeBanner, setActiveBanner] = React.useState(0);
    const banners = [
        { title: 'Stay Safe with King Transport', sub: 'Updated safety protocols for every ride.', color: 'bg-[#00B14F]', img: '🛡️' },
        { title: 'GCash Exclusive: ₱50 OFF', sub: 'Link your GCash and save on 5 rides.', color: 'bg-[#0052cc]', img: '💸' },
    ];

    return (
        <div className="pb-24 animate-fadeIn bg-white">
            {/* Search Header */}
            <div className="sticky top-0 z-[2000] bg-white/80 backdrop-blur-md px-[16px] py-[12px] border-b border-[#F3F4F6]">
                <button onClick={() => navigate('search')} className="w-full h-[52px] bg-[#F3F4F6] rounded-[24px] px-[16px] flex items-center gap-3 active:scale-[0.98] transition-all group">
                    <Search className="w-5 h-5 text-[#6B7280] group-hover:text-[#00B14F] transition-colors" />
                    <span className="text-[#6B7280] text-[15px] font-medium">Where to?</span>
                </button>
            </div>

            {/* Hero Banner Carousel */}
            <div className="px-[16px] py-[12px]">
                <div className={`w-full h-[140px] ${banners[activeBanner].color} rounded-[20px] p-[20px] relative overflow-hidden text-white flex flex-col justify-center`}>
                    <div className="relative z-10 max-w-[70%]">
                        <h3 className="text-[18px] font-bold leading-tight mb-1">{banners[activeBanner].title}</h3>
                        <p className="text-[12px] opacity-90">{banners[activeBanner].sub}</p>
                    </div>
                    <div className="absolute right-[-10px] bottom-[-10px] text-[100px] opacity-20 rotate-[15deg]">{banners[activeBanner].img}</div>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                        {banners.map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeBanner ? 'bg-white w-4' : 'bg-white/40'}`} onClick={() => setActiveBanner(i)} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Service Grid */}
            <div className="p-[16px] grid grid-cols-4 gap-[12px]">
                {[
                    { label: 'Transport', icon: <Car className="w-6 h-6" />, color: 'bg-[#E8F5E9] text-[#2E7D32]' },
                    { label: 'Bike', icon: <Bike className="w-6 h-6" />, color: 'bg-[#E3F2FD] text-[#1976D2]' },
                    { label: 'Express', icon: <Package className="w-6 h-6" />, color: 'bg-[#FFF3E0] text-[#EF6C00]' },
                    { label: 'Rentals', icon: <Clock className="w-6 h-6" />, color: 'bg-[#F3E5F5] text-[#7B1FA2]' },
                ].map(s => (
                    <div key={s.label} onClick={() => navigate('search')} className="flex flex-col items-center gap-[10px] cursor-pointer group">
                        <div className={`w-[56px] h-[56px] ${s.color} rounded-[18px] flex items-center justify-center group-active:scale-95 transition-all shadow-sm`}>{s.icon}</div>
                        <span className="text-[12px] font-bold text-[#374151]">{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="h-[2px] bg-[#F3F4F6] mx-[16px] my-[12px]" />

            {/* Map Preview */}
            <div className="px-[16px] py-[8px]">
                <h4 className="text-[14px] font-bold text-[#111827] mb-3">Around You</h4>
                <div className="h-[220px] bg-gray-100 rounded-[20px] relative overflow-hidden border border-[#F3F4F6] shadow-sm">
                    <PassengerMap />
                </div>
            </div>

            {/* Saved Places */}
            <div className="px-[16px] py-[24px] space-y-[16px]">
                <div className="flex justify-between items-center">
                    <h4 className="text-[13px] font-bold text-[#6B7280] uppercase tracking-widest">Quick Save</h4>
                    <button className="text-[12px] font-bold text-[#00B14F]">Manage</button>
                </div>
                <div className="space-y-[4px]">
                    {[
                        { label: 'Home', loc: 'Emerald Street, Cebu City', icon: <HomeIcon className="w-5 h-5 text-[#6B7280]" /> },
                        { label: 'Work', loc: 'Ayala IT Park Tower 1', icon: <Building2 className="w-5 h-5 text-[#6B7280]" /> }
                    ].map((place, i) => (
                        <div key={i} onClick={() => navigate('search')} className="flex items-center gap-[16px] py-[14px] border-b border-[#F3F4F6] last:border-none cursor-pointer active:bg-[#F9FAFB] px-[4px] rounded-[8px] transition-all">
                            <div className="w-[40px] h-[40px] bg-[#F3F4F6] rounded-full flex items-center justify-center">{place.icon}</div>
                            <div className="flex-1">
                                <p className="text-[15px] font-bold text-[#111827]">{place.label}</p>
                                <p className="text-[12px] text-[#6B7280] line-clamp-1">{place.loc}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#D1D5DB]" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SearchView = ({ navigate, destination, setDestination }) => (
    <div className="fixed inset-0 z-[3000] bg-white animate-slideInUp px-[16px] py-[24px] space-y-[24px] flex flex-col">
        <div className="flex items-center gap-[16px]">
            <button onClick={() => navigate('home')} className="p-[8px] bg-[#F7F7F7] rounded-full active:scale-90 transition-all"><X className="w-6 h-6 text-[#111827]" /></button>
            <h2 className="text-[20px] font-semibold text-[#111827]">Where are you going?</h2>
        </div>
        <div className="space-y-[12px]">
            <div className="relative">
                <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#6B7280] w-[20px] h-[20px]" />
                <input autoFocus className="w-full h-[48px] pl-[44px] pr-[12px] bg-[#F7F7F7] border border-[#E5E7EB] rounded-[12px] text-[16px] focus:outline-none focus:border-[#00B14F] transition-all" placeholder="Enter destination..." value={destination} onChange={(e) => setDestination(e.target.value)} />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-[32px] pt-[8px]">
            <section className="space-y-[16px]">
                <h4 className="text-[12px] font-bold uppercase text-[#6B7280] tracking-widest">Recent</h4>
                {['SM Cebu', 'Ayala Center', 'Mactan Airport'].map(loc => (
                    <button key={loc} onClick={() => { setDestination(loc); navigate('selection'); }} className="w-full flex items-center gap-[16px] py-[8px] group active:opacity-60 transition-all">
                        <History className="w-5 h-5 text-[#E5E7EB]" />
                        <span className="text-[16px] font-medium text-[#111827]">{loc}</span>
                    </button>
                ))}
            </section>
        </div>
    </div>
);

const SelectionView = ({ navigate, pickup, destination, rides, selectedRide, setSelectedRide }) => (
    <div className="flex flex-col h-full bg-[#F3F4F6] animate-slideInUp">
        {/* Header Info */}
        <div className="p-[20px] bg-white border-b border-[#E5E7EB] flex items-center gap-[16px] shadow-sm z-10">
            <button onClick={() => navigate('search')} className="p-[10px] bg-[#F3F4F6] rounded-full active:scale-90 transition-all"><ChevronLeft className="w-5 h-5 text-[#111827]" /></button>
            <div className="flex-1">
                <div className="flex items-center gap-[10px]"><div className="w-[8px] h-[8px] border-2 border-[#9CA3AF] rounded-full"></div><p className="text-[13px] text-[#6B7280] font-medium truncate">{pickup}</p></div>
                <div className="flex items-center gap-[10px] mt-[6px]"><div className="w-[8px] h-[8px] bg-[#00B14F] rounded-full"></div><p className="text-[17px] font-bold text-[#111827] truncate">{destination}</p></div>
            </div>
        </div>

        {/* Ride List */}
        <div className="flex-1 overflow-y-auto pt-[16px] px-[16px] space-y-[12px]">
            <h3 className="text-[12px] font-bold text-[#6B7280] uppercase tracking-widest px-[4px]">Recommended for you</h3>
            {rides.map(ride => (
                <div
                    key={ride.id}
                    onClick={() => setSelectedRide(ride)}
                    className={`group p-[16px] bg-white border-2 flex items-center justify-between rounded-[20px] cursor-pointer transition-all duration-300 ${selectedRide?.id === ride.id ? 'border-[#00B14F] shadow-lg shadow-[#00B14F]/10 -translate-y-1' : 'border-transparent shadow-sm hover:border-[#E5E7EB]'}`}
                >
                    <div className="flex items-center gap-[16px]">
                        <div className={`w-[52px] h-[52px] rounded-[16px] flex items-center justify-center transition-colors ${selectedRide?.id === ride.id ? 'bg-[#00B14F] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>{ride.icon}</div>
                        <div>
                            <p className="text-[17px] font-bold text-[#111827]">{ride.label}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[12px] text-[#6B7280] font-medium flex items-center gap-1"><Clock className="w-3 h-3" />{ride.eta}</span>
                                {ride.id === 'econ' && <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Value</span>}
                            </div>
                        </div>
                    </div>
                    <p className="text-[19px] font-black text-[#111827]">₱{ride.price}</p>
                </div>
            ))}
        </div>

        {/* Bottom Action */}
        <div className="bg-white p-[20px] pt-4 rounded-t-[24px] border-t border-[#E5E7EB] space-y-[16px] z-[2000] shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-[12px]">
                    <div className="p-[10px] bg-blue-50 text-[#0052cc] rounded-[12px]"><CreditCard className="w-5 h-5" /></div>
                    <div>
                        <p className="text-[14px] font-bold text-[#111827]">GCash Payment</p>
                        <p className="text-[11px] text-[#6B7280]">Balance: ₱1,245.00</p>
                    </div>
                </div>
                <div className="px-[12px] py-[6px] bg-orange-50 text-[#F59E0B] text-[11px] font-black rounded-full border border-orange-100 uppercase tracking-tighter">Offers Applied</div>
            </div>
            <button
                disabled={!selectedRide}
                onClick={() => navigate('matching')}
                className="w-full h-[56px] bg-[#00B14F] text-white text-[17px] font-bold rounded-[16px] shadow-xl shadow-[#00B14F]/20 disabled:opacity-30 active:scale-[0.97] transition-all flex items-center justify-center gap-3"
            >
                Book {selectedRide?.label || 'Ride now'}
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    </div>
);

const MatchingView = ({ navigate }) => {
    useEffect(() => {
        const t = setTimeout(() => navigate('tracking'), 3000);
        return () => clearTimeout(t);
    }, [navigate]);
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-[32px] bg-white space-y-[32px] animate-fadeIn">
            <div className="relative">
                <div className="absolute inset-0 bg-[#00B14F]/10 rounded-full animate-ping scale-[2.5]"></div>
                <div className="w-[120px] h-[120px] bg-[#00B14F] rounded-full flex items-center justify-center text-white shadow-2xl relative z-10"><Navigation className="w-12 h-12 rotate-45" /></div>
            </div>
            <div className="text-center space-y-[8px]"><h2 className="text-[24px] font-bold text-[#111827]">Finding your driver</h2><p className="text-[16px] text-[#6B7280]">Usually takes less than a minute...</p></div>
            <button onClick={() => navigate('selection')} className="h-[48px] w-full border border-[#E5E7EB] text-[#6B7280] text-[14px] font-medium rounded-[12px]">Cancel</button>
        </div>
    );
};

const TrackingView = ({ navigate }) => (
    <div className="absolute inset-0 flex flex-col bg-[#F7F7F7]">
        <div className="h-[60px] bg-white border-b border-[#E5E7EB] px-[16px] flex items-center justify-between z-10">
            <div className="flex items-center gap-[8px]"><div className="w-[8px] h-[8px] bg-yellow-400 rounded-full animate-pulse"></div><span className="text-[14px] font-bold text-[#111827]">Arriving in 3 mins</span></div>
            <button onClick={() => navigate('completion')} className="text-[12px] font-bold text-[#EF4444] uppercase tracking-widest">Cancel</button>
        </div>
        <div className="flex-1 relative bg-white overflow-hidden">
            <PassengerMap id="passenger-tracking-map" showRoute={true} />
            <div className="absolute bottom-[32px] right-[16px] z-[500]"><button className="w-[56px] h-[56px] bg-[#EF4444] text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all"><ShieldAlert className="w-8 h-8" /></button></div>
        </div>
        <div className="bg-white p-[16px] rounded-t-[24px] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] space-y-[20px] z-20 animate-slideInUp">
            <div className="flex justify-between items-center h-[80px]">
                <div className="flex items-center gap-[12px]">
                    <div className="w-[48px] h-[48px] bg-[#F7F7F7] border border-[#00B14F]/20 rounded-full overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Juan" className="w-full h-full" /></div>
                    <div><h3 className="text-[18px] font-bold text-[#111827]">Juan Dela Cruz</h3><p className="text-[14px] text-[#6B7280]">⭐ 4.9 • Toyota Vios (ABC 123)</p></div>
                </div>
                <div className="flex gap-[12px]">
                    <button className="w-[48px] h-[48px] bg-green-50 text-[#00B14F] rounded-full flex items-center justify-center active:scale-90 transition-all"><Phone className="w-6 h-6" /></button>
                    <button className="w-[48px] h-[48px] bg-blue-50 text-[#3B82F6] rounded-full flex items-center justify-center active:scale-90 transition-all"><MessagesSquare className="w-6 h-6" /></button>
                </div>
            </div>
            <div className="bg-[#F7F7F7] p-[12px] rounded-[12px] flex items-center gap-[12px]"><Navigation className="w-5 h-5 text-[#6B7280]" /><p className="text-[14px] text-[#111827] flex-1">En route to SM Cebu Tower 2</p></div>
        </div>
    </div>
);

const CompletionView = ({ navigate }) => (
    <div className="p-[20px] bg-white space-y-[32px] animate-fadeIn min-h-full overflow-y-auto flex flex-col">
        <div className="text-center py-[24px] space-y-[12px]"><div className="w-[64px] h-[64px] bg-green-50 text-[#00B14F] rounded-full flex items-center justify-center mx-auto shadow-sm"><CheckCircle className="w-[40px] h-[40px]" /></div><h2 className="text-[24px] font-bold text-[#111827]">Trip Completed</h2><p className="text-[#6B7280] text-[14px]">May 12, 2026 • 10:24 AM</p></div>
        <PCard className="!p-0 overflow-hidden border border-[#E5E7EB]">
            {[{ label: 'Base Fare', val: '₱150.00' }, { label: 'Discount', val: '-₱50.00', color: 'text-[#00B14F]' }].map((row, i) => (
                <div key={i} className="h-[48px] px-[16px] flex justify-between items-center border-b border-[#E5E7EB] last:border-none"><span className="text-[14px] text-[#6B7280] font-medium">{row.label}</span><span className={`text-[14px] font-bold ${row.color || 'text-[#111827]'}`}>{row.val}</span></div>
            ))}
            <div className="h-[64px] px-[16px] bg-[#F7F7F7] flex justify-between items-center"><span className="text-[16px] font-bold text-[#111827]">Total Paid</span><span className="text-[24px] font-bold text-[#00B14F]">₱100.00</span></div>
        </PCard>
        <PButton onClick={() => navigate('home')} className="w-full mt-4">Back to Home</PButton>
    </div>
);

const AccountView = ({ navigate }) => (
    <div className="pb-24 animate-fadeIn bg-[#F7F7F7]">
        <div className="h-[88px] bg-white px-[20px] flex items-center gap-[16px] border-b border-[#E5E7EB]">
            <div className="w-[56px] h-[56px] bg-[#F7F7F7] rounded-full flex items-center justify-center p-[2px] border-2 border-[#00B14F] overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" className="w-full h-full" /></div>
            <div><h2 className="text-[20px] font-bold text-[#111827]">John Doe</h2><p className="text-[14px] text-[#6B7280]">Platinum Member</p></div>
        </div>
        <div className="mt-[20px] px-[16px] space-y-[24px]">
            <PCard className="!p-0 overflow-hidden">
                {[{ label: 'Edit Profile', icon: <User className="w-5 h-5" /> }, { label: 'Payment Methods', icon: <CreditCard className="w-5 h-5" /> }, { label: 'Safety Settings', icon: <ShieldCheck className="w-5 h-5" /> }, { label: 'Help Center', icon: <LifeBuoy className="w-5 h-5" /> }].map((item, i) => (
                    <div key={i} className="h-[56px] px-[16px] flex items-center justify-between border-b border-[#E5E7EB] last:border-none active:bg-[#F7F7F7] transition-all cursor-pointer">
                        <div className="flex items-center gap-[12px]"><div className="text-[#6B7280]">{item.icon}</div><span className="text-[16px] font-medium text-[#111827]">{item.label}</span></div>
                        <ChevronRight className="w-5 h-5 text-[#E5E7EB]" />
                    </div>
                ))}
            </PCard>
            <button onClick={() => navigate('home')} className="h-[48px] w-full text-[#EF4444] text-[16px] font-bold border border-[#E5E7EB] rounded-[12px] bg-white active:scale-[0.98] transition-all">Sign Out</button>
        </div>
    </div>
);

const PBottomNav = ({ view, navigate }) => (
    <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t border-[#E5E7EB] px-[20px] flex justify-between items-center z-[2000] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe">
        {[
            { id: 'home', label: 'Home', icon: <HomeIcon className="w-6 h-6" /> },
            { id: 'activity', label: 'Activity', icon: <History className="w-6 h-6" /> },
            { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-6 h-6" /> },
            { id: 'chat', label: 'Chat', icon: <MessagesSquare className="w-6 h-6" /> },
            { id: 'account', label: 'Account', icon: <User className="w-6 h-6" /> },
        ].map(nav => (
            <button key={nav.id} onClick={() => navigate(nav.id)} className={`flex flex-col items-center justify-center gap-1.5 transition-all flex-1 ${view === nav.id ? 'text-[#00B14F]' : 'text-[#9CA3AF]'}`}>{nav.icon}<span className="text-[11px] font-bold uppercase tracking-widest">{nav.label}</span></button>
        ))}
    </div>
);

function PassengerApp() {
    const [view, setView] = React.useState('home'); // 'home' or 'booking'
    const [service, setService] = React.useState('Transport');
    const [showServiceList, setShowServiceList] = React.useState(false);
    const [pickup, setPickup] = React.useState('Greenhills Shopping Center');
    const [pickupCoords, setPickupCoords] = React.useState([14.6019, 121.0355]);
    const [destination, setDestination] = React.useState('');
    const [destCoords, setDestCoords] = React.useState(null);
    const [searchTarget, setSearchTarget] = React.useState('destination'); // 'pickup' or 'destination'
    const [isDestinationConfirmed, setIsDestinationConfirmed] = React.useState(false);
    const [suggestions, setSuggestions] = React.useState([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [isCalculating, setIsCalculating] = React.useState(false);
    const [showOptionsSheet, setShowOptionsSheet] = React.useState(false);

    // Real-time Geocoding Search Effect
    React.useEffect(() => {
        const query = searchTarget === 'pickup' ? pickup : destination;
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        const handler = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ph&limit=5`);
                const data = await res.json();
                setSuggestions(data.map(item => ({
                    name: item.display_name.split(',')[0],
                    address: item.display_name.split(',').slice(1).join(',').trim(),
                    lat: item.lat,
                    lon: item.lon
                })));
            } catch (e) {
                console.error('Geocoding error:', e);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [pickup, destination, searchTarget]);

    const transportOptions = [
        { id: 'grabcar', label: 'GrabCar', price: 156, eta: '2 min', icon: <Car />, desc: 'Standard 4-seater' },
        { id: 'grabbike', label: 'GrabBike', price: 82, eta: '1 min', icon: <Bike />, desc: 'Beat the traffic' },
        { id: 'grabtaxi', label: 'GrabTaxi', price: 120, eta: '4 min', icon: <Truck />, desc: 'Metered taxi' },
        { id: 'grabpremium', label: '6-Seater', price: 245, eta: '5 min', icon: <Car />, desc: 'Spacious for groups' },
    ];

    const [selectedRide, setSelectedRide] = React.useState(transportOptions[0]);

    const services = ['Transport', 'Delivery', 'Rentals', 'Mart', 'Food'];

    const navigate = React.useCallback((newView) => {
        if (newView === 'home') {
            setIsDestinationConfirmed(false);
            setShowOptionsSheet(false);
            setDestination('');
            setDestCoords(null);
            setSuggestions([]);
        }
        setView(newView);
    }, []);

    return (
        <div className="bg-[#F7F7F7] h-screen w-full relative flex flex-col font-sans overflow-hidden selection:bg-[#00B14F] selection:text-white">
            {view === 'home' ? (
                /* HOME HUB VIEW */
                <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-10">
                    {/* Header with Search */}
                    <div className="bg-[#00B14F] p-[20px] pt-[30px] rounded-b-[32px] shadow-lg relative z-20">
                        <div className="flex items-center justify-between mb-8">
                            <button className="p-2 text-white"><Menu className="w-6 h-6" /></button>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-black text-white">G</div>
                                <span className="text-white font-black text-[19px] tracking-tight">Grab</span>
                            </div>
                            <button className="p-2 text-white"><Bell className="w-6 h-6" /></button>
                        </div>

                        {/* Where to? Search Bar */}
                        <div
                            onClick={() => setView('booking')}
                            className="bg-white p-3.5 pr-5 rounded-full shadow-2xl flex items-center gap-4 cursor-pointer active:scale-[0.95] transition-all border border-black/5"
                        >
                            <div className="w-10 h-10 bg-blue-50 text-[#0052cc] rounded-full flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[15px] font-bold text-gray-400">Where to?</p>
                            </div>
                            <div className="h-5 w-[1px] bg-gray-100"></div>
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                                <Clock className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-[11px] font-bold text-[#111827]">Now</span>
                            </div>
                        </div>
                    </div>

                    {/* Service Grid */}
                    <div className="px-[20px] py-[28px] grid grid-cols-4 gap-y-8 gap-x-4">
                        {[
                            { label: 'Transport', icon: <Car className="w-7 h-7" />, id: 'transport' },
                            { label: 'Delivery', icon: <Package className="w-7 h-7" />, id: 'delivery' },
                            { label: 'Mart', icon: <ShoppingCart className="w-7 h-7" />, id: 'mart' },
                            { label: 'Food', icon: <Truck className="w-7 h-7" />, id: 'food' },
                            { label: 'Rentals', icon: <Clock className="w-7 h-7" />, id: 'rentals' },
                            { label: 'Hotels', icon: <Building2 className="w-7 h-7" />, id: 'hotels' },
                            { label: 'Insurance', icon: <ShieldCheck className="w-7 h-7" /> },
                            { label: 'More', icon: <PlusSquare className="w-7 h-7" /> }
                        ].map(svc => (
                            <button
                                key={svc.label}
                                onClick={() => { setService(svc.label); setView('booking'); }}
                                className="flex flex-col items-center gap-2 group active:scale-95 transition-all text-gray-600"
                            >
                                <div className="w-[60px] h-[60px] flex items-center justify-center">
                                    {svc.icon}
                                </div>
                                <span className="text-[12px] font-bold">{svc.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Promo Banner */}
                    <div className="px-[20px]">
                        <div className="bg-gradient-to-br from-[#00B14F] to-[#008A3D] p-[24px] rounded-[28px] text-white relative overflow-hidden shadow-xl">
                            <div className="relative z-10 w-2/3">
                                <h3 className="text-[22px] font-black leading-tight mb-2">50% Discount on Your First Ride!</h3>
                                <p className="text-[13px] text-white/90 font-bold mb-4 opacity-80 uppercase tracking-widest">Limited Time Offer</p>
                                <button className="bg-white text-[#00B14F] px-6 py-2.5 rounded-full text-[14px] font-black shadow-lg">Use Prompt: NEWGRAB</button>
                            </div>
                            <Zap className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 rotate-12" />
                        </div>
                    </div>
                </div>
            ) : (
                /* BOOKING / MAP VIEW */
                <div className="flex-1 relative flex flex-col overflow-hidden">
                    {/* Dynamic Header */}
                    <div className="bg-[#00B14F] h-[80px] flex items-center px-[16px] relative z-[4000] shadow-md flex-shrink-0">
                        <button onClick={() => setView('home')} className="p-2 text-white active:scale-90 transition-all"><ArrowLeft className="w-6 h-6" /></button>

                        <div className="flex-1 flex justify-center">
                            <div className="relative">
                                <button
                                    onClick={() => setShowServiceList(!showServiceList)}
                                    className="bg-[#00A248] text-white px-[16px] py-[8px] rounded-[10px] flex items-center gap-2 font-bold text-[16px] active:scale-95 transition-all"
                                >
                                    {service} <ChevronDown className={`w-4 h-4 transition-transform ${showServiceList ? 'rotate-180' : ''}`} />
                                </button>

                                {showServiceList && (
                                    <>
                                        <div className="fixed inset-0 z-[-1]" onClick={() => setShowServiceList(false)}></div>
                                        <div className="absolute top-[120%] left-1/2 -translate-x-1/2 w-[180px] bg-white rounded-[16px] shadow-2xl py-[12px] border border-gray-100 animate-fadeInUp">
                                            {services.map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => { setService(s); setShowServiceList(false); }}
                                                    className={`w-full text-left px-[20px] py-[12px] text-[15px] font-bold ${service === s ? 'text-[#00B14F] bg-green-50' : 'text-[#374151] hover:bg-gray-50'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <button className="p-2 text-white opacity-0"><PlusSquare className="w-6 h-6" /></button>
                    </div>

                    <div className="flex-1 relative overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <PassengerMap
                                pickupCoords={pickupCoords}
                                destinationCoords={destCoords}
                                showRoute={isDestinationConfirmed}
                            />
                        </div>

                        <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
                            <div className="flex-1 p-[16px] space-y-4 overflow-y-auto no-scrollbar pb-40">
                                {service === 'Transport' ? (
                                    <>
                                        <PCard className="w-full p-[14px] flex flex-col gap-[10px] pointer-events-auto border border-gray-100/50 shadow-xl">
                                            <div className={`flex items-center gap-[14px] p-1 rounded-xl transition-all ${searchTarget === 'pickup' ? 'bg-blue-50/50' : ''}`}>
                                                <div className="w-[8px] h-[8px] rounded-full border-[2.5px] border-blue-500 bg-white"></div>
                                                <input
                                                    className="flex-1 text-[13px] font-medium text-[#111827] focus:outline-none bg-transparent"
                                                    value={pickup}
                                                    onFocus={() => setSearchTarget('pickup')}
                                                    onChange={e => {
                                                        setPickup(e.target.value);
                                                        setIsDestinationConfirmed(false);
                                                    }}
                                                />
                                            </div>
                                            <div className="h-[1px] bg-gray-100 ml-[22px]"></div>
                                            <div className={`flex items-center gap-[14px] p-1 rounded-xl transition-all ${searchTarget === 'destination' ? 'bg-red-50/50' : ''}`}>
                                                <div className="w-[8px] h-[8px] rounded-full bg-[#EF4444]"></div>
                                                <input
                                                    className="flex-1 text-[12px] font-bold text-[#111827] focus:outline-none bg-transparent"
                                                    placeholder="Where to?"
                                                    onFocus={() => setSearchTarget('destination')}
                                                    value={destination}
                                                    onChange={e => {
                                                        setDestination(e.target.value);
                                                        setIsDestinationConfirmed(false);
                                                    }}
                                                />
                                                <Plus className="w-3 px-1 text-gray-300" />
                                            </div>
                                        </PCard>

                                        {/* Search Suggestions List */}
                                        {!isSearching && (searchTarget === 'pickup' ? pickup : destination) && suggestions.length > 0 && (
                                            <div className="space-y-2 pointer-events-auto animate-fadeInUp">
                                                {suggestions.map((loc, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            const coords = [parseFloat(loc.lat), parseFloat(loc.lon)];
                                                            if (searchTarget === 'pickup') {
                                                                setPickup(loc.name);
                                                                setPickupCoords(coords);
                                                                setSearchTarget('destination'); // Auto-switch to destination after picking start
                                                            } else {
                                                                setDestination(loc.name);
                                                                setDestCoords(coords);
                                                                setIsDestinationConfirmed(true);
                                                            }
                                                            setSuggestions([]);
                                                            setShowOptionsSheet(false);
                                                        }}
                                                        className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl active:bg-gray-50 transition-all text-left shadow-sm border border-gray-50"
                                                    >
                                                        <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center">
                                                            <MapPin className="w-4 h-4 text-[#00B14F]" />
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="text-[15px] font-bold text-[#111827] truncate">{loc.name}</p>
                                                            <p className="text-[11px] text-gray-400 font-medium truncate">{loc.address}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Empty / Initial State Suggestions */}
                                        {!destination && (
                                            <div className="space-y-3 pointer-events-auto">
                                                {[
                                                    { name: 'Market! Market!', dist: 'Taguig', icon: <History className="w-4 h-4" /> },
                                                    { name: 'SM Megamall', dist: 'Mandaluyong', icon: <History className="w-4 h-4" /> },
                                                    { name: 'NAIA Terminal 3', dist: 'Pasay', icon: <MapPin className="w-4 h-4" /> },
                                                ].map(loc => (
                                                    <button
                                                        key={loc.name}
                                                        onClick={() => {
                                                            setDestination(loc.name);
                                                            setDestCoords(loc.coords || [14.6091, 121.0501]); // Mock some history coords
                                                            setIsDestinationConfirmed(true);
                                                            setShowOptionsSheet(false);
                                                        }}
                                                        className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl active:bg-gray-50 transition-all text-left shadow-sm mb-2"
                                                    >
                                                        <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center">{loc.icon}</div>
                                                        <div>
                                                            <p className="text-[15px] font-bold text-[#111827]">{loc.name}</p>
                                                            <p className="text-[12px] text-gray-400 font-medium">{loc.dist}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {isSearching && (
                                            <div className="flex items-center justify-center py-10 pointer-events-auto">
                                                <div className="w-6 h-6 border-2 border-[#00B14F] border-t-transparent rounded-full animate-spin"></div>
                                                <span className="ml-3 text-[14px] font-bold text-gray-400">Searching...</span>
                                            </div>
                                        )}

                                        {/* Quick Options (Hidden until confirmed) */}
                                        {isDestinationConfirmed && !isSearching && (
                                            <div className="grid grid-cols-3 gap-2 pointer-events-auto animate-fadeIn">
                                                {[{ l: 'Personal', i: <User className="w-4 h-4" /> }, { l: 'Cash', i: <Wallet className="w-4 h-4" /> }, { l: 'Now', i: <Clock className="w-4 h-4" /> }].map(o => (
                                                    <PCard key={o.l} className="p-2.5 flex flex-col items-center gap-1 active:bg-gray-50 transition-colors">
                                                        <div className="text-gray-400">{o.i}</div>
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{o.l}</span>
                                                    </PCard>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="pointer-events-auto">
                                        <PCard className="p-8 text-center bg-white/95 backdrop-blur-sm shadow-xl">
                                            <h3 className="text-[18px] font-black">{service} Service</h3>
                                            <p className="text-[13px] text-gray-500">Coming soon to your area.</p>
                                        </PCard>
                                    </div>
                                )}
                            </div>

                            {service === 'Transport' && isDestinationConfirmed && !showOptionsSheet && !isSearching && (
                                <div className="pointer-events-auto mt-auto px-5 pb-6 animate-fadeInUp">
                                    <div className="bg-white/95 backdrop-blur-md p-[14px] rounded-[22px] shadow-2xl border border-gray-100 flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center text-gray-600">
                                                <Car className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em] leading-none mb-1">Destination Set</p>
                                                <p className="text-[13px] font-black text-[#111827]">Tap to see ride options</p>
                                            </div>
                                        </div>
                                        <PButton
                                            className="w-full !rounded-[16px] uppercase tracking-[1px] font-bold text-[14px] h-[50px] shadow-lg border-none"
                                            onClick={() => {
                                                setShowOptionsSheet(true);
                                                setIsCalculating(true);
                                                setTimeout(() => setIsCalculating(false), 1200);
                                            }}
                                        >
                                            View Options
                                        </PButton>
                                    </div>
                                </div>
                            )}

                            {service === 'Transport' && showOptionsSheet && (
                                <div className="pointer-events-auto mt-auto flex flex-col bg-white rounded-t-[32px] shadow-2xl overflow-hidden max-h-[60%] animate-slideUp relative">
                                    {/* Close Button & Handle */}
                                    <div className="flex items-center justify-between px-6 pt-3 pb-2 sticky top-0 bg-white/95 backdrop-blur-sm z-20">
                                        <div className="w-10"></div> {/* Spacer for symmetry */}
                                        <div className="w-12 h-1.5 bg-gray-100 rounded-full"></div>
                                        <button
                                            onClick={() => setShowOptionsSheet(false)}
                                            className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center active:scale-90 transition-all"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto px-[16px] space-y-2 py-2 no-scrollbar">
                                        {transportOptions.map(opt => (
                                            <div
                                                key={opt.id}
                                                onClick={() => setSelectedRide(opt)}
                                                className={`flex items-center justify-between p-4 rounded-[22px] transition-all ${selectedRide.id === opt.id ? 'bg-[#E8F5E9] border-2 border-[#00B14F]' : 'border-2 border-transparent hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-[48px] h-[48px] flex items-center justify-center text-gray-600">{opt.icon}</div>
                                                    <div>
                                                        <h4 className="text-[15px] font-bold text-[#111827] leading-tight">{opt.label}</h4>
                                                        <p className="text-[11px] text-[#6B7280] font-medium leading-none mt-1">{opt.eta} away • {opt.desc}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {isCalculating ? (
                                                        <div className="w-12 h-3 bg-gray-100 rounded animate-pulse ml-auto"></div>
                                                    ) : (
                                                        <>
                                                            <span className="text-[10px] text-[#00B14F] font-bold">₱</span>
                                                            <span className="text-[16px] font-black text-[#111827]">{opt.price}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-5 pb-8 pt-4 border-t border-gray-50">
                                        <PButton
                                            disabled={isCalculating}
                                            className={`w-full !rounded-2xl uppercase tracking-[2px] font-black text-[16px] h-14 transition-all ${isCalculating ? 'bg-gray-100 text-gray-400 border-none' : ''}`}
                                            onClick={() => navigate('matching')}
                                        >
                                            {isCalculating ? 'Calculating...' : `Book ${selectedRide.label}`}
                                        </PButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Overlays */}
            {['matching', 'tracking', 'completion'].includes(view) && (
                <div className="fixed inset-0 z-[5000] bg-white">
                    {view === 'matching' && <MatchingView navigate={navigate} />}
                    {view === 'tracking' && <TrackingView navigate={navigate} />}
                    {view === 'completion' && <CompletionView navigate={navigate} />}
                </div>
            )}
        </div>
    );
}

function HomeIcon(props) {
    return <svg {...props} fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
}

// Admin Dashboard Component
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
        const validTabs = ['appointments', 'queue', 'calendar', 'reports', 'feedback', 'settings', 'specialists', 'services'];
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
    const [newService, setNewService] = useState({
        name: '',
        duration: '30m',
        price: 'PHP 0.00',
        icon: '',
        category: 'General',
        base_fare: 0,
        per_km_rate: 0
    });
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

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
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
            setIsLoading(false);
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
            fetchSpecialists();
            const fetchBookingServices = async () => {
                try {
                    const res = await fetch('/api/booking-services');
                    const data = await res.json();
                    if (data.success) setBookingServices(data.services);
                } catch (err) { }
            };
            fetchBookingServices();
        }
    }, [isLoggedIn]);

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
            case 'pending': return 'bg-[#fcf4d6] text-[#161616] border-[#f1c21b]'; // Warning 10/20
            case 'confirmed': return 'bg-[#edf5ff] text-[#0f62fe] border-[#0f62fe]'; // Info (Blue 10/60)
            case 'completed': return 'bg-[#defbe6] text-[#198038] border-[#24a148]'; // Success (Green 10/60)
            case 'cancelled': return 'bg-[#fff1f1] text-[#da1e28] border-[#da1e28]'; // Error (Red 10/60)
            default: return 'bg-[#f4f4f4] text-[#525252] border-[#c6c6c6]'; // Gray 10/30
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
        if (isLoggedIn) {
            if (activeTab === 'calendar') fetchCalendarData();
            if (activeTab === 'reports') fetchReports();
            if (activeTab === 'feedback') fetchCsm();
            if (activeTab === 'settings') {
                fetchBlockedDates();
                fetchDoctors();
                fetchServices();
            }
        }
    }, [activeTab, isLoggedIn, calendarMonth, calendarYear]);

    // Login Page
    if (!isLoggedIn) {
        return (
            <div className="bg-[#f4f4f4] min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white border border-[#e0e0e0] p-12 relative">
                        <div className="absolute top-0 left-0 w-2 h-full bg-[#0f62fe]"></div>
                        <div className="mb-12">
                            <p className="text-[10px] font-bold text-[#0f62fe] uppercase tracking-[2.5px] mb-2">Systems Administration</p>
                            <h2 className="text-3xl font-light text-[#161616] tracking-tighter uppercase">Enterprise Access</h2>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-8">
                            {loginError && (
                                <div className="bg-[#fff1f1] border-l-4 border-[#da1e28] text-[#da1e28] px-4 py-3 text-xs font-bold uppercase tracking-widest">
                                    {loginError}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-widest">Operator ID</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-4 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] placeholder-[#c6c6c6] focus:outline-none focus:border-[#0f62fe] transition-all"
                                    placeholder="Username"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-widest">Passcode</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-4 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] placeholder-[#c6c6c6] focus:outline-none focus:border-[#0f62fe] transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full py-5 bg-[#161616] text-white font-bold rounded-0 hover:bg-[#393939] transition-all disabled:opacity-30 uppercase tracking-[2px] text-[12px]"
                            >
                                {isLoggingIn ? 'Verifying...' : 'Authorize Access'}
                            </button>
                        </form>

                        <button
                            onClick={() => setCurrentPage('home')}
                            className="w-full mt-8 py-4 text-[#525252] hover:text-[#161616] transition-all text-[10px] uppercase font-bold tracking-[2px] flex items-center justify-center gap-2"
                        >
                            <ChevronLeft className="w-3 h-3" /> External Site
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Helper for generic Carbon listing views
    const renderModuleView = (title, description, columns, data, actions = null) => (
        <div className="space-y-8 animate-fadeIn">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-[#525252] text-sm font-medium uppercase tracking-widest border-l-2 border-[#0f62fe] pl-3">{description}</p>
                </div>
                {actions && <div className="flex gap-2">{actions}</div>}
            </header>

            <div className="bg-white border border-[#e0e0e0] rounded-0 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#161616] text-white">
                                {columns.map((col, i) => (
                                    <th key={i} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest border-b border-[#393939]">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => (
                                <tr key={i} className="border-b border-[#f4f4f4] hover:bg-[#f4f4f4] transition-colors group">
                                    {Object.values(row).map((val, j) => (
                                        <td key={j} className="px-6 py-5 text-sm text-[#161616]">
                                            {typeof val === 'string' && (val.includes('Active') || val.includes('Status') || val.includes('Verified')) ? (
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${val.includes('Active') || val.includes('Verified') ? 'bg-[#defbe6] text-[#198038] border-[#24a148]' : 'bg-[#edf5ff] text-[#0f62fe] border-[#0f62fe]'
                                                    }`}>
                                                    {val}
                                                </span>
                                            ) : val}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // Dashboard
    return (
        <div className="flex bg-[#f4f4f4] min-h-screen">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} userProfile={{ name: username, role: 'Administrator' }} />

            <div className="flex-1 ml-[260px] p-0 min-h-screen overflow-y-auto">
                <div className="w-full px-4 md:px-8 py-8">
                    {/* Dashboard Header */}
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-3xl font-light text-[#161616] mb-1">
                                {{
                                    'dashboard': 'Control Center',
                                    'appointments': 'Booking Management',
                                    'services': 'Clinical Services',
                                    'specialists': 'Personnel Management',
                                    'calendar': 'Schedule Overview',
                                    'reports': 'Intelligence & Reports',
                                    'feedback': 'Satisfaction Meter',
                                    'queue': 'Live Queue Control',
                                    'settings': 'System Configuration',
                                }[activeTab] || activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')}
                            </h1>
                            <p className="text-[#525252] text-sm font-medium">Operator: {username}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-[#0f62fe]" />
                                <input
                                    type="text"
                                    placeholder="Search anything..."
                                    className="pl-10 pr-4 py-2.5 bg-white border border-[#e0e0e0] rounded-0 text-sm focus:outline-none focus:border-[#0f62fe] transition-all w-64"
                                />
                            </div>

                            <button className="p-2.5 bg-white border border-[#e0e0e0] rounded-0 text-gray-500 hover:bg-[#f4f4f4] transition-colors relative">
                                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#da1e28] rounded-full border-2 border-white"></div>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
                            </button>

                            <div className="h-10 w-[1px] bg-[#e0e0e0] mx-2"></div>

                            <button
                                onClick={() => setCurrentPage('home')}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e0e0e0] text-[#161616] rounded-0 hover:bg-[#f4f4f4] transition-all text-sm font-medium"
                            >
                                <ChevronLeft className="w-4 h-4" /> Exit
                            </button>
                        </div>
                    </div>

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
                                        <div key={i} className="bg-white p-6 rounded-0 border border-[#e0e0e0] hover:bg-[#f4f4f4] transition-colors relative overflow-hidden group">
                                            <p className="text-[#525252] text-xs font-medium uppercase tracking-wider mb-2">{stat.label}</p>
                                            <div className="flex items-end justify-between">
                                                <h3 className="text-3xl font-light text-[#161616]">{stat.value}</h3>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.positive ? 'bg-[#edf5ff] text-[#0f62fe]' : 'bg-[#fff1f1] text-[#da1e28]'}`}>
                                                    {stat.change}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f62fe] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Main Chart/Map Area */}
                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="bg-white p-6 rounded-0 border border-[#e0e0e0]">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="font-medium text-[#161616]">Recent Activity</h3>
                                                <button className="text-xs font-medium text-[#0f62fe] hover:underline">View Detailed Report</button>
                                            </div>
                                            <div className="h-[300px] w-full bg-[#f4f4f4] rounded-0 border border-dashed border-[#e0e0e0] flex items-center justify-center">
                                                <p className="text-[#8d8d8d] text-sm italic font-mono">Activity visualization placeholder</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sidebar Info Area */}
                                    <div className="space-y-8">
                                        <div className="bg-white p-6 rounded-0 border border-[#e0e0e0]">
                                            <h3 className="font-medium text-[#161616] mb-6 uppercase text-[12px] tracking-[0.32px]">System Status</h3>
                                            <div className="space-y-4">
                                                {[
                                                    { label: 'Server Status', status: 'Optimal', color: 'bg-[#24a148]' },
                                                    { label: 'Payment Gateway', status: 'Active', color: 'bg-[#24a148]' },
                                                    { label: 'SMS Provider', status: 'Active', color: 'bg-[#24a148]' }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between p-4 bg-[#f4f4f4] rounded-0 border-l-4 border-l-[#24a148]">
                                                        <span className="text-sm text-[#525252]">{item.label}</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                                            <span className="text-xs font-mono text-[#161616]">{item.status}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ==================== SERVICES TAB ==================== */}
                        {activeTab === 'services' && (
                            <div className="space-y-8">
                                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[#525252] text-sm font-medium uppercase tracking-widest border-l-2 border-[#0f62fe] pl-3">Configure clinical listings, dynamic pricing models, and service durations.</p>
                                    </div>
                                </header>

                                <div className="grid lg:grid-cols-3 gap-8">
                                    {/* Add Service Form */}
                                    <div className="lg:col-span-1 border border-[#e0e0e0] bg-white p-8">
                                        <h3 className="text-lg font-bold text-[#161616] mb-8 uppercase tracking-wider border-b-2 border-[#0f62fe] inline-block pb-1">New Service</h3>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Service Name</label>
                                                <input
                                                    className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] placeholder-[#c6c6c6] focus:outline-none focus:border-[#0f62fe] transition-all"
                                                    placeholder="e.g. Luxury Van Transport"
                                                    value={newService.name}
                                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Price</label>
                                                    <input
                                                        className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] focus:outline-none focus:border-[#0f62fe] transition-all"
                                                        placeholder="PHP 0.00"
                                                        value={newService.price}
                                                        onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Duration</label>
                                                    <input
                                                        className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] focus:outline-none focus:border-[#0f62fe] transition-all"
                                                        placeholder="e.g. 1h 30m"
                                                        value={newService.duration}
                                                        onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Category</label>
                                                <div className="space-y-2">
                                                    <select
                                                        className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] focus:outline-none focus:border-[#0f62fe] transition-all appearance-none"
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
                                                            className="w-full px-4 py-3 bg-white border-2 border-[#0f62fe] rounded-0 text-gray-800 placeholder-gray-400 focus:outline-none"
                                                            placeholder="Enter new category name"
                                                            value={newService.customCategory || ''}
                                                            onChange={(e) => setNewService({ ...newService, customCategory: e.target.value })}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Icon (Emoji)</label>
                                                <input
                                                    className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] focus:outline-none focus:border-[#0f62fe] transition-all"
                                                    placeholder="e.g. 🚐"
                                                    value={newService.icon}
                                                    onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                                                />
                                            </div>

                                            {newService.category?.toUpperCase() === 'TRANSPORT' || newService.category === 'NEW_CATEGORY' ? (
                                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#f4f4f4]">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-[#0f62fe] uppercase tracking-widest">Base Fare (Min)</label>
                                                        <input
                                                            type="number"
                                                            className="w-full px-4 py-3 bg-blue-50 border border-[#0f62fe] rounded-0 text-gray-800"
                                                            placeholder="50"
                                                            value={newService.base_fare}
                                                            onChange={(e) => setNewService({ ...newService, base_fare: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-[#0f62fe] uppercase tracking-widest">Rate per KM</label>
                                                        <input
                                                            type="number"
                                                            className="w-full px-4 py-3 bg-blue-50 border border-[#0f62fe] rounded-0 text-gray-800"
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
                                                        const res = await fetch('/api/booking-services', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify(payload)
                                                        });
                                                        const data = await res.json();
                                                        if (data.success) {
                                                            setBookingServices([...bookingServices, data.service]);
                                                            setNewService({ name: '', duration: '30m', price: 'PHP 0.00', icon: '', category: payload.category });
                                                        }
                                                    } catch (err) {
                                                        alert('Failed to add service');
                                                    } finally {
                                                        setIsAddingService(false);
                                                    }
                                                }}
                                                className="w-full py-3 bg-[#0f62fe] text-white font-bold uppercase tracking-widest text-[12px] disabled:opacity-50 hover:bg-[#465a8f] transition-all"
                                            >
                                                {isAddingService ? 'Saving...' : 'Add Service'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Services List */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <div className="bg-white border border-[#e0e0e0] overflow-hidden">
                                            <div className="grid grid-cols-[3rem_1fr_120px_100px_80px] bg-[#161616] text-white p-4 text-[10px] font-bold uppercase tracking-widest">
                                                <div className="text-center">#</div>
                                                <div>Service Entity</div>
                                                <div>Category</div>
                                                <div className="text-right">Pricing</div>
                                                <div className="text-right">Op</div>
                                            </div>
                                            <div className="divide-y divide-[#f4f4f4]">
                                                {bookingServices.map((s, idx) => (
                                                    <div key={s.id} className="grid grid-cols-[3rem_1fr_120px_100px_80px] p-5 items-center group hover:bg-[#f4f4f4] transition-colors">
                                                        <div className="text-xl text-center grayscale group-hover:grayscale-0 transition-all">{s.icon || '🛠️'}</div>
                                                        <div>
                                                            <h4 className="font-bold text-[#161616] leading-tight">{s.name}</h4>
                                                            <p className="text-[10px] text-[#8d8d8d] font-mono mt-0.5">{s.duration} Duration</p>
                                                        </div>
                                                        <div>
                                                            <span className="bg-[#edf5ff] text-[#0f62fe] px-2 py-0.5 text-[9px] font-bold uppercase border border-[#0f62fe]">
                                                                {s.category}
                                                            </span>
                                                        </div>
                                                        <div className="text-right font-mono font-bold text-[#161616] text-xs">
                                                            {s.category?.toUpperCase() === 'TRANSPORT' ? (
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-[#0f62fe]">{parseFloat(s.base_fare || 0).toFixed(0)} BASE</span>
                                                                    <span className="text-[#24a148] text-[9px]">{parseFloat(s.per_km_rate || 0).toFixed(0)}/KM</span>
                                                                </div>
                                                            ) : s.price}
                                                        </div>
                                                        <div className="text-right">
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm('Confirm deletion?')) {
                                                                        try {
                                                                            await fetch(`/api/booking-services/${s.id}`, { method: 'DELETE' });
                                                                            setBookingServices(bookingServices.filter(x => x.id !== s.id));
                                                                        } catch (err) { }
                                                                    }
                                                                }}
                                                                className="text-[#da1e28] text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 hover:underline transition-all"
                                                            >
                                                                Del
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {bookingServices.length === 0 && (
                                                <div className="py-20 text-center text-[#c6c6c6] text-xs font-mono uppercase border-t border-[#f4f4f4]">
                                                    Systems Ready // No Services Initialized
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* ==================== SPECIALISTS TAB ==================== */}
                        {activeTab === 'specialists' && (
                            <div className="space-y-8 animate-fadeIn">
                                <header>
                                    <p className="text-[#525252] text-sm font-medium uppercase tracking-widest border-l-2 border-[#0f62fe] pl-3">Assign clinical specialists and operational staff to services.</p>
                                </header>

                                <div className="grid lg:grid-cols-3 gap-8">
                                    {/* Add Specialist Form */}
                                    <div className="lg:col-span-1 border border-[#e0e0e0] bg-white p-8">
                                        <h3 className="text-lg font-bold text-[#161616] mb-8 uppercase tracking-wider border-b-2 border-[#0f62fe] inline-block pb-1">New Entry</h3>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Full Name</label>
                                                <input
                                                    className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] placeholder-[#c6c6c6] focus:outline-none focus:border-[#0f62fe] transition-all"
                                                    placeholder="e.g. Dr. Jordan Smith"
                                                    value={newSpecialist.name}
                                                    onChange={(e) => setNewSpecialist({ ...newSpecialist, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Title / Specialty</label>
                                                <input
                                                    className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] placeholder-[#c6c6c6] focus:outline-none focus:border-[#0f62fe] transition-all"
                                                    placeholder="e.g. Lead Surgeon"
                                                    value={newSpecialist.title}
                                                    onChange={(e) => setNewSpecialist({ ...newSpecialist, title: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">Email Access</label>
                                                <input
                                                    className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] placeholder-[#c6c6c6] focus:outline-none focus:border-[#0f62fe] transition-all"
                                                    placeholder="jordan@enterprise.com"
                                                    value={newSpecialist.email}
                                                    onChange={(e) => setNewSpecialist({ ...newSpecialist, email: e.target.value })}
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
                                                        alert('Operation failed');
                                                    } finally {
                                                        setIsAddingSpecialist(false);
                                                    }
                                                }}
                                                className="w-full py-4 bg-[#161616] text-white rounded-0 font-bold text-[12px] uppercase tracking-widest hover:bg-[#393939] transition-all disabled:opacity-30"
                                            >
                                                {isAddingSpecialist ? 'Registering...' : 'Register Specialist'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Specialists List */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <div className="bg-white border border-[#e0e0e0] overflow-hidden">
                                            <div className="grid grid-cols-[4rem_1fr_1fr_80px] bg-[#161616] text-white p-4 text-[10px] font-bold uppercase tracking-widest">
                                                <div className="text-center">Avatar</div>
                                                <div>Identity</div>
                                                <div>Email / Access</div>
                                                <div className="text-right">Actions</div>
                                            </div>
                                            <div className="divide-y divide-[#f4f4f4]">
                                                {specialists.map(spec => (
                                                    <div key={spec.id} className="grid grid-cols-[4rem_1fr_1fr_80px] p-6 items-center group hover:bg-[#f4f4f4] transition-colors">
                                                        <div className="flex justify-center">
                                                            <div className="w-10 h-10 bg-[#edf5ff] border border-[#0f62fe] flex items-center justify-center text-[#0f62fe] font-bold overflow-hidden">
                                                                {spec.imageUrl ? <img src={spec.imageUrl} alt="" className="w-full h-full object-cover" /> : spec.name.charAt(0)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-[#161616]">{spec.name}</h4>
                                                            <p className="text-[10px] text-[#0f62fe] font-bold uppercase tracking-widest">{spec.title}</p>
                                                        </div>
                                                        <div className="text-xs text-[#525252] font-mono">{spec.email}</div>
                                                        <div className="text-right">
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm('Revoke access?')) {
                                                                        try {
                                                                            await fetch(`/api/specialists/${spec.id}`, { method: 'DELETE' });
                                                                            setSpecialists(specialists.filter(x => x.id !== spec.id));
                                                                        } catch (err) { }
                                                                    }
                                                                }}
                                                                className="text-[#da1e28] text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:underline"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {specialists.length === 0 && (
                                                <div className="py-20 text-center text-[#c6c6c6] text-xs font-mono uppercase border-t border-[#f4f4f4]">
                                                    Personnel Database Empty // No Specialists Found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ==================== APPOINTMENTS TAB ==================== */}
                        {activeTab === 'appointments' && (
                            <div className="space-y-6">
                                {/* Analytics Chart */}
                                {(() => {
                                    const chartData = [
                                        { label: 'Pending', value: stats.pending, color: '#F59E0B' },
                                        { label: 'Confirmed', value: stats.confirmed, color: '#3B82F6' },
                                        { label: 'Completed', value: stats.completed, color: '#10B981' },
                                        { label: 'Cancelled', value: stats.cancelled, color: '#EF4444' },
                                    ];
                                    const total = stats.total || 1;
                                    const radius = 54;
                                    const circumference = 2 * Math.PI * radius;
                                    let cumulative = 0;
                                    return (
                                        <div className="bg-white rounded-0 border border-gray-200 shadow-sm p-5 mb-6">
                                            <div className="flex flex-col md:flex-row items-center gap-6">
                                                {/* Donut Chart */}
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
                                                                <circle
                                                                    key={i}
                                                                    cx="64" cy="64" r={radius}
                                                                    fill="none"
                                                                    stroke={seg.color}
                                                                    strokeWidth="16"
                                                                    strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                                                                    strokeDashoffset={offset}
                                                                    strokeLinecap="butt"
                                                                    transform="rotate(-90 64 64)"
                                                                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                                                                />
                                                            );
                                                        })}
                                                        <text x="64" y="58" textAnchor="middle" className="text-2xl font-bold" fill="#1F2937" fontSize="22" fontWeight="700">{stats.total}</text>
                                                        <text x="64" y="76" textAnchor="middle" fill="#6B7280" fontSize="10">Total</text>
                                                    </svg>
                                                </div>
                                                {/* Legend + Bar Breakdown */}
                                                <div className="flex-1 w-full">
                                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Appointment Status</h3>
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
                                    );
                                })()}

                                {/* Search & Filter Bar */}
                                <div className="space-y-6">
                                    {/* Search & Filter Bar */}
                                    <div className="bg-white rounded-0 p-6 border border-[#e0e0e0] mb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-[#525252] text-xs font-medium uppercase tracking-[0.32px] mb-2">Search Records</label>
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search by name, phone, or email..."
                                                    className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] placeholder-[#8d8d8d] focus:outline-none focus:border-[#0f62fe] text-sm transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[#525252] text-xs font-medium uppercase tracking-[0.32px] mb-2">Date From</label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] focus:outline-none focus:border-[#0f62fe] text-sm transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[#525252] text-xs font-medium uppercase tracking-[0.32px] mb-2">Date To</label>
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="w-full px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] focus:outline-none focus:border-[#0f62fe] text-sm transition-all"
                                                />
                                            </div>
                                        </div>
                                        {(searchQuery || startDate || endDate) && (
                                            <button
                                                onClick={clearFilters}
                                                className="mt-3 text-sm text-[#0f62fe] hover:underline"
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
                                                    ? 'bg-[#0f62fe] text-white'
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
                                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f62fe] mb-4"></div>
                                            <p className="text-gray-500">Loading appointments...</p>
                                        </div>
                                    ) : filteredAppointments.length === 0 ? (
                                        <div className="text-center py-16 bg-blue-50 rounded-0 border border-[#e0e0e0]">
                                            <p className="text-gray-500">No appointments found</p>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-0 border border-[#e0e0e0] shadow-sm overflow-hidden">
                                            {/* Table Header */}
                                            <div className="hidden md:grid md:grid-cols-[40px_repeat(6,1fr)] gap-3 px-4 py-3 bg-[#0f62fe] border-b border-[#0f62fe] text-xs font-semibold text-white uppercase tracking-wider items-center">
                                                <span>#</span>
                                                <span>Patient</span>
                                                <span>Service</span>
                                                <span>Date</span>
                                                <span>Time</span>
                                                <span>Status</span>
                                                <span className="text-right">Actions</span>
                                            </div>
                                            {filteredAppointments.map((apt, index) => (
                                                <div key={apt.id} className={`grid grid-cols-1 md:grid-cols-[40px_repeat(6,1fr)] gap-3 px-4 py-3 items-center text-sm border-b border-blue-100 hover:bg-blue-50/50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}`}>
                                                    <span className="text-gray-400 font-mono">{apt.id}</span>
                                                    <div className="min-w-0">
                                                        <p className="text-gray-800 font-medium truncate">{apt.full_name}</p>
                                                        <p className="text-gray-400 text-sm truncate md:hidden">{apt.phone_number}</p>
                                                    </div>
                                                    <span className="text-gray-600 truncate">{apt.service_type}</span>
                                                    <span className="text-gray-600">{apt.preferred_date}</span>
                                                    <span className="text-gray-600">{apt.preferred_time}</span>
                                                    <span className={`px-2 py-1 rounded-full text-sm font-medium border w-fit ${getStatusColor(apt.status)}`}>
                                                        {apt.status}
                                                    </span>
                                                    <div className="flex flex-wrap gap-1 justify-end">
                                                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                                                            <button onClick={() => openRescheduleModal(apt)} className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs hover:bg-purple-100 transition-all border border-purple-200">
                                                                Reschedule
                                                            </button>
                                                        )}
                                                        {apt.status === 'pending' && (
                                                            <>
                                                                <button onClick={() => updateStatus(apt.id, 'confirmed')} disabled={updatingId === apt.id} className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs hover:bg-green-100 transition-all border border-green-200 disabled:opacity-50">
                                                                    Confirm
                                                                </button>
                                                                <button onClick={() => updateStatus(apt.id, 'cancelled')} disabled={updatingId === apt.id} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                        {apt.status === 'confirmed' && (
                                                            <>
                                                                <button onClick={() => updateStatus(apt.id, 'completed')} disabled={updatingId === apt.id} className="px-2 py-1 bg-blue-50 text-[#0f62fe] rounded text-xs hover:bg-blue-100 transition-all border border-[#e0e0e0] disabled:opacity-50">
                                                                    Complete
                                                                </button>
                                                                <button onClick={() => updateStatus(apt.id, 'cancelled')} disabled={updatingId === apt.id} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                        {(apt.status === 'cancelled' || apt.status === 'completed') && (
                                                            <button onClick={() => updateStatus(apt.id, 'pending')} disabled={updatingId === apt.id} className="px-2 py-1 bg-blue-50 text-[#0f62fe] rounded text-xs hover:bg-blue-100 transition-all border border-[#e0e0e0] disabled:opacity-50">
                                                                Reopen
                                                            </button>
                                                        )}
                                                        <button onClick={() => sendSMSReminder(apt)} className="px-2 py-1 bg-cyan-50 text-cyan-600 rounded text-xs hover:bg-cyan-100 transition-all border border-cyan-200" title="Send SMS Reminder">
                                                            <Smartphone className="w-3 h-3" />
                                                        </button>
                                                        <button onClick={() => printSlip(apt)} className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs hover:bg-gray-100 transition-all border border-gray-200" title="Print Appointment Slip">
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
                            <div className="bg-white rounded-0 p-6 border border-[#e0e0e0] shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <p className="text-[#525252] text-sm font-medium uppercase tracking-widest border-l-2 border-[#0f62fe] pl-3">Schedule Overview</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                if (calendarMonth === 1) {
                                                    setCalendarMonth(12);
                                                    setCalendarYear(calendarYear - 1);
                                                } else {
                                                    setCalendarMonth(calendarMonth - 1);
                                                }
                                            }}
                                            className="p-3 bg-[#f4f4f4] rounded-0 hover:bg-[#e0e0e0] text-[#161616] border border-[#e0e0e0]"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <div className="bg-[#161616] text-white px-8 py-3 text-sm font-medium uppercase tracking-[0.16px]">
                                            {new Date(calendarYear, calendarMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (calendarMonth === 12) {
                                                    setCalendarMonth(1);
                                                    setCalendarYear(calendarYear + 1);
                                                } else {
                                                    setCalendarMonth(calendarMonth + 1);
                                                }
                                            }}
                                            className="p-3 bg-[#f4f4f4] rounded-0 hover:bg-[#e0e0e0] text-[#161616] border border-[#e0e0e0]"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-center text-gray-500 text-sm py-2 font-medium">
                                            {day}
                                        </div>
                                    ))}
                                    {(() => {
                                        const firstDay = new Date(calendarYear, calendarMonth - 1, 1).getDay();
                                        const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
                                        const days = [];

                                        for (let i = 0; i < firstDay; i++) {
                                            days.push(<div key={`empty-${i}`} className="p-2"></div>);
                                        }

                                        for (let day = 1; day <= daysInMonth; day++) {
                                            const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                            const dayAppointments = calendarData.appointments?.filter(a => a.preferred_date === dateStr) || [];
                                            const isBlocked = calendarData.blockedDates?.some(b => b.blocked_date === dateStr);
                                            const isToday = dateStr === new Date().toISOString().split('T')[0];

                                            days.push(
                                                <div
                                                    key={day}
                                                    className={`min-h-[100px] p-2 rounded-0 border transition-colors ${isBlocked ? 'bg-[#fff1f1] border-[#da1e28]' :
                                                        isToday ? 'bg-[#edf5ff] border-[#0f62fe]' :
                                                            'bg-white border-[#e0e0e0]'
                                                        }`}
                                                >
                                                    <div className={`text-xs font-bold mb-2 uppercase tracking-tighter ${isToday ? 'text-[#0f62fe]' : 'text-[#8d8d8d]'}`}>
                                                        {day}
                                                    </div>
                                                    {isBlocked && (
                                                        <div className="text-xs text-red-500 truncate">Closed</div>
                                                    )}
                                                    {dayAppointments.slice(0, 2).map((apt, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`text-[10px] truncate px-2 py-0.5 mb-1 font-mono uppercase tracking-tighter ${apt.status === 'confirmed' ? 'bg-[#edf5ff] text-[#0f62fe]' :
                                                                apt.status === 'pending' ? 'bg-[#fcf4d6] text-[#161616]' :
                                                                    apt.status === 'completed' ? 'bg-[#defbe6] text-[#198038]' :
                                                                        'bg-[#f4f4f4] text-[#525252]'
                                                                }`}
                                                        >
                                                            {apt.preferred_time.split(' ')[0]} {apt.full_name.split(' ')[0]}
                                                        </div>
                                                    ))}
                                                    {dayAppointments.length > 2 && (
                                                        <div className="text-xs text-gray-500">+{dayAppointments.length - 2} more</div>
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
                                <div className="bg-white rounded-0 p-6 border border-[#e0e0e0]">
                                    <div className="flex flex-wrap gap-6 items-end">
                                        <div>
                                            <label className="block text-[#525252] text-xs font-medium uppercase tracking-[0.32px] mb-2">Start Date</label>
                                            <input
                                                type="date"
                                                value={reportStartDate}
                                                onChange={(e) => setReportStartDate(e.target.value)}
                                                className="px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] text-sm focus:outline-none focus:border-[#0f62fe]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[#525252] text-xs font-medium uppercase tracking-[0.32px] mb-2">End Date</label>
                                            <input
                                                type="date"
                                                value={reportEndDate}
                                                onChange={(e) => setReportEndDate(e.target.value)}
                                                className="px-4 py-3 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] text-sm focus:outline-none focus:border-[#0f62fe]"
                                            />
                                        </div>
                                        <button
                                            onClick={fetchReports}
                                            className="px-6 py-3 bg-[#0f62fe] text-white rounded-0 font-bold text-[12px] uppercase tracking-widest hover:bg-[#0353e9]"
                                        >
                                            Generate Report
                                        </button>
                                    </div>
                                </div>

                                {reportStats && (
                                    <>
                                        {/* Summary Cards */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 border-t border-l border-[#e0e0e0]">
                                            {[
                                                { label: 'Total Appointments', val: reportStats.totals?.total || 0 },
                                                { label: 'Completed', val: reportStats.totals?.completed || 0 },
                                                { label: 'Cancelled', val: reportStats.totals?.cancelled || 0 },
                                                { label: 'Completion Rate', val: (reportStats.totals?.total > 0 ? Math.round((reportStats.totals.completed / reportStats.totals.total) * 100) : 0) + '%' }
                                            ].map((s, i) => (
                                                <div key={i} className="bg-[#161616] p-8 border-r border-b border-[#393939]">
                                                    <p className="text-[#c6c6c6] text-[10px] font-bold uppercase tracking-widest mb-2">{s.label}</p>
                                                    <p className="text-4xl font-light text-white">{s.val}</p>
                                                </div>
                                            ))}
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
                                                                    className="h-full bg-[#0f62fe]"
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
                                                        <p className="text-[#0f62fe] font-medium">{item.time}</p>
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
                                <p className="text-[#525252] text-sm font-medium uppercase tracking-widest border-l-2 border-[#0f62fe] pl-3">Citizen Satisfaction Measurement & ARTA Feedback</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
                                        { label: 'Overall CSAT', val: (csmStats?.excellentPercent || '0') + '%', color: '#0f62fe' },
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
                                    <h4 className="text-sm font-bold uppercase mb-8 tracking-widest text-[#0f62fe]">Service Quality Dimensions (ARTA Standards)</h4>
                                    <div className="space-y-4">
                                        {csmStats?.sqdAverages && Object.entries(csmStats.sqdAverages).map(([q, val]) => (
                                            <div key={q} className="flex items-center justify-between p-4 bg-white border border-[#e0e0e0]">
                                                <span className="text-xs uppercase font-bold text-[#525252]">{q}</span>
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-64 h-2 bg-[#e0e0e0]">
                                                        <div className="h-full bg-[#0f62fe]" style={{ width: `${(parseFloat(val) || 0) * 20}%` }}></div>
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



                        {/* Reschedule Modal */}
                        {rescheduleModal && (
                            <div className="fixed inset-0 bg-[#393939]/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                                <div className="bg-white rounded-0 p-10 w-full max-w-md border-t-8 border-[#0f62fe]">
                                    <h3 className="text-3xl font-light text-[#161616] mb-2 uppercase tracking-tighter">Reschedule</h3>
                                    <p className="text-sm text-[#525252] mb-10 font-medium uppercase tracking-[0.32px]">
                                        Client: <span className="text-[#161616]">{rescheduleModal.full_name}</span>
                                    </p>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-[#525252] text-xs font-bold uppercase tracking-widest mb-2">New Date</label>
                                            <input
                                                type="date"
                                                value={newDate}
                                                onChange={(e) => handleDateChange(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-4 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] focus:outline-none focus:border-[#0f62fe]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[#525252] text-xs font-bold uppercase tracking-widest mb-2">New Time Slot</label>
                                            <select
                                                value={newTime}
                                                onChange={(e) => setNewTime(e.target.value)}
                                                className="w-full px-4 py-4 bg-[#f4f4f4] border-b-2 border-[#8d8d8d] rounded-0 text-[#161616] focus:outline-none focus:border-[#0f62fe]"
                                            >
                                                <option value="">Select time slot</option>
                                                {availableSlots.map(slot => (
                                                    <option key={slot} value={slot}>{slot}</option>
                                                ))}
                                            </select>
                                            {availableSlots.length === 0 && newDate && (
                                                <p className="text-[#da1e28] text-xs mt-2 uppercase font-bold tracking-widest">No slots available</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-12">
                                        <button
                                            onClick={() => setRescheduleModal(null)}
                                            className="flex-1 py-4 bg-[#e0e0e0] text-[#161616] rounded-0 font-bold text-[12px] uppercase tracking-widest hover:bg-[#c6c6c6] transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleReschedule}
                                            disabled={!newDate || !newTime || isRescheduling}
                                            className="flex-1 py-4 bg-[#0f62fe] text-white font-bold text-[12px] uppercase tracking-widest rounded-0 hover:bg-[#0353e9] transition-all disabled:opacity-30"
                                        >
                                            {isRescheduling ? 'Saving...' : 'Confirm'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'monitoring' && (
                            <TripMonitoringView />
                        )}
                        {activeTab === 'corporate' && (
                            <CorporateClientsView />
                        )}
                        {activeTab === 'payments' && (
                            <PaymentsManagementView />
                        )}
                        {activeTab === 'Drivers' && (
                            <DriverManagerView />
                        )}
                        {activeTab === 'verification' && (
                            <DriverVerificationView />
                        )}
                        {(activeTab === 'tickets' || activeTab === 'disputes') && (
                            <SupportDisputeView />
                        )}
                        {activeTab === 'reports' && (
                            <IntelligenceReportsView />
                        )}
                        {activeTab === 'zones' && (
                            <PricingZonesView />
                        )}
                        {activeTab === 'sos' && (
                            <SOSAlertsView />
                        )}
                        {activeTab === 'scheduling' && (
                            <RideSchedulingView />
                        )}
                        {activeTab === 'billing' && (
                            <CorporateBillingView />
                        )}
                        {activeTab === 'payouts' && (
                            <PayoutManagementView />
                        )}
                        {activeTab === 'promotions' && (
                            <PromotionsManagementView />
                        )}
                        {activeTab === 'vehicles' && (
                            <VehiclesManagementView />
                        )}
                        {activeTab === 'wallet' && (
                            <WalletManagementView />
                        )}
                        {activeTab === 'settings' && (
                            <GlobalSettingsView />
                        )}
                        {['users', 'roles', 'audit'].includes(activeTab) && (
                            renderModuleView(
                                activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1'),
                                `Management and oversight of system-wide ${activeTab} data and configurations.`,
                                ['Reference ID', 'Display Name', 'Type / Category', 'Last Updated', 'Current Status'],
                                [
                                    { id: `M001`, name: `Sample ${activeTab} Entry A`, type: 'Standard', date: '2023-10-21', status: 'Active Status' },
                                    { id: `M002`, name: `Sample ${activeTab} Entry B`, type: 'Premium', date: '2023-10-20', status: 'Pending Status' },
                                    { id: `M003`, name: `Sample ${activeTab} Entry C`, type: 'Enterprise', date: '2023-10-19', status: 'Verified Status' },
                                    { id: `M004`, name: `Sample ${activeTab} Entry D`, type: 'Legacy', date: '2023-10-18', status: 'Inactive Status' },
                                ],
                                <button className="px-6 py-3 bg-[#0f62fe] text-white rounded-0 font-bold text-[12px] uppercase tracking-widest hover:bg-[#0353e9]">
                                    Add New {activeTab.replace(/s$/, '')}
                                </button>
                            )
                        )}
                    </>

                    {/* Print Appointment Slip */}
                    {printAppointment && (
                        <div className="fixed inset-0 bg-[#393939]/80 flex items-center justify-center z-50 p-4 print:bg-white print:p-0 backdrop-blur-sm">
                            <div className="bg-white rounded-0 p-12 w-full max-w-md print:p-0 border-t-8 border-t-[#0f62fe]">
                                <div className="text-center mb-8 pb-8 border-b border-[#f4f4f4]">
                                    <h2 className="text-2xl font-light text-[#161616] uppercase tracking-tighter">Enterprise Queuing</h2>
                                    <p className="text-[#525252] text-[10px] font-bold uppercase tracking-widest mt-1">Service Confirmation Slip</p>
                                </div>
                                <div className="space-y-6 mb-10">
                                    <div>
                                        <p className="text-[10px] font-bold text-[#8d8d8d] uppercase mb-1">Client</p>
                                        <p className="text-lg font-medium text-[#161616]">{printAppointment.full_name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-[10px] font-bold text-[#8d8d8d] uppercase mb-1">Service</p>
                                            <p className="text-sm font-medium text-[#161616]">{printAppointment.service_type}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[#8d8d8d] uppercase mb-1">Schedule</p>
                                            <p className="text-sm font-medium text-[#161616]">{printAppointment.preferred_date}</p>
                                            <p className="text-xs text-[#525252]">{printAppointment.preferred_time}</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#f4f4f4] p-6 text-center">
                                        <p className="text-[10px] font-bold text-[#8d8d8d] uppercase mb-1">Reference ID</p>
                                        <p className="text-3xl font-mono text-[#161616] tracking-tighter">#{printAppointment.id}</p>
                                    </div>
                                </div>

                                <p className="text-[10px] text-[#8d8d8d] text-center uppercase tracking-widest leading-relaxed">Please arrive 15 minutes early.<br />Present this slip at the front desk.</p>

                                <div className="mt-10 flex gap-4 print:hidden">
                                    <button
                                        onClick={() => setPrintAppointment(null)}
                                        className="flex-1 py-4 bg-[#e0e0e0] text-[#161616] font-bold text-[12px] uppercase tracking-widest hover:bg-[#c6c6c6]"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="flex-1 py-4 bg-[#0f62fe] text-white font-bold text-[12px] uppercase tracking-widest hover:bg-[#0353e9]"
                                    >
                                        Print Slip
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

// My Appointment Page - Patient Self-Service
const MyAppointment = ({ token: initialToken }) => {
    const [token, setToken] = useState(initialToken || '');
    const [email, setEmail] = useState('');
    const [referenceId, setReferenceId] = useState('');
    const [appointment, setAppointment] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [trackingData, setTrackingData] = useState(null);
    const [trackerInterval, setTrackerInterval] = useState(null);

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
        if (trackerInterval) clearInterval(trackerInterval);
        const itv = setInterval(async () => {
            try {
                const res = await fetch(`/api/patient/appointment/${tk}/tracker`);
                const data = await res.json();
                if (data.success && data.tracking) {
                    setTrackingData(data.tracking);
                }
            } catch (e) { }
        }, 5000);
        setTrackerInterval(itv);
    };

    useEffect(() => {
        return () => { if (trackerInterval) clearInterval(trackerInterval); };
    }, [trackerInterval]);

    const handleLookup = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/patient/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, referenceId })
            });
            const data = await res.json();
            if (data.success) {
                setAppointment(data.appointment);
                if (data.appointment.cancel_token) {
                    setToken(data.appointment.cancel_token);
                    if (data.appointment.rider_id || data.appointment.service_type?.toUpperCase().includes('TRANSPORT') || data.appointment.service_type?.toUpperCase().includes('VAN')) {
                        startTracking(data.appointment.cancel_token);
                    }
                }
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('An error occurred during lookup.');
        } finally {
            setLoading(false);
        }
    };

    if (appointment) {
        return (
            <div className="max-w-4xl mx-auto py-10 px-4">
                <div className="bg-white border border-[#e0e0e0] p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6">
                        <span className={`px-4 py-1 text-[10px] font-bold uppercase tracking-widest border border-current ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                        </span>
                    </div>

                    <h2 className="text-4xl font-light text-[#161616] mb-8 uppercase tracking-tighter">Track Order</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.32px] mb-1">Customer</p>
                                <p className="font-medium text-lg text-[#161616]">{appointment.full_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.32px] mb-1">Vehicle / Service</p>
                                <p className="font-medium text-[#161616]">{appointment.service_type}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.32px] mb-1">Scheduled Time</p>
                                <p className="font-medium text-[#161616]">{appointment.preferred_date} at {appointment.preferred_time}</p>
                            </div>
                        </div>

                        <div className="bg-[#f4f4f4] p-8 border-l-4 border-[#0f62fe]">
                            <p className="text-[10px] font-bold text-[#525252] uppercase mb-4 tracking-[0.32px]">Pickup Point</p>
                            <p className="text-sm font-medium text-[#161616]">{appointment.pickup_location}</p>
                            <div className="mt-6 pt-6 border-t border-[#e0e0e0]">
                                <p className="text-[10px] font-bold text-[#525252] uppercase mb-1 tracking-[0.32px]">Reference ID</p>
                                <p className="text-2xl font-mono text-[#161616]">#{appointment.id}</p>
                            </div>
                        </div>
                    </div>

                    {trackingData && trackingData.rider_id && (
                        <div className="mt-10 pt-10 border-t border-[#1c1917] animate-in slide-in-from-bottom duration-500">
                            <div className="h-[450px] bg-gray-50 border border-[#e0e0e0] shadow-inner relative z-0 overflow-hidden group">
                                <LiveTrackingMap
                                    riderPos={trackingData.current_lat ? { lat: parseFloat(trackingData.current_lat), lng: parseFloat(trackingData.current_lng) } : null}
                                    pickupPos={trackingData.pickup_lat ? { lat: parseFloat(trackingData.pickup_lat), lng: parseFloat(trackingData.pickup_lng) } : null}
                                    destPos={trackingData.dest_lat ? { lat: parseFloat(trackingData.dest_lat), lng: parseFloat(trackingData.dest_lng) } : null}
                                    status={trackingData.transport_status}
                                />




                                {/* Status Floating Badge */}
                                <div className="absolute top-4 left-4 z-[1000] bg-[#1c1917] text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-xl">
                                    {trackingData.transport_status?.replace(/_/g, ' ') || 'Searching'}
                                </div>
                            </div>

                            {/* Rider Info Card BELOW Map */}
                            <div className="mt-8 bg-white border border-[#e0e0e0] p-8 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
                                <div className="flex items-center gap-8 flex-1 w-full">
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-[#161616] flex items-center justify-center text-white text-3xl font-light border-4 border-[#f4f4f4] transition-transform group-hover:scale-105 duration-300">
                                            {trackingData.rider_name?.charAt(0)}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#24a148] border-4 border-white rounded-full"></div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-4 mb-4">
                                            <h4 className="text-2xl font-light text-[#161616] uppercase tracking-tighter leading-none">{trackingData.rider_name}</h4>
                                            <span className="bg-[#f1c21b] text-[#161616] px-2 py-1 text-[10px] font-bold uppercase flex items-center gap-1">
                                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" /></svg>
                                                4.9 Rating
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 border-t border-[#f4f4f4] pt-6">
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] font-bold text-[#8d8d8d] uppercase tracking-[0.32px] leading-none">Vehicle</p>
                                                <p className="text-xs font-medium text-[#161616] uppercase leading-none">{trackingData.vehicle_type || 'Luxury Transport'}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] font-bold text-[#8d8d8d] uppercase tracking-[0.32px] leading-none">Plate</p>
                                                <p className="text-xs font-mono text-[#0f62fe] uppercase leading-none">{trackingData.plate_number || '---'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full md:w-auto">
                                    <a href={`tel:${trackingData.rider_phone}`} className="flex-1 md:flex-none carbon-btn-primary px-10 py-5 font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        Contact Driver
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {!trackingData?.rider_id && (appointment.service_type?.toUpperCase().includes('TRANSPORT') || appointment.service_type?.toUpperCase().includes('VAN')) && (
                        <div className="mt-10 pt-10 border-t border-[#1c1917] text-center bg-gray-50 py-12 border border-dashed animate-pulse">
                            <div className="text-3xl mb-4">[MAP]</div>
                            <p className="text-sm font-bold text-[#1c1917] uppercase tracking-widest">Waiting for a rider...</p>
                            <p className="text-xs text-[#666] mt-2">Your Luxury Transport request is pending assignment.</p>
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
                <p className="text-[10px] text-[#0f62fe] font-black mb-4 uppercase tracking-[2px]">Customer Lookup</p>
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
    const tabs = [
        { id: 'home', label: 'Home' },
        { id: 'queue', label: 'Queue' },
        { id: 'queue-display', label: 'Display' },
        { id: 'queue-teller', label: 'Teller' },
        { id: 'survey', label: 'Feedback' },
        { id: 'passenger', label: 'Passenger' },
        { id: 'rider', label: 'Rider' }
    ];
    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-[100px] bg-[#161616] text-white">
            <div className="w-full px-8 h-[70px] flex items-center justify-between border-b border-[#393939]">
                <div className="flex items-center space-x-8">
                    <h1 className="text-xl font-bold uppercase tracking-tight cursor-pointer" onClick={() => setCurrentPage('home')}>Service<span className="font-light">Box</span></h1>
                    <nav className="hidden lg:flex items-center space-x-1">
                        {tabs.map(t => (
                            <button key={t.id} onClick={() => setCurrentPage(t.id)} className={`px-4 py-6 text-sm font-medium transition-all border-b-2 ${currentPage === t.id ? 'border-[#0f62fe] text-white' : 'border-transparent text-[#c6c6c6] hover:text-white'}`}>{t.label}</button>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={() => { localStorage.setItem('adminActiveTab', 'settings'); setCurrentPage('admin'); }} className="p-2 hover:bg-[#262626]"><Settings className="w-5 h-5 text-[#c6c6c6]" /></button>
                    <button onClick={() => setCurrentPage('queue-teller')} className="bg-[#0f62fe] px-4 py-2 text-sm font-medium hover:bg-[#0353e9]">LOG IN</button>
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
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white border-b border-[#e0e0e0]">
                <div className="relative min-h-[70vh] flex items-center">
                    {/* Subtle Background */}
                    <div className="absolute inset-0 bg-[#f4f4f4]"></div>

                    <div className="relative z-10 max-w-[1584px] mx-auto px-8 w-full py-24">
                        <div className="max-w-3xl">
                            <span className="inline-block px-4 py-1 bg-[#0f62fe] text-white text-[10px] font-bold uppercase tracking-[2px] mb-8">
                                Welcome to King's Tourist and Transport Services!
                            </span>
                            <h1 className="text-6xl lg:text-8xl font-light text-[#161616] mb-8 leading-[1.05] tracking-tighter">
                                Your Gateway to Land and Sea <br />
                                <span className="text-[#0f62fe]">Adventure.</span>
                            </h1>
                            <p className="text-xl text-[#525252] mb-12 max-w-xl leading-relaxed font-light">
                                Discover the beauty of every destination with KINGS affordable, convenient, and ready on demand transport service.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a href="#booking-section" className="carbon-btn-primary px-10 py-4 font-bold uppercase tracking-widest text-[12px] flex items-center gap-3">
                                    Book Appointment
                                    <ArrowRight className="w-5 h-5" />
                                </a>
                                <button onClick={() => setCurrentPage('queue')} className="bg-white border border-[#161616] text-[#161616] px-10 py-4 font-bold uppercase tracking-widest text-[12px] hover:bg-[#161616] hover:text-white transition-all">
                                    Live Queue Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Form Section */}
            <section id="booking-section" className="bg-[#f4f4f4] py-24 lg:py-32">
                <div className="max-w-[1584px] mx-auto px-8">
                    <div className="mb-16">
                        <h2 className="text-4xl font-light text-[#161616] uppercase tracking-tighter">Booking Engine</h2>
                        <p className="text-[#525252] mt-2">Complete the steps below to schedule your clinical visit.</p>
                    </div>
                    <AppointmentForm />
                </div>
            </section>

            {/* Stats Section - Alternating Background */}
            <section className="bg-white py-24 border-t border-[#e0e0e0]">
                <div className="max-w-[1584px] mx-auto px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 border-l border-t border-[#e0e0e0]">
                        {[
                            { val: '15+', label: 'Years Experience' },
                            { val: '10k+', label: 'Happy Patients' },
                            { val: '20+', label: 'Specialists' },
                            { val: '24/7', label: 'Support Available' }
                        ].map((s, i) => (
                            <div key={i} className="bg-[#f4f4f4] p-10 border-r border-b border-[#e0e0e0] hover:bg-white transition-colors group">
                                <div className="text-4xl font-mono text-[#161616] mb-2 tracking-tight">{s.val}</div>
                                <div className="text-[12px] text-[#525252] uppercase font-bold tracking-[0.32px] group-hover:text-[#0f62fe] transition-colors">{s.label}</div>
                            </div>
                        ))}
                    </div>
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
                                    <a href="#" className="w-10 h-10 bg-[#262626] hover:bg-[#0f62fe] flex items-center justify-center text-white transition-all">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-[#262626] hover:bg-[#0f62fe] flex items-center justify-center text-white transition-all">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-[#262626] hover:bg-[#0f62fe] flex items-center justify-center text-white transition-all">
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
                                        <svg className="w-4 h-4 text-[#0f62fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        +63 927 623 0491
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-[#0f62fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                <button onClick={() => setCurrentPage('my-appointment')} className="hover:text-[#0f62fe] transition-all ml-1">My Appointment</button> |
                                <button onClick={() => setCurrentPage('admin')} className="hover:text-[#0f62fe] transition-all ml-1">Admin</button>
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
                    <span className="inline-block px-4 py-1 bg-[#0f62fe]/20 text-[#0f62fe] rounded-full text-sm font-medium mb-4">
                        Our Healthcare Services
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Quality Care for Your
                        <span className="text-[#0f62fe]"> Well-being</span>
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                        Comprehensive healthcare services tailored to meet your needs. Scroll down to explore our services.
                    </p>
                </div>
                {/* Scroll indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
                    <svg className="w-6 h-6 text-[#0f62fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>

            {/* Sticky Deck Services */}
            <div className="relative px-4 md:px-8 pb-32">
                {loadingServices ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f62fe] mb-4"></div>
                        <p className="text-xl text-blue-700 font-medium">Loading services...</p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        {services.map((service, index) => (
                            <div
                                key={service.id}
                                className="sticky mb-4"
                                style={{
                                    top: `${160 + index * 20}px`,
                                    zIndex: index + 1
                                }}
                            >
                                <div
                                    className={`bg-gradient-to-br ${deckColors[index % deckColors.length]} rounded-0 shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02]`}
                                    style={{
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                    }}
                                >
                                    <div className="p-4 md:p-8">
                                        {/* Always horizontal: Icon LEFT, Text RIGHT */}
                                        <div className="flex flex-row items-start md:items-center gap-3 md:gap-6">
                                            {/* Icon - Left side */}
                                            <div className="flex-shrink-0">
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-white/80 rounded-0 md:rounded-0 flex items-center justify-center shadow-lg">
                                                    <span className="text-2xl sm:text-3xl md:text-5xl">
                                                        {serviceIcons[service.name] || serviceIcons['default']}
                                                    </span>
                                                </div>
                                                {/* Mobile card number under icon */}
                                                <div className="md:hidden mt-1 text-center">
                                                    <span className="text-xs font-bold text-stone-500">
                                                        #{String(index + 1).padStart(2, '0')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content - Right side */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-1 md:mb-2">
                                                    <h3 className="text-sm sm:text-base md:text-2xl font-bold text-blue-900 leading-tight">
                                                        {service.name}
                                                    </h3>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="text-2xl font-bold text-[#161616]">
                                                            {service.category?.toUpperCase() === 'TRANSPORT' && (service.base_fare > 0)
                                                                ? `PHP ${parseFloat(service.base_fare).toLocaleString()}`
                                                                : service.price}
                                                        </span>
                                                        <span className="text-[10px] text-[#525252] font-medium uppercase tracking-widest bg-gray-100 px-2 py-1">
                                                            {service.category?.toUpperCase() === 'TRANSPORT' ? 'Starts At' : (service.duration || '30m')}
                                                        </span>
                                                    </div>
                                                    <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-3 md:py-1 bg-blue-100 text-stone-700 rounded-full text-[10px] sm:text-xs md:text-sm font-medium">
                                                        {service.duration}min
                                                    </span>
                                                </div>
                                                <p className="text-stone-600 mb-2 md:mb-4 text-[11px] sm:text-xs md:text-base line-clamp-2">
                                                    {service.description || 'Professional healthcare service.'}
                                                    {service.category?.toUpperCase() === 'TRANSPORT' && (
                                                        <span className="block mt-1 text-[10px] italic text-blue-800">
                                                            *Final price confirmed upon distance calculation.
                                                        </span>
                                                    )}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                                    <div className="text-base sm:text-lg md:text-3xl font-bold text-blue-900">
                                                        PHP {parseFloat(service.price).toLocaleString()}
                                                    </div>
                                                    <button
                                                        onClick={() => document.getElementById('appointment-section')?.scrollIntoView({ behavior: 'smooth' })}
                                                        className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-6 md:py-3 bg-blue-700 text-white rounded-0 md:rounded-0 font-semibold hover:bg-blue-800 transition-all flex items-center gap-1 md:gap-2 shadow-lg text-[10px] sm:text-xs md:text-base"
                                                    >
                                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="hidden sm:inline">Book Now</span>
                                                        <span className="sm:hidden">Book</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Card Number - Desktop only */}
                                            <div className="hidden md:flex flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
                                                <span className="text-2xl font-bold text-stone-700">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom accent line */}
                                    <div className="h-1 bg-blue-200"></div>
                                </div>
                            </div>
                        ))}

                        {services.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-2xl text-gray-400">No services available</p>
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
                        className="px-8 py-4 bg-[#0f62fe] text-white rounded-0 font-bold text-lg hover:bg-[#465a8f] transition-all shadow-lg hover:shadow-xl"
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
                            From Php {Math.min(...item.sizes.map(s => s.price)).toFixed(2)}
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
            <div className="bg-gray-50 rounded-0 flex items-center justify-center w-16 h-16">
                {item.image && item.image.startsWith('assets/') ? (
                    <img src={item.image} alt={item.name} className="object-contain w-full h-full rounded" />
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
                          To enable: Click the lock icon in your browser's address bar -> Allow notifications
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
                                                <p className="text-lg font-medium text-[#0f62fe]">Php {(getTotalPrice() + 4.99 + getTotalPrice() * 0.08).toFixed(2)}</p>
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
                                        <p className="text-2xl font-bold text-[#0f62fe]">{fmt(avgWait)}</p>
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
                    <svg className="w-5 h-5 text-[#0f62fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
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
                        className="w-full bg-[#0f62fe] text-white py-2 rounded-0 text-sm font-bold hover:bg-blue-700 transition-all uppercase tracking-wider"
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
                        <button onClick={fetchAll} className="text-[#0f62fe] hover:text-blue-800 text-sm transition-all">Refresh</button>
                    </div>
                </div>
                {tickets.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No tickets today</p>
                ) : (
                    <>
                        {/* Table Header */}
                        <div className="hidden md:grid md:grid-cols-8 gap-3 px-4 py-3 bg-[#0f62fe] text-xs font-semibold text-white uppercase tracking-wider items-center">
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
                            className="flex-1 px-3 py-2 rounded-0 border border-[#e0e0e0] bg-blue-50 text-gray-800 text-sm placeholder-gray-400 focus:border-[#0f62fe] focus:outline-none"
                        />
                        <input
                            type="text"
                            value={newTypePrefix}
                            onChange={e => setNewTypePrefix(e.target.value.toUpperCase().slice(0, 3))}
                            placeholder="Prefix"
                            maxLength={3}
                            className="w-20 px-3 py-2 rounded-0 border border-[#e0e0e0] bg-blue-50 text-gray-800 text-sm placeholder-gray-400 focus:border-[#0f62fe] focus:outline-none"
                        />
                        <button onClick={addTransactionType} className="bg-[#0f62fe] text-white px-4 py-2 rounded-0 font-semibold text-sm hover:bg-[#465a8f] transition-all">
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
                                                    className="w-3.5 h-3.5 rounded border-blue-300 text-[#0f62fe] focus:ring-blue-500"
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
                            className="flex-1 px-3 py-2 rounded-0 border border-[#e0e0e0] bg-blue-50 text-gray-800 text-sm placeholder-gray-400 focus:border-[#0f62fe] focus:outline-none"
                        />
                        <button onClick={addTeller} className="bg-[#0f62fe] text-white px-4 py-2 rounded-0 font-semibold text-sm hover:bg-[#465a8f] transition-all">
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
                        className="flex-1 px-3 py-2 rounded-0 border border-[#e0e0e0] bg-blue-50 text-gray-800 text-sm placeholder-gray-400 focus:border-[#0f62fe] focus:outline-none"
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
                        className="bg-[#0f62fe] text-white px-4 py-2 rounded-0 font-semibold text-sm hover:bg-[#465a8f] transition-all disabled:opacity-50"
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
                        className="flex-1 px-3 py-2 rounded-0 border border-[#e0e0e0] bg-blue-50 text-gray-800 text-sm focus:border-[#0f62fe] focus:outline-none"
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
                        className="bg-[#0f62fe] text-white px-4 py-2 rounded-0 font-semibold text-sm hover:bg-[#465a8f] transition-all disabled:opacity-50"
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
                                    className="px-3 py-2 rounded-0 border border-[#e0e0e0] bg-blue-50 text-gray-800 text-sm focus:border-[#0f62fe] focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">End Date</label>
                                <input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)}
                                    className="px-3 py-2 rounded-0 border border-[#e0e0e0] bg-blue-50 text-gray-800 text-sm focus:border-[#0f62fe] focus:outline-none" />
                            </div>
                            <button onClick={fetchReport} disabled={reportLoading}
                                className="bg-[#0f62fe] text-white px-5 py-2 rounded-0 font-semibold text-sm hover:bg-[#465a8f] transition-all disabled:opacity-50">
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
                                            <div className="grid grid-cols-3 gap-3 px-4 py-2 bg-[#0f62fe] text-xs font-semibold text-white uppercase tracking-wider">
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
                                                                        className="bg-[#0f62fe] h-full rounded-full flex items-center justify-end pr-2 transition-all"
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
                                            <div className="grid grid-cols-3 gap-3 px-4 py-2 bg-[#0f62fe] text-xs font-semibold text-white uppercase tracking-wider">
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

function SurveyPage({ setCurrentPage }) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        sex: '', age: '', region: '', clientType: '',
        cc1: '', cc2: '', cc3: '',
        sqd0: 0, sqd1: 0, sqd2: 0, sqd3: 0, sqd4: 0, sqd5: 0, sqd6: 0, sqd7: 0, sqd8: 0,
        comments: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRating = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

    const submitSurvey = async () => {
        // Basic validation
        if (!formData.sex || !formData.clientType || !formData.cc1 || formData.sqd0 === 0) {
            alert('Please fill in all required fields (Sex, Client Type, CC Awareness, and Overall Satisfaction)');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    name: 'Anonymous',
                    contactNumber: '00000000000',
                    suggestions: formData.comments,
                    serviceAvailed: 'Queuing Service'
                })
            });
            const data = await res.json();
            if (data.success) {
                setIsSubmitted(true);
            } else {
                alert(data.message || 'Submission failed');
            }
        } catch (err) {
            alert('Error submitting survey');
        } finally {
            setIsSubmitting(false);
        }
    };

    const likertScale = [
        { v: 5, l: 'Strongly Agree' },
        { v: 4, l: 'Agree' },
        { v: 3, l: 'Neither' },
        { v: 2, l: 'Disagree' },
        { v: 1, l: 'Strongly Disagree' }
    ];

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-white pt-[148px] px-8 flex justify-center text-center">
                <div className="max-w-xl w-full bg-[#f4f4f4] p-16 border-t-8 border-[#24a148]">
                    <h2 className="text-5xl font-light text-[#161616] mb-8">Thank You!</h2>
                    <p className="text-xl text-[#525252] mb-12">Your feedback helps us provide better service for everyone.</p>
                    <button onClick={() => setCurrentPage('home')} className="carbon-btn-primary px-12 py-4 font-bold uppercase tracking-widest">Return Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-[148px] px-8 pb-32">
            <div className="max-w-3xl mx-auto bg-[#f4f4f4] border-t-4 border-[#0f62fe] p-12">

                {/* Header */}
                <div className="mb-12">
                    <h2 className="text-3xl font-light text-[#161616] mb-2 uppercase tracking-tight">Client Satisfaction Measurement</h2>
                    <p className="text-xs text-[#525252] uppercase font-bold tracking-[0.2em] border-b pb-4 border-[#e0e0e0]">Harmonized ARTA CSM 2024 Standard</p>
                </div>

                <div className="space-y-16">
                    {/* Step 1: Client Profile */}
                    <div className="space-y-8">
                        <h3 className="text-xl font-bold uppercase text-[#161616] border-l-4 border-[#0f62fe] pl-4">I. Client Profile</h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-[#525252]">Sex</label>
                                <select value={formData.sex} onChange={e => handleRating('sex', e.target.value)} className="carbon-input w-full p-4">
                                    <option value="">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-[#525252]">Age</label>
                                <input type="number" value={formData.age} onChange={e => handleRating('age', e.target.value)} className="carbon-input w-full p-4" placeholder="Enter age" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[#525252]">Region</label>
                            <input value={formData.region} onChange={e => handleRating('region', e.target.value)} className="carbon-input w-full p-4" placeholder="Ex. Region IV-A" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[#525252]">Client Type</label>
                            <select value={formData.clientType} onChange={e => handleRating('clientType', e.target.value)} className="carbon-input w-full p-4">
                                <option value="">Select...</option>
                                <option value="Citizen">Citizen</option>
                                <option value="Business">Business</option>
                                <option value="Government">Government (Employee or other Agency)</option>
                            </select>
                        </div>
                    </div>

                    {/* Step 2: Citizen's Charter (CC) */}
                    <div className="space-y-12">
                        <h3 className="text-xl font-bold uppercase text-[#161616] border-l-4 border-[#0f62fe] pl-4">II. Citizen's Charter (CC)</h3>

                        <div className="space-y-4">
                            <p className="text-sm font-bold text-[#161616]">CC1: Which of the following best describes your awareness of a CC?</p>
                            {[
                                "I know what a CC is and I saw this office's CC.",
                                "I know what a CC is but I did NOT see this office's CC.",
                                "I learned of the CC only when I saw this office's CC.",
                                "I do not know what a CC is and I did not see one in this office."
                            ].map((opt, i) => (
                                <button key={i} onClick={() => handleRating('cc1', opt)} className={`w-full text-left p-4 text-xs transition-all ${formData.cc1 === opt ? 'bg-[#0f62fe] text-white' : 'bg-white border hover:bg-[#e8e8e8]'}`}>{opt}</button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm font-bold text-[#161616]">CC2: If aware of CC, would you say that the CC of this office was...?</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {["Easy to see", "Somewhat easy to see", "Difficult to see", "Not visible at all", "N/A"].map(opt => (
                                    <button key={opt} onClick={() => handleRating('cc2', opt)} className={`p-4 text-xs transition-all ${formData.cc2 === opt ? 'bg-[#161616] text-white' : 'bg-white border hover:bg-[#e8e8e8]'}`}>{opt}</button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm font-bold text-[#161616]">CC3: How much did the CC help you in your transaction?</p>
                            <div className="grid grid-cols-2 gap-2">
                                {["Helped very much", "Somewhat helped", "Did not help", "N/A"].map(opt => (
                                    <button key={opt} onClick={() => handleRating('cc3', opt)} className={`p-4 text-xs transition-all ${formData.cc3 === opt ? 'bg-[#161616] text-white' : 'bg-white border hover:bg-[#e8e8e8]'}`}>{opt}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Service Quality */}
                    <div className="space-y-12">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2">
                            <h3 className="text-xl font-bold uppercase text-[#161616] border-l-4 border-[#0f62fe] pl-4">III. Service Quality</h3>
                            <p className="text-[10px] text-[#525252] font-mono">1 = Strongly Disagree | 5 = Strongly Agree</p>
                        </div>

                        <div className="space-y-8">
                            {[
                                { id: '0', q: 'I am satisfied with the service that I availed.', d: 'Overall' },
                                { id: '1', q: 'I spent a reasonable amount of time for my transaction.', d: 'Responsiveness' },
                                { id: '2', q: 'The office followed the transaction requirements and steps based on the transaction.', d: 'Reliability' },
                                { id: '3', q: 'The steps (including payment) were easy and simple.', d: 'Access' },
                                { id: '4', q: 'I easily found information about my transaction from the office or its website.', d: 'Communication' },
                                { id: '5', q: 'I paid an acceptable amount of fees for my transaction.', d: 'Costs' },
                                { id: '6', q: 'I felt the office was secure.', d: 'Integrity' },
                                { id: '7', q: 'I was treated courteously by the staff, and (if asked for help) the staff was helpful.', d: 'Assurance' },
                                { id: '8', q: 'I got what I needed from the government office.', d: 'Outcome' }
                            ].map(sqd => (
                                <div key={sqd.id} className="space-y-4 border-b border-[#e0e0e0] pb-8">
                                    <p className="text-sm font-bold">{sqd.q}</p>
                                    <div className="flex gap-1">
                                        {likertScale.map(l => (
                                            <button
                                                key={l.v}
                                                onClick={() => handleRating(`sqd${sqd.id}`, l.v)}
                                                className={`flex-1 flex flex-col items-center p-2 border transition-all ${formData[`sqd${sqd.id}`] === l.v ? 'bg-[#0f62fe] text-white border-[#0f62fe]' : 'bg-white border-[#e0e0e0] hover:bg-[#f4f4f4]'}`}
                                            >
                                                <span className="text-lg font-bold">{l.v}</span>
                                                <span className="text-[8px] uppercase font-bold text-center mt-1 hidden md:block">{l.l}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 4: Comments */}
                    <div className="space-y-8">
                        <h3 className="text-xl font-bold uppercase text-[#161616] border-l-4 border-[#0f62fe] pl-4">IV. Comments</h3>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[#525252]">Suggestions on how we can further improve our services (Optional)</label>
                            <textarea
                                value={formData.comments}
                                onChange={e => handleRating('comments', e.target.value)}
                                className="carbon-input w-full p-6 min-h-[150px]"
                                placeholder="Type your feedback here..."
                            ></textarea>
                        </div>

                        <button onClick={submitSurvey} disabled={isSubmitting} className="carbon-btn-primary w-full p-6 font-bold uppercase tracking-widest text-lg disabled:opacity-30 mt-12 shadow-xl hover:-translate-y-1 transition-all">
                            {isSubmitting ? 'Submitting...' : 'Submit Final Feedback'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QueuePage({ setCurrentPage }) {
    const [view, setView] = useState('initial');
    const [formData, setFormData] = useState({ customerName: '', cellphoneNumber: '', transactionType: '', isPriority: false, priorityType: '' });
    const [transactionTypes, setTransactionTypes] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ticket, setTicket] = useState(null);

    useEffect(() => {
        fetch('/api/queue/transaction-types')
            .then(res => res.json())
            .then(data => { if (data.success) setTransactionTypes(data.types); })
            .catch(err => console.error('Error fetching types:', err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/queue/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setTicket(data.ticket);
                setView('receipt');
            } else {
                alert(data.message || 'Failed to create ticket');
            }
        } catch (err) { alert('Server error'); }
        finally { setIsSubmitting(false); }
    };

    if (view === 'receipt' && ticket) {
        return (
            <div className="min-h-screen bg-white pt-[148px] px-8 flex justify-center">
                <div className="w-full max-w-sm bg-[#f4f4f4] p-12 text-center border-t-4 border-[#0f62fe]">
                    <p className="text-xs uppercase text-[#525252] mb-8 font-bold tracking-widest">Queue Number</p>
                    <h2 className="text-8xl font-light text-[#161616] mb-4">{ticket.ticket_number}</h2>
                    <p className="text-[#525252] text-sm mb-12 uppercase tracking-wide">{ticket.customer_name}</p>
                    <button
                        onClick={() => {
                            localStorage.setItem('lastTicketId', ticket.id);
                            setCurrentPage('survey');
                        }}
                        className="carbon-btn-primary w-full p-4 font-bold uppercase tracking-wider"
                    >
                        Go to Feedback
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-[148px] px-8 flex justify-center pb-24">
            <div className="w-full max-w-lg bg-[#f4f4f4] p-12 border-t-4 border-[#0f62fe]">
                <h2 className="text-3xl font-light text-[#161616] mb-10 uppercase tracking-tight">Generate Ticket</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-[#525252] font-bold">Full Name</label>
                        <input
                            value={formData.customerName}
                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                            className="carbon-input w-full p-4"
                            placeholder="Ex. Juan Dela Cruz"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-[#525252] font-bold">Phone Number</label>
                        <input
                            value={formData.cellphoneNumber}
                            onChange={e => setFormData({ ...formData, cellphoneNumber: e.target.value })}
                            className="carbon-input w-full p-4"
                            placeholder="09XXXXXXXXX"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-[#525252] font-bold">Transaction Type</label>
                        <select
                            value={formData.transactionType}
                            onChange={e => setFormData({ ...formData, transactionType: e.target.value })}
                            className="carbon-input w-full p-4"
                            required
                        >
                            <option value="">Select Service...</option>
                            {transactionTypes.map(t => (
                                <option key={t.id} value={t.name}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-white border border-[#e0e0e0]">
                        <input
                            type="checkbox"
                            checked={formData.isPriority}
                            onChange={e => setFormData({ ...formData, isPriority: e.target.checked })}
                            className="w-5 h-5 accent-[#0f62fe]"
                        />
                        <label className="text-xs uppercase font-bold text-[#525252]">Priority Lane (Senior/PWD/Pregnant)</label>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="carbon-btn-primary w-full p-5 font-bold uppercase tracking-widest text-lg disabled:opacity-50">
                        {isSubmitting ? 'Processing...' : 'Generate Number'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function QueueDisplayPage() {
    const [serving, setServing] = useState([]);
    const [waiting, setWaiting] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [marqueeText, setMarqueeText] = useState('');

    useEffect(() => {
        const fetchDisplay = () => {
            fetch('/api/queue/display')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setServing(data.serving);
                        setWaiting(data.waiting);
                    }
                })
                .catch(err => console.error(err));
        };
        const fetchMarquee = () => {
            fetch('/api/queue/marquee')
                .then(res => res.json())
                .then(data => { if (data.success) setMarqueeText(data.text); });
        };
        fetchDisplay();
        fetchMarquee();
        const interval = setInterval(fetchDisplay, 3000);
        const marqueeInt = setInterval(fetchMarquee, 10000);
        const clock = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => { clearInterval(interval); clearInterval(marqueeInt); clearInterval(clock); };
    }, []);

    return (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col overflow-hidden">
            {/* Header Bar */}
            <div className="bg-[#161616] text-white px-12 py-6 flex justify-between items-center border-b border-[#393939]">
                <div>
                    <h1 className="text-4xl font-light uppercase tracking-[0.2em]">Live <span className="font-bold text-[#0f62fe]">Queue</span></h1>
                </div>
                <div className="text-4xl font-mono font-light text-[#c6c6c6]">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
            </div>

            {/* Main Display Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Now Serving (Big) */}
                <div className="flex-[2] bg-[#f4f4f4] p-12 border-r border-[#e0e0e0] flex flex-col">
                    <h2 className="text-xs font-bold uppercase text-[#525252] mb-12 tracking-[0.3em]">Now Serving</h2>
                    <div className="flex-1 grid grid-cols-2 gap-8 content-start">
                        {serving.map((ticket, i) => (
                            <div key={ticket.id} className={`bg-white p-8 border-t-8 border-[#0f62fe] shadow-sm transform transition-all ${i === 0 ? 'scale-105 ring-4 ring-[#0f62fe]/10' : ''}`}>
                                <p className="text-xs uppercase font-bold text-[#525252] mb-2">{ticket.teller_window}</p>
                                <p className="text-8xl font-light text-[#161616] tracking-tighter">{ticket.ticket_number}</p>
                                <p className="text-sm text-[#525252] mt-4 font-medium uppercase truncate">{ticket.customer_name}</p>
                            </div>
                        ))}
                        {serving.length === 0 && (
                            <div className="col-span-2 h-[400px] flex items-center justify-center border-2 border-dashed border-[#e0e0e0]">
                                <p className="text-[#c6c6c6] text-2xl uppercase tracking-widest font-light">Waiting for Next Customer</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Waiting List */}
                <div className="flex-1 bg-white p-12 flex flex-col overflow-hidden">
                    <h2 className="text-xs font-bold uppercase text-[#525252] mb-12 tracking-[0.3em]">Waiting List</h2>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-4">
                        {waiting.slice(0, 10).map((ticket) => (
                            <div key={ticket.id} className="p-6 bg-[#f4f4f4] flex justify-between items-center border-l-4 border-[#393939]">
                                <span className="text-4xl font-light text-[#161616]">{ticket.ticket_number}</span>
                                <span className="text-xs font-mono text-[#525252] uppercase">{ticket.transaction_type}</span>
                            </div>
                        ))}
                        {waiting.length === 0 && <p className="text-[#c6c6c6] italic">No pending tickets</p>}
                    </div>
                </div>
            </div>

            {/* Marquee Footer */}
            {marqueeText && (
                <div className="h-[60px] bg-[#0f62fe] text-white flex items-center overflow-hidden border-t border-[#0353e9]">
                    <div className="animate-marquee whitespace-nowrap">
                        <span className="text-xl font-medium mx-12 uppercase tracking-wide">{marqueeText}</span>
                        <span className="text-xl font-medium mx-12 uppercase tracking-wide">{marqueeText}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function QueueTellerPage({ setCurrentPage }) {
    const [tellers, setTellers] = useState([]);
    const [selectedWindow, setSelectedWindow] = useState('');
    const [tellerName, setTellerName] = useState('');
    const [currentTicket, setCurrentTicket] = useState(null);
    const [skippedTickets, setSkippedTickets] = useState([]);
    const [completedCount, setCompletedCount] = useState(0);
    const [waitingCount, setWaitingCount] = useState(0);
    const [waitingTickets, setWaitingTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [assignedTypes, setAssignedTypes] = useState([]);
    const [avgServingTime, setAvgServingTime] = useState(0);
    const [, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetch('/api/queue/tellers')
            .then(res => res.json())
            .then(data => { if (data.success) setTellers(data.tellers); });
    }, []);

    const fetchCurrentTicket = async () => {
        if (!selectedWindow) return;
        try {
            const res = await fetch(`/api/queue/teller/${encodeURIComponent(selectedWindow)}/current`);
            const data = await res.json();
            if (data.success) {
                setCurrentTicket(data.current);
                setSkippedTickets(data.skipped);
                setCompletedCount(data.completedCount);
                setWaitingCount(data.waitingCount);
                setWaitingTickets(data.waitingTickets || []);
                setAssignedTypes(data.assignedTypes || []);
                setAvgServingTime(data.avgServingTime || 0);
            }
        } catch (err) { }
    };

    useEffect(() => {
        if (selectedWindow) {
            fetchCurrentTicket();
            const interval = setInterval(fetchCurrentTicket, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedWindow]);

    const callNext = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/queue/teller/next', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ windowName: selectedWindow, tellerName })
            });
            const data = await res.json();
            if (data.success) {
                setCurrentTicket(data.ticket);
                fetchCurrentTicket();
            } else alert(data.message);
        } catch (err) { } finally { setIsLoading(false); }
    };

    const completeTicket = async () => {
        if (!currentTicket) return;
        await fetch(`/api/queue/tickets/${currentTicket.id}/complete`, { method: 'PATCH' });
        setCurrentTicket(null);
        fetchCurrentTicket();
    };

    const skipTicket = async () => {
        if (!currentTicket) return;
        await fetch(`/api/queue/tickets/${currentTicket.id}/skip`, { method: 'PATCH' });
        setCurrentTicket(null);
        fetchCurrentTicket();
    };

    const recallTicket = async (id) => {
        try {
            const res = await fetch(`/api/queue/tickets/${id}/recall`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ windowName: selectedWindow, tellerName })
            });
            const data = await res.json();
            if (data.success) {
                setCurrentTicket(data.ticket);
                fetchCurrentTicket();
            } else {
                alert(data.message);
            }
        } catch (err) { }
    };

    if (!selectedWindow) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-[100px]">
                <div className="w-full max-w-lg bg-[#f4f4f4] p-12 border-t-4 border-[#0f62fe]">
                    <h2 className="text-3xl font-light text-[#161616] mb-8 uppercase tracking-tighter">Teller Access</h2>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-[#525252] font-bold">Teller Name</label>
                            <input value={tellerName} onChange={e => setTellerName(e.target.value)} className="carbon-input w-full p-4" placeholder="Staff Name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-[#525252] font-bold">Active Window</label>
                            <div className="grid grid-cols-2 gap-2">
                                {tellers.map(t => (
                                    <button key={t.id} onClick={() => setSelectedWindow(t.window_name)} disabled={!tellerName} className="carbon-btn-primary p-4 text-sm disabled:opacity-30 uppercase font-bold tracking-widest">{t.window_name}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-[148px] px-8 pb-24">
            <div className="max-w-[1584px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-[#161616] p-8 text-white flex justify-between items-center">
                        <div>
                            <p className="text-xs text-[#c6c6c6] uppercase mb-1 font-mono">{selectedWindow}</p>
                            <h3 className="text-2xl font-light">{tellerName}</h3>
                        </div>
                        <div className="flex space-x-4">
                            <div className="text-center px-6 border-r border-[#393939]">
                                <p className="text-xs text-[#c6c6c6] uppercase font-bold">Waiting</p>
                                <p className="text-2xl font-bold text-[#0f62fe]">{waitingCount}</p>
                            </div>
                            <button onClick={() => setSelectedWindow('')} className="p-2 border border-[#393939] hover:bg-[#262626] transition-colors font-bold text-white text-lg flex items-center justify-center w-10 h-10">
                                X
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#f4f4f4] p-12 border-t-4 border-[#0f62fe]">
                        {currentTicket ? (
                            <div className="text-center">
                                <p className="text-xs uppercase text-[#525252] mb-4 font-bold tracking-widest">Serving Now</p>
                                <h2 className="text-9xl font-light text-[#161616] mb-8 tracking-tighter">{currentTicket.ticket_number}</h2>
                                <div className="space-y-2 mb-12">
                                    <p className="text-2xl font-medium">{currentTicket.customer_name}</p>
                                    <p className="text-sm font-mono text-[#525252] uppercase">{currentTicket.transaction_type}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                                    <button onClick={completeTicket} className="carbon-btn-primary p-5 font-bold uppercase tracking-widest text-lg">COMPLETE</button>
                                    <button onClick={skipTicket} className="p-5 border border-[#da1e28] text-[#da1e28] font-bold hover:bg-[#fff1f1] uppercase tracking-widest text-lg transition-colors">SKIP</button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-24">
                                <p className="text-[#525252] mb-8 uppercase tracking-widest font-bold text-sm">Waiting for next client...</p>
                                <button onClick={callNext} disabled={waitingCount === 0} className="carbon-btn-primary px-16 py-6 text-2xl font-bold flex items-center justify-center space-x-6 mx-auto disabled:opacity-30">
                                    <span>CALL NEXT</span>
                                    <span className="text-3xl">+</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Waiting Queue */}
                    <div className="bg-[#f4f4f4] p-8 border-t-4 border-[#0f62fe]">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xs font-bold uppercase text-[#525252] tracking-widest">Waiting Queue</h4>
                            <span className="bg-[#0f62fe] text-white text-[10px] font-bold px-2 py-0.5">{waitingCount}</span>
                        </div>
                        <div className="space-y-2 overflow-y-auto max-h-[400px]">
                            {waitingTickets.map((t, idx) => (
                                <div key={t.id} className="bg-white p-4 flex justify-between items-center border-l-2 border-[#0f62fe] shadow-sm">
                                    <span className="font-bold text-[#161616] text-lg">{t.ticket_number}</span>
                                    <span className="text-[10px] text-[#525252] font-mono">{t.transaction_type}</span>
                                </div>
                            ))}
                            {waitingTickets.length === 0 && <p className="text-[#c6c6c6] text-center italic py-8">No clients waiting</p>}
                        </div>
                    </div>

                    {/* Skipped Tickets */}
                    <div className="bg-[#f4f4f4] p-8 border-t-4 border-[#da1e28]">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xs font-bold uppercase text-[#525252] tracking-widest">Skipped</h4>
                            <span className="bg-[#da1e28] text-white text-[10px] font-bold px-2 py-0.5">{skippedTickets.length}</span>
                        </div>
                        <div className="space-y-2 overflow-y-auto max-h-[300px]">
                            {skippedTickets.map((t, idx) => (
                                <div key={t.id} className="bg-white p-4 flex flex-col border-l-2 border-[#da1e28] shadow-sm relative group">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-[#161616]">{t.ticket_number}</span>
                                        <span className="text-[9px] text-[#525252] font-mono uppercase">{t.transaction_type}</span>
                                    </div>
                                    <button
                                        onClick={() => recallTicket(t.id)}
                                        disabled={!!currentTicket}
                                        className="w-full py-1.5 text-[10px] bg-[#f4f4f4] hover:bg-[#e0e0e0] font-bold uppercase border border-[#e0e0e0] transition-colors disabled:opacity-30"
                                    >
                                        Recall Ticket
                                    </button>
                                </div>
                            ))}
                            {skippedTickets.length === 0 && <p className="text-[#c6c6c6] text-center italic py-8">None skipped</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
const TransportMapBase = ({ onLocationSelect, mapAction }) => {
    const mapRef = React.useRef(null);
    const leafletMap = React.useRef(null);
    const routingControl = React.useRef(null);
    const pickupMarker = React.useRef(null);
    const destMarker = React.useRef(null);

    const resetMarkers = () => {
        if (pickupMarker.current) { leafletMap.current.removeLayer(pickupMarker.current); pickupMarker.current = null; }
        if (destMarker.current) { leafletMap.current.removeLayer(destMarker.current); destMarker.current = null; }
        if (routingControl.current) { leafletMap.current.removeControl(routingControl.current); routingControl.current = null; }
        onLocationSelect(null, null);
    };

    const [isRouting, setIsRouting] = React.useState(false);
    const routeTimeout = React.useRef(null);

    const recenterMap = () => {
        if (!leafletMap.current) return;
        leafletMap.current.invalidateSize();
        const markers = [];
        if (pickupMarker.current) markers.push(pickupMarker.current.getLatLng());
        if (destMarker.current) markers.push(destMarker.current.getLatLng());

        if (markers.length > 0) {
            const bounds = window.L.latLngBounds(markers);
            leafletMap.current.fitBounds(bounds, { padding: [50, 50] });
        } else {
            leafletMap.current.setView([11.0500, 124.0000], 10);
        }
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const address = await reverseGeocode(latitude, longitude);
            const L = window.L;

            if (pickupMarker.current) leafletMap.current.removeLayer(pickupMarker.current);
            pickupMarker.current = L.marker([latitude, longitude], {
                draggable: true, icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41]
                })
            }).addTo(leafletMap.current).bindPopup('<b>Your Location</b>').openPopup();

            pickupMarker.current.on('dragend', async () => {
                const pos = pickupMarker.current.getLatLng();
                const adr = await reverseGeocode(pos.lat, pos.lng);
                onLocationSelect({ address: adr, coords: { lat: pos.lat, lng: pos.lng } }, null);
                updateRoute();
            });

            leafletMap.current.setView([latitude, longitude], 15);
            onLocationSelect({ address, coords: { lat: latitude, lng: longitude } }, null);
            updateRoute();
        }, (error) => {
            // Fallback: If GPS fails, drop a pin in the current map center
            let errorMsg = "Could not get GPS.";
            if (error.code === 1) errorMsg = "Location permission denied. Dropping pin in center as fallback.";
            else if (error.code === 2) errorMsg = "Position unavailable. Dropping pin in center as fallback.";

            alert(errorMsg);

            const center = leafletMap.current.getCenter();
            const L = window.L;

            if (pickupMarker.current) leafletMap.current.removeLayer(pickupMarker.current);
            pickupMarker.current = L.marker([center.lat, center.lng], {
                draggable: true, icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41]
                })
            }).addTo(leafletMap.current).bindPopup('<b>Dropped in Center</b><br>Drag to your house').openPopup();

            onLocationSelect({ address: "Center Point - Please refine", coords: { lat: center.lat, lng: center.lng } }, null);
            leafletMap.current.setView([center.lat, center.lng], 15);
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    };

    const updateRoute = React.useCallback(() => {
        if (!leafletMap.current || !window.L || !window.L.Routing) return;

        // Clear previous timeout
        if (routeTimeout.current) clearTimeout(routeTimeout.current);

        routeTimeout.current = setTimeout(() => {
            if (pickupMarker.current && destMarker.current) {
                setIsRouting(true);
                if (routingControl.current) {
                    try {
                        leafletMap.current.removeControl(routingControl.current);
                    } catch (e) { }
                }

                const p1 = pickupMarker.current.getLatLng();
                const p2 = destMarker.current.getLatLng();

                routingControl.current = window.L.Routing.control({
                    waypoints: [p1, p2],
                    lineOptions: { styles: [{ color: '#0f62fe', weight: 6, opacity: 0.8 }] },
                    addWaypoints: false,
                    draggableWaypoints: false,
                    fitSelectedRoutes: true,
                    show: false,
                    router: window.L.Routing.osrmv1({
                        serviceUrl: 'https://router.project-osrm.org/route/v1',
                        timeout: 10000
                    })
                }).on('routesfound', (e) => {
                    setIsRouting(false);
                    const routes = e.routes;
                    if (routes && routes[0]) {
                        const dist = routes[0].summary.totalDistance / 1000;
                        onLocationSelect(null, null, dist);
                    }
                }).on('routingerror', (e) => {
                    setIsRouting(false);
                    console.error("Routing error:", e);
                }).addTo(leafletMap.current);
            }
        }, 500); // 500ms debounce
    }, [onLocationSelect]);

    React.useEffect(() => {
        if (!leafletMap.current || !mapAction) return;
        const L = window.L;
        const { type, lat, lng } = mapAction;

        if (type === 'MOVE_PICKUP') {
            if (lat === undefined || lng === undefined) return;
            if (pickupMarker.current) leafletMap.current.removeLayer(pickupMarker.current);
            pickupMarker.current = L.marker([lat, lng], {
                draggable: true, icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41]
                })
            }).addTo(leafletMap.current).bindPopup('Pickup');
            pickupMarker.current.on('dragend', async () => {
                const pos = pickupMarker.current.getLatLng();
                const address = await reverseGeocode(pos.lat, pos.lng);
                onLocationSelect({ address, coords: { lat: pos.lat, lng: pos.lng } }, null);
                updateRoute();
            });
            leafletMap.current.setView([lat, lng], 15);
            updateRoute();
        }

        if (type === 'MOVE_DEST') {
            if (lat === undefined || lng === undefined) return;
            if (destMarker.current) leafletMap.current.removeLayer(destMarker.current);
            destMarker.current = L.marker([lat, lng], {
                draggable: true, icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41]
                })
            }).addTo(leafletMap.current).bindPopup('Destination');
            destMarker.current.on('dragend', async () => {
                const pos = destMarker.current.getLatLng();
                const address = await reverseGeocode(pos.lat, pos.lng);
                onLocationSelect(null, { address, coords: { lat: pos.lat, lng: pos.lng } });
                updateRoute();
            });
            leafletMap.current.setView([lat, lng], 15);
            updateRoute();
        }
    }, [mapAction]);

    React.useEffect(() => {
        if (!mapRef.current || leafletMap.current) return;
        const L = window.L;
        if (!L) return;

        leafletMap.current = L.map(mapRef.current).setView([11.0500, 124.0000], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM contributors' }).addTo(leafletMap.current);

        // Fix for blank map tiles in conditional containers
        setTimeout(() => {
            if (leafletMap.current) leafletMap.current.invalidateSize();
        }, 200);

        leafletMap.current.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            const address = await reverseGeocode(lat, lng);

            if (!pickupMarker.current) {
                pickupMarker.current = L.marker([lat, lng], {
                    draggable: true, icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41], iconAnchor: [12, 41]
                    })
                }).addTo(leafletMap.current).bindPopup('<b>Pickup</b>').openPopup();
                pickupMarker.current.on('dragend', async () => {
                    const pos = pickupMarker.current.getLatLng();
                    const adr = await reverseGeocode(pos.lat, pos.lng);
                    onLocationSelect({ address: adr, coords: { lat: pos.lat, lng: pos.lng } }, null);
                    updateRoute();
                });
                onLocationSelect({ address, coords: { lat, lng } }, null);
            } else if (!destMarker.current) {
                destMarker.current = L.marker([lat, lng], {
                    draggable: true, icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41], iconAnchor: [12, 41]
                    })
                }).addTo(leafletMap.current).bindPopup('<b>Destination</b>').openPopup();
                destMarker.current.on('dragend', async () => {
                    const pos = destMarker.current.getLatLng();
                    const adr = await reverseGeocode(pos.lat, pos.lng);
                    onLocationSelect(null, { address: adr, coords: { lat: pos.lat, lng: pos.lng } });
                    updateRoute();
                });
                onLocationSelect(null, { address, coords: { lat, lng } });
                updateRoute();
            }
        });

        return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
    }, []);

    return (
        <div className="relative">
            <div ref={mapRef} className="w-full h-[450px] border border-[#e0e0e0] shadow-inner z-10" style={{ background: '#f4f4f4' }} />
            {isRouting && (
                <div className="absolute inset-0 z-[1001] bg-white/40 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="bg-[#1c1917] text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-2xl animate-pulse">
                        Calculating Route...
                    </div>
                </div>
            )}
            <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                <button onClick={useCurrentLocation} className="bg-white border border-[#e0e0e0] p-2 text-[#0f62fe] hover:bg-blue-50 transition-all shadow-md" title="Use My Location">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
                <button onClick={recenterMap} className="bg-white border border-[#e0e0e0] p-2 text-[#525252] hover:bg-gray-50 transition-all shadow-md" title="Recenter Map">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                </button>
            </div>
            {(pickupMarker.current || destMarker.current) && (
                <button onClick={resetMarkers} className="absolute top-4 right-4 z-[1000] bg-white border border-[#da1e28] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#da1e28] hover:bg-red-50 transition-all shadow-sm">Reset Map</button>
            )}
        </div>
    );
};

const TransportMap = React.memo(TransportMapBase);

