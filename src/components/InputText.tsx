import React from 'react';

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  required?: boolean;
}

const InputText: React.FC<InputTextProps> = ({
  label,
  error,
  required = false,
  className = '',
  ...props
}) => {
  const wrapperClassName = `w-full flex flex-col gap-1 ${className}`.trim();
  return (
    <div className={wrapperClassName}>
      {label && <label className="block font-semibold text-foreground">{label}{required && <span className="text-destructive"> *</span>}</label>}
      <input
        className={
          `w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ` +
          `border-border focus:ring-ring bg-input text-foreground ` +
          (error ? ' border-destructive' : '')
        }
        {...props}
      />
      {error && <div className="text-destructive mt-1 text-sm">{error}</div>}
    </div>
  );
};

export default InputText;
