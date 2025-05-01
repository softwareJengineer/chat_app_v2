const logout = async () => {
    try {
        const response = await fetch('http://localhost:8000/api/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert("Log out successful.");
        } else {
            console.error("Log out failed: " + data.error);
        }
    } catch (error) {
        alert(error);
    }
}

const signup = async (signupData) => {
    try {
        const response = await fetch('http://localhost:8000/api/signup/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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

const getReminders = async () => {
    try {
        const response = await fetch(`http://localhost:8000/api/reminders/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            const reminders = data.reminders;
            return reminders.map(reminder => {
                let obj = JSON.parse(reminder);
                obj.start = new Date(obj.start);
                obj.end = new Date(obj.end);
                if (obj.rrule) {
                    obj.rrule = JSON.parse(obj.rrule);
                    obj.rrule.dtstart = new Date(obj.rrule.dtstart);
                }
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

const createReminder = async (title, start, end, rrule, duration) => {
    try {
        const response = await fetch(`http://localhost:8000/api/reminders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                start: start,
                end: end,
                rrule: rrule,
                duration: duration,
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

const editSettings = async (settings) => {
    try {
        const response = await fetch(`http://localhost:8000/api/settings/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
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

const createChat = async (chatData) => {
    try {
        const response = await fetch(`http://localhost:8000/api/chats/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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

const getChats = async () => {
    try {
        const response = await fetch(`http://localhost:8000/api/chats/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            const chats = data.chats;
            return chats.map(chat => {
                let obj = JSON.parse(chat);
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


const getChat = async (chatID) => {
    try {
        const response = await fetch(`http://localhost:8000/api/chat/chatid/${chatID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            let chat = JSON.parse(data.chat);
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
};

const getChatCount = async () => {
    try {
        const response = await fetch(`http://localhost:8000/api/chatcount/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            return data.chat_count;
        } else {
            console.error("Could not fetch chat: " + data.error);
            return 0;
        }
    } catch (error) {
        alert(error);
        return 0;
    }
};


export {logout, signup, getReminders, createReminder, editSettings, createChat, getChats, getChat, getChatCount};