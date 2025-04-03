import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

function ScoreTrackGraph({chats}) {
    const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight
	});
    useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight
			});
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

    const chatsReversed = chats.slice().reverse();

    function getScores(chatData) {
        var scores = [];
        for (var i = 0; i < chatData.length; i++) {
            var avgScores = Object.values(chatData[i].avgScores);
            var score = avgScores.reduce((a, b) => a + b, 0) / avgScores.length;
            scores.push({date: chatData[i].date, score: score});
        }
        return scores;
    }
    

    return (
        <BarChart width={windowSize.width * .95} height={windowSize.height / 3} data={getScores(chatsReversed)}>
            <XAxis dataKey="date" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <Bar dataKey="score" barSize={30} fill="#8884d8"/>
        </BarChart>
    );
}

export default ScoreTrackGraph;