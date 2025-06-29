
export const ACCENT_COLOR = "violet-600";

// Helper to style navigation links
export const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "underline decoration-2 text-violet-600"
    : "no-underline text-gray-500 hover:text-gray-700 visited:text-gray-500";
