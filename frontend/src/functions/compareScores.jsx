const compareScores = (chatData, prevChatData) => {
    var compared = {
        improved: [],
        declined: [],
        steady: []
    }
    if (!prevChatData) {
        return {
            improved: ["N/A"],
            declined: ["N/A"],
            steady: ["N/A"]
        }
    }
    const avg = chatData.avgScores;
    const prevAvg = prevChatData.avgScores;
    for (const score in avg) {
        if (avg[score] > prevAvg[score]) {
            compared.improved.push(score);
        } else if (avg[score] < prevAvg[score]) {
            compared.declined.push(score);
        } else {
            compared.steady.push(score);
        }
    }
    if (compared.improved.length == 0) {
        compared.improved = ["N/A"];
    }
    if (compared.declined.length == 0) {
        compared.declined = ["N/A"];
    }
    if (compared.steady.length == 0) {
        compared.steady = ["N/A"];
    }
    return compared;
}

export default compareScores;