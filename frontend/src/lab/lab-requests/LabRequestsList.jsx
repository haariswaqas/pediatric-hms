import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLabRequests } from "../../store/lab/labRequestSlice";
import { Link, useParams } from "react-router-dom";

export default function LabRequestList() {
  const dispatch = useDispatch();
  const { labRequests, loading, error } = useSelector((state) => state.labRequest);


  useEffect(() => {
    dispatch(fetchLabRequests());
  }, [dispatch]);

  return (
    <div className="container mt-4">
      <h2>Lab Requests</h2>

      {loading && <p>Loading lab requests...</p>}
      {error && <p className="text-danger">Error: {error}</p>}

      {!loading && labRequests?.length === 0 && (
        <p>No lab requests found.</p>
      )}

      {!loading && labRequests?.length > 0 && (
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Child Name</th>
              <th>Age</th>
              <th>Requested By</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Scheduled Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {labRequests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>
                  {req.child_details
                    ? `${req.child_details.first_name} ${req.child_details.last_name}`
                    : "N/A"}
                </td>
                <td>{req.child_details?.age ?? "N/A"}</td>
                <td>
                  {req.requested_by_details
                    ? `${req.requested_by_details.first_name} ${req.requested_by_details.last_name}`
                    : "N/A"}
                </td>
                <td>{req.status}</td>
                <td>{req.priority}</td>
                <td>{req.scheduled_date}</td>
                <td>
                  <Link to={`/labs/edit-lab-request/${req.id}`} className="btn btn-sm btn-primary">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
