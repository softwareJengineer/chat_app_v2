import React from "react";
import ReactWordcloud from 'react-wordcloud';
import dummyChats from "../data/dummyChats.json";

function WordCloud({messages}) {
    const chats = dummyChats;
    const chatData = chats[0];

    const tokenize = () => {
        // Initialize an empty object to store word frequencies
        const wordFrequency = {};

        // Iterate over each message in the data array
        messages.forEach(item => {
            // Split the message into words, remove punctuation, and convert to lowercase
            if (item.sender === "You") {
                const words = item.message.replace(/[^\w\s]/g, '').toLowerCase().split(/\s+/);

                // Count the frequency of each word
                words.forEach(word => {
                    if (word.length > 3) {
                        if (wordFrequency[word]) {
                            wordFrequency[word]++;
                        } else {
                            wordFrequency[word] = 1;
                        }
                    }
                });
            }
        });

        // Convert the wordFrequency object into an array of objects with 'text' and 'value' properties
        const result = Object.keys(wordFrequency).map(word => ({
            text: word,
            value: wordFrequency[word]
        }));

        return result;
    }

    const words = tokenize();
    const options = {
        enableTooltip: false,
        fontSizes: [20, 60],
        transitionDuration: 500,
        rotationAngles: [-30, 30],
        rotations: 5
    };

    return (
        <div className="w-full md:h-[30vh] h-[40vh]">
            {messages.length > 0 ? 
            <ReactWordcloud words={words} maxWords={30} options={options}/> : 
            <p className="text-5xl">Not available</p>
            }
        </div>
    )
}

export default WordCloud;