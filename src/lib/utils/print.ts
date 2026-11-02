/**
 * FlowPilot High-Fidelity Print & PDF Export Utility
 * Prints an HTML element in complete DOM isolation using an ephemeral iframe.
 * Completely eliminates modal clipping, backdrop bleed, and browser blank-page bugs.
 */

export function printElementById(elementId: string, documentTitle?: string): boolean {
  if (typeof window === "undefined") return false;

  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    // Fallback to standard window print
    window.print();
    return true;
  }

  // Create temporary hidden iframe
  const iframe = document.createElement("iframe");
  iframe.setAttribute(
    "style",
    "position:fixed;right:0;bottom:0;width:0;height:0;border:none;visibility:hidden;z-index:-999;"
  );
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    window.print();
    return false;
  }

  // Collect all styles and stylesheet links from the parent document
  const headElements: string[] = [];
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
    headElements.push(el.outerHTML);
  });

  const title = documentTitle || "FlowPilot Commercial Document";

  iframeDoc.open();
  iframeDoc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  ${headElements.join("\n")}
  <style>
    @page {
      margin: 8mm 10mm;
      size: auto;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0 !important;
      padding: 0 !important;
      height: auto !important;
      min-height: auto !important;
      overflow: visible !important;
    }
    #${elementId} {
      display: block !important;
      position: static !important;
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 12px !important;
      border: none !important;
      box-shadow: none !important;
      background: #ffffff !important;
      color: #0f172a !important;
      overflow: visible !important;
    }
    .print\\:hidden {
      display: none !important;
    }
    .print\\:block {
      display: block !important;
    }
  </style>
</head>
<body>
  ${targetElement.outerHTML}
</body>
</html>`);
  iframeDoc.close();

  // Allow styles and font resources to resolve before triggering native print
  const printAction = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        try {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        } catch {
          // Ignore cleanup errors
        }
      }, 3000);
    }
  };

  setTimeout(printAction, 250);
  return true;
}

