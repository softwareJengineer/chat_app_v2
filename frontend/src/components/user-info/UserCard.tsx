import { useAuth } from "@/context/AuthProvider";
import { FaUser  } from "react-icons/fa";
import { User    } from "@/api";
import { PATIENT_HEX, CAREGIVER_HEX } from "@/utils/styling/colors";

interface Props { user: User; big?: boolean}

// User icon & full name display rgb(139 92 246)
export default function UserCard({ user, big = false }: Props) {
    const { profile } = useAuth();
    const iconColor = (user === profile?.plwd) ? PATIENT_HEX : CAREGIVER_HEX;
    const iconSize  = big ? 40 : 25
    const nameSize  = big ? "align-middle text-xl" : "align-middle"

    return (
        <div className="flex items-center gap-2 align-middle">
            <FaUser size={iconSize} color={iconColor}/>
            <span className={nameSize}>{user.first_name} {user.last_name}</span>
        </div>
    );
}
