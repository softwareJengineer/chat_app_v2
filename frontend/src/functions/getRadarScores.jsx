const getRadarScores = (biomarkerData, prevBiomarkerData) => {
    var data = [];

    for (var i = 0; i < biomarkerData.length; i++) {
        var name = biomarkerData[i].name;
        var scores = biomarkerData[i].data;
        var score = scores.length > 0 ? scores.reduce((prev, current) => prev + current) / scores.length : 0
        if (prevBiomarkerData) {
            var prevScores = prevBiomarkerData[i].data;
            var prevScore = prevScores.length > 0 ? prevScores.reduce((prev, current) => prev + current) / prevScores.length : 0
            data.push({name: name, x: score, y: prevScore});
        } else {
            data.push({name: name, x: score});
        }
    }
    return data;
}

export default getRadarScores;