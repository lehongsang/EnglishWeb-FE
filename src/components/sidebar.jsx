import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeFilled,
  AudioOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  BookOutlined,
  UserOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import logo from '../assets/image/logoweb.png'; 
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase'; 
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { to: '/home',       label: 'Học',           icon: <HomeFilled /> },
  { to: '/pronounce',  label: 'Phát âm',       icon: <AudioOutlined /> },
  { to: '/leaderboard',label: 'Bảng xếp hạng', icon: <TrophyOutlined /> },
  { to: '/tasks',      label: 'Nhiệm vụ',      icon: <CheckCircleOutlined /> },
  { to: '/vocabulary', label: 'Từ vựng',       icon: <BookOutlined /> },
  { to: '/profile',    label: 'Hồ sơ',         icon: <UserOutlined /> },
];

export const SIDEBAR_WIDTH_CONST = 240;

export default function DesktopSidebar() {
  const { pathname } = useLocation();
  const [hovered, setHovered] = useState(null);
  const { setCurrentUser } = useAuth?.() || {};
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      localStorage.removeItem('completedLessons');
      if (setCurrentUser) setCurrentUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <img src={logo} alt="Engsy Logo" style={styles.logoImg} />
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item, i) => {
          const isActive = pathname === item.to || (item.to === '/home' && pathname === '/');
          const isHovered = hovered === i;

          return (
            <Link
              key={item.to}
              to={item.to}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...styles.navItemBase,
                backgroundColor: isActive ? styles.navItemActive.backgroundColor : (isHovered ? styles.navItemHover.backgroundColor : 'transparent'),
                color: isActive ? styles.navItemActive.color : styles.navItemBase.color,
                borderLeft: isActive ? `4px solid ${styles.navItemActive.color}` : '4px solid transparent',
                paddingLeft: isActive ? '12px' : '16px', 
              }}
            >
              <span style={{...styles.navIcon, color: isActive ? styles.navItemActive.color : '#5f6368e0' }}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ flexGrow: 1 }} />

      <button onClick={handleLogout} style={styles.logoutButton}>
        Đăng xuất
      </button>
    </aside>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: `${SIDEBAR_WIDTH_CONST}px`,
    height: '100vh',
    backgroundColor: '#ffffff', 
    borderRight: '2px solid #e5e5e5', 
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 101,
    fontFamily: "'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    boxSizing: 'border-box',
    orderRadius: '0 12px 12px 0'
  },
  logoContainer: {
    width: '100%',
    padding: '0 30px', 
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'flex-start', 
  },
  logoImg: {
    height: '60px',
    width: 'auto',
    objectFit: 'contain',
    marginLeft: '30px'
  },
  nav: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch', 
    gap: '4px', 
  },
  navItemBase: {
    height: '48px',
    borderRadius: '0 12px 12px 0', 
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px', 
    margin: '0 10px 0 0', 
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: 'bold', 
    color: '#5f6368', 
    transition: 'background-color 0.2s, color 0.2s, padding-left 0.2s',
    cursor: 'pointer',
    borderLeft: '4px solid transparent', 
  },
  navItemHover: {
    backgroundColor: '#f0f2f5', 
  },
  navItemActive: {
    backgroundColor: '#e6f7ff', 
    color: '#1890ff', 
  },
  navIcon: {
    fontSize: '22px', 
    marginRight: '16px', 
    width: '24px', 
    textAlign: 'center',
  },
  navLabel: {
    flex: 1,
    textAlign: 'left',
  },
  logoutButton: {
    width: `calc(100% - ${2 * 20}px)`, 
    margin: '10px 20px 16px 20px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: 'bold',
    backgroundColor: '#e5e5e5', 
    color: '#777777',
    border: '2px solid #e5e5e5',
    borderBottomWidth: '4px',
    borderBottomColor: '#d4d4d4',
    borderRadius: '12px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'background-color 0.1s, border-color 0.1s, transform 0.1s',
  }
};