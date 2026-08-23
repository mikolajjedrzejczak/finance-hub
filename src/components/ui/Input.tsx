import { step } from 'next/dist/experimental/testmode/playwright/step';
import React from 'react';
import {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from 'react-hook-form';

type InputProps<T extends FieldValues> = {
  id: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  error?: FieldError | undefined;
  type?: React.HTMLInputTypeAttribute;
  step?: string;
  placeholder?: string;
  required?: boolean;
  actionButton?: React.ReactNode;
};

export default function Input<T extends FieldValues>({
  label,
  id,
  register,
  error,
  type = 'text',
  step,
  placeholder,
  required,
  actionButton,
}: InputProps<T>) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1 flex rounded-md shadow-sm">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          step={step || ''}
          {...register(id, {
            valueAsNumber: type === 'number',
          })}
          className={`block w-full text-black px-3 py-2 text-sm border focus:outline-none focus:ring-1 ${actionButton ? 'rounded-l-md border-r-0' : 'rounded-md'} ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
        />
        {actionButton}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
    </div>
  );
}
