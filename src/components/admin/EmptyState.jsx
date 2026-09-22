import { Inbox } from "lucide-react";

export default function EmptyState({
  title = "No data found",
  description = "There are no records available.",
}) {
  return (
    <div className="admin-empty-state">
      <div className="empty-icon">
        <Inbox size={30} />
      </div>

      <h3>{title}</h3>

      <p>{description}</p>
    </div>
  );
}