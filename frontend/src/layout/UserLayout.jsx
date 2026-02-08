import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-3">
        <Outlet />
      </main>

      {/* Optional Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-3 py-3">
          <div className="text-center text-gray-600">
            <p>
              &copy; {new Date().getFullYear()} dShoppy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
