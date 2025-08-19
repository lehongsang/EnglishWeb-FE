import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Typography, Spin, message, Empty } from 'antd';
import DesktopSidebar, { SIDEBAR_WIDTH_CONST } from '../components/sidebar';
import BottomNavBar from '../components/BottomNavBar';
import Rightbar, { RIGHTBAR_FULL_WIDTH, RIGHTBAR_COMPACT_WIDTH } from '../components/Rightbar';
import TaskCard from '../components/TaskCard'; 
import apiEndpoints from '../apis/endPoint';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const TaskPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [userInfo, setUserInfo] = useState({
        totalXp: 0, currentStreak: 0, currentCourseId: null,
    });
    const [isUserInfoLoading, setIsUserInfoLoading] = useState(true);
    const [viewMode, setViewMode] = useState('desktop');

    const { currentUser } = useAuth() || {};
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) setViewMode('mobile');
            else if (width < 1024) setViewMode('tablet');
            else setViewMode('desktop');
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchUserInfo = useCallback(async (showLoadingSpinner = true) => {
        if (!currentUser) {
            if (showLoadingSpinner) setIsUserInfoLoading(false);
            return;
        }
        if (showLoadingSpinner) setIsUserInfoLoading(true);
        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(apiEndpoints.getUserStats, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            // Không throw error nếu refresh ngầm thất bại, để tránh làm gián đoạn UX
            if (!response.ok && showLoadingSpinner) throw new Error('Failed to fetch user info');
            if (!response.ok && !showLoadingSpinner) {
                console.warn("Silent user info refresh failed. Old data might be shown.");
                return;
            }

            const responseData = await response.json();
            if (responseData && responseData.data) {
                const userData = responseData.data;
                setUserInfo({
                    totalXp: userData.totalXp || 0,
                    currentStreak: userData.currentStreak || 0,
                    currentCourseId: userData.progress?.currentCourseId || null,
                });
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
            if (showLoadingSpinner) message.error("Không thể tải thông tin người dùng.");
        } finally {
            if (showLoadingSpinner) setIsUserInfoLoading(false);
        }
    }, [currentUser]);

    const fetchTasks = useCallback(async () => {
        if (!currentUser) {
            setLoadingTasks(false);
            return;
        }
        setLoadingTasks(true);
        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(apiEndpoints.getDailyTasksForUser, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) { // Thêm log chi tiết hơn khi fetch thất bại
                console.error('Failed to fetch tasks, status:', response.status, 'statusText:', response.statusText);
                const errorBody = await response.text(); // Cố gắng đọc body lỗi nếu có
                console.error('Error body:', errorBody);
                throw new Error(`Failed to fetch tasks. Status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Raw API response for tasks (data object):', JSON.stringify(data, null, 2));

            let tasksArray = [];
            if (data && data.data && Array.isArray(data.data.tasks)) {
                tasksArray = data.data.tasks;
            } else {
                console.warn("Tasks data received is not in expected array format (data.data.tasks), or is missing:", data);
            }
            
            if (Array.isArray(tasksArray) && tasksArray.length > 0) {
                const sortedTasks = [...tasksArray].sort((a, b) => {
                    if (a.isCompleted && !b.isCompleted) return 1;
                    if (!a.isCompleted && b.isCompleted) return -1;
                    return 0;
                });
                console.log('Processed and sorted tasks:', sortedTasks);
                setTasks(sortedTasks);
            } else {
                console.log('No tasks found or tasksArray is empty after processing.');
                setTasks([]); 
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
            if (!(error.message && error.message.startsWith("Failed to fetch tasks. Status:"))) {
                 message.error("Không thể tải danh sách nhiệm vụ. Vui lòng thử lại.");
            }
            setTasks([]);
        } finally {
            setLoadingTasks(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchUserInfo(true);
            fetchTasks();
        } else {
            setIsUserInfoLoading(false); setLoadingTasks(false); setTasks([]);
            setUserInfo({ totalXp: 0, currentStreak: 0, currentCourseId: null });
        }
  
        const refreshInterval = setInterval(() => {
            if (currentUser) {
                console.log("Refreshing tasks and user info...");
                fetchTasks();
                fetchUserInfo(false); 
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(refreshInterval);

    }, [currentUser, fetchUserInfo, fetchTasks]);

    const handleNavigateToTaskType = async (taskDetails, courseIdForTask) => {
        const { type } = taskDetails;
        const currentCourseIdToUse = courseIdForTask || userInfo.currentCourseId;

        if (!currentCourseIdToUse && (type === 'learn' || type === 'earn_xp' || type === 'review')) {
            message.warn("Vui lòng chọn một khóa học để tiếp tục."); return;
        }
        if (!currentUser) return;
        const token = await currentUser.getIdToken();
        const loadingMessageKey = 'taskNavigation';
        message.loading({ content: 'Đang chuyển hướng...', key: loadingMessageKey, duration: 0 });

        try {
            if (type === 'learn' || type === 'earn_xp') {
                const response = await fetch(apiEndpoints.getNextLesson(currentCourseIdToUse), {
                     headers: { 'Authorization': `Bearer ${token}` }});
                if (!response.ok) throw new Error('Không thể lấy bài học tiếp theo');
                const nextLessonData = await response.json();
                console.log('Next Lesson Data from API:', JSON.stringify(nextLessonData, null, 2)); 

               if (nextLessonData && nextLessonData.data && nextLessonData.data._id) {
                    const lessonId = nextLessonData.data._id; // Lấy lessonId từ nextLessonData.data._id
                    navigate(`/lessons/${lessonId}`);
                } else { 
                    message.info("Bạn đã hoàn thành tất cả bài học trong khóa này!"); 
                }
            } else if (type === 'review') {
                const response = await fetch(apiEndpoints.startReviewSession, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ courseId: currentCourseIdToUse }),
                });
                if (!response.ok) throw new Error('Không thể bắt đầu phiên ôn tập');
                const reviewSessionData = await response.json();
                if (reviewSessionData && reviewSessionData.vocabularies && reviewSessionData.vocabularies.length > 0) {
                    navigate(`/review/active-session`, { state: { ...reviewSessionData, courseId: currentCourseIdToUse } });
                } else { message.info("Chưa có từ vựng nào cần ôn tập cho khóa học này."); }
            } else if (type === 'streak') {
                navigate('/home');
            }
            message.destroy(loadingMessageKey);
        } catch (error) {
            message.destroy(loadingMessageKey);
            message.error(error.message || "Thao tác thất bại. Vui lòng thử lại.");
            console.error("Error navigating/starting task:", error);
        }
    };

    const rightbarKey = `user-${userInfo.totalXp}-${userInfo.currentStreak}`;
    const mainContentStyle = {...pageStyles.mainContentBase,
        paddingTop: '28px',
        paddingBottom: viewMode === 'mobile' ? '80px' : '32px',
        marginLeft: viewMode !== 'mobile' ? `${SIDEBAR_WIDTH_CONST}px` : '0',
        marginRight: viewMode === 'desktop' ? `${RIGHTBAR_FULL_WIDTH + 20}px` :
                       viewMode === 'tablet' ? `${RIGHTBAR_COMPACT_WIDTH + 15}px` : '0',
        transition: 'margin-left 0.3s ease-in-out, margin-right 0.3s ease-in-out, padding-bottom 0.3s ease-in-out', 
    };

    if (isUserInfoLoading && viewMode !== 'mobile' && !tasks.length) { 
        return ( 
             <div style={{...pageStyles.pageContainer, justifyContent: 'center', alignItems: 'center'}}>
                <Spin size="large"/>
            </div>
        );
    }

    return (
        <div style={pageStyles.pageContainer}>
            {viewMode !== 'mobile' ? <DesktopSidebar /> : <BottomNavBar />}
            <main style={mainContentStyle}>
                <div style={pageStyles.headerContainer}>
                    <Title level={1} style={pageStyles.pageTitle}>Nhiệm Vụ</Title>
                </div>
                {loadingTasks && userInfo.currentCourseId !== null ? (
                     <div style={{ textAlign: 'center', marginTop: '50px' }}><Spin /></div>
                ) : !loadingTasks && tasks.length === 0 ? (
                    <Empty /* ... */ />
                ) : (
                    <div style={pageStyles.taskListContainer}>
                        {tasks.map(task => (
                            <TaskCard
                                key={task._id || task.id}
                                task={task}
                                courseId={userInfo.currentCourseId}
                                onNavigateToTask={handleNavigateToTaskType}
                            />
                        ))}
                    </div>
                )}
            </main>
            {viewMode === 'desktop' && <Rightbar key={rightbarKey} isCompact={false} />}
            {viewMode === 'tablet' && <Rightbar key={rightbarKey} isCompact={true} />}
        </div>
    );
};

const pageStyles = {
    pageContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#f7f7f7', fontFamily: "'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif", overflowX: 'hidden', },
    mainContentBase: { flexGrow: 1, paddingLeft: '32px', paddingRight: '32px', display: 'flex', flexDirection: 'column', minWidth: 0, boxSizing: 'border-box', },
    headerContainer: { paddingBottom: '20px', width: '100%', },
    pageTitle: { fontSize: '30px', fontWeight: '900', color: '#3c3c3c', margin: 0, }, 
    taskListContainer: { maxWidth: '700px', width: '100%', margin: '0 auto', }
};

export default TaskPage;