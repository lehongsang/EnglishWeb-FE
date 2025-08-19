// src/components/Rightbar.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Typography, Spin } from 'antd';
import { FireFilled, StarFilled } from '@ant-design/icons'; 
// Hoặc dùng react-icons nếu muốn đồng bộ hơn
import { IoStar, IoFlame } from 'react-icons/io5'; 
import apiEndpoints from '../apis/endPoint'; 
import { useAuth } from '../contexts/AuthContext'; 

const { Text } = Typography;

const CustomTitle = ({ children, level = 3, style }) => {
    const Tag = `h${level}`;
    return <Tag style={{ ...styles.valueFull, ...style }}>{children}</Tag>;
};

const Rightbar = ({ isCompact = false }) => {
    const [stats, setStats] = useState({ totalXp: 0, currentStreak: 0 });
    const [loading, setLoading] = useState(true);
    const [xpIncreased, setXpIncreased] = useState(false);
    const prevXpRef = useRef();
    const { currentUser } = useAuth() || {};

    const fetchUserStats = useCallback(async (isInitialLoad = false) => {
        if (!currentUser) {
            if (isInitialLoad) setLoading(false);
            return;
        }
        if (isInitialLoad) setLoading(true);
        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(apiEndpoints.getUserStats, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                if (isInitialLoad) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch user stats' }));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                console.error("Silent refresh failed for user stats, keeping old stats.");
                return; 
            }
            const responseData = await response.json();
            if (responseData && responseData.data) {
                const userData = responseData.data;
                setStats({
                    totalXp: userData.totalXp || 0,
                    currentStreak: userData.currentStreak || 0,
                });
            }
        } catch (error) {
            console.error("Error fetching user stats:", error);
            if (isInitialLoad) setStats({ totalXp: 'N/A', currentStreak: '0' });
        } finally {
            if (isInitialLoad) setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchUserStats(true); 
        const intervalId = setInterval(() => fetchUserStats(false), 60000); // Cập nhật mỗi phút (ngầm)
        return () => clearInterval(intervalId);
    }, [fetchUserStats]);

    useEffect(() => {
        if (typeof stats.totalXp === 'number' && typeof prevXpRef.current === 'number') {
            if (stats.totalXp > prevXpRef.current) {
                setXpIncreased(true);
                const timer = setTimeout(() => setXpIncreased(false), 1000);
                return () => clearTimeout(timer);
            }
        }
        prevXpRef.current = stats.totalXp;
    }, [stats.totalXp]);

    const showStreakAnimation = stats.currentStreak > 0 && typeof stats.currentStreak === 'number';
    const streakFireContainerStyleFull = {
        fontSize: '30px', marginRight: '12px',
        animation: showStreakAnimation ? 'duolingoFlameFull 1.2s ease-in-out infinite' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px',
    };

    if (loading) {
        return (
            <aside style={isCompact ? styles.rightbarCompact : styles.rightbarFull}>
                <div style={styles.loadingContainer}>
                    <Spin />
                </div>
            </aside>
        );
    }

    if (isCompact) {
        return (
            <aside style={styles.rightbarCompact}>
                <div style={styles.statItemCompact}>
                    <IoStar style={{ ...styles.iconCompact, color: '#ffc800' }} />
                    <Text style={styles.valueCompact}>
                        {typeof stats.totalXp === 'number' ? (stats.totalXp > 999 ? Math.floor(stats.totalXp / 1000) + 'k' : stats.totalXp) : stats.totalXp}
                    </Text>
                </div>
                <div style={styles.statItemCompact}>
                     <IoFlame
                        style={{
                            ...styles.iconCompact,
                            color: showStreakAnimation ? '#ff9600' : '#bababa',
                        }}
                    />
                    <Text style={styles.valueCompact}>
                        {typeof stats.currentStreak === 'number' ? stats.currentStreak : stats.currentStreak}
                    </Text>
                </div>
            </aside>
        );
    }

    // Giao diện Rightbar đầy đủ
    return (
        <aside style={{...styles.rightbarFull, ...(xpIncreased && styles.xpBumpEffectFull)}}>
            <div style={styles.infoCardFull}>
                <div style={styles.statItemFull}>
                    <StarFilled style={{ ...styles.iconFull, color: '#ffc800' }} />
                    <div style={styles.textContainerFull}>
                        <Text style={styles.labelFull}>TỔNG XP</Text>
                        <CustomTitle level={3} style={styles.valueTextFull}>
                            {typeof stats.totalXp === 'number' ? stats.totalXp.toLocaleString() : stats.totalXp}
                        </CustomTitle>
                    </div>
                </div>
            </div>
            <div style={styles.infoCardFull}>
                <div style={styles.statItemFull}>
                    <span style={streakFireContainerStyleFull}>
                        <FireFilled style={{ color: showStreakAnimation ? '#ff9600' : '#bababa' }} />
                    </span>
                    <div style={styles.textContainerFull}>
                        <Text style={styles.labelFull}>CHUỖI</Text>
                        <CustomTitle level={3} style={styles.valueTextFull}>
                            {typeof stats.currentStreak === 'number' ? `${stats.currentStreak}` : stats.currentStreak}
                            {typeof stats.currentStreak === 'number' && <span style={styles.daysUnitFull}> NGÀY</span>}
                        </CustomTitle>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                @keyframes duolingoFlameFull {
                    0%   { transform: scale(1) translateY(0px) rotate(0deg); opacity: 0.9; }
                    20%  { transform: scale(1.1) translateY(-3px) rotate(-3deg); opacity: 1; }
                    40%  { transform: scale(0.95) translateY(2px) rotate(3deg); opacity: 0.85; }
                    60%  { transform: scale(1.05) translateY(-2px) rotate(-2deg); opacity: 1; }
                    80%  { transform: scale(0.98) translateY(1px) rotate(2deg); opacity: 0.9; }
                    100% { transform: scale(1) translateY(0px) rotate(0deg); opacity: 0.9; }
                }
                @keyframes xpBumpAnimationRightbar {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.03); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </aside>
    );
};

export const RIGHTBAR_FULL_WIDTH = 290;
export const RIGHTBAR_COMPACT_WIDTH = 80; 

const styles = {
    loadingContainer: { 
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100%' 
    },
    
    rightbarFull: {
        width: `${RIGHTBAR_FULL_WIDTH}px`,
        padding: '24px 16px', 
        backgroundColor: '#ffffff',
        boxShadow: '-3px 0 12px rgba(0,0,0,0.06)', 
        height: 'calc(100vh - 40px)',
        position: 'fixed', 
        right: '20px', 
        top: '20px', 
        borderRadius: '16px',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        fontFamily: "'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        boxSizing: 'border-box', 
        zIndex: 90,
        transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
    },
    xpBumpEffectFull: { 
        animation: 'xpBumpAnimationRightbar 0.6s ease-out' 
    },
    infoCardFull: { 
        backgroundColor: '#ffffff', 
        borderRadius: '16px', 
        padding: '16px', 
        border: '2px solid #e5e5e5' 
    },
    statItemFull: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px' 
    },
    iconFull: { 
        fontSize: '28px', 
        minWidth: '30px', 
        textAlign: 'center', 
        display: 'flex', 
        alignItems: 'center' 
    },
    textContainerFull: { 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-start' 
    },
    labelFull: { fontSize: '14px', 
        color: '#777777', 
        fontWeight: '700', 
        textTransform: 'uppercase', 
        lineHeight: '1.2', 
        marginBottom: '2px' 
    },
    valueFull: { 
        margin: 0, 
        color: '#4b4b4b', 
        fontWeight: '800', 
        lineHeight: '1.1' 
    }, 
    valueTextFull: { fontSize: '24px' },
    daysUnitFull: { 
        ontSize: '13px', 
        color: '#777777', 
        fontWeight: '700', 
        marginLeft: '5px', 
        textTransform: 'uppercase' 
    },

    rightbarCompact: {
        width: `${RIGHTBAR_COMPACT_WIDTH}px`, position: 'fixed', right: '15px', top: '80px',
        padding: '12px 8px', backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px',
        zIndex: 90, fontFamily: "'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    statItemCompact: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' },
    iconCompact: { fontSize: '24px' }, 
    valueCompact: { fontSize: '14px', fontWeight: 'bold', color: '#3c3c3c' }
};

export default Rightbar;