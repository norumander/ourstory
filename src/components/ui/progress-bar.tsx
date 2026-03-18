import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** Percentage value between 0 and 100 */
  value: number;
  /** Optional label shown above the bar */
  label?: string;
  /** Show percentage text */
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="mb-1 flex items-center justify-between text-sm">
          {label && <span className="font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-gray-500">{clampedValue}%</span>
          )}
        </div>
      )}
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progress"}
      >
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-500 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
