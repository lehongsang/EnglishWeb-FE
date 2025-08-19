import React, { useRef, useState } from 'react';
import { Button } from 'antd';
import { SoundOutlined, LoadingOutlined } from '@ant-design/icons';

const AudioButton = ({ audioUrl }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const playAudio = () => {
        if (!audioUrl) return;
        if (audioRef.current) {
            audioRef.current.pause(); 
            audioRef.current.currentTime = 0;
        }

        const newAudio = new Audio(audioUrl);
        audioRef.current = newAudio;
        setIsLoading(true);
        setIsPlaying(true);

        newAudio.oncanplaythrough = () => {
            setIsLoading(false);
            newAudio.play().catch(error => {
                console.error("Error playing audio:", error);
                setIsPlaying(false);
                setIsLoading(false);
            });
        };
        newAudio.onended = () => {
            setIsPlaying(false);
        };
        newAudio.onerror = (e) => {
            console.error("Audio error:", e);
            setIsPlaying(false);
            setIsLoading(false);
        };
    };

    return (
        <Button
            type="text"
            icon={isLoading ? <LoadingOutlined /> : <SoundOutlined />}
            onClick={playAudio}
            disabled={isLoading || !audioUrl}
            aria-label="Play audio"
            style={{ color: isPlaying ? '#1890ff' : undefined }}
        />
    );
};

export default AudioButton;