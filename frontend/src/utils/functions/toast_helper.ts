import toast from "react-hot-toast";  


export function toastMessage (text: string, success: boolean) {
    if (success) { console.info(text); toast.success(text); }
    else         { console.warn(text); toast.error  (text); }
};



