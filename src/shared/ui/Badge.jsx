export function Badge({ variant = 'default', children }) {
  return <span className={`ui-badge ${variant === 'strong' ? 'strong' : ''}`}>{children}</span>
}
