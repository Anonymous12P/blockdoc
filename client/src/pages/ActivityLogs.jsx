import { useEffect, useState, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

function ActivityLogs() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!user || hasFetched.current) return;

    hasFetched.current = true;

    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/api/documents/activity/${user.id}`
        );
        setActivities(res.data || []);
      } catch (error) {
        console.error("Failed to fetch activity logs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  return (
    <div className="container">
      <div className="glass-card p-4 mb-4">
        <h2 className="section-title mb-2">Activity Timeline</h2>
        <p className="section-subtitle mb-0">
          Track uploads, integrity checks, and blockchain events
        </p>
      </div>

      <div className="glass-card p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info mb-3"></div>
            <p className="soft-text mb-0">Loading activity logs...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-clock-history display-4 text-secondary mb-3"></i>
            <h5>No activity found</h5>
            <p className="soft-text">Your recent actions will appear here.</p>
          </div>
        ) : (
          <div className="activity-timeline">
            {activities.map((activity, index) => (
              <div key={index} className="activity-item mb-4">
                <div className="activity-dot"></div>

                <div className="glass-card p-4 ms-4">
                  <h5 className="mb-2">{activity.action_type}</h5>
                  <p className="soft-text mb-2">{activity.action_details}</p>
                  <small className="soft-text">
                    {new Date(activity.created_at).toLocaleString()}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityLogs;