import React from 'react';

const baseClasses = "mt-1 block w-full px-3 py-2 bg-white border border-light-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-light-gray-100";

export const TextField = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function TextField({ className = '', ...props }, ref) {
  return <input ref={ref} className={`${baseClasses} ${className}`.trim()} {...props} />;
});

export const SelectField = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function SelectField({ className = '', children, ...props }, ref) {
  return <select ref={ref} className={`${baseClasses} ${className}`.trim()} {...props}>{children}</select>;
});

export const TextAreaField = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextAreaField({ className = '', ...props }, ref) {
  return <textarea ref={ref} className={`${baseClasses} ${className}`.trim()} {...props} />;
});

export default { TextField, SelectField, TextAreaField };
