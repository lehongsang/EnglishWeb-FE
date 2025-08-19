import React from 'react';
import { Card, Typography, Tag } from 'antd';
import { BookOutlined, CheckCircleTwoTone, TrophyOutlined, LockFilled, UnlockFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

const LessonCard = ({ lesson, onLessonClick }) => {
  const title = lesson.title || 'Bài học không tên';
  const description = lesson.description; 
  const reward = lesson.reward;
  const isUnlocked = lesson.isUnlock === true;
  const isCompleted = lesson.isCompleted === true; // SỬA: Đổi từ userHasCompletedThisLesson sang isCompleted
  
  // Debug log
  console.log(`[LessonCard] ${title}: isUnlocked=${isUnlocked}, isCompleted=${isCompleted}`);

  const canInteract = isUnlocked;

  return (
    <Card
      hoverable={canInteract && !isCompleted} 
      onClick={() => canInteract && onLessonClick(lesson)} 
      style={{
        marginBottom: '16px',
        borderRadius: '12px',
        border: !isUnlocked ? '2px solid  #d9d9d9' : (isCompleted ? '2px solid #52c41a' : '1px solid #1890ff'),
        cursor: !isUnlocked ? 'not-allowed' : (isCompleted ? 'default' : 'pointer'),
        opacity: !isUnlocked ? 0.5 : 1, 
        backgroundColor: !isUnlocked ? '#f5f5f5' : '#ffffff',
        transition: 'all 0.3s ease',
        minHeight: '150px',
        display: 'flex',
        flexDirection: 'column'
      }}
      styles={{ 
        body: {
            padding: '20px',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }
      }}
    >
      <div>
        <Title
          level={5}
          style={{
            marginBottom: '20px',
            color: !isUnlocked ? '#bfbfbf' : '#3c3c3c',
            textDecoration: 'none',
            fontSize: '22px',
          }}
          ellipsis={{ rows: 2 }}
        >
          <BookOutlined style={{ marginRight: '8px', color: !isUnlocked ? '#bfbfbf' : '#1890ff' }} />
          {title}
        </Title>
        {description && ( 
          <Text 
            type={isUnlocked ? "secondary" : undefined}
            style={{ 
              fontSize: '14px', 
              marginBottom: '12px',
              color: !isUnlocked ? '#d9d9d9' : undefined
            }}
            ellipsis={{ rows: 3 }}
          >
            {description}
          </Text>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        {isUnlocked && reward !== undefined && ( 
          <Tag icon={<TrophyOutlined />} color="gold">
            {reward} XP
          </Tag>
        )}
        
        {!isUnlocked ? (
          <Tag icon={<LockFilled />} color="default" style={{ marginLeft: reward === undefined ? 'auto' : '0' }}> 
            Bị khóa
          </Tag>
        ) : isCompleted ? (
          <Tag icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} color="success" style={{ marginLeft: reward === undefined ? 'auto' : '0' }}>
            Đã hoàn thành
          </Tag>
        ) : (
          <Tag icon={<UnlockFilled />} color="processing" style={{ marginLeft: reward === undefined ? 'auto' : '0' }}>
            Mở khóa
          </Tag>
        )}
      </div>
    </Card>
  );
};

export default LessonCard;