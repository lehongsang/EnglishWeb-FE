import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeFilled,TrophyOutlined, TrophyFilled, CheckCircleOutlined, CheckSquareFilled, UserOutlined } from '@ant-design/icons'; // Sử dụng icon Filled cho active

const menuItemsBottom = [
  { to: '/home',         label: 'Trang chủ',    iconDefault: <HomeFilled />,    iconActive: <HomeFilled />    },
  { to: '/leaderboard',  label: 'Xếp hạng',     iconDefault: <TrophyOutlined />,iconActive: <TrophyFilled />  }, // TrophyOutlined từ câu hỏi gốc
  { to: '/tasks',        label: 'Nhiệm vụ',     iconDefault: <CheckCircleOutlined />, iconActive: <CheckSquareFilled />}, // CheckCircleOutlined từ câu hỏi gốc
  { to: '/profile',      label: 'Cá nhân',      iconDefault: <UserOutlined />,  iconActive: <UserOutlined style={{fontWeight: 'bold'}}/> },
];

export default function BottomNavBar() {
  const { pathname } = useLocation();

  return (
    <nav style={styles.bottomNav}>
      {menuItemsBottom.map((item) => {
        const isActive = pathname === item.to || (item.to === '/home' && pathname === '/');
        return (
          <Link key={item.to} to={item.to} style={styles.navItem}>
            <div style={{ ...styles.iconWrapper, color: isActive ? styles.activeColor : styles.inactiveColor }}>
              {isActive ? item.iconActive : item.iconDefault}
            </div>
            <span style={{ ...styles.label, color: isActive ? styles.activeColor : styles.inactiveColor, fontWeight: isActive ? 'bold' : 'normal' }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

const styles = {
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65px',
    backgroundColor: '#ffffff',
    boxShadow: '0 -2px 5px rgba(0,0,0,0.06)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'stretch', 
    zIndex: 100,
    padding: '0 5px',
    borderTop: '1px solid #f0f0f0',
    fontFamily: "'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    flex: 1,
    height: '100%',
    padding: '8px 0', 
    transition: 'color 0.2s',
    borderRadius: '5xp'
  },
  iconWrapper: {
    fontSize: '24px', 
    marginBottom: '3px', 
  },
  label: {
    fontSize: '11px', 
    marginTop: '2px', 
    textAlign: 'center',
  },
  activeColor: '#1cb0f6', 
  inactiveColor: '#777777', 
};