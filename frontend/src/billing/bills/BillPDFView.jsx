// src/components/billing/BillPDFView.jsx
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBillPdf, clearBillPdf } from "../../store/billing/billGenerationSlice";

export default function BillPDFView() {
  const { billNumber } = useParams(); // e.g. BL-20250727-0010
  const dispatch = useDispatch();

  const { billPdfs, loading, error } = useSelector((state) => state.billGeneration);

  // Get blob URL for this bill
  const fileUrl = billPdfs[billNumber];

  useEffect(() => {
    if (billNumber) {
      dispatch(fetchBillPdf(billNumber));
    }

    // Cleanup the blob URL when component unmounts
    return () => {
      if (billNumber) {
        dispatch(clearBillPdf(billNumber));
      }
    };
  }, [billNumber, dispatch]);

  if (loading) return <div>Loading bill PDF...</div>;
  if (error) return <div style={{ color: "red" }}>Failed: {error}</div>;
  if (!fileUrl) return <div>No PDF found for this bill</div>;

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <h2>Bill PDF Viewer</h2>
      <iframe
        src={fileUrl}
        title={`Bill ${billNumber}`}
        style={{ width: "100%", height: "90vh", border: "none" }}
      />
    </div>
  );
}
