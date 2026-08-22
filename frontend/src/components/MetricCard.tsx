interface MetricCardProps {
  label: string;
  value: string;
  description?: string;
}

function MetricCard({
  label,
  value,
  description,
}: MetricCardProps) {
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>

      <h3 className="metric-value">{value}</h3>

      {description && (
        <p className="metric-description">
          {description}
        </p>
      )}
    </div>
  );
}

export default MetricCard;