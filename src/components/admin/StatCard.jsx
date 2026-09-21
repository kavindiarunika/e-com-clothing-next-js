export default function StatCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="stat-card">

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

      <div className="stat-icon">
        <Icon size={21} />
      </div>

    </div>
  );
}