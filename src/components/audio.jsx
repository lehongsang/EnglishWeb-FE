import React from "react";
import { SoundOutlined } from "@ant-design/icons";

const AudioButton = ({ text, lang = "en-US" }) => {
  const speakText = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      speechSynthesis.speak(utterance);
    } else {
      alert("Browser not supported!");
    }
  };

  return (
    <button onClick={speakText} style={{ border: "none", background: "none", cursor: "pointer" }}>
      <SoundOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
    </button>
  );
};

export default AudioButton;
