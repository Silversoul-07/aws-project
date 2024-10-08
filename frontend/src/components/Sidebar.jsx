import React, { useState, useEffect } from 'react';
import { Home, UserPlus, LogOut, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Sidebar = () => {
  const [userData, setUserData] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          throw new Error('No auth token found');
        }
  
        const axiosInstance = axios.create({
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
  
        const cachedUserData = document.cookie.split('; ').find(row => row.startsWith('userData='));
        if (cachedUserData) {
          const userData = JSON.parse(decodeURIComponent(cachedUserData.split('=')[1]));
          setUserData(userData);
        } else {
          const response = await axiosInstance.get('/api/session');
          const data = response.data;
          setUserData(data);
          document.cookie = `userData=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=3600`;
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchUserData();
  }, []);

  const handleLogout = () => {
    // clear local storage
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    console.log('Logout clicked');
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4 flex flex-col">
      {userData && (
        <div className="flex items-center mb-6">
          {userData.pic ? (
            <img src={userData.pic} alt="User Avatar" className="w-10 h-10 rounded-full mr-2 object-cover" />
          ) : (
            <User className="w-10 h-10 mr-2 rounded-full" />
          )}
          <div className="overflow-hidden">
            <div className="text-lg font-semibold truncate">{userData.username}</div>
            <div className="text-sm text-gray-400 truncate">{userData.email}</div>
          </div>
        </div>
      )}
      <nav className="flex-grow">
        <ul className="space-y-2">
          <li>
            <a href="/" className={`flex items-center p-2 hover:bg-gray-700 rounded ${location.pathname === '/home' ? 'bg-gray-700' : ''}`}>
              <Home className="mr-2" />
              Home
            </a>
          </li>
          <li>
            <a href="/register" className={`flex items-center p-2 hover:bg-gray-700 rounded ${location.pathname === '/register' ? 'bg-gray-700' : ''}`}>
              <UserPlus className="mr-2" />
              Register
            </a>
          </li>
        </ul>
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center p-2 hover:bg-gray-700 rounded w-full text-left mt-auto"
      >
        <LogOut className="mr-2" />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;