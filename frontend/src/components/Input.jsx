import React, { useId } from 'react';

const Input = React.forwardRef(function Input(
  { label, type = 'text', className = '', ...props },
  ref
) {
  const id = useId();
  return (
    <div className="w-full">
      {label && (
        <label
          className="block mb-2 text-sm font-medium text-gray-400"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        className={`px-4 py-2 rounded-lg bg-gray-700 placeholder-gray-400 
                   outline-none border border-gray-400 focus:ring-2 focus:ring-blue-400 
                   focus:border-blue-400 hover:border-gray-400 transition duration-200 
                   w-full ${className}`}
        ref={ref}
        {...props}
        id={id}
      />
    </div>
  );
});

export default Input;
