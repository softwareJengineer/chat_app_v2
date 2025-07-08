import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Reminder, listReminders, updateReminder } from "@/api";
import { useModelQuery } from "@/hooks/queries/common";

// [GET] Hook to wrap useQuery for retrieving Reminder objects
export const useReminders = () =>
    useModelQuery<Reminder[]>({
        queryKey: "reminder",
        queryFn : listReminders,
        empty   : [],
    });

// [POST] Hook to wrap useQueryClient for updating Reminder objects

// [DELETE]
// ...

