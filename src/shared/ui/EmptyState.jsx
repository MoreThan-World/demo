export function EmptyState({ title = '등록된 항목이 없어요.', message }) {
  return (
    <div className="ui-empty" role="status">
      <strong>{title}</strong>
      {message && <p>{message}</p>}
    </div>
  )
}
