import type { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function FormInput({ label, ...props }: FormInputProps) {
  return (
    <div className="db-form-group">
      <label className="db-form-label">{label}</label>
      <input className="db-form-input" {...props} />
    </div>
  );
}
