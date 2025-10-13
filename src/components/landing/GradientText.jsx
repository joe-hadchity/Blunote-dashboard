const GradientText = ({ colors = ["#60A5FA", "#2563EB"], animationSpeed = 3, className = "", children }) => {
  const gradient = `linear-gradient(90deg, ${colors.join(", ")})`;
  const anim = `shimmer ${animationSpeed}s linear infinite`;

  return (
    <span
      className={`inline-block ${className}`} // ensure className is applied here
      style={{
        backgroundImage: gradient,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        animation: anim,
        backgroundSize: "200% 100%",
      }}
    >
      {children}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </span>
  );
};

export default GradientText;
