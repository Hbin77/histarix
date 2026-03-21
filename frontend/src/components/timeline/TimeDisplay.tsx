export function formatYear(year: number): string {
  if (year < 0) {
    return `BC ${Math.abs(year)}`;
  }
  return `${year}`;
}

interface TimeDisplayProps {
  year: number;
  className?: string;
  style?: React.CSSProperties;
}

export function TimeDisplay({ year, className = "", style }: TimeDisplayProps) {
  return <span className={className} style={style}>{formatYear(year)}</span>;
}
