import { request } from "../client";
import { Goal    } from "../models";

// GET & PUT
export const    getGoal = ()                    => request<Goal>("/goal/");
export const updateGoal = (body: Partial<Goal>) => request<Goal>("/goal/", { method: "PUT", body: JSON.stringify(body) });
