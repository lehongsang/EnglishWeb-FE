import React from 'react';
import { Typography } from 'antd';
import LessonCard from './LessonCard';

const { Title } = Typography;

const SkillSection = ({ skill, onLessonClick }) => {
  if (!skill || !skill.lessons) {
    return null;
  }

  return (
    <div style={{
      marginBottom: '28px',
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    }}>
      <Title level={3} style={{ marginBottom: '20px', color: '#1f1f1f', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
        {skill.iconUrl && <img src={skill.iconUrl} alt="" style={{width: '28px', marginRight: '10px', verticalAlign: 'middle'}} /> /* Nếu có icon */}
        {skill.title}
      </Title>
      {skill.description && <Typography.Paragraph type="secondary" style={{marginBottom: '16px'}}>{skill.description}</Typography.Paragraph> /* Nếu có mô tả skill */}
      {skill.lessons.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {skill.lessons.map(lesson => (
            <LessonCard
              key={lesson._id}
              lesson={lesson} 
              onLessonClick={() => onLessonClick(lesson)}
            />
          ))}
        </div>
      ) : (
        <Typography.Text type="secondary">Kỹ năng này hiện chưa có bài học.</Typography.Text>
      )}
    </div>
  );
};

export default SkillSection;