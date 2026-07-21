import { UseFormRegister, FieldValues } from 'react-hook-form';

interface InputProps<T extends FieldValues> {
  id: keyof T | any;
  title: string;
  type?: string;
  register: UseFormRegister<T>;
  placeholder?: string;
  required?: boolean;
  errors?: any;
  step?: string;
  actionButton?: React.ReactNode;
}

export default function Input<T extends FieldValues>({
  id,
  title,
  type = 'text',
  register,
  placeholder = '',
  required,
  errors,
  step,
  actionButton,
}: InputProps<T>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {title} {required && <span className="text-red-700">*</span>}
      </label>
      <div className="mt-1 flex items-center justify-center gap-1 rounded-md">
        <input
          {...register(id, { valueAsNumber: type === 'number' })}
          type={type}
          step={step}
          className="text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={placeholder}
        />
        {actionButton}
      </div>
      {errors && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
    </div>
  );
}
