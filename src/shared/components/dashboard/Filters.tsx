import { useState } from 'react';

interface FiltersProps {
  options: string[];
  onChange?: (index: number, value: string) => void;
}

export default function Filters({ options, onChange }: FiltersProps) {
  const [active, setActive] = useState(0);
  return (
    <div className="db-filters">
      {options.map((o, i) => (
        <button
          key={o}
          className={`db-chip${active === i ? ' active' : ''}`}
          onClick={() => {
            setActive(i);
            onChange?.(i, o);
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
