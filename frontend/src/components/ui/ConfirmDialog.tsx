import React from 'react';
import { motion } from 'framer-motion';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  type = 'danger'
}) => {
  // Define styles based on the type
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          title: 'text-red-500',
          button: 'bg-red-500 hover:bg-red-600',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      case 'warning':
        return {
          title: 'text-yellow-500',
          button: 'bg-yellow-500 hover:bg-yellow-600',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      case 'info':
        return {
          title: 'text-neon-blue',
          button: 'bg-neon-blue hover:bg-neon-blue/90',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-neon-blue mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      default:
        return {
          title: 'text-neon-purple',
          button: 'bg-neon-purple hover:bg-neon-purple/90',
          icon: null
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-purple-light p-6 rounded-lg w-full max-w-md"
      >
        {typeStyles.icon}
        
        <h2 className={`text-xl font-bold ${typeStyles.title} mb-4 text-center`}>
          {title}
        </h2>
        
        <p className="text-white text-center mb-6">
          {message}
        </p>
        
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-dark-purple text-white rounded-md hover:bg-dark-purple-light transition-colors"
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-md transition-colors flex items-center ${typeStyles.button}`}
            disabled={isLoading}
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmDialog; 