import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div className="p-8 text-center">
    <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
    <p className="mb-4">The page you are looking for does not exist.</p>
    <Link to="/" className="text-brand-blue hover:underline">Go to Dashboard</Link>
  </div>
);

export default NotFound;

