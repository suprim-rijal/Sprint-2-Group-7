import { useEffect, useRef, useState } from "react";

// Asks for the 4-digit parent PIN before leaving child view.
// Uses the native <dialog> element: it traps focus and closes with Esc.
// Mock only: the PIN is compared in the browser. Sprint 3 should verify it on the server.

export default function PinDialog({ open, expectedPin, onSuccess, onClose }) {
  const ref = useRef(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setPin("");
      setError("");
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const submit = (event) => {
    event.preventDefault();
    if (pin === expectedPin) onSuccess();
    else {
      setError("That PIN is not right. Try again.");
      setPin("");
    }
  };

  return (
    <dialog ref={ref} className="pin-dialog" onClose={onClose} aria-labelledby="pin-title">
      <form onSubmit={submit}>
        <h2 id="pin-title">Parent check</h2>
        <p>Enter the 4-digit parent PIN to open parental controls.</p>
        <input
          className="pin-input"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
            setError("");
          }}
          inputMode="numeric"
          autoComplete="off"
          aria-label="4-digit PIN"
          autoFocus
        />
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="pin-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-dark btn-sm" disabled={pin.length !== 4}>
            Unlock
          </button>
        </div>
      </form>
    </dialog>
  );
}
