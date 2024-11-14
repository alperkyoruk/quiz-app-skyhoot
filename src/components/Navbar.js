"use client";

import React from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import '../styles/globals.css';

function Navbar() {
    const router = useRouter();

    const handleLogout = () => {
        Cookies.remove('token');
        router.push('/login');
    };

    return (
        <nav className="bg-blue-500 p-4">
            <div className="flex justify-between items-center">
                <div className="text-white text-lg font-bold">
                    <a href="/">SkyHoot</a>
                </div>
                <ul className="flex space-x-4">
                    {/* Games and Questions links added here */}
                    <li><a className="text-white hover:text-gray-300" href="/createGame">Games</a></li>
                    <li><a className="text-white hover:text-gray-300" href="/questionlist">Questions</a></li>
                    <li><a className="text-white hover:text-gray-300" href="/profile">Profile</a></li>
                    <li><button className="text-white hover:text-gray-300" onClick={handleLogout}>Logout</button></li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
