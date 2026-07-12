import type { ReactNode } from 'react';

interface ModalProps {
  id: string;
  title: string;
  openId: string | null;
  onClose: () => void;
  children?: ReactNode;
}

export default function Modal({ id, title, openId, onClose, children }: ModalProps) {
  return (
    <div
      className={`db-modal-overlay${openId === id ? ' open' : ''}`}
      onClick={(e) =>
        (e.target as HTMLElement).className.includes('db-modal-overlay') && onClose()
      }
    >
      <div className="db-modal">
        <div className="db-modal-head">
          <div className="db-modal-title">{title}</div>
          <button className="db-modal-close" onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
