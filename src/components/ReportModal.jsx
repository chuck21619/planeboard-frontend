import { useState } from "react";

const HTTP_BASE_URL = import.meta.env.VITE_HTTP_BASE_URL;

export default function ReportModal({ onClose }) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(""); // clear previous errors
    try {
      const res = await fetch(`${HTTP_BASE_URL}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        setError("Failed to submit report. Please try again.");
        return;
      }

      onClose();
    } catch (err) {
      setError("Error sending report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Submit a Report</h2>

        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (error) setError("");
          }}
          placeholder="Describe the issue or feedback..."
          rows={10}
          className="report-textarea"
          disabled={isSubmitting}
        />

        {error && (
          <div
            className="error-message"
            style={{ color: "red", marginBottom: 8 }}
          >
            {error}
          </div>
        )}

        <div className="modal-button-group">
          <button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
