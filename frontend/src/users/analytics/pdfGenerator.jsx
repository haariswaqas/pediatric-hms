import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportLogsToPDF = (logs) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('System Logs', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);

  const tableColumn = ['Timestamp', 'Level', 'User', 'Message'];
  const tableRows = [];

  logs.forEach((log) => {
    const logData = [
      new Date(log.timestamp).toLocaleString(),
      log.level,
      log.user || 'N/A',
      log.message
    ];
    tableRows.push(logData);
  });

  autoTable(doc, {
    startY: 30,
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 8 },
    theme: 'grid'
  });

  doc.save('system_logs.pdf');
};
