import { useEffect } from 'react'

export function Drawer({ open, title, children, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="ui-drawer-backdrop" role="presentation" onClick={onClose}>
      <div
        className="ui-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-drawer-header">
          <h3>{title}</h3>
          <button type="button" className="ui-modal-close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>
        <div className="ui-drawer-body">{children}</div>
      </div>
    </div>
  )
}
