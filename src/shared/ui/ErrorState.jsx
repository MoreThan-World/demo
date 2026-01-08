export function ErrorState({
  title = '요청을 처리하지 못했어요.',
  message = '잠시 후 다시 시도해 주세요.',
}) {
  return (
    <div className="ui-error-state" role="alert">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  )
}
