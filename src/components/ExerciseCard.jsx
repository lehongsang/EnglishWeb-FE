import React, { useState } from 'react';
import { Card, Radio, Input, Button, Space, Typography, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, AudioOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const ExerciseCard = ({ 
  exercise, 
  onSubmit, 
  isCompleted, 
  isCorrect, 
  userAnswer, 
  correctAnswer,
  isSubmitting 
}) => {
  const [answer, setAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    console.log('--- [EXERCISE_CARD] handleSubmit ---');
    console.log('Exercise ID:', exercise._id);
    console.log('Answer FROM STATE being submitted:', `'${answer}'`);
    onSubmit(answer);
    setShowFeedback(true);
  };

  const handleOptionSelect = (value) => {
    setAnswer(value);
    if (!isCompleted) {
      console.log('--- [EXERCISE_CARD] handleOptionSelect ---');
      console.log('Exercise ID:', exercise._id);
      console.log('Value (answer) FROM OPTION being submitted:', `'${value}'`);
      onSubmit(value);
      setShowFeedback(true);
    }
  };

  const playAudio = () => {
    if (exercise.audioUrl) {
      const audio = new Audio(exercise.audioUrl);
      audio.play();
    }
  };

  const renderQuestion = () => {
    return (
      <div style={{ marginBottom: '16px' }}>
        <Title level={5} style={{ marginBottom: '8px' }}>
          {exercise.type === 'listen' && exercise.audioUrl ? (
            <Button
              icon={<AudioOutlined />}
              onClick={playAudio}
              style={{ marginRight: 8 }}
              disabled={isCompleted}
            >
              Nghe
            </Button>
          ) : null}
          {exercise.question}
        </Title>
        {(exercise.type === 'multiple-choice' || exercise.type === 'listen') && (
          <Radio.Group 
            onChange={(e) => handleOptionSelect(e.target.value)}
            value={isCompleted ? userAnswer : answer}
            disabled={isCompleted}
          >
            <Space direction="vertical">
              {exercise.options.map((option, index) => (
                <Radio 
                  key={index} 
                  value={option}
                  style={{ 
                    padding: '8px',
                    borderRadius: '4px',
                    backgroundColor: isCompleted && option === userAnswer 
                      ? (isCorrect ? '#f6ffed' : '#fff2f0')
                      : 'transparent',
                    border: isCompleted && option === userAnswer
                      ? `1px solid ${isCorrect ? '#b7eb8f' : '#ffccc7'}`
                      : '1px solid #d9d9d9'
                  }}
                >
                  {option}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        )}
        {exercise.type === 'translate' && (
          <Input
            value={isCompleted ? userAnswer : answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            disabled={isCompleted}
            style={{ marginBottom: '16px' }}
          />
        )}
      </div>
    );
  };

  const renderFeedback = () => {
    if (!isCompleted) return null;

    if (isSubmitting) {
      return (
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #d9d9d9'
        }}>
          <div style={{ textAlign: 'center' }}>Đang kiểm tra...</div>
        </div>
      );
    }

    const showAsCorrect = isCorrect;
    return (
      <div style={{ 
        marginTop: '16px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: showAsCorrect ? '#f6ffed' : '#fff2f0',
        border: `1px solid ${showAsCorrect ? '#b7eb8f' : '#ffccc7'}`
      }}>
        {isSubmitting ? (
          <div style={{ textAlign: 'center' }}>Đang kiểm tra...</div>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {showAsCorrect ? (
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
              )}
              <Text strong style={{ color: showAsCorrect ? '#52c41a' : '#ff4d4f' }}>
                {showAsCorrect ? 'Correct!' : 'Incorrect'}
              </Text>
            </div>
            {!showAsCorrect && (
              <div>
                <Text type="secondary">Correct answer: </Text>
                <Tag color="success">{correctAnswer}</Tag>
              </div>
            )}
          </Space>
        )}
      </div>
    );
  };

  return (
    <Card
      style={{
        marginBottom: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      {renderQuestion()}
      {!isCompleted && exercise.type === 'translate' && (
        <Button 
          type="primary" 
          onClick={handleSubmit}
          disabled={!answer.trim()}
        >
          Submit Answer
        </Button>
      )}
      {renderFeedback()}
    </Card>
  );
};

export default ExerciseCard;