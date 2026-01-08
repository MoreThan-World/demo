import { useId } from 'react'

export function Textarea({ label, helper, error, required, className = '', ...props }) {
  const textareaId = useId()
  return (
    <div className="ui-field">
      {label && (
        <label className="ui-label" htmlFor={textareaId}>
          {label}
          {required ? ' *' : ''}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`ui-textarea ${className}`}
        aria-invalid={!!error}
        {...props}
      />
      {helper && !error && <span className="ui-helper">{helper}</span>}
      {error && <span className="ui-error">{error}</span>}
    </div>
  )
}
