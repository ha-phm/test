import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Adjust the base URL as needed
});

// Function to register a new user
export const registerUser = async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
};

// Function to log in a user
export const loginUser = async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
};