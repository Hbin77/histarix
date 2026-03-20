export function formatYear(year: number): string {
  if (year < 0) {
    return `BC ${Math.abs(year)}`;
  }
  return `${year}`;
}

interface TimeDisplayProps {
  year: number;
  className?: string;
}

export function TimeDisplay({ year, className = "" }: TimeDisplayProps) {
  return <span className={className}>{formatYear(year)}</span>;
}
