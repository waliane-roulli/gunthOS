interface MarqueeBarProps {
  text: string;
  speed?: number;
}

export function MarqueeBar({ text, speed = 25 }: MarqueeBarProps) {
  return (
    <div
      className="py-1 overflow-hidden whitespace-nowrap border-[2px] text-base tracking-wider"
      style={{
        backgroundColor: "var(--t-marquee-bg)",
        color: "var(--t-marquee-text)",
        borderTopColor: "var(--t-border-dark)",
        borderLeftColor: "var(--t-border-dark)",
        borderBottomColor: "var(--t-border-light)",
        borderRightColor: "var(--t-border-light)",
        fontFamily: "var(--t-font-display)",
      }}
    >
      <span
        className="inline-block pl-full animate-marquee"
        style={{ animationDuration: `${speed}s` }}
      >
        {text}
      </span>
    </div>
  );
}
