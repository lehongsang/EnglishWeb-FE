import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import { Card, Typography, Row, Col, Avatar, Statistic, Progress, List, Tag, Spin, message } from "antd";
import { UserOutlined, TrophyOutlined, ClockCircleOutlined, BookOutlined } from '@ant-design/icons';
import { useAuth } from "../contexts/AuthContext";
import { getFirestore, doc, getDoc, getDocs, query, where, collection } from "firebase/firestore";
import app from "../firebase";

const { Title, Text } = Typography;

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    totalScore: 0,
    averageScore: 0,
    totalTime: 0
  });
  const { currentUser } = useAuth();
  const db = getFirestore(app);

  useEffect(() => {
    fetchUserData();
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Fetch user information from Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserInfo(userDoc.data());
      } else {
        message.error('Không tìm thấy thông tin người dùng');
      }

      // Fetch completed lessons
      const completedLessonsQuery = await getDocs(
        query(
          collection(db, 'completedLessons'),
          where('userId', '==', currentUser.uid)
        )
      );
      
      const lessons = completedLessonsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompletedLessons(lessons);

      // Calculate statistics
      calculateStats(lessons);
    } catch (error) {
      console.error('Error fetching user data:', error);
      message.error('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (lessons) => {
    const totalScore = lessons.reduce((sum, lesson) => sum + lesson.score, 0);
    const totalTime = lessons.reduce((sum, lesson) => {
      const minutes = parseInt(lesson.completionTime);
      return sum + (isNaN(minutes) ? 0 : minutes);
    }, 0);

    setStats({
      totalLessons: lessons.length,
      completedLessons: lessons.length,
      totalScore: totalScore,
      averageScore: lessons.length > 0 ? (totalScore / lessons.length).toFixed(1) : 0,
      totalTime: totalTime
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.content}>
        <Row gutter={[24, 24]}>
          {/* User Profile Section */}
          <Col xs={24} md={8}>
            <Card style={styles.profileCard}>
              <div style={styles.profileHeader}>
                <Avatar 
                  size={100} 
                  icon={<UserOutlined />} 
                  src={userInfo?.photoURL}
                  style={styles.avatar}
                />
                <Title level={3} style={styles.userName}>
                  {userInfo?.displayName || 'User Name'}
                </Title>
                <Text type="secondary">{userInfo?.email}</Text>
              </div>

              <div style={styles.statsSection}>
                <Statistic
                  title="Total Score"
                  value={stats.totalScore}
                  prefix={<TrophyOutlined />}
                />
                <Statistic
                  title="Completed Lessons"
                  value={stats.completedLessons}
                  prefix={<BookOutlined />}
                />
                <Statistic
                  title="Total Learning Time"
                  value={`${stats.totalTime} min`}
                  prefix={<ClockCircleOutlined />}
                />
              </div>
            </Card>
          </Col>

          {/* Completed Lessons Section */}
          <Col xs={24} md={16}>
            <Card style={styles.progressCard}>
              <Title level={4}>Bài học đã hoàn thành</Title>
              <List
                dataSource={completedLessons}
                renderItem={lesson => (
                  <List.Item>
                    <Card style={styles.lessonCard}>
                      <div style={styles.lessonInfo}>
                        <Title level={5}>{lesson.title}</Title>
                        <div style={styles.lessonStats}>
                          <Tag color="blue">Score: {lesson.score}</Tag>
                          <Tag color="green">Time: {lesson.completionTime}</Tag>
                          <Tag color="purple">
                            Completed: {new Date(lesson.completedAt.toDate()).toLocaleDateString()}
                          </Tag>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
  },
  content: {
    flex: 1,
    padding: "24px",
    marginLeft: "240px",
    backgroundColor: "#f5f7fa",
  },
  loadingContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "240px",
  },
  profileCard: {
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  profileHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "24px",
  },
  avatar: {
    backgroundColor: "#1890ff",
    marginBottom: "16px",
  },
  userName: {
    marginBottom: "8px",
  },
  statsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  progressCard: {
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  lessonCard: {
    width: "100%",
    marginBottom: "8px",
  },
  lessonInfo: {
    width: "100%",
  },
  lessonStats: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
    flexWrap: "wrap",
  },
};

export default Profile;
