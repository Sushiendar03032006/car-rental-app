import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

// Create Context
export const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const navigate = useNavigate();
    const currency = import.meta.env.VITE_CURRENCY;
    const backendUrl = import.meta.env.VITE_BASE_URL;

    // Set default base URL
    axios.defaults.baseURL = backendUrl;
    axios.defaults.withCredentials = false;

    // Use sessionStorage so user is logged out when browser closes
    const [token, setToken] = useState(sessionStorage.getItem('token') || null);
    
    const [user, setUser] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    
    // Booking State
    const [pickupDate, setPickupDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [cars, setCars] = useState([]);

    // -------------------------------------------------
    // 1. Function to Log Out
    // -------------------------------------------------
    const logout = () => {
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsOwner(false);
        
        // ⭐ FIX: Clear the 'Authorization' header
        delete axios.defaults.headers.common['Authorization'];
        
        toast.success('Logged out successfully');
        navigate('/');
    };

    // -------------------------------------------------
    // 2. Fetch User Data
    // -------------------------------------------------
    const fetchUser = async () => {
        try {
            // ⭐ FIX: Check if token exists before making request
            if (token) {
                // Backend expects "Bearer <token>"
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            const { data } = await axios.get('/api/user/data');

            if (data.success) {
                setUser(data.user);
                setIsOwner(data.user.role === 'owner');
            } else {
                // Token is invalid/expired according to backend
                logout();
            }
        } catch (error) {
            console.error("Fetch User Error:", error);
            // If backend says 401 (Unauthorized), force logout
            if (error.response && error.response.status === 401) {
                logout();
            }
        }
    };

    // -------------------------------------------------
    // 3. Fetch Cars
    // -------------------------------------------------
    const fetchCars = async () => {
        try {
            const { data } = await axios.get('/api/user/cars');
            if (data.success) {
                setCars(data.cars);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load cars");
        }
    };

    // -------------------------------------------------
    // 4. Effects
    // -------------------------------------------------

    useEffect(() => {
        fetchCars();
    }, []);

    // Token Listener
    useEffect(() => {
        if (token) {
            // ⭐ FIX: Set 'Authorization' header to match your auth.js
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Save to session storage
            sessionStorage.setItem('token', token);
            
            fetchUser();
        } else {
            // Cleanup
            delete axios.defaults.headers.common['Authorization'];
            sessionStorage.removeItem('token');
            setUser(null);
            setIsOwner(false);
        }
    }, [token]);

    const value = {
        navigate, currency, axios, 
        user, setUser,
        token, setToken, 
        isOwner, setIsOwner, 
        fetchUser, showLogin, setShowLogin, logout, 
        fetchCars, cars, setCars, 
        pickupDate, setPickupDate, 
        returnDate, setReturnDate,
        backendUrl
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext);
};