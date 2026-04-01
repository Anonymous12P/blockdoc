import { useEffect, useState } from "react";
import axios from "axios";
import {toast} from "react-toastify";
import API_BASE_URL from "../config/api";



function MyDocuments() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  

  const fetchDocuments = async () => {
    try {
     const res = await axios.get(`${API_BASE_URL}/api/documents/user/${user.id}`);
      setDocuments(res.data);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const handleIntegrityCheck = async (docId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/documents/check/${docId}`);
      toast.success(`${res.data.message}`);
      fetchDocuments();
    } catch (error) {
      console.error("Integrity check failed", error);
      toast.error(" Integrity check failed");
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.doc_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="glass-card p-4 mb-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div>
            <h2 className="section-title mb-1">My Documents</h2>
            <p className="section-subtitle mb-0">
              Manage, verify, and monitor your uploaded files
            </p>
          </div>

          <div style={{ maxWidth: "350px", width: "100%" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title or file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

   

      <div className="glass-card p-4">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-folder-x display-4 text-secondary mb-3"></i>
            <h5>No documents found</h5>
            <p className="soft-text">Try uploading a file or adjusting your search.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>File Name</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.doc_id}>
                    <td>{doc.doc_title}</td>
                    <td>{doc.file_name}</td>
                    <td>
                      {doc.status === "ACTIVE" ? (
                        <span className="badge bg-success">ACTIVE</span>
                      ) : (
                        <span className="badge bg-danger">TAMPERED</span>
                      )}
                    </td>
                    <td>{new Date(doc.uploaded_at).toLocaleString()}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <a
                          href={`${API_BASE_URL}/${doc.file_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-light"
                        >
                          <i className="bi bi-eye me-1"></i>
                          View
                        </a>

                        <button
                          onClick={() => handleIntegrityCheck(doc.doc_id)}
                          className="btn btn-sm btn-outline-warning"
                        >
                          <i className="bi bi-shield-check me-1"></i>
                          Check Integrity
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyDocuments;