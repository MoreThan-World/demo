export function Button({
  variant = 'ghost',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  children,
}) {
  const sizeClass = size === 'sm' ? 'small' : ''
  return (
    <button
      type={type}
      className={`ui-button ${variant} ${sizeClass}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
