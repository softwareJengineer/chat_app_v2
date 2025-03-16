const daysInARow = (chats) => {
    var days = 1;
    for (var i = 0; i < chats.length - 1; i++) {
        if (chats[i].date == chats[i+1].date + 1) {
            days += 1;
        }
    }

    return days === 1 ? days + " day" : days + " days";
}

export default daysInARow;