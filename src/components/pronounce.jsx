import React, { useState } from "react";
import "./pronounce.css";

const Pronounce = ({ data }) => {
    const [selectedItem, setSelectedItem] = useState(null);

    const handleCardClick = (item) => {
        setSelectedItem(item);
        // Play IPA audio first
        if (item.IPA_AudioUrl) {
            const ipaAudio = new Audio(item.IPA_AudioUrl);
            ipaAudio.play();
            // Play example word audio after IPA audio finishes
            ipaAudio.onended = () => {
                if (item.exampleWord?.audioUrl) {
                    new Audio(item.exampleWord.audioUrl).play();
                }
            };
        }
    };

    const renderCards = () => {
        const rows = [];
        for (let i = 0; i < data.length; i += 3) {
            rows.push(data.slice(i, i + 3));
        }

        return (
            <div className="pronounce-grid">
                {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="pronounce-row">
                        {row.map((item, idx) => (
                            <div
                                key={idx}
                                className={`pronounce-card ${selectedItem?._id === item._id ? 'selected' : ''}`}
                                onClick={() => handleCardClick(item)}
                            >
                                <div className="pronounce-symbol">{item.symbol}</div>
                                <div className="pronounce-word">{item.exampleWord?.word}</div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="pronounce-component">
            {renderCards()}
            {selectedItem && (
                <div className="pronounce-details">
                    <h2>Chi tiết phát âm</h2>
                    <p>
                        <strong>Ký hiệu:</strong> {selectedItem.symbol}
                    </p>
                    <p>
                        <strong>Loại:</strong> {selectedItem.type}
                    </p>
                    <p>
                        <strong>Từ ví dụ:</strong> {selectedItem.exampleWord?.word}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Pronounce;