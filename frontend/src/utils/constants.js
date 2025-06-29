const RUN_ENV = import.meta.env.VITE_RUN_ENV ?? "DEV";

const WEB_URL = import.meta.env.VITE_API_URL ?? "https://cognibot.org";
const API_URL = import.meta.env.VITE_API_URL ?? "http://backend:8000/api";

export { RUN_ENV, WEB_URL, API_URL }
