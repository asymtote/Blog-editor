import React from 'react';
import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <PenLine className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-xl font-semibold text-gray-800">BlogFlow</span>
          </Link>
          <div className="flex space-x-4">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              My Blogs
            </Link>
            <Link
              to="/editor"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              New Blog
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;