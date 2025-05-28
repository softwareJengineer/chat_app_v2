const getExercises = () => {
    const exercises = [
        "Play a word game with me!",
        "Go outside and enjoy some greenery.", 
        "Read a book.",
        "Look at pictures of loved ones.",
        "Go for a walk!",
        "Play a memory game.",
        "Play a card game.",
        "Play board game.",
        "Drink some water!",
        "Do some writing."
    ]
    const numExercises = Math.floor(Math.random() * 4) + 3;
    var recommended = [];
    for (var i = 0; i < numExercises; i++) {
        var idx = Math.floor(Math.random() * exercises.length);
        var exercise = exercises[idx];
        recommended.push(exercise);
        exercises.splice(idx, 1);
    }
    return recommended;
};

export default getExercises;;