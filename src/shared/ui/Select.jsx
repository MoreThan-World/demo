import { useId } from 'react'

export function Select({
  label,
  helper,
  error,
  required,
  className = '',
  children,
  ...props
}) {
  const selectId = useId()
  return (
    <div className="ui-field">
      {label && (
        <label className="ui-label" htmlFor={selectId}>
          {label}
          {required ? ' *' : ''}
        </label>
      )}
      <select
        id={selectId}
        className={`ui-select ${className}`}
        aria-invalid={!!error}
        {...props}
      >
        {children}
      </select>
      {helper && !error && <span className="ui-helper">{helper}</span>}
      {error && <span className="ui-error">{error}</span>}
    </div>
  )
}
