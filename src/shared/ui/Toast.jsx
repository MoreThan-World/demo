import { Button } from './Button.jsx'

export function Toast({ message, onClose }) {
  return (
    <div className="ui-toast" role="status" aria-live="polite">
      <span>{message}</span>
      <Button variant="ghost" size="sm" onClick={onClose}>
        닫기
      </Button>
    </div>
  )
}
