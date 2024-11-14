// Layout.js
import React from 'react';
import Navbar from './Navbar';

function Layout({ children }) {
  return (
    <div className="layout">
      <main>{children}</main>
    </div>
  );
}

export default Layout;
