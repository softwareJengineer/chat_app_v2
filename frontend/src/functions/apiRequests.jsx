const signup = async (signupData) => {
    try {
        const response = await fetch('http://localhost:8000/api/signup/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            return true;
        } else {
            alert(data.error);
            return false;
        }
    } catch (error) {
        console.error('Signup error:', error);
        return false;
    }
}

const getReminders = async (authTokens) => {
    try {
        const response = await fetch(`http://localhost:8000/api/reminders/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        });

        const data = await response.json();

        if (data.success) {
            const reminders = data.reminders;
            return reminders.map(reminder => {
                let obj = reminder;
                if (obj.start) obj.start = new Date(obj.start);
                if (obj.end) obj.end = new Date(obj.end);
                return obj;
            });
        } else {
            console.error("Could not fetch reminders: " + data.error);
            return [];
        }
    } catch (error) {
        console.error("Could not fetch reminders: " + error);
        return [];
    }
}

const createReminder = async (title, start, end, authTokens) => {
    try {
        const response = await fetch(`http://localhost:8000/api/reminders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            },
            body: JSON.stringify({
                title: title,
                start: start,
                end: end,
            })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error with creating reminder:', error);
        return false;
    }
};

const createRepeatReminder = async (title, startTime, endTime, daysOfWeek, authTokens) => {
    try {
        const response = await fetch(`http://localhost:8000/api/reminders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            },
            body: JSON.stringify({
                title: title,
                startTime: startTime,
                endTime: endTime,
                daysOfWeek: daysOfWeek
            })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error with creating reminder:', error);
        return false;
    }
};

const editSettings = async (settings, authTokens) => {
    try {
        const response = await fetch(`http://localhost:8000/api/settings/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            },
            body: JSON.stringify({ ...settings })
        });

        const data = await response.json();

        if (data.success) {
            alert("Settings successfully set.");
            return true;
        } else {
            alert(data.error);
            return false;
        }
    } catch (error) {
        console.error('Error setting user settings:', error);
        return false;
    }
};

const createChat = async (chatData, authTokens) => {
    try {
        const response = await fetch(`http://localhost:8000/api/chats/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            },
            body: JSON.stringify(chatData)
        });

        const data = await response.json();

        if (data.success) {
            return true;
        } else {
            alert(data.error);
            return false;
        }
    } catch (error) {
        console.error('Error saving chat data:', error);
        return false;
    }
};

const getChats = async (authTokens) => {
    try {
        const response = await fetch(`http://localhost:8000/api/chats/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        });

        const data = await response.json();

        if (data.success) {
            const chats = data.chats;
            return chats.map(chat => {
                let obj = chat;
                obj.date = new Date(obj.date);
                return obj;
            });
        } else {
            console.error("Could not fetch chats: " + data.error);
            return false;
        }
    } catch (error) {
        alert(error);
        return false;
    }
};

const getRecentChat = async (authTokens) => {
    try {
        const response = await fetch(`http://localhost:8000/api/chat/recent`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        });

        const data = await response.json();

        if (data.success) {
            let chat = data.chat;
            chat.date = new Date(chat.date);
            return chat;
        } else {
            console.error("Could not fetch chat: " + data.error);
            return false;
        }
    } catch (error) {
        alert(error);
        return false;
    }
}

const getGoal = async (authTokens) => {
    try {
        const response = await fetch(`http://localhost:8000/api/goal/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        });

        const data = await response.json();

        if (data.success) {
            let goal = data.goal
            return goal;
        } else {
            console.error("Could not fetch goal: " + data.error);
            return false;
        }
    } catch (error) {
        alert(error);
        return false;
    }
}

const updateGoal = async (startDay, target, authTokens) => {
    try {
        const response = await fetch(`http://localhost:8000/api/goal/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            },
            body: JSON.stringify({ startDay: startDay, target: target })
        });

        const data = await response.json();

        if (data.success) {
            alert("Goal successfully set.");
            return true;
        } else {
            alert(data.error);
            return false;
        }
    } catch (error) {
        console.error('Error setting goal:', error);
        return false;
    }
}

export {signup, getReminders, createReminder, createRepeatReminder, editSettings, createChat, getChats, getRecentChat, getGoal, updateGoal};