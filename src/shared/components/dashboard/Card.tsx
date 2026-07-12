import type { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
}

export default function Card({ title, right, children }: CardProps) {
  return (
    <div className="db-card">
      <div className="db-card-head">
        <div className="db-card-title">{title}</div>
        {right && <div>{right}</div>}
      </div>
      {children}
    </div>
  );
}
