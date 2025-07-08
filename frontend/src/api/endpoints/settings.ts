import { request      } from "../client";
import { UserSettings } from "../models";

// GET & PUT
export const    getUserSettings = ()                            => request<UserSettings>("/settings/");
export const updateUserSettings = (body: Partial<UserSettings>) => request<UserSettings>("/settings/", { method: "PUT", body: JSON.stringify(body) });
