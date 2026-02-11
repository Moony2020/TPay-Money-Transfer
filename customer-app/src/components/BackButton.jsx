import { useNavigate } from 'react-router-dom';

export default function BackButton({ onClick }) {
  const navigate = useNavigate();

  const handleClick = onClick || (() => navigate(-1));

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Go back"
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '1px solid #e0e0e0',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'background 0.15s, box-shadow 0.15s',
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#333"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}
