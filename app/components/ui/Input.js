import { cn } from '@/lib/utils';

const Input = ({ 
  label,
  error,
  className,
  type = 'text',
  required = false,
  ...props 
}) => {
  const inputClasses = cn(
    'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
    error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
    className
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
