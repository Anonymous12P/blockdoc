import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../config/api";

function UploadDocument() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [docTitle, setDocTitle] = useState("");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !docTitle) {
      toast.error("Please provide both title and file.");
      return;
    }

    const formData = new FormData();
    formData.append("document", file);
    formData.append("user_id", user.id);
    formData.append("doc_title", docTitle);

    try {
      setUploading(true);

      await axios.post(`${API_BASE_URL}/api/documents/upload`, formData);

      toast.success("Document uploaded & blockchain block created!");
      setFile(null);
      setDocTitle("");
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <div className="glass-card p-5 mx-auto" style={{ maxWidth: "700px" }}>
        <h2 className="text-center mb-4 section-title">Upload Document</h2>
        <p className="text-center section-subtitle mb-4">
          Securely store your file on blockchain with integrity protection
        </p>

        {/* TITLE INPUT */}
        <div className="mb-4">
          <label className="form-label">Document Title</label>
          <input
            type="text"
            className="form-control"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            placeholder="Enter document title"
          />
        </div>

        {/* DRAG DROP AREA */}
        <div
          className={`upload-dropzone mb-4 ${dragActive ? "active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            onChange={(e) => handleFileChange(e.target.files[0])}
            hidden
            id="fileUpload"
          />

          <label
            htmlFor="fileUpload"
            className="w-100 h-100 text-center cursor-pointer"
          >
            <div className="py-5">
              <i className="bi bi-cloud-upload display-4 text-info mb-3"></i>
              <h5>Drag & Drop your file here</h5>
              <p className="soft-text">or click to browse</p>

              {file && (
                <div className="mt-3">
                  <span className="badge bg-info">{file.name}</span>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleUpload}
          className="btn btn-info w-100"
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Uploading...
            </>
          ) : (
            <>
              <i className="bi bi-upload me-2"></i>
              Upload to Blockchain
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default UploadDocument;