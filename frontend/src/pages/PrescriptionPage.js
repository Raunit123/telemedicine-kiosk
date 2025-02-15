import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@mui/material";
import axios from "axios";
import "./PrescriptionPage.css";

// Fix worker issue for rendering PDFs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PrescriptionPage = () => {
  const [numPages, setNumPages] = useState(null);
  const [pdfPath, setPdfPath] = useState("");

  // ✅ Fetch and set the prescription PDF URL
  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await axios({
          url: "http://localhost:3000/api/prescription/download",
          method: "GET",
          responseType: "blob", // Get binary data
        });

        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob); // Convert to viewable URL
        setPdfPath(pdfUrl); // Set it for React-PDF
      } catch (error) {
        console.error("Error loading prescription PDF:", error);
      }
    };

    fetchPdf();
  }, []);

  // ✅ Function to download the prescription PDF
  const downloadPrescription = async () => {
    try {
      const response = await axios({
        url: "http://localhost:3000/api/prescription/download",
        method: "GET",
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "prescription.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading prescription:", error);
    }
  };

  return (
    <div className="prescription-container">
      <h2>🩺 Prescription</h2>

      {/* ✅ Only render PDF when it is available */}
      {pdfPath ? (
        <div className="pdf-viewer">
          <Document
            file={pdfPath}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page key={index} pageNumber={index + 1} renderTextLayer={false}/>
            ))}
          </Document>
        </div>
      ) : (
        <p>Loading prescription...</p>
      )}

      {/* Download Button */}
      <Button variant="contained" color="primary" onClick={downloadPrescription}>
        📥 Download Prescription
      </Button>
    </div>
  );
};

export default PrescriptionPage;