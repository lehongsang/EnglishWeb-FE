import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Spin, message, Empty, Button, Collapse, Modal, List } from 'antd';
import DesktopSidebar, { SIDEBAR_WIDTH_CONST } from '../components/sidebar';
import BottomNavBar from '../components/BottomNavBar';
import Rightbar, { RIGHTBAR_FULL_WIDTH, RIGHTBAR_COMPACT_WIDTH } from '../components/Rightbar';
import VocabularyCard from '../components/VocabularyCard';
import ExerciseCard from '../components/ExerciseCard';
import apiEndpoints from '../apis/endPoint';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HistoryOutlined, BookOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const TEMP_DEFAULT_COURSE_ID = 'YOUR_COURSE_ID_HERE';

const VocabularyPage = () => {
    const [groupedVocabularies, setGroupedVocabularies] = useState([]);
    const [loadingVocab, setLoadingVocab] = useState(false);
    const [userInfo, setUserInfo] = useState({ totalXp: 0, currentStreak: 0, currentCourseId: null });
    const [isUserInfoLoading, setIsUserInfoLoading] = useState(true);
    const [viewMode, setViewMode] = useState('desktop');
    const [reviewSession, setReviewSession] = useState({ active: false, exercises: [], currentExerciseIndex: 0, answers: {}, isLoading: false });
    const { currentUser } = useAuth() || {};
    const navigate = useNavigate();

    useEffect(() => { 
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) setViewMode('mobile');
            else if (width < 1024) setViewMode('tablet'); 
            else if (width < 1280) setViewMode('desktopSmall'); 
            else setViewMode('desktopLarge'); 
        };
        window.addEventListener('resize', handleResize); handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchUserInfo = useCallback(async (showLoadingSpinner = true) => { 
        if (!currentUser) { if (showLoadingSpinner) setIsUserInfoLoading(false); return; }
        if (showLoadingSpinner) setIsUserInfoLoading(true);
        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(apiEndpoints.getUserStats, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok && showLoadingSpinner) throw new Error('Failed to fetch user info');
            if (!response.ok && !showLoadingSpinner) { console.warn("Silent user info refresh failed."); return; }
            const responseData = await response.json();
            if (responseData && responseData.data) {
                const userData = responseData.data;
                setUserInfo({
                    totalXp: userData.totalXp || 0,
                    currentStreak: userData.currentStreak || 0,
                    currentCourseId: userData.progress?.currentCourseId || TEMP_DEFAULT_COURSE_ID, 
                });
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
            if (showLoadingSpinner) message.error("Không thể tải thông tin người dùng.");
        } finally {
            if (showLoadingSpinner) setIsUserInfoLoading(false);
        }
    }, [currentUser]);

    const fetchGroupedVocabularies = useCallback(async (courseId) => {
        if (!currentUser || !courseId) {
            setLoadingVocab(false);
            setGroupedVocabularies([]);
            return;
        }
        setLoadingVocab(true);
        try {
            const token = await currentUser.getIdToken();
            // SỬ DỤNG ENDPOINT CHÍNH XÁC TỪ apiEndpoints.js
            const response = await fetch(apiEndpoints.getLearnedVocabGrouped(courseId), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Lỗi không xác định khi tải từ vựng.' }));
                throw new Error(errorData.message || 'Không thể tải danh sách từ vựng.');
            }
            const responseData = await response.json();
            if (responseData && responseData.success && Array.isArray(responseData.data)) {
                setGroupedVocabularies(responseData.data);
            } else if (responseData && responseData.success && responseData.data === null) { // Trường hợp không có từ nào
                 setGroupedVocabularies([]);
            } else {
                console.warn("Dữ liệu từ vựng không hợp lệ hoặc không thành công:", responseData);
                setGroupedVocabularies([]);
            }
        } catch (error) {
            console.error("Error fetching grouped vocabularies:", error);
            message.error(error.message || "Lỗi khi tải từ vựng.");
            setGroupedVocabularies([]);
        } finally {
            setLoadingVocab(false);
        }
    }, [currentUser]);

    useEffect(() => { 
        if (currentUser) {
            fetchUserInfo(true);
        } else {
            setIsUserInfoLoading(false); setLoadingVocab(false);
            setGroupedVocabularies([]);
            setUserInfo(prev => ({ ...prev, currentCourseId: TEMP_DEFAULT_COURSE_ID }));
        }
    }, [currentUser, fetchUserInfo]);

    useEffect(() => {
        if (userInfo.currentCourseId && currentUser) { 
            fetchGroupedVocabularies(userInfo.currentCourseId);
        }
    }, [userInfo.currentCourseId, fetchGroupedVocabularies, currentUser]);


    const handleStartReviewSession = async () => {
        if (!currentUser || !userInfo.currentCourseId) {
            message.warn("Vui lòng đăng nhập và chọn khóa học.");
            return;
        }
        setReviewSession(prev => ({ ...prev, isLoading: true, active: false, exercises: [], currentExerciseIndex: 0, answers: {} }));
        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(apiEndpoints.startReviewSession, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ courseId: userInfo.currentCourseId, vocabCount: 10, exercisesPerVocab: 1 }), // Ví dụ params
            });
            if (!response.ok) {
                 const errorData = await response.json().catch(()=>({}));
                 throw new Error(errorData.message || 'Không thể bắt đầu phiên ôn tập');
            }
            const sessionData = await response.json();

            if (sessionData.success && sessionData.data && sessionData.data.length > 0) {
                setReviewSession({
                    active: true,
                    exercises: sessionData.data, 
                    currentExerciseIndex: 0,
                    answers: {},
                    isLoading: false,
                });
            } else {
                message.info('Tuyệt vời! Hiện không có từ nào cần ôn tập ngay.');
                setReviewSession(prev => ({ ...prev, isLoading: false, active: false }));
            }
        } catch (error) {
            console.error("Error starting review session:", error);
            message.error(error.message || "Lỗi khi bắt đầu phiên ôn tập.");
            setReviewSession(prev => ({ ...prev, isLoading: false, active: false }));
        }
    };
    const handleSubmitReviewAnswer = async (exerciseId, userAnswer) => { 
        if (!exerciseId) {
            console.error("Exercise ID is undefined. Cannot submit review answer.");
            message.error("Lỗi: Không tìm thấy thông tin bài tập.");
            return;
        }
        
        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(apiEndpoints.submitLearningExercise(exerciseId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ answer: userAnswer }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(()=>({}));
                throw new Error(errorData.message || 'Lỗi khi nộp câu trả lời');
            }
            const resultData = await response.json();

            if (resultData.success) {
                const result = resultData.data;
                setReviewSession(prev => ({
                    ...prev,
                    answers: {
                        ...prev.answers,
                        [exerciseId]: { 
                            userAnswer: userAnswer,
                            isCorrect: result.isCorrect,
                            correctAnswer: result.correctAnswer,
                            srsDetails: result.srsDetails
                        }
                    }
                }));
                if(result.xpEarned && result.xpEarned > 0) {
                    fetchUserInfo(false); 
                }
            } else {
                message.error(resultData.message || "Nộp câu trả lời thất bại.");
            }
        } catch (err) {
            console.error("Error submitting review answer:", err);
            message.error(err.message || "Lỗi khi nộp câu trả lời ôn tập.");
        } finally {
        }
    };
    const handleNextReviewExercise = () => { 
        setReviewSession(prev => {
            if (prev.currentExerciseIndex < prev.exercises.length - 1) {
                return { ...prev, currentExerciseIndex: prev.currentExerciseIndex + 1 };
            } else {
                message.success("Bạn đã hoàn thành phiên ôn tập!");
                fetchUserInfo(false); 
                fetchGroupedVocabularies(userInfo.currentCourseId); 
                return { ...prev, active: false };
            }
        });
    };
    const handleCloseReviewModal = () => { 
        setReviewSession({ active: false, exercises: [], currentExerciseIndex: 0, answers: {}, isLoading: false });
        fetchUserInfo(false);
        if (userInfo.currentCourseId) {
             fetchGroupedVocabularies(userInfo.currentCourseId);
        }
    };
        const renderReviewSessionModal = () => {
        if (!reviewSession.active || reviewSession.exercises.length === 0) return null;
        const currentExercise = reviewSession.exercises[reviewSession.currentExerciseIndex];
        const exerciseResult = currentExercise ? reviewSession.answers[currentExercise._id] : null;

        if (!currentExercise) return null;

        return (
            <Modal
                title={`Ôn tập (${reviewSession.currentExerciseIndex + 1}/${reviewSession.exercises.length})`}
                open={reviewSession.active} // ĐÃ THAY ĐỔI
                onCancel={handleCloseReviewModal}
                footer={
                    exerciseResult ? (
                        <Button type="primary" onClick={handleNextReviewExercise}>
                            {reviewSession.currentExerciseIndex < reviewSession.exercises.length - 1 ? "Tiếp theo" : "Hoàn thành"}
                        </Button>
                    ) : (
                        <Text type="secondary">Hãy hoàn thành bài tập bên trên.</Text>
                    )
                }
                width={600}
                // destroyOnClose
                centered
            >
                <ExerciseCard
                    key={currentExercise._id} 
                    exercise={currentExercise}
                    onSubmit={handleSubmitReviewAnswer}
                    isCompleted={!!exerciseResult}
                    isCorrect={exerciseResult?.isCorrect}
                    userAnswer={exerciseResult?.userAnswer}
                    correctAnswer={exerciseResult?.correctAnswer}
                    exerciseResult={exerciseResult}
                />
            </Modal>
        );
    };


    const rightbarKey = `user-${userInfo.totalXp}-${userInfo.currentStreak}`;

    const mainContentWrapperStyle = {
        ...pageStyles.mainContentWrapperBase,
        marginLeft: (viewMode === 'desktopLarge' || viewMode === 'desktopSmall' || viewMode === 'tablet') ? `${SIDEBAR_WIDTH_CONST}px` : '0',
        paddingRight: (viewMode === 'desktopLarge') ? `${RIGHTBAR_FULL_WIDTH + 40}px` : 
                      (viewMode === 'desktopSmall' || viewMode === 'tablet') ? `${RIGHTBAR_COMPACT_WIDTH + 30}px` : // Khoảng cách với Rightbar compact
                      '0',
        paddingBottom: viewMode === 'mobile' ? '80px' : '32px', 
        transition: 'margin-left 0.3s ease-in-out, padding-right 0.3s ease-in-out, padding-bottom 0.3s ease-in-out',
    };


    if (isUserInfoLoading && viewMode !== 'mobile' && !groupedVocabularies.length) {
        return ( <div style={{...pageStyles.pageContainer, justifyContent: 'center', alignItems: 'center'}}><Spin size="large" /></div> );
    }

    return (
        <div style={pageStyles.pageContainer}>
            {viewMode !== 'mobile' ? <DesktopSidebar /> : <BottomNavBar />}

            <div style={mainContentWrapperStyle}>
                <main style={pageStyles.mainContentFramed}>
                    <div style={pageStyles.headerContainer}>
                        <Title level={1} style={pageStyles.pageTitle}>Từ Vựng Của Tôi</Title>
                        <Button
                            type="primary"
                            icon={<HistoryOutlined />}
                            size="large"
                            onClick={handleStartReviewSession}
                            loading={reviewSession.isLoading}
                            style={pageStyles.reviewButton}
                        >
                            Ôn Tập Ngay
                        </Button>
                    </div>

                    {loadingVocab && !isUserInfoLoading ? ( 
                        <div style={{ textAlign: 'center', marginTop: '50px' }}><Spin /></div>
                    ) : groupedVocabularies.length === 0 ? (
                        <Empty image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                        imageStyle={{ height: 120 }}
                        description={
                            <Typography.Text style={{ fontSize: '16px', color: '#595959' }}>
                                Bạn chưa học từ vựng nào trong khóa học này.
                                <br/>
                                Hãy bắt đầu học để xây dựng kho từ của bạn!
                            </Typography.Text>
                        } 
                        >
                             <Button type="primary" size="large" onClick={() => navigate('/home')}>Bắt đầu học</Button>
                        </Empty>
                    ) : (
                        <Collapse accordion defaultActiveKey={groupedVocabularies.length > 0 ? '0' : undefined} ghost style={pageStyles.collapse}>
                            {groupedVocabularies.map((lessonGroup, index) => (
                                <Panel
                                    header={
                                        <Title level={4} style={pageStyles.lessonTitle}>
                                            <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                            {lessonGroup.lessonTitle || `Bài học ${lessonGroup.lessonOrder || index + 1}`}
                                            <Text type="secondary" style={{marginLeft: 10, fontSize: '0.9em'}}>({lessonGroup.vocabularies?.length || 0} từ)</Text>
                                        </Title>
                                    }
                                    key={index.toString()}
                                    style={pageStyles.panel}
                                >
                                    <List
                                        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }} // Giảm số cột một chút cho vừa khung
                                        dataSource={lessonGroup.vocabularies}
                                        renderItem={vocab => ( <List.Item> <VocabularyCard vocabulary={vocab} /> </List.Item> )}
                                        locale={{ emptyText: "Chưa có từ vựng trong bài này." }}
                                    />
                                </Panel>
                            ))}
                        </Collapse>
                    )}
                </main>
            </div>

            {viewMode === 'desktopLarge' && <Rightbar key={rightbarKey} isCompact={false} />}
            {(viewMode === 'desktopSmall' || viewMode === 'tablet') && <Rightbar key={rightbarKey} isCompact={true} />}

            {renderReviewSessionModal()}
        </div>
    );
};

const pageStyles = {
    pageContainer: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5', 
        fontFamily: "'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        overflowX: 'hidden',
    },
    mainContentWrapperBase: { 
        flexGrow: 1,
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        paddingTop: '28px', 
        boxSizing: 'border-box',
    },
    mainContentFramed: { 
        width: '100%',
        maxWidth: '960px', 
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 28px - 32px)', 
    },
    headerContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%', 
        paddingBottom: '24px',
        borderBottom: '1px solid #e8e8e8',
        marginBottom: '24px',
    },
    pageTitle: {
        fontSize: '32px', 
        fontWeight: '900', 
        color: '#3c3c3c',
        margin: 0,
    },
    reviewButton: {
        borderRadius: '12px', 
        fontWeight: 'bold',
        
    },
    collapse: {
        backgroundColor: 'transparent',
        border: 'none', 
    },
    panel: {
        backgroundColor: '#ffffff',
        borderRadius: '16px !important',
        marginBottom: '20px !important', 
        border: '2px solid #e8e8e8 !important', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
        overflow: 'hidden',
        '.ant-collapse-header': { 
            padding: '16px 20px !important',
            // backgroundColor: '#fafafa', 
            // borderBottom: '1px solid #e8e8e8', 
        },
        '.ant-collapse-content > .ant-collapse-content-box': { 
            padding: '20px !important',
        }
    },
    lessonTitle: {
        margin: 0,
        color: '#3c3c3c',
        fontWeight: 700,
        fontSize: '18px',
    },
};

export default VocabularyPage;