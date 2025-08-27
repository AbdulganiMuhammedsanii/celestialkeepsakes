export interface DownloadOptions {
  filename: string
  format: "png" | "jpg" | "pdf"
  quality?: number
  scale?: number
}

export async function downloadAsImage(element: HTMLElement, options: DownloadOptions) {
  const html2canvas = (await import("html2canvas")).default

  const canvas = await html2canvas(element, {
    scale: options.scale || 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    width: element.offsetWidth,
    height: element.offsetHeight,
  })

  return new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `${options.filename}.${options.format}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          resolve()
        } else {
          reject(new Error("Failed to create blob"))
        }
      },
      `image/${options.format}`,
      options.quality || 1.0,
    )
  })
}

export async function downloadAsPDF(element: HTMLElement, options: DownloadOptions) {
  const html2canvas = (await import("html2canvas")).default
  const jsPDF = (await import("jspdf")).default

  // Ensure web fonts are fully loaded to avoid layout shifts/overlaps in capture
  if (typeof document !== "undefined" && (document as any).fonts && (document as any).fonts.ready) {
    try {
      await (document as any).fonts.ready
    } catch {
      // ignore
    }
  }

  // Clone the poster and adjust spacing inline specifically for PDF capture
  const clone = element.cloneNode(true) as HTMLElement
  clone.style.position = "fixed"
  clone.style.left = "-10000px"
  clone.style.top = "0"
  clone.style.width = `${element.offsetWidth}px`
  clone.style.height = `${element.offsetHeight}px`
  clone.setAttribute("data-export", "pdf")
  clone.setAttribute("data-exporting", "true")

  const titleEl = clone.querySelector('[data-title]') as HTMLElement | null
  const subtitleEl = clone.querySelector('[data-subtitle]') as HTMLElement | null
  const dateEl = clone.querySelector('[data-date]') as HTMLElement | null

  if (titleEl) {
    titleEl.style.marginBottom = "26px"
  }
  if (subtitleEl) {
    const mt = parseFloat(getComputedStyle(subtitleEl).marginTop || "0")
    subtitleEl.style.marginTop = `${mt + 18}px`
  }
  if (dateEl) {
    const mt = parseFloat(getComputedStyle(dateEl).marginTop || "0")
    dateEl.style.marginTop = `${mt + 16}px`
  }

  document.body.appendChild(clone)

  // Wait a frame for layout to settle with the clone in DOM
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  const canvas = await html2canvas(clone, {
    scale: options.scale || 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    letterRendering: true,
    width: clone.offsetWidth,
    height: clone.offsetHeight,
  })

  // Add extra bottom spacing for title/subtitle/date to avoid overlaps in PDF
  const paddingBottomPx = 24
  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const imgWidth = 210 // A4 width in mm
  const pageHeight = 297 // A4 height in mm
  const imgHeight = ((canvas.height + paddingBottomPx) * imgWidth) / canvas.width
  let heightLeft = imgHeight

  let position = 0

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(`${options.filename}.pdf`)

  // Cleanup clone
  clone.remove()
}
