const compareScores = (chatData, prevChatData) => {
    console.log(chatData, prevChatData)
    var compared = {
        improved: [],
        declined: [],
        steady: []
    }
    const avg = chatData.avg_scores;
    const prevAvg = prevChatData.avg_scores;
    for (const score in avg) {
        if (avg[score] > prevAvg[score]) {
            compared.improved.push(score);
        } else if (avg[score] < prevAvg[score]) {
            compared.declined.push(score);
        } else {
            compared.steady.push(score);
        }
    }
    return compared;
}

export default compareScores;