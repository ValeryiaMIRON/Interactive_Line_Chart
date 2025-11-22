import React from "react";

export const WinnerIcon: React.FC<{ size?: number; color?: string; style?: React.CSSProperties }> = ({
    size = 20,
    color = "black",
    style,
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={style}
    >
        <path
            d="M7 2H17V7C17 9.20914 15.2091 11 13 11H11C8.79086 11 7 9.20914 7 7V2Z"
            fill="none"
            stroke={color}
            strokeWidth="2"
        />
        <path
            d="M5 4H7V7H5V4Z"
            fill="none"
            stroke={color}
            strokeWidth="2"
        />
        <path
            d="M17 4H19V7H17V4Z"
            fill="none"
            stroke={color}
            strokeWidth="2"
        />
        <rect x="10" y="11" width="4" height="3" fill="none" stroke={color} strokeWidth="2" />
        <rect x="9" y="14" width="6" height="1" fill="none" stroke={color} strokeWidth="2" />
        <path
            d="M12 3.5L12.618 5.354H14.618L13.309 6.146L13.927 8L12 6.618L10.073 8L10.691 6.146L9.382 5.354H11.382L12 3.5Z"
            fill="white"
        />
    </svg>
);


