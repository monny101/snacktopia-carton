
import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';
import CustomerChat from './CustomerChat';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <CustomerChat />
      <ScrollRestoration />
    </div>
  );
};

export default Layout;
