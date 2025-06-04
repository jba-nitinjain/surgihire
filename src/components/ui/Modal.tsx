import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title?: React.ReactNode;
  widthClasses?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, widthClasses = 'max-w-lg', onClose, children }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full ${widthClasses} max-h-[90vh] flex flex-col`}>
        {title !== undefined && (
          <div className="flex justify-between items-center p-4 border-b border-light-gray-200">
            <h2 className="text-xl font-semibold text-brand-blue">{title}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-light-gray-100">
              <X className="h-5 w-5 text-dark-text" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
