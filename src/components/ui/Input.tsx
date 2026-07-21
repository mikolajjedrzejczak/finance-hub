import { ClientInput } from '@/schemas/client.schema';
import { UseFormRegister } from 'react-hook-form';

interface InputProps {
  title: string;
  type?: string;
  config: any;
  placeholder?: string;
  important?: boolean;
  errors?: any;
  actionButton?: React.ReactNode;
}

export default function Input({
  title,
  type = 'text',
  config,
  placeholder = '',
  important,
  errors,
  actionButton,
}: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {title} {important && <span className="text-red-700">*</span>}
      </label>
      <div className="mt-1 flex items-center justify-center gap-1 rounded-md">
        <input
          {...config}
          type={type}
          className="text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={placeholder}
        />
        {actionButton}
      </div>
      {errors && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
    </div>
  );
}
