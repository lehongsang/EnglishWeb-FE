import React from 'react';
import { Typography, Progress as AntProgress, Button as AntButton } from 'antd';
import {
    IoSchoolSharp,
    IoFlameSharp,
    IoRocketSharp,
    IoStar,
    IoCheckmarkCircleSharp
} from "react-icons/io5";

const { Text } = Typography;

const TaskCard = ({ task, courseId, onNavigateToTask }) => {
    // Trích xuất thông tin từ cấu trúc task nhận được
    const taskDetails = task.taskID || {}; // Thông tin gốc của task (title, type, target, xpReward, description)
    const userProgressCurrent = task.progress !== undefined ? task.progress : 0; // Tiến độ hiện tại của người dùng
    const taskIsCompleted = task.isCompleted || false; // Trạng thái hoàn thành

    // Lấy các giá trị cần thiết từ taskDetails hoặc task
    const name = taskDetails.title || "Nhiệm vụ"; 
    const description = taskDetails.description; 
    const type = taskDetails.type; 
    const progressTarget = taskDetails.target !== undefined ? taskDetails.target : 1;
    const xpReward = taskDetails.xpReward || 0; 
    const dailyTaskId = task._id; 

    const percentage = Math.min(Math.floor((userProgressCurrent / progressTarget) * 100), 100);

    const getTaskIconElement = () => {
        const iconStyle = { fontSize: '36px' };
        const taskColor = taskIsCompleted ? '#78c800' : (type === 'review' ? '#ff9600' : '#1cb0f6');
        const streakIconColor = taskIsCompleted ? '#78c800' : '#bababa';

        switch (type) {
            case 'learn':
            case 'earn_xp':
                return <IoSchoolSharp style={{ ...iconStyle, color: taskColor }} />;
            case 'review':
                return <IoFlameSharp style={{ ...iconStyle, color: taskColor }} />;
            case 'streak':
                return <IoRocketSharp style={{ ...iconStyle, color: streakIconColor, transform: 'rotate(-45deg)' }} />;
            default:
                return <div style={{ width: '38px', height: '38px', backgroundColor: '#e5e5e5', borderRadius: '12px' }} />;
        }
    };

    const getButtonText = () => {
        if (taskIsCompleted) return "ĐÃ HOÀN THÀNH";
        if (type === 'streak') return "DUY TRÌ";
        return "BẮT ĐẦU";
    };

    const progressActiveColor = taskIsCompleted ? '#78c800' : '#1cb0f6';

    return (
        <div style={{ ...styles.taskCard, opacity: taskIsCompleted ? 0.75 : 1 }}>
            <div style={styles.iconContainer}>
                {getTaskIconElement()}
            </div>
            <div style={styles.contentContainer}>
                <Text style={styles.taskName}>{name}</Text>
                {description && <Text style={styles.taskDescription}>{description}</Text>}

                {!taskIsCompleted && (type === 'learn' || type === 'earn_xp' || type === 'review' || (type === 'streak' && progressTarget > 1)) && (
                    <div style={styles.progressWrapper}>
                        <AntProgress
                            percent={percentage}
                            showInfo={false}
                            strokeColor={progressActiveColor}
                            trailColor="#e5e5e5"
                            size={{ height: 12 }}
                            strokeLinecap="round"
                        />
                        <Text style={styles.progressText}>
                            {userProgressCurrent}/{progressTarget}
                        </Text>
                    </div>
                )}

                {(type === 'streak' && taskIsCompleted) && (
                    <Text style={{ ...styles.taskDescription, color: '#78c800', fontWeight: 'bold', marginTop: '8px' }}>
                        Tuyệt vời! Đã duy trì chuỗi {userProgressCurrent} ngày.
                    </Text>
                )}
            </div>
            <div style={styles.actionContainer}>
                <div style={styles.xpRewardContainer}>
                    {/* Sử dụng taskIsCompleted */}
                    <IoStar style={{ fontSize: '20px', color: taskIsCompleted ? '#78c800' : '#ffc800' }} />
                    <Text style={{ ...styles.xpRewardText, color: taskIsCompleted ? '#78c800' : '#ffab1f' }}>
                        +{xpReward}
                    </Text>
                </div>
                {taskIsCompleted ? (
                    <div style={styles.completedState}>
                        <IoCheckmarkCircleSharp style={styles.completedIcon} />
                        <Text style={styles.completedText}>ĐÃ HOÀN THÀNH</Text>
                    </div>
                ) : (
                    <AntButton
                        style={{ ...styles.actionButton, ...styles.startButton }}
                        onClick={() => {
                            if (onNavigateToTask) {
                                // Truyền task.taskID (chứa type) cho hàm điều hướng
                                onNavigateToTask(taskDetails, courseId);
                            }
                        }}
                    >
                        {getButtonText()}
                    </AntButton>
                )}
            </div>
        </div>
    );
};

const styles = {
    taskCard: { display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '16px', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid #e5e5e5', padding: '20px', marginBottom: '12px', fontFamily: "'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif", minHeight: '100px', },
    iconContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', },
    contentContainer: { display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', },
    taskName: { fontSize: '18px', fontWeight: 'bold', color: '#3c3c3c', lineHeight: '1.3', },
    taskDescription: { fontSize: '14px', color: '#777777', lineHeight: '1.4', },
    progressWrapper: { marginTop: '8px', },
    progressText: { fontSize: '12px', color: '#afafaf', fontWeight: 'bold', textAlign: 'right', marginTop: '2px', },
    actionContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', gap: '10px', minWidth: '120px', }, 
    xpRewardContainer: { display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fffbe6', padding: '4px 8px', borderRadius: '8px', border: '1px solid #ffe58f', },
    xpRewardText: { fontSize: '15px', fontWeight: 'bold', },
    actionButton: { width: '100%', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', padding: '10px 0', height: '44px', borderWidth: '2px', 
                borderStyle: 'solid', borderBottomWidth: '4px', textTransform: 'uppercase', transition: 'background-color 0.1s, border-color 0.1s, transform 0.1s'
            },
    startButton: { backgroundColor: '#58cc02', color: '#ffffff', borderColor: '#58cc02', borderBottomColor: '#4aa402'},
    completedState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '44px', 
        borderRadius: '12px',
        backgroundColor: '#f6ffed', 
        border: '2px solid #b7eb8f', 
    },
    completedIcon: {
        fontSize: '20px',
        color: '#52c41a', 
    },
    completedText: {
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#52c41a',
        textTransform: 'uppercase',
        marginTop: '2px'
    }
};
export default TaskCard;