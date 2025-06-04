// --- there should probably be a subdirectory for API requests, and each endpoint in its own file with these helpers also in a separate file that gets imported

// ==================================================================== ==================================
// API Request Helpers 
// ==================================================================== ==================================

// Make a request to the API
// "auth" and "body" are only included as parts of the fetch call if provided in the function call.
const makeApiRequest = async ({endpoint, method, data=null, authTokens=null}) => {
    try {
        // Make a request to the API
        const response = await fetch(`/api/${endpoint}/`, {
            method  : method,
            headers : {
                "Content-Type": "application/json",
                ...(authTokens != null && {"Authorization": `Bearer ${String(authTokens.access)}`})
            },
            ...(method !== null && {body: JSON.stringify(data),})
        });

        // Wait for a response from the API & return it
        const responseData = await response.json(); return responseData;
    } 

    // Catch errors
    catch (error) {console.error(`/api/${endpoint} ${method} error:`, error); return false;}
}

// Re-use logic for functions that return a bool on success or failure
// (Could add a way to make the alert on success an optional too somehow...)
const processBoolResponse = (data, errorMessage="An unknown error occured") => {
    if (data?.success) {return true;}
    else {
        const error =  data?.error ?? "An unknown error occured";
        console.error(errorMessage, error);
        alert(error); 
        return false;
    }
}

// ==================================================================== ==================================
// All API Request Functions
// ==================================================================== ==================================

// --------------------------------------------------------------------
// "signup" endpoint
// --------------------------------------------------------------------

// [POST] Sign Up
const signup = async (signupData) => {
    const data = makeApiRequest({endpoint: "signup", method: "POST", data: signupData, authTokens: null});
    return processBoolResponse(data, "Signup error:");
}

// --------------------------------------------------------------------
// "reminders" endpoint
// --------------------------------------------------------------------

// [GET] Get Reminders
const getReminders = async (authTokens) => {
    const data = makeApiRequest({endpoint: "reminders", method: "GET", data: null, authTokens: authTokens});
    try {
        if (data?.success) {
            return data.reminders.map(reminder => ({...reminder,
                start: reminder.start ? new Date(reminder.start) : undefined,
                end:   reminder.end   ? new Date(reminder.end  ) : undefined,
            }));
        } 
        else        {console.error("Could not fetch reminders: " + data.error); return [];}
    } catch (error) {console.error("Could not fetch reminders: " +      error); return [];}
}

// [POST] Create Reminder
const createReminder = async (title, start, end, authTokens) => {
    const data = makeApiRequest({
        endpoint   : "reminders", 
        method     : "POST", 
        data       : {title: title, start: start, end: end}, 
        authTokens : authTokens
    });
    return processBoolResponse(data, "Error with creating reminder:");
};

// [POST] Create Repeat Reminder
const createRepeatReminder = async (title, startTime, endTime, daysOfWeek, authTokens) => {
    const data = makeApiRequest({
        endpoint   : "reminders", 
        method     : "POST", 
        data       : {title: title, startTime: startTime, endTime: endTime, daysOfWeek: daysOfWeek}, 
        authTokens : authTokens
    });
    return processBoolResponse(data, "Error with creating repeating reminder:");
};

// [DELETE] Delete Reminder
const deleteReminder = async (reminderId, authTokens) => {
    const data = makeApiRequest({
        endpoint   : "reminders", 
        method     : "DELETE", 
        data       : {id: reminderId}, 
        authTokens : authTokens
    });
    return processBoolResponse(data, "Error with deleting reminder:");
}

// --------------------------------------------------------------------
// "settings" endpoint
// --------------------------------------------------------------------

// [PUT] Edit Settings
const editSettings = async (settings, authTokens) => {
    const data = makeApiRequest({
        endpoint   : "settings", 
        method     : "PUT", 
        data       : { ...settings }, 
        authTokens : authTokens
    });
    return processBoolResponse(data, "Error setting user settings:");
}

// --------------------------------------------------------------------
// "chats" endpoint
// --------------------------------------------------------------------

// [POST] Create a Chat
const createChat = async (chatData, authTokens) => {
    const data = makeApiRequest({
        endpoint   : "chats", 
        method     : "POST", 
        data       : chatData, 
        authTokens : authTokens
    });
    return processBoolResponse(data, "Error saving chat data:");
};

// [GET] Get Chats
const getChats = async (authTokens) => {
    const data = makeApiRequest({endpoint: "chats", method: "GET", data: null, authTokens: authTokens});
    try {
        if (data.success) {return data.chats.map(chat => ({...chat, date: chat.date ? new Date(chat.date) : undefined}));} 
        else        {console.error("Could not fetch chats: " + data.error); return false;}
    } catch (error) {console.error("Could not fetch chats: " +      error); return false;}
}

// [GET] Get the most recent chat
const getRecentChat = async (authTokens) => {
    const data = makeApiRequest({endpoint: "chats/recent", method: "GET", data: null, authTokens: authTokens});
    try {
        if (data.success) {return data.chats.map(chat => ({...chat, date: chat.date ? new Date(chat.date) : undefined}));}
        else        {console.error("Could not fetch recent chat: " + data.error); return false;}
    } catch (error) {console.error("Could not fetch recent chat: " +      error); return false;}
}

// --------------------------------------------------------------------
// "goal" endpoint
// --------------------------------------------------------------------

// [GET] Get Goal
const getGoal = async (authTokens) => {
    const data = makeApiRequest({endpoint: "goal", method: "GET", data: null, authTokens: authTokens});
    try {
        if (data.success) {return data.goal;} 
        else        {console.error("Could not fetch goal: " + data.error); return false;}
    } catch (error) {console.error("Could not fetch goal: " + data.error); return false;}
}

// [PUT] Update Goal
const updateGoal = async (startDay, target, authTokens) => {
    const data = makeApiRequest({
        endpoint   : "goal", 
        method     : "PUT", 
        data       : {startDay: startDay, target: target}, 
        authTokens : authTokens
    });
    return processBoolResponse(data, "Error setting goal:");
}

// Export
export {signup, getReminders, createReminder, createRepeatReminder, deleteReminder, editSettings, createChat, getChats, getRecentChat, getGoal, updateGoal};