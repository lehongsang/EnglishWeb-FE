import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SkillSection from "../components/SkillSection";
import Sidebar, { SIDEBAR_WIDTH_CONST } from "../components/sidebar";
import Rightbar, { RIGHTBAR_FULL_WIDTH, RIGHTBAR_COMPACT_WIDTH } from '../components/Rightbar';
import BottomNavBar from "../components/BottomNavBar";
import ExerciseCard from "../components/ExerciseCard";
import { Typography, Spin, message, Button, Progress, Result, Empty, Tag, Card } from "antd"; // Thêm Card
import { ArrowLeftOutlined, TrophyOutlined, LoadingOutlined, CheckCircleFilled, RiseOutlined } from '@ant-design/icons'; // Thêm CheckCircleFilled, RiseOutlined
import apiEndpoints from "../apis/endPoint";
import { useAuth } from "../contexts/AuthContext";
import './Home.css'; 
const { Title, Text } = Typography;

const CURRENT_COURSE_ID = "6839a612215295a44a2704eb";

const pageStyles = {
    pageContainer: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5', // Màu nền nhẹ nhàng hơn
        fontFamily: "'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        overflowX: 'hidden'
    },
    mainContentBase: {
        flexGrow: 1,
        padding: '24px 32px', // Tăng padding
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 0,
        boxSizing: 'border-box',
    },
    headerContainer: {
        paddingTop: '28px',
        paddingBottom: '28px', // Tăng padding bottom
        width: '100%',
        maxWidth: '700px',
        marginBottom: '24px', // Thêm margin bottom
    },
    pageTitle: {
        fontSize: '32px', // Tăng kích thước
        fontWeight: '700', // Điều chỉnh độ đậm
        color: '#262626', // Màu tối hơn chút
        margin: 0,
        textAlign: 'center',
    },
    listContainer: {
        width: '100%',
        maxWidth: '700px',
        paddingBottom: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px', // Khoảng cách giữa các SkillSection
    },
    lessonDetailContainer: {
        width: '100%',
        maxWidth: '800px',
        paddingTop: '20px', // Giảm paddingTop
        paddingBottom: '32px'
    },
    lessonContentCard: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Bóng đổ rõ hơn
    }
};

function Home() {
    const [skills, setSkills] = useState([]);
    const [courseTitle, setCourseTitle] = useState("");
    const [loadingCourse, setLoadingCourse] = useState(true);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [lessonExercises, setLessonExercises] = useState([]);
    const [loadingLessonContent, setLoadingLessonContent] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [lessonScore, setLessonScore] = useState(0);
    const [isLessonCompletedByServer, setIsLessonCompletedByServer] = useState(false);
    const [isLessonView, setIsLessonView] = useState(false);
    const [viewMode, setViewMode] = useState('desktop');
    const [userInfoForRightbar, setUserInfoForRightbar] = useState({ totalXp: 0, currentStreak: 0 });
    const [refreshingCourse, setRefreshingCourse] = useState(false);
    const [unlockedNextLessonInfo, setUnlockedNextLessonInfo] = useState(null);
    const [xpGainedRecently, setXpGainedRecently] = useState(0); // State cho hiệu ứng XP

    const { currentUser } = useAuth();
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

    const getToken = useCallback(async () => {
        if (!currentUser) throw new Error("Người dùng chưa xác thực");
        return await currentUser.getIdToken();
    }, [currentUser]);

    const fetchUserInfoForRightbar = useCallback(async () => {
        if (!currentUser) return;
        try {
            const token = await getToken();
            const response = await fetch(apiEndpoints.getUserStats, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Lỗi tải thông số người dùng');
            const responseData = await response.json();
            if (responseData?.data) {
                setUserInfoForRightbar({
                    totalXp: responseData.data.totalXp || 0,
                    currentStreak: responseData.data.currentStreak || 0,
                });
            }
        } catch (error) {
            console.error("Lỗi tải thông số người dùng cho rightbar:", error);
        }
    }, [currentUser, getToken]);

    useEffect(() => {
        if (currentUser && (viewMode === 'desktop' || viewMode === 'tablet')) {
            fetchUserInfoForRightbar();
        }
    }, [currentUser, viewMode, fetchUserInfoForRightbar]);

    const fetchCourseStructure = useCallback(async (isInitialLoad = false) => {
        if (!currentUser || !CURRENT_COURSE_ID) {
            setLoadingCourse(false);
            return;
        }
        if (isInitialLoad || refreshingCourse) setLoadingCourse(true);

        try {
            console.log(`Đang tải cấu trúc khóa học cho courseId: ${CURRENT_COURSE_ID}...`);
            const token = await getToken();
            const response = await fetch(apiEndpoints.getCourseStructure(CURRENT_COURSE_ID), {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            console.log("Response status getCourseStructure:", response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Lỗi tải cấu trúc khóa học: ${response.statusText}`);
            }

            const responseData = await response.json();
            if (responseData?.success && responseData.data) {
                setSkills(responseData.data.skills || []);
                // Chỉ set courseTitle nếu có, không hiển thị ID
                if (responseData.data.courseTitle) {
                    setCourseTitle(responseData.data.courseTitle);
                } else {
                    setCourseTitle(""); // Hoặc "Khóa học của tôi" nếu muốn có fallback
                    console.warn("API không trả về courseTitle cho courseId:", CURRENT_COURSE_ID);
                }

                if (responseData.data.userProgress?.totalXp !== undefined) {
                   setUserInfoForRightbar(prev => ({...prev, totalXp: responseData.data.userProgress.totalXp}));
                }
            } else {
                message.error(responseData.message || 'Định dạng dữ liệu khóa học không hợp lệ.');
                setSkills([]);
                setCourseTitle("");
            }
        } catch (error) {
            message.error(error.message);
            setSkills([]);
            setCourseTitle("");
        } finally {
            if (isInitialLoad || refreshingCourse) setLoadingCourse(false);
            if (refreshingCourse) setRefreshingCourse(false);
        }
    }, [currentUser, getToken, refreshingCourse]);

    useEffect(() => {
        if (currentUser && CURRENT_COURSE_ID) {
            fetchCourseStructure(true);
        } else {
            setSkills([]);
            setLoadingCourse(false);
        }
    }, [currentUser, fetchCourseStructure]);

    const findNextUnlockableLesson = useCallback(() => {
        if (!selectedLesson || !skills || skills.length === 0) return null;

        let currentLessonOrder = -1;
        let currentSkillOrder = -1;
        let currentSkillId = selectedLesson.skillID;

        const currentSkillData = skills.find(s => s._id === currentSkillId);
        if (!currentSkillData) return null;
        currentSkillOrder = currentSkillData.order;

        const lessonInSkill = currentSkillData.lessons.find(l => l._id === selectedLesson._id);
        if (!lessonInSkill) return null;
        currentLessonOrder = lessonInSkill.order;

        const nextLessonInSameSkill = currentSkillData.lessons.find(
            l => l.order > currentLessonOrder && l.isUnlock
        );
        if (nextLessonInSameSkill) {
            return { lesson: nextLessonInSameSkill, skillTitle: currentSkillData.title };
        }

        const sortedSkills = [...skills].sort((a, b) => a.order - b.order);
        for (const skill of sortedSkills) {
            if (skill.order > currentSkillOrder) {
                const firstUnlockedInNextSkill = skill.lessons.find(l => l.isUnlock);
                if (firstUnlockedInNextSkill) {
                    return { lesson: firstUnlockedInNextSkill, skillTitle: skill.title };
                }
            }
        }
        return null;
    }, [skills, selectedLesson]);

    const handleLessonClick = useCallback(async (lessonFromList) => {
        if (!currentUser) {
            message.error("Vui lòng đăng nhập để bắt đầu học.");
            return;
        }
        if (!lessonFromList.isUnlock) {
            message.warn("Bài học này hiện đang bị khóa. Hãy hoàn thành các bài học trước đó.");
            return;
        }

        setIsLessonView(true);
        setSelectedLesson(lessonFromList);
        setIsLessonCompletedByServer(lessonFromList.isCompleted || false);
        setUnlockedNextLessonInfo(null);
        setUserAnswers({});
        setLessonScore(0);
        setXpGainedRecently(0); // Reset XP khi chuyển bài
        setLoadingLessonContent(true);

        try {
            const token = await getToken();
            const exercisesResponse = await fetch(apiEndpoints.getExercisesForLesson(lessonFromList._id), {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!exercisesResponse.ok) {
                const errorData = await exercisesResponse.json().catch(() => ({}));
                throw new Error(errorData.message || `Lỗi tải bài tập: ${exercisesResponse.statusText}`);
            }
            const exercisesData = await exercisesResponse.json();
            if (exercisesData?.success && Array.isArray(exercisesData.data)) {
                setLessonExercises(exercisesData.data);
                if (lessonFromList.isCompleted && exercisesData.data.length > 0) {
                    const completedAnswers = {};
                    let score = 0;
                    exercisesData.data.forEach(ex => {
                        completedAnswers[ex._id] = { userAnswer: ex.correctAnswer, isCorrect: true, feedback: "Đã hoàn thành" };
                        score++;
                    });
                    setUserAnswers(completedAnswers);
                    setLessonScore(score);
                }
            } else {
                message.error(exercisesData.message || 'Không tìm thấy bài tập.');
                setLessonExercises([]);
            }
        } catch (error) {
            console.error('Lỗi tải nội dung bài học:', error);
            message.error(error.message);
            setIsLessonView(false);
            setSelectedLesson(null);
            setLessonExercises([]);
        } finally {
            setLoadingLessonContent(false);
        }
    }, [currentUser, getToken]);

    const handleExerciseSubmit = useCallback(async (exerciseId, actualUserAnswer) => {
        if (!currentUser || !selectedLesson || isLessonCompletedByServer) return;

        setUserAnswers(prev => ({
            ...prev,
            [exerciseId]: { ...prev[exerciseId], userAnswer: actualUserAnswer, isSubmitting: true }
        }));
        setXpGainedRecently(0); // Reset trước khi submit mới

        try {
            const token = await getToken();
            const response = await fetch(apiEndpoints.submitLearningExercise(exerciseId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ userAnswer: actualUserAnswer, lessonId: selectedLesson._id }),
            });
            const resultData = await response.json();

            if (!response.ok) throw new Error(resultData.message || `Lỗi nộp bài tập: ${response.statusText}`);

            if (resultData.success && resultData.data) {
                setUserAnswers(prev => ({
                    ...prev,
                    [exerciseId]: {
                        userAnswer: actualUserAnswer,
                        isCorrect: resultData.data.isCorrect,
                        feedback: resultData.data.isCorrect ? (resultData.data.feedback || "Chính xác!") : (resultData.data.feedback || "Chưa đúng, thử lại nhé."),
                        isSubmitting: false
                    }
                }));

                if (resultData.data.isCorrect) {
                    setLessonScore(prev => prev + 1);
                    if (resultData.data.xpGained > 0) {
                        setUserInfoForRightbar(prev => ({ ...prev, totalXp: prev.totalXp + resultData.data.xpGained }));
                        setXpGainedRecently(resultData.data.xpGained); // Set XP để hiển thị hiệu ứng
                        // Hiển thị message.success với hiệu ứng
                        message.success({
                            content: (
                                <span className="xp-gain-message">
                                    {resultData.data.feedback || "Chính xác!"} +{resultData.data.xpGained} XP
                                </span>
                            ),
                            icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, // Icon tick xanh
                            duration: 2.5,
                            className: 'custom-xp-message'
                        });
                    } else {
                        message.success(resultData.data.feedback || "Chính xác!");
                    }
                } else {
                    message.error(resultData.data.feedback || "Chưa đúng. Hãy thử lại.");
                }
                await fetchUserInfoForRightbar();
            } else {
                throw new Error(resultData.message || "Lỗi xử lý kết quả từ server.");
            }
        } catch (error) {
            message.error(error.message);
            setUserAnswers(prev => ({
                ...prev,
                [exerciseId]: { ...prev[exerciseId], isSubmitting: false, feedback: "Nộp bài thất bại." }
            }));
        }
    }, [currentUser, selectedLesson, getToken, isLessonCompletedByServer, fetchUserInfoForRightbar]);

    const allExercisesAttempted = useCallback(() => {
        if (!lessonExercises || lessonExercises.length === 0) return true;
        return lessonExercises.every(ex => userAnswers[ex._id] !== undefined && userAnswers[ex._id].isSubmitting === false);
    }, [lessonExercises, userAnswers]);

    const handleLessonCompletion = useCallback(async () => {
        if (!currentUser || !selectedLesson) return;
        if (!isLessonCompletedByServer && !allExercisesAttempted() && lessonExercises.length > 0) {
            message.warn("Vui lòng hoàn thành tất cả bài tập.");
            return;
        }
        setRefreshingCourse(true);
        try {
            const token = await getToken();
            const response = await fetch(apiEndpoints.completeLearningLesson(selectedLesson._id), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const resultData = await response.json();
            if (!response.ok) throw new Error(resultData.message || `Lỗi hoàn thành bài học: ${response.statusText}`);

            if (resultData?.success) {
                message.success(resultData.message || `Chúc mừng! Bạn đã hoàn thành bài học "${selectedLesson.title}"!`);
                setIsLessonCompletedByServer(true);
                if (resultData.data?.xpGained) {
                     setUserInfoForRightbar(prev => ({ ...prev, totalXp: prev.totalXp + resultData.data.xpGained }));
                }
                await fetchCourseStructure(false);
                await fetchUserInfoForRightbar();
            } else {
                message.error(resultData?.message || "Không thể hoàn thành bài học.");
            }
        } catch (error) {
            message.error(error.message);
        }
    }, [
        currentUser, selectedLesson, getToken, fetchCourseStructure,
        allExercisesAttempted, lessonExercises, isLessonCompletedByServer, fetchUserInfoForRightbar
    ]);

    useEffect(() => {
        if (selectedLesson && isLessonCompletedByServer && skills.length > 0) {
            const nextLessonDetails = findNextUnlockableLesson();
            setUnlockedNextLessonInfo(nextLessonDetails);
        } else if (!selectedLesson || !isLessonCompletedByServer) {
            setUnlockedNextLessonInfo(null);
        }
    }, [skills, selectedLesson, isLessonCompletedByServer, findNextUnlockableLesson]);

    const calculateProgressPercentage = useCallback(() => {
        if (!lessonExercises || lessonExercises.length === 0) return isLessonCompletedByServer ? 100 : 0;
        const attemptedCount = Object.keys(userAnswers).filter(id => userAnswers[id]?.isCorrect !== undefined).length;
        return Math.round((attemptedCount / lessonExercises.length) * 100);
    }, [lessonExercises, userAnswers, isLessonCompletedByServer]);

    const handleGoToNextLesson = useCallback(() => {
        if (!unlockedNextLessonInfo?.lesson) return;
        handleLessonClick(unlockedNextLessonInfo.lesson);
    }, [unlockedNextLessonInfo, handleLessonClick]);

    const handleBackToLessonList = useCallback(() => {
        setIsLessonView(false);
        setSelectedLesson(null);
        setLessonExercises([]);
    }, []);

    const rightbarKey = `user-${userInfoForRightbar.totalXp}-${userInfoForRightbar.currentStreak}`;
    const mainContentStyle = {
        ...pageStyles.mainContentBase,
        paddingBottom: viewMode === 'mobile' ? '80px' : '24px', // Đảm bảo padding bottom cho desktop
        marginLeft: viewMode !== 'mobile' ? `${SIDEBAR_WIDTH_CONST}px` : '0',
        marginRight: (viewMode === 'desktop' && !isLessonView) ? `${RIGHTBAR_FULL_WIDTH + 20}px` :
            (viewMode === 'tablet' && !isLessonView) ? `${RIGHTBAR_COMPACT_WIDTH + 15}px` : '0',
        transition: 'margin-left 0.3s ease-in-out, margin-right 0.3s ease-in-out, padding-bottom 0.3s ease-in-out',
    };

    if (loadingCourse && skills.length === 0 && !isLessonView) {
        return (
            <div style={{ ...pageStyles.pageContainer, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' }}>
                <Spin size="large" tip="Đang tải khóa học..." fullscreen />
            </div>
        );
    }

    return (
        <div style={pageStyles.pageContainer}>
            {viewMode !== 'mobile' ? <Sidebar /> : <BottomNavBar />}

            <main style={mainContentStyle}>
                {!isLessonView ? (
                    <>
                        <div style={pageStyles.headerContainer}>
                            <Title level={1} style={pageStyles.pageTitle}>
                                {courseTitle || (loadingCourse && skills.length === 0 ? "" : "Học tập")}
                            </Title>
                        </div>
                        {(loadingCourse && (refreshingCourse || skills.length === 0)) ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <Spin
                                    indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />} // Icon to hơn, màu sắc
                                    tip={<Text style={{ marginTop: 16, fontSize: 16, color: '#595959' }}>{refreshingCourse ? "Đang cập nhật..." : "Đang tải khóa học..."}</Text>}
                                />
                            </div>
                        ) : !loadingCourse && skills.length === 0 ? (
                            <Empty 
                                description={<Text style={{fontSize: 16}}>Không tìm thấy nội dung khóa học.</Text>} 
                                style={{ marginTop: '60px' }} 
                            />
                        ) : (
                            <div style={pageStyles.listContainer}>
                                {skills.map(skill => (
                                    <SkillSection
                                        key={skill._id}
                                        skill={skill}
                                        onLessonClick={handleLessonClick}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    selectedLesson && (
                        <div style={pageStyles.lessonDetailContainer}>
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                onClick={handleBackToLessonList}
                                style={{ marginBottom: '20px', fontSize: '16px', padding: '0', color: '#595959', fontWeight: 500 }}
                            >
                                Quay lại danh sách
                            </Button>

                            {loadingLessonContent ? (
                                <div style={{ textAlign: 'center', padding: '50px' }}>
                                    <Spin size="large" tip="Đang tải bài học..." />
                                </div>
                            ) : (
                                <Card bordered={false} style={pageStyles.lessonContentCard}>
                                    <Title level={2} style={{ marginBottom: '12px', color: '#1f1f1f' }}>{selectedLesson.title}</Title>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', color: '#595959' }}>
                                        <Text>Điểm: <Text strong style={{fontSize: '1.1em'}}>{lessonScore}</Text>/{lessonExercises.length > 0 ? lessonExercises.length : 'N/A'}</Text>
                                        {selectedLesson.reward !== undefined && (
                                            <Tag icon={<TrophyOutlined />} color="gold" style={{fontSize: '1em', padding: '4px 8px'}}>
                                                {selectedLesson.reward} XP
                                            </Tag>
                                        )}
                                    </div>

                                    <Progress
                                        percent={calculateProgressPercentage()}
                                        status={
                                            isLessonCompletedByServer || (allExercisesAttempted() && lessonScore === lessonExercises.length && lessonExercises.length > 0)
                                                ? "success"
                                                : (allExercisesAttempted() && lessonExercises.length > 0 && lessonScore < lessonExercises.length)
                                                    ? "exception"
                                                    : "active"
                                        }
                                        strokeColor={{ from: '#108ee9', to: '#87d068' }} // Gradient cho progress
                                        style={{ marginBottom: '32px' }}
                                        format={() => lessonExercises.length > 0 ? `${Object.keys(userAnswers).filter(id => userAnswers[id]?.isCorrect !== undefined).length}/${lessonExercises.length} đã thử` : "Không có bài tập"}
                                    />

                                    {lessonExercises && lessonExercises.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            {lessonExercises.map((exercise) => (
                                                <ExerciseCard
                                                    key={exercise._id}
                                                    exercise={exercise}
                                                    onSubmit={(answer) => handleExerciseSubmit(exercise._id, answer)}
                                                    isCompleted={userAnswers[exercise._id]?.isCorrect !== undefined || isLessonCompletedByServer}
                                                    userAnswer={userAnswers[exercise._id]?.userAnswer}
                                                    isCorrect={userAnswers[exercise._id]?.isCorrect}
                                                    feedback={userAnswers[exercise._id]?.feedback}
                                                    correctAnswer={exercise.correctAnswer}
                                                    isSubmitting={userAnswers[exercise._id]?.isSubmitting}
                                                />
                                            ))}

                                            {(allExercisesAttempted() && !isLessonCompletedByServer && lessonExercises.length > 0) && (
                                                <Result
                                                    status={lessonScore === lessonExercises.length ? "success" : "warning"}
                                                    title={lessonScore === lessonExercises.length ? "Xuất sắc! Tất cả đều đúng!" : `Bạn đã thử tất cả bài tập.`}
                                                    subTitle={lessonScore === lessonExercises.length ?
                                                        "Nhấn nút để hoàn thành bài học và nhận thưởng." :
                                                        `Điểm của bạn: ${lessonScore}/${lessonExercises.length}. Hoàn thành bài học để lưu tiến độ?`}
                                                    extra={[
                                                        <Button
                                                            type="primary"
                                                            size="large"
                                                            key="complete"
                                                            icon={<CheckCircleFilled />}
                                                            onClick={handleLessonCompletion}
                                                            loading={refreshingCourse}
                                                            disabled={refreshingCourse}
                                                            style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.045)' }}
                                                        >
                                                            {lessonScore === lessonExercises.length ?
                                                                "Hoàn thành & Nhận thưởng" :
                                                                "Hoàn thành với điểm này"}
                                                        </Button>,
                                                    ]}
                                                    style={{ marginTop: '30px', padding: '32px', backgroundColor: '#fafafa', borderRadius: '8px' }}
                                                />
                                            )}

                                            {isLessonCompletedByServer && (
                                                <Result
                                                    status="success"
                                                    icon={<TrophyOutlined style={{color: '#faad14'}} />}
                                                    title={`Đã hoàn thành: "${selectedLesson.title}"!`}
                                                    subTitle={`Điểm số: ${lessonScore}/${lessonExercises.length}. ${selectedLesson.reward ? `Bạn nhận được ${selectedLesson.reward} XP.` : ''}`}
                                                    extra={[
                                                        <Button
                                                            type="default"
                                                            size="large"
                                                            key="back"
                                                            onClick={handleBackToLessonList}
                                                            style={{ marginRight: '12px' }}
                                                        >
                                                            Quay lại danh sách
                                                        </Button>,
                                                        unlockedNextLessonInfo?.lesson ? (
                                                            <Button
                                                                type="primary"
                                                                size="large"
                                                                key="next"
                                                                onClick={handleGoToNextLesson}
                                                                style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.045)' }}
                                                            >
                                                                Tiếp tục: {unlockedNextLessonInfo.lesson.title}
                                                                {/* Sửa lỗi currentCourseData và logic hiển thị tên skill */}
                                                                {unlockedNextLessonInfo.lesson.skillID !== selectedLesson?.skillID && ` (trong ${unlockedNextLessonInfo.skillTitle})`}
                                                            </Button>
                                                        ) : (
                                                            <Text style={{display: 'block', marginTop: '16px', fontSize: '1em'}}>
                                                                {(skills.length > 0 && selectedLesson && findNextUnlockableLesson() === null) ? "Chúc mừng! Bạn đã hoàn thành tất cả bài học có sẵn trong khóa này!" : "Hiện chưa có bài học nào được mở khóa tiếp theo."}
                                                            </Text>
                                                        )
                                                    ]}
                                                    style={{ marginTop: '30px', padding: '32px', backgroundColor: '#fafafa', borderRadius: '8px' }}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <Empty 
                                            description={<Text style={{fontSize: 16}}>Bài học này chưa có bài tập.</Text>} 
                                            style={{ padding: '40px 0' }} 
                                        />
                                    )}
                                </Card>
                            )}
                        </div>
                    )
                )}
            </main>

            {(viewMode === 'desktop' || viewMode === 'tablet') && !isLessonView && (
                <Rightbar key={rightbarKey} isCompact={viewMode === 'tablet'} userInfo={userInfoForRightbar} />
            )}
        </div>
    );
}

export default Home;