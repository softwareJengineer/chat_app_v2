const calcAvgBiomarkerScores = (biomarkerData) => {
    var avg = {
        "Pragmatic": 0,
        "Grammar": 0,
        "Prosody": 0,
        "Pronunciation": 0,
        "Anomia": 0,
        "Turn Taking": 0
    };
    for (var i = 0; i < biomarkerData.length; i++) {
        var name = biomarkerData[i].name;
        var scores = biomarkerData[i].data;
        if (scores.length > 0) {
            var score = scores.reduce((prev, current) => prev + current) / scores.length;
            avg[name] = score;                    
        } else {
            avg[name] = 0;
        }
    }
    return avg;
}

export default calcAvgBiomarkerScores;