interface HealthBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getScoreTier(score: number): { label: string; bgColor: string; textColor: string; ringColor: string } {
  if (score >= 80) {
    return {
      label: "Excellent",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      ringColor: "ring-green-600/20",
    };
  }
  if (score >= 60) {
    return {
      label: "Good",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      ringColor: "ring-blue-600/20",
    };
  }
  if (score >= 40) {
    return {
      label: "Warning",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      ringColor: "ring-yellow-600/20",
    };
  }
  return {
    label: "Critical",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    ringColor: "ring-red-600/20",
  };
}

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function HealthBadge({ score, size = "md", showLabel = true }: HealthBadgeProps) {
  const tier = getScoreTier(score);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ring-1 ring-inset ${tier.bgColor} ${tier.textColor} ${tier.ringColor} ${sizeClasses[size]}`}
    >
      <span className="font-bold">{score}</span>
      {showLabel && <span>{tier.label}</span>}
    </span>
  );
}
