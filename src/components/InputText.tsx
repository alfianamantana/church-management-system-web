import React from 'react';

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  onLeftIconClick?: () => void;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

const InputText = React.forwardRef<HTMLInputElement, InputTextProps>(
  ({
    label,
    error,
    required = false,
    className = '',
    leftIcon = undefined,
    onLeftIconClick = undefined,
    rightIcon = undefined,
    onRightIconClick = undefined,
    ...props
  }, ref) => {
    const wrapperClassName = `w-full flex flex-col gap-1 ${className}`.trim();
    return (
      <div className={wrapperClassName}>
        {label && <label className="block font-semibold text-foreground">{label}{required && <span className="text-destructive"> *</span>}</label>}
        <div className="relative w-full">
          {leftIcon && (
            <button
              type="button"
              tabIndex={-1}
              className="absolute inset-y-0 left-2 flex items-center pl-1 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
              onClick={onLeftIconClick}
              style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
            >
              {leftIcon}
            </button>
          )}
          <input
            ref={ref}
            className={
              `w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ` +
              `border-border focus:ring-ring bg-card text-card-foreground placeholder:text-muted-foreground ` +
              (error ? ' border-destructive' : '') +
              (leftIcon ? ' pl-10' : '') +
              (rightIcon ? ' pr-10' : '')
            }
            {...props}
          />
          {rightIcon && (
            <button
              type="button"
              tabIndex={-1}
              className="absolute inset-y-0 right-2 flex items-center pr-1 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
              onClick={onRightIconClick}
              style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
            >
              {rightIcon}
            </button>
          )}
        </div>
      </div>
    );
  }
);

export default InputText;