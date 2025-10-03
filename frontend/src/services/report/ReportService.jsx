// src/services/ReportService.js

import axios from "axios";
import API from "../api";

const ReportService = {
  fetchReports: async (token) => {
    if (!token) throw new Error("Authorization token is missing");
    const res = await axios.get(`${API}/reports/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  fetchReportById: async (reportId, token) => {
    if (!token) throw new Error("Authorization token is missing");
    const res = await axios.get(`${API}/reports/${reportId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  deleteReport: async (reportId, token) => {
    if (!token) throw new Error("Authorization token is missing");
    const res = await axios.delete(`${API}/reports/${reportId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  downloadReport: async (downloadUrl, token) => {
    if (!token) throw new Error("Authorization token is missing");
    // Fetch as blob so we can trigger a download in‑app
    const res = await axios.get(downloadUrl, {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
    });
    // create a URL for the blob and click a hidden link
    const blob = new Blob([res.data], { type: res.headers["content-type"] });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    // You can pull filename out of content-disposition header if you like:
    const disposition = res.headers["content-disposition"];
    let filename = "report";
    if (disposition) {
      const match = disposition.match(/filename="?(.+)"?/);
      if (match) filename = match[1];
    }
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default ReportService;
