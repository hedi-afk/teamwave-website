import React from 'react';

interface SafeTextProps {
  children: React.ReactNode;
}

/**
 * Safely renders text in React, preventing "Objects are not valid as React child" errors
 */
const SafeText: React.FC<SafeTextProps> = ({ children }) => {
  try {
    // Handle null or undefined
    if (children === null || children === undefined) {
      return <>{'-'}</>;
    }

    // Handle strings and numbers directly
    if (typeof children === 'string' || typeof children === 'number') {
      return <>{children.toString()}</>;
    }

    // Handle React elements - convert to string instead of returning the element
    if (React.isValidElement(children)) {
      return <>{`[React Element]`}</>;
    }

    // Handle arrays (join with commas)
    if (Array.isArray(children)) {
      const output = children.map(child => {
        if (child === null || child === undefined) return '-';
        if (typeof child === 'string' || typeof child === 'number') return child.toString();
        if (React.isValidElement(child)) return '[React Element]';
        return typeof child === 'object' ? '[Object]' : String(child);
      }).join(', ');
      return <>{output}</>;
    }

    // Handle objects (convert to JSON string)
    if (typeof children === 'object') {
      try {
        return <>{JSON.stringify(children)}</>;
      } catch (e) {
        return <>{`[Object]`}</>;
      }
    }

    // Fallback for any other type
    return <>{String(children)}</>;
  } catch (error) {
    console.error('SafeText error:', error);
    return <>{`[Display Error]`}</>;
  }
};

export default SafeText; 