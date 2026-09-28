export default function AdminHeader({
  title,
  description,
  action,
}) {
  return (
    <div className="admin-page-header">
      <div>
        <h1>{title}</h1>

        {description && (
          <p>{description}</p>
        )}
      </div>

      {action && (
        <div className="admin-header-action">
          {action}
        </div>
      )}
    </div>
  );
}