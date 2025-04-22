const login = async (loginData) => {
    try {
        const response = await fetch('http://localhost:8000/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            const user = {
                role: data.role,
                plwdUsername: data.plwdUsername,
                plwdFirstName: data.plwdFirstName,
                plwdLastName: data.plwdLastName,
                caregiverUsername: data.caregiverUsername,
                caregiverFirstName: data.caregiverFirstName,
                caregiverLastName: data.caregiverLastName,
            };
            const settingsJson = JSON.parse(data.settings);
            const settings = {
                patientViewOverall: settingsJson.patientViewOverall,
                patientCanSchedule: settingsJson.patientCanSchedule
            };
            return { user, settings }; 
        } else {
            alert(data.error);
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

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

const getReminders = async (user) => {
    try {
        const username = user.role == 'Caregiver' ? user.caregiverUsername : user.plwdUsername;
        const response = await fetch(`http://localhost:8000/api/reminders/${username}/`, {
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

const createReminder = async (user, title, start, end, rrule, duration) => {
    try {
        const username = user.role == 'Caregiver' ? user.caregiverUsername : user.plwdUsername;
        const response = await fetch(`http://localhost:8000/api/reminders/${username}/`, {
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

const editSettings = async (user, settings) => {
    try {
        const username = user.role == 'Caregiver' ? user.caregiverUsername : user.plwdUsername;
        const response = await fetch(`http://localhost:8000/api/settings/${username}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...settings, user: user })
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

const createChat = async (user, chatData) => {
    try {
        const username = user.role == 'Caregiver' ? user.caregiverUsername : user.plwdUsername;
        const response = await fetch(`http://localhost:8000/api/chats/${username}/`, {
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

const getChats = async (user) => {
    try {
        const username = user.role == 'Caregiver' ? user.caregiverUsername : user.plwdUsername;
        const response = await fetch(`http://localhost:8000/api/chats/${username}/`, {
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


const getChat = async (user, chatID) => {
    try {
        const username = user.role == 'Caregiver' ? user.caregiverUsername : user.plwdUsername;
        const response = await fetch(`http://localhost:8000/api/chat/${username}/chatid/${chatID}`, {
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


export {login, logout, signup, getReminders, createReminder, editSettings, createChat, getChats, getChat};