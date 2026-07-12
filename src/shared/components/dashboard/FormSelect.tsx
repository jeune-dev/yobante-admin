import type { SelectHTMLAttributes } from 'react';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

export default function FormSelect({ label, options, ...props }: FormSelectProps) {
  return (
    <div className="db-form-group">
      <label className="db-form-label">{label}</label>
      <select className="db-form-input db-form-select" {...props}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
