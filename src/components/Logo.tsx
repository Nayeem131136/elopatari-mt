const Logo = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer circle */}
    <circle cx="20" cy="20" r="19" stroke="hsl(340, 82%, 52%)" strokeWidth="1.5" fill="none" />
    {/* Inner decorative petals */}
    <path
      d="M20 6 C23 12, 28 14, 34 14 C34 20, 28 26, 20 34 C12 26, 6 20, 6 14 C12 14, 17 12, 20 6Z"
      fill="hsl(340, 82%, 52%)"
      opacity="0.15"
    />
    <path
      d="M20 10 C22 14, 26 16, 30 16 C30 20, 26 24, 20 30 C14 24, 10 20, 10 16 C14 16, 18 14, 20 10Z"
      fill="hsl(340, 82%, 52%)"
      opacity="0.3"
    />
    {/* Center diamond */}
    <path
      d="M20 13 L25 20 L20 27 L15 20Z"
      fill="hsl(340, 82%, 52%)"
    />
    {/* MT text */}
    <text
      x="20"
      y="23"
      textAnchor="middle"
      fontSize="8"
      fontWeight="700"
      fontFamily="'Playfair Display', serif"
      fill="white"
      letterSpacing="1"
    >
      MT
    </text>
  </svg>
);

export default Logo;
