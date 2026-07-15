interface Props {
  page: number;
  total: number;
  limit: number;
  onChange: (p: number) => void;
}

export default function Pagination({ page, total, limit, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const pages: (number | '…')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  const btn = (content: React.ReactNode, target: number, disabled: boolean, active = false) => (
    <button
      key={String(content)}
      disabled={disabled}
      onClick={() => !disabled && onChange(target)}
      style={{
        minWidth: 34,
        height: 34,
        padding: '0 10px',
        border: active ? 'none' : '1px solid #e2e8f0',
        borderRadius: 8,
        background: active ? '#1a56db' : disabled ? '#f9fafb' : '#fff',
        color: active ? '#fff' : disabled ? '#c0c7d0' : '#374151',
        cursor: disabled ? 'default' : 'pointer',
        fontWeight: active ? 700 : 500,
        fontSize: '0.85rem',
        transition: 'background 0.15s',
      }}
    >
      {content}
    </button>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginTop: '0.9rem', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.8rem', color: '#888', marginRight: 4 }}>
        {total} résultat{total > 1 ? 's' : ''}
      </span>
      {btn('‹', page - 1, page === 1)}
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: '#9ca3af' }}>…</span>
          : btn(p, p, false, p === page)
      )}
      {btn('›', page + 1, page === totalPages)}
    </div>
  );
}
