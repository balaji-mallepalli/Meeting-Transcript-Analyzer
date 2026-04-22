import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPDF = (result) => {
  const doc = new jsPDF();
  const pageMargin = 14;
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(30, 64, 175); // Tailwind blue-800
  doc.text("Meeting Analysis Report", pageMargin, 22);
  
  // Subtitle/Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  const dateStr = new Date().toLocaleString();
  doc.text(`Generated on: ${dateStr}`, pageMargin, 30);
  
  let currentY = 45;
  
  // Overall Summary
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("Meeting Summary", pageMargin, currentY);
  currentY += 8;
  
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85); // slate-700
  const summaryLines = doc.splitTextToSize(result.summary.overall, 180);
  doc.text(summaryLines, pageMargin, currentY);
  currentY += (summaryLines.length * 6) + 10;
  
  // Topics Covered
  if (result.summary.by_topic && result.summary.by_topic.length > 0) {
    if (currentY > 260) { doc.addPage(); currentY = 20; }
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Topics Covered", pageMargin, currentY);
    currentY += 8;
    
    result.summary.by_topic.forEach((topicObj) => {
       if (currentY > 270) { doc.addPage(); currentY = 20; }
       doc.setFontSize(11);
       doc.setFont(undefined, "bold");
       doc.text(`• ${topicObj.topic}`, pageMargin + 4, currentY);
       currentY += 6;
       
       doc.setFont(undefined, "normal");
       const tLines = doc.splitTextToSize(topicObj.summary, 170);
       doc.text(tLines, pageMargin + 8, currentY);
       currentY += (tLines.length * 6) + 4;
    });
    currentY += 6;
  }
  
  // Key Decisions
  if (result.decisions && result.decisions.length > 0) {
    if (currentY > 260) { doc.addPage(); currentY = 20; }
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("Key Decisions", pageMargin, currentY);
    currentY += 8;
    
    doc.setFontSize(11);
    result.decisions.forEach((d, idx) => {
       if (currentY > 270) { doc.addPage(); currentY = 20; }
       const text = `${idx + 1}. [${d.speaker}] ${d.decision}`;
       const dLines = doc.splitTextToSize(text, 180);
       doc.text(dLines, pageMargin, currentY);
       currentY += (dLines.length * 6) + 2;
    });
    currentY += 10;
  }
  
  // Action Items
  if (result.action_items && result.action_items.length > 0) {
      if (currentY > 240) { doc.addPage(); currentY = 20; }
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text("Action Items", pageMargin, currentY);
      currentY += 6;
      
      const tableData = result.action_items.map(a => [
          a.speaker,
          a.action,
          a.deadline || "None"
      ]);
      
      autoTable(doc, {
          startY: currentY,
          head: [['Assignee', 'Task', 'Deadline']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [234, 179, 8] }, // yellow-500
          margin: { left: pageMargin, right: pageMargin }
      });
      currentY = doc.lastAutoTable.finalY + 10;
  }
  
  // Footer with Page Numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, {
        align: 'center'
    });
  }

  doc.save("Meeting_Analysis_Report.pdf");
};
