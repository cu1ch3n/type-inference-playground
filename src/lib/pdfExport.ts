import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InferenceResult } from '@/types/inference';
import { TypeInferenceAlgorithm } from '@/types/inference';

export const exportToPDF = async (
  algorithm: TypeInferenceAlgorithm,
  expression: string,
  result: InferenceResult
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add text with wrapping
  const addWrappedText = (text: string, fontSize: number, isBold = false) => {
    pdf.setFontSize(fontSize);
    if (isBold) {
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFont('helvetica', 'normal');
    }

    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
    
    // Check if we need a new page
    if (yPosition + lines.length * (fontSize * 0.35) > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * (fontSize * 0.35) + 5;
  };

  // Title
  pdf.setFillColor(59, 130, 246); // Blue background
  pdf.rect(0, 0, pageWidth, 25, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Type Inference Result', margin, 15);

  yPosition = 35;
  pdf.setTextColor(0, 0, 0);

  // Algorithm Information
  addWrappedText(`Algorithm: ${algorithm.name}`, 14, true);
  if (algorithm.paper) {
    addWrappedText(`Paper: ${algorithm.paper.title} (${algorithm.paper.year})`, 10);
    if (algorithm.paper.authors) {
      addWrappedText(`Authors: ${algorithm.paper.authors.join(', ')}`, 10);
    }
  }
  yPosition += 5;

  // Program
  addWrappedText('Input Program:', 14, true);
  pdf.setFillColor(249, 250, 251);
  const programHeight = Math.max(15, expression.split('\n').length * 5);
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, programHeight, 'F');
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(11);
  pdf.text(expression, margin + 5, yPosition + 8);
  yPosition += programHeight + 10;

  // Result
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  addWrappedText('Result:', 14, true);

  if (result.success) {
    pdf.setTextColor(34, 197, 94); // Green
    addWrappedText('✓ Type inference successful', 12, true);
    pdf.setTextColor(0, 0, 0);
    
    if (result.finalType) {
      addWrappedText(`Inferred Type: ${result.finalType}`, 12);
    }
  } else {
    pdf.setTextColor(239, 68, 68); // Red
    addWrappedText('✗ Type inference failed', 12, true);
    pdf.setTextColor(0, 0, 0);
    
    if (result.error) {
      addWrappedText(`Error: ${result.error}`, 11);
    }
  }

  // Derivation
  if (result.derivation && result.derivation.length > 0) {
    yPosition += 10;
    addWrappedText('Derivation Steps:', 14, true);

    // Try to capture the derivation viewer as image
    const derivationElement = document.querySelector('[data-derivation-viewer]');
    if (derivationElement) {
      try {
        const canvas = await html2canvas(derivationElement as HTMLElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if image fits on current page
        if (yPosition + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      } catch (error) {
        console.error('Failed to capture derivation as image:', error);
        addWrappedText('Derivation tree could not be captured in PDF format.', 11);
      }
    } else {
      addWrappedText('Derivation tree could not be captured in PDF format.', 11);
    }
  }

  // Footer
  const timestamp = new Date().toLocaleString();
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(`Generated on ${timestamp} by Type Inference Zoo`, margin, pageHeight - 10);

  // Save the PDF
  const filename = `type-inference-${algorithm.id}-${Date.now()}.pdf`;
  pdf.save(filename);
};