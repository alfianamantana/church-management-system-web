import React from 'react';

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

const InputText: React.FC<InputTextProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  const wrapperClassName = `w-full flex flex-col gap-1 ${className}`.trim();
  return (
    <div className={wrapperClassName}>
      {label && <label className="block font-semibold text-gray-700 dark:text-gray-200">{label}</label>}
      <input
        className={
          `w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ` +
          `border-gray-300 focus:ring-blue-400 bg-white text-gray-900 ` +
          `dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500` +
          (error ? ' border-red-500' : '')
        }
        {...props}
      />
      {error && <div className="text-red-600 mt-1 text-sm">{error}</div>}
    </div>
  );
};

export default InputText;
