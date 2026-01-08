import { useId } from 'react'

export function Input({ label, helper, error, required, className = '', ...props }) {
  const inputId = useId()
  return (
    <div className="ui-field">
      {label && (
        <label className="ui-label" htmlFor={inputId}>
          {label}
          {required ? ' *' : ''}
        </label>
      )}
      <input
        id={inputId}
        className={`ui-input ${className}`}
        aria-invalid={!!error}
        {...props}
      />
      {helper && !error && <span className="ui-helper">{helper}</span>}
      {error && <span className="ui-error">{error}</span>}
    </div>
  )
}
