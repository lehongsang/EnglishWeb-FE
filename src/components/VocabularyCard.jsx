import React from 'react';
import { Typography, List, Tag, Divider } from 'antd'; 
import AudioButton from './AudioButton'; 
import apiEndpoints from '../apis/endPoint'; 

const { Title, Text, Paragraph } = Typography;

const VocabularyCard = ({ vocabulary }) => {
  if (!vocabulary || !vocabulary.word) {
    return null; 
  }

  return (
    <div style={styles.vocabCard}>
      <div style={styles.header}>
        <Title level={4} style={styles.wordTitle}>
          {vocabulary.word}
          {/**
          {vocabulary.pronunciation && (
            <Text type="secondary" style={styles.pronunciation}> /{vocabulary.pronunciation}/</Text>
          )}
          **/}
        </Title>
      
        {vocabulary.audioUrl && ( 
             <AudioButton audioUrl={vocabulary.audioUrl} />
        )}
        {!vocabulary.audioUrl && vocabulary.word && ( 
             <AudioButton audioUrl={apiEndpoints.getVocabularyAudio(vocabulary.word)} />
        )}
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <div style={styles.section}>
        <Text strong style={styles.sectionTitle}>Nghĩa:</Text>
        <Paragraph style={styles.sectionContent}>{vocabulary.meaning || "..."}</Paragraph>
      </div>

      {vocabulary.examples && vocabulary.examples.length > 0 && (
        <div style={styles.section}>
          <Text strong style={styles.sectionTitle}>Ví dụ:</Text>
          <List
            size="small"
            dataSource={vocabulary.examples}
            renderItem={(example, index) => (
              <List.Item key={index} style={styles.exampleItem}>
                <Text style={styles.exampleText}>{typeof example === 'string' ? example : example.sentence}</Text>
              </List.Item>
            )}
          />
        </div>
      )}
       {vocabulary.partOfSpeech && (
            <Tag color="blue" style={{ marginTop: '8px' }}>{vocabulary.partOfSpeech}</Tag>
       )}
    </div>
  );
};

const styles = {
  vocabCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    border: '1px solid #f0f0f0',
    fontFamily: "'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center', 
  },
  wordTitle: {
    margin: 0,
    color: '#3c3c3c',
    fontWeight: 700,
  },
  pronunciation: {
    marginLeft: '8px',
    fontSize: '0.9em',
    color: '#777',
  },
  section: {
    marginTop: '12px',
  },
  sectionTitle: {
    fontSize: '15px',
    color: '#595959',
  },
  sectionContent: {
    fontSize: '15px',
    color: '#4b4b4b',
    marginTop: '4px',
    lineHeight: 1.6,
  },
  exampleItem: {
    padding: '4px 0',
    borderBottom: 'none !important', 
  },
  exampleText: {
    fontSize: '14px',
    color: '#595959',
    fontStyle: 'italic',
  }
};

export default VocabularyCard;