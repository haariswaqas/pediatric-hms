// src/components/children/ChildMedicalHistoryPDFView.jsx
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMedicalHistoryPdf, clearMedicalHistoryPdf } from "../store/children/childManagementSlice";
export default function ChildMedicalHistoryPDFView() {
  const { childId } = useParams(); // e.g. 12
  const dispatch = useDispatch();

  const { medicalHistoryPdfs, loading, error } = useSelector(
    (state) => state.childMedicalHistory
  );

  // Get blob URL for this child's medical history
  const fileUrl = medicalHistoryPdfs[childId];

  useEffect(() => {
    if (childId) {
      dispatch(fetchMedicalHistoryPdf(childId));
    }

    // Cleanup blob URL when component unmounts
    return () => {
      if (childId) {
        dispatch(clearMedicalHistoryPdf(childId));
      }
    };
  }, [childId, dispatch]);

  if (loading) return <div>Loading medical history PDF...</div>;
  if (error) return <div style={{ color: "red" }}>Failed: {error}</div>;
  if (!fileUrl) return <div>No medical history PDF found for this child</div>;

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <h2>Medical History PDF Viewer</h2>
      <iframe
        src={fileUrl}
        title={`Child ${childId} Medical History`}
        style={{ width: "100%", height: "90vh", border: "none" }}
      />
    </div>
  );
}
