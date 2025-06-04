import React from 'react';
import { APP_VERSION } from '../version';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="text-center text-sm text-gray-500 mt-4">
      &copy; {year} SurgiHire – Version {APP_VERSION}
    </footer>
  );
};

export default Footer;
