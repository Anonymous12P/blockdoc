import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [stats, setStats] = useState({
    totalDocuments: 0,
    activeDocuments: 0,
    tamperedDocuments: 0,
    totalBlocks: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!user || hasFetched.current) return;

    hasFetched.current = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API_BASE_URL}/api/documents/dashboard/${user.id}`
        );

        setStats(
          res.data.stats || {
            totalDocuments: 0,
            activeDocuments: 0,
            tamperedDocuments: 0,
            totalBlocks: 0,
          }
        );

        setRecentActivity(res.data.recentActivity || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="container">
      {/* HERO */}
      <div className="glass-card p-5 mb-5 hover-lift">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <h1 className="section-title mb-3">
              Welcome back, <span className="text-glow">{user?.name}</span>
            </h1>
            <p className="section-subtitle mb-4">
              Secure your files with blockchain-backed integrity, storage, and activity tracking.
            </p>

            <div className="d-flex flex-wrap gap-3">
              <Link to="/upload" className="btn btn-info">
                <i className="bi bi-upload me-2"></i>
                Upload Document
              </Link>

              <Link to="/documents" className="btn btn-outline-light">
                <i className="bi bi-folder2-open me-2"></i>
                View Documents
              </Link>
            </div>
          </div>

          <div className="col-lg-4 text-center mt-4 mt-lg-0">
            <i className="bi bi-shield-lock-fill text-info" style={{ fontSize: "6rem" }}></i>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="row g-4 mb-5">
        <div className="col-md-6 col-xl-3">
          <div className="glass-card p-4 h-100 hover-lift">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Documents</h5>
              <i className="bi bi-file-earmark-text text-info fs-2"></i>
            </div>
            <h2 className="fw-bold">{stats.totalDocuments}</h2>
            <p className="soft-text mb-0">Total uploaded files</p>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="glass-card p-4 h-100 hover-lift">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Active</h5>
              <i className="bi bi-shield-check text-success fs-2"></i>
            </div>
            <h2 className="fw-bold">{stats.activeDocuments}</h2>
            <p className="soft-text mb-0">Safe and untampered</p>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="glass-card p-4 h-100 hover-lift">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Tampered</h5>
              <i className="bi bi-exclamation-triangle text-danger fs-2"></i>
            </div>
            <h2 className="fw-bold">{stats.tamperedDocuments}</h2>
            <p className="soft-text mb-0">Security alerts detected</p>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="glass-card p-4 h-100 hover-lift">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Blocks</h5>
              <i className="bi bi-diagram-3 text-primary fs-2"></i>
            </div>
            <h2 className="fw-bold">{stats.totalBlocks}</h2>
            <p className="soft-text mb-0">Blockchain records created</p>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS + RECENT ACTIVITY */}
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="glass-card p-4 h-100">
            <h4 className="mb-4">Quick Actions</h4>

            <div className="d-grid gap-3">
              <Link to="/upload" className="btn btn-outline-info text-start p-3">
                <i className="bi bi-cloud-upload me-2"></i>
                Upload a new document
              </Link>

              <Link to="/integrity" className="btn btn-outline-warning text-start p-3">
                <i className="bi bi-patch-check me-2"></i>
                Run integrity verification
              </Link>

              <Link to="/blockchain" className="btn btn-outline-primary text-start p-3">
                <i className="bi bi-diagram-3 me-2"></i>
                Explore blockchain ledger
              </Link>

              <Link to="/activity" className="btn btn-outline-light text-start p-3">
                <i className="bi bi-clock-history me-2"></i>
                View activity timeline
              </Link>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="glass-card p-4 h-100 recent-activity-panel">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">Recent Activity</h4>
              <Link to="/activity" className="text-info small">View all</Link>
            </div>

            <div className="recent-activity-scroll">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-info mb-3"></div>
                  <p className="soft-text mb-0">Loading recent activity...</p>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-clock-history display-5 text-secondary mb-3"></i>
                  <p className="soft-text mb-0">No recent activity yet.</p>
                </div>
              ) : (
                <div className="list-group">
                  {recentActivity.map((item, index) => (
                    <div key={index} className="list-group-item mb-3">
                      <h6 className="mb-2">{item.action_type}</h6>
                      <p className="mb-2 soft-text">{item.action_details}</p>
                      <small className="soft-text">
                        {new Date(item.created_at).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;