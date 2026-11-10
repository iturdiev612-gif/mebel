import { useEffect, useRef } from 'react';
import Icon from './Icons';
export default function Modal({ title, onClose, children, drawer = false, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const focusable = ref.current?.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex="0"]');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [onClose]);
  return <div className={`modal-backdrop ${drawer ? 'drawer-backdrop' : ''}`} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <section className={`modal ${drawer ? 'drawer' : ''} ${className}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={ref}>
      <header className="modal-header"><div><span className="eyebrow">МЕБЕЛЬ ДОМА</span><h2 id="modal-title">{title}</h2></div><button className="icon-button" aria-label="Закрыть окно" onClick={onClose}><Icon name="close" /></button></header>
      {children}
    </section>
  </div>;
}
