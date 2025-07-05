import { useMatch, useNavigate } from 'react-router-dom';

function NavLink({ to, children, target, clickHandle, onClick }) {
  const match = useMatch(to);
  const navigate = useNavigate();
  
  const handleClick = (e) => {
    e.preventDefault();
    
    if (onClick) {
      onClick(e);
      return;
    }
    
    navigate(to);
    
    setTimeout(() => {
      if (clickHandle) {
        clickHandle();
      }
    }, 300);
  };

  return (
    <li className={match ? 'current-menu-item' : ''}>
      <button 
        onClick={handleClick}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          font: 'inherit',
          cursor: 'pointer',
          padding: '16px 32px',
          width: '100%',
          textAlign: 'left',
          fontSize: '20px',
          color: '#ffd700',
          pointerEvents: 'auto'
        }}
      >
        {children}
      </button>
    </li>
  );
}

export default NavLink;
