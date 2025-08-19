import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Pronounce from "../components/pronounce";
import apiCommon from "../apis/functionApi";

const PronouncePage = () => {
  const [pronounceData, setPronounceData] = useState({ vowels: [], consonants: [] });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiCommon.getPronounce();
        const items = Array.isArray(res.data?.data) ? res.data.data : [];
        const vowels = items.filter((item) => item.type === "vowel");
        const consonants = items.filter((item) => item.type === "consonant");
        setPronounceData({ vowels, consonants });
      } catch (error) {
        console.error("Error fetching pronounce data:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ 
        marginLeft: '240px', 
        padding: '20px', 
        width: 'calc(100% - 240px)'
      }}>
        <div style={{ 
          marginBottom: '30px',
          marginLeft: 'calc(50% - 530px)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            textAlign: 'left'
          }}>
            Cùng học phát âm tiếng Anh nào!
          </h2>
          <p style={{ 
            color: '#666',
            textAlign: 'left'
          }}>
            Tập nghe và học phát âm các âm trong tiếng Anh
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            marginBottom: '15px',
            textAlign: 'left',
            marginLeft: 'calc(50% - 400px)'
          }}>
            Nguyên âm
          </h3>
          <Pronounce data={pronounceData.vowels} />
        </div>
        <div>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            marginBottom: '15px',
            textAlign: 'left',
            marginLeft: 'calc(50% - 400px)'
          }}>
            Phụ âm
          </h3>
          <Pronounce data={pronounceData.consonants} />
        </div>
      </div>
    </div>
  );
};

export default PronouncePage; 