import React from "react";

// Genosai Voice wordmark (component name kept for upstream compatibility).
/* eslint-disable i18next/no-literal-string -- brand name, not UI copy */
const HandyTextLogo = ({
  width,
  height,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 520 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Genosai Voice"
    >
      <defs>
        <linearGradient id="gv-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A7BFF" />
          <stop offset="100%" stopColor="#0E2C96" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="104" height="104" rx="26" fill="url(#gv-grad)" />
      <rect x="44" y="26" width="24" height="42" rx="12" fill="#fff" />
      <path
        d="M36 58a20 20 0 0 0 40 0"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M56 78v14M44 92h24" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      <text
        x="126"
        y="62"
        fontFamily="Inter, -apple-system, 'Segoe UI', Arial, sans-serif"
        fontWeight="800"
        fontSize="46"
        className="fill-text"
        fill="currentColor"
      >
        Genosai
      </text>
      <text
        x="127"
        y="104"
        fontFamily="Inter, -apple-system, 'Segoe UI', Arial, sans-serif"
        fontWeight="600"
        fontSize="34"
        fill="#3A7BFF"
      >
        Voice
      </text>
    </svg>
  );
};

export default HandyTextLogo;
