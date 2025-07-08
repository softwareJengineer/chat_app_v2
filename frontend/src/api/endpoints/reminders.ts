import { request  } from "../client";
import { Reminder } from "../models";

// GET, PUT, & DELETE
export const listReminders  = () => request<Reminder[]>("/reminders/");
export const updateReminder = (body: Partial<Reminder>) => request<Reminder>("/reminders/", { method: "PUT", body: JSON.stringify(body) });
// ToDo: Delete method
