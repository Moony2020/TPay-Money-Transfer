import React from "react";

export default function Logo({ size = "md", showText = true, light = false }) {
  const sizes = {
    sm: { icon: 28, font: "1.25rem" },
    md: { icon: 40, font: "1.6rem" },
    lg: { icon: 56, font: "2.25rem" },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {/* Stylized red T (NO background) */}
      <span
        style={{
          color: "#B93B33", // red T
          fontWeight: 900,
          fontSize: currentSize.icon * 0.85,
          fontStyle: "italic",
          fontFamily: '"Georgia", serif',
          transform: "skewX(-2deg)",
          lineHeight: 1,
          marginBottom: "4px",
        }}
      >
        T
      </span>

      {showText && (
        <span
          className="logo-text-pay"
          style={{
            fontSize: currentSize.font,
            fontWeight: 800,
            color: light ? "#FFFFFF" : "#1A1A1A",
            fontFamily: '"Georgia", serif',
            fontStyle: "italic",
            letterSpacing: "-0.02em",
            marginLeft: "1px", // 👈 pulls Pay closer to T (tight like your logo)
          }}
        >
          Pay
        </span>
      )}
    </div>
  );
}
