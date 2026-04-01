import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

function IntegrityCheck() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/documents/user/${user.id}`);
        setDocuments(res.data);
      } catch (error) {
        console.error("Failed to fetch documents", error);
      }
    };

    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const handleCheck = async () => {
    if (!selectedDoc) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/documents/check/${selectedDoc}`);
      setResult(res.data);
    } catch (error) {
      console.error("Integrity check failed", error);
      setResult({
        status: "ERROR",
        message: "Integrity check failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="glass-card p-5 mx-auto" style={{ maxWidth: "800px" }}>
        <div className="text-center mb-4">
          <h2 className="section-title mb-2">Integrity Verification</h2>
          <p className="section-subtitle">
            Validate whether a stored document has been altered or remains secure
          </p>
        </div>

        {/* SELECT DOCUMENT */}
        <div className="mb-4">
          <label className="form-label">Select Document</label>
          <select
            className="form-select"
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
          >
            <option value="">Choose a document...</option>
            {documents.map((doc) => (
              <option key={doc.doc_id} value={doc.doc_id}>
                {doc.doc_title} ({doc.file_name})
              </option>
            ))}
          </select>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleCheck}
          className="btn btn-info w-100 mb-4"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Verifying...
            </>
          ) : (
            <>
              <i className="bi bi-shield-check me-2"></i>
              Run Integrity Check
            </>
          )}
        </button>

        {/* RESULT */}
        {result && (
          <div
            className={`integrity-result-card p-4 mt-3 ${
              result.status === "VALID"
                ? "integrity-valid"
                : result.status === "TAMPERED"
                ? "integrity-tampered"
                : "integrity-error"
            }`}
          >
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="result-icon">
                {result.status === "VALID" && <i className="bi bi-patch-check-fill fs-1 text-success"></i>}
                {result.status === "TAMPERED" && <i className="bi bi-shield-exclamation fs-1 text-danger"></i>}
                {result.status === "ERROR" && <i className="bi bi-exclamation-octagon fs-1 text-warning"></i>}
              </div>

              <div>
                <h4 className="mb-1">{result.message}</h4>
                <p className="soft-text mb-0">
                  Status: <strong>{result.status}</strong>
                </p>
              </div>
            </div>

            {result.storedHash && (
              <>
                <div className="hash-box mb-3">
                  <small className="text-info">Stored Hash</small>
                  <p className="mb-0 hash-text">{result.storedHash}</p>
                </div>

                <div className="hash-box">
                  <small className="text-warning">Current Hash</small>
                  <p className="mb-0 hash-text">{result.currentHash}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default IntegrityCheck;