import React from "react";

export const CalendarIcon: React.FC<{ size?: number; color?: string; style?: React.CSSProperties }> = ({
    size = 16,
    color = "currentColor",
    style,
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        fill={color}
        viewBox="0 0 16 16"
        style={style}
    >
        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h.5A1.5 1.5 0 0 1 15 2.5v11A1.5 1.5 0 0 1 13.5 15h-11A1.5 1.5 0 0 1 1 13.5v-11A1.5 1.5 0 0 1 2.5 1H3V.5a.5.5 0 0 1 .5-.5zM2.5 2a.5.5 0 0 0-.5.5V4h12V2.5a.5.5 0 0 0-.5-.5h-11zM14 5H2v8.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V5z" />
    </svg>
);