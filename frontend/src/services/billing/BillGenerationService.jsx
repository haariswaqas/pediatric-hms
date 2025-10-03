// src/services/billing/BillGenerationService.jsx
import axios from "axios";
import API from "../api";
import { handleRequestError } from "../handleRequestError";

const BillGenerationService = {
  fetchBillPdf: async (billNumber, token) => {
    if (!token) throw new Error("Authorization token is missing");
    if (!billNumber) throw new Error("Bill number is required");

    try {
      const res = await axios.get(`${API}/generate-bill/${billNumber}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // ✅ important for PDF
        withCredentials: true,
      });

      // ✅ Explicitly set Blob type to application/pdf
      const fileUrl = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );

      return fileUrl;
    } catch (err) {
      handleRequestError(err);
    }
  },

  openBillPdf: async (billNumber, token) => {
    const fileUrl = await BillGenerationService.fetchBillPdf(billNumber, token);
    if (fileUrl) {
      // ✅ Opens in new tab
      window.open(fileUrl, "_blank");
    }
  },

  downloadBillPdf: async (billNumber, token) => {
    const fileUrl = await BillGenerationService.fetchBillPdf(billNumber, token);
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", `bill_${billNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  },
};

export default BillGenerationService;
