import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

function BlockchainExplorer() {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/documents/blockchain`);
        setBlocks(res.data);
      } catch (error) {
        console.error("Failed to fetch blockchain data", error);
      }
    };

    fetchBlocks();
  }, []);

  const shortenHash = (hash) => {
    if (!hash) return "N/A";
    return `${hash.substring(0, 14)}...${hash.substring(hash.length - 10)}`;
  };

  return (
    <div className="container">
      <div className="glass-card p-4 mb-4">
        <h2 className="section-title mb-2">Blockchain Explorer</h2>
        <p className="section-subtitle mb-0">
          View all blockchain blocks generated from uploaded documents
        </p>
      </div>

      {blocks.length === 0 ? (
        <div className="glass-card p-5 text-center">
          <i className="bi bi-diagram-3 display-4 text-secondary mb-3"></i>
          <h5>No blockchain records found</h5>
          <p className="soft-text">Upload documents to start building your blockchain ledger.</p>
        </div>
      ) : (
        <div className="row g-4">
          {blocks.map((block, index) => (
            <div className="col-12" key={block.block_id}>
              <div className="glass-card p-4 hover-lift blockchain-card">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
                  <div>
                    <h4 className="mb-1">
                      <i className="bi bi-box me-2 text-info"></i>
                      Block #{block.block_id}
                    </h4>
                    <p className="soft-text mb-0">
                      Linked to Document ID: <strong>{block.doc_id}</strong>
                    </p>
                  </div>

                  <span className="badge bg-info px-3 py-2">
                    {new Date(block.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="hash-box">
                      <small className="text-info">Previous Hash</small>
                      <p className="mb-0 hash-text">{shortenHash(block.previous_hash)}</p>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="hash-box">
                      <small className="text-success">Current Hash</small>
                      <p className="mb-0 hash-text">{shortenHash(block.current_hash)}</p>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="hash-box">
                      <small className="text-warning">File Hash</small>
                      <p className="mb-0 hash-text">{shortenHash(block.file_hash)}</p>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="hash-box">
                      <small className="text-primary">Block Data</small>
                      <p className="mb-0 hash-text">{block.block_data}</p>
                    </div>
                  </div>
                </div>

                {index !== blocks.length - 1 && (
                  <div className="text-center mt-4">
                    <i className="bi bi-arrow-down-circle-fill text-info fs-2"></i>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BlockchainExplorer;