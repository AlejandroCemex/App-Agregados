"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SharePdfButtonProps {
  contentRef: React.RefObject<HTMLElement>
  fileName: string
  // Datos de cliente para la cotización
  clientName?: string
  clientContact?: string
  projectName?: string
  // Productos para la cotización
  products?: Array<{
    code: string
    description: string
    origin: string
    lithology: string
    pv: number
    um: string
    price: number
    freight?: number
  }>
  // Datos de representante
  representativeName?: string
  representativePosition?: string
  representativePhone?: string
  representativeEmail?: string
  // Datos adicionales
  premises?: string
  notes?: string
}

export function SharePdfButton({
  contentRef,
  fileName,
  clientName = "",
  clientContact = "",
  projectName = "",
  products = [],
  representativeName = "ADRIAN HORTA LERMA",
  representativePosition = "JEFE COMERCIAL AGREGADOS BAJO",
  representativePhone = "477 750 96 46",
  representativeEmail = "alejandro.diazfernandezdecovallos@cemex.com",
  premises = "",
  notes = "",
}: SharePdfButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const printFrameRef = useRef<HTMLIFrameElement | null>(null)

  // Formatear la fecha actual en formato español
  const formatDate = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, "0")
    const month = today.toLocaleString("es-ES", { month: "long" })
    const year = today.getFullYear()
    return `${day} de ${month} de ${year}`
  }

  // Formatear número como moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Calcular total para la cotización
  const calculateTotal = () => {
    // Si no hay productos, devolver valor predeterminado
    if (!products || products.length === 0) {
      return "0.00"
    }

    // Calcular total sumando precios de productos
    const total = products.reduce((sum, product) => {
      const productPrice = product.price || 0
      const freightPrice = product.freight || 0
      return sum + productPrice + freightPrice
    }, 0)

    return total.toFixed(2)
  }

  // Procesar premisas para convertirlas en elementos de lista
  const processPremises = (premisesText: string) => {
    if (!premisesText) return ""

    return premisesText
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        // Eliminar marcadores de lista y aplicar formato a texto en negrita
        const processedLine = line.replace(/^[•\-*]\s*/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

        return `<li>${processedLine}</li>`
      })
      .join("")
  }

  // Extraer datos del firmante
  const extractFirmanteData = () => {
    // Intentar extraer datos del contentRef si no se proporcionaron explícitamente
    if (contentRef.current) {
      const content = contentRef.current

      // Buscar elementos que puedan contener la información del firmante
      const firmanteNameElement = content.querySelector('[id*="firmante"]') as HTMLInputElement
      const firmanteCargoElement = content.querySelector('[id*="cargo"]') as HTMLInputElement
      const firmanteTelefonoElement = content.querySelector('[id*="telefono"]') as HTMLInputElement
      const firmanteEmailElement = content.querySelector('[id*="email"]') as HTMLInputElement

      // Extraer valores si los elementos existen
      const extractedName = firmanteNameElement?.value || representativeName
      const extractedPosition = firmanteCargoElement?.value || representativePosition
      const extractedPhone = firmanteTelefonoElement?.value || representativePhone
      const extractedEmail = firmanteEmailElement?.value || representativeEmail

      return {
        name: extractedName,
        position: extractedPosition,
        phone: extractedPhone,
        email: extractedEmail,
      }
    }

    // Usar valores predeterminados si no se puede extraer
    return {
      name: representativeName,
      position: representativePosition,
      phone: representativePhone,
      email: representativeEmail,
    }
  }

  // Función para imprimir directamente usando un iframe
  const handlePrint = () => {
    if (!contentRef.current) {
      toast({
        title: "Error",
        description: "No se pudo encontrar el contenido para imprimir",
        variant: "destructive",
      })
      return
    }

    try {
      // Detectar si es un dispositivo móvil
      const isMobile = /Mobi|Android/i.test(navigator.userAgent)

      // Si es móvil, mostrar un mensaje adicional
      if (isMobile) {
        toast({
          title: "Preparando impresión",
          description: "En dispositivos móviles, usa la opción 'Imprimir' del navegador cuando se abra la vista previa",
        })
      }
      setIsLoading(true)

      // Calcular total para la cotización
      const total = calculateTotal()

      // Extraer datos del firmante
      const firmante = extractFirmanteData()

      // Crear un iframe oculto para la impresión
      let printFrame = printFrameRef.current

      if (!printFrame) {
        printFrame = document.createElement("iframe")
        printFrame.style.position = "fixed"
        printFrame.style.right = "0"
        printFrame.style.bottom = "0"
        printFrame.style.width = "0"
        printFrame.style.height = "0"
        printFrame.style.border = "0"
        document.body.appendChild(printFrame)
        printFrameRef.current = printFrame
      }

      // Obtener el documento del iframe
      const frameDoc = printFrame.contentWindow?.document
      if (!frameDoc) {
        throw new Error("No se pudo acceder al documento del iframe")
      }

      // Generar filas de productos para la tabla
      let productRowsHtml = ""

      if (products && products.length > 0) {
        // Calcular cuántas páginas necesitamos (21 productos por página)
        const productsPerPage = 21
        const totalPages = Math.ceil(products.length / productsPerPage)

        // Generar HTML para cada página
        for (let page = 0; page < totalPages; page++) {
          // Determinar qué productos van en esta página
          const startIndex = page * productsPerPage
          const endIndex = Math.min(startIndex + productsPerPage, products.length)
          const pageProducts = products.slice(startIndex, endIndex)

          // Iniciar una nueva página si no es la primera
          if (page > 0) {
            productRowsHtml += `
              <div class="page-break"></div>
              <table class="products-table page-${page + 1}">
                <thead>
                  <tr>
                    <th>BANCO/CANTERA</th>
                    <th>MATERIAL</th>
                    <th>LITOLOGÍA</th>
                    <th>P.V.</th>
                    <th>UM</th>
                    <th>PRECIO UNITARIO</th>
                    <th>FLETE</th>
                  </tr>
                </thead>
                <tbody>
            `
          } else {
            // Primera página - solo abrir la tabla
            productRowsHtml += `
              <table class="products-table page-1">
                <thead>
                  <tr>
                    <th>BANCO/CANTERA</th>
                    <th>MATERIAL</th>
                    <th>LITOLOGÍA</th>
                    <th>P.V.</th>
                    <th>UM</th>
                    <th>PRECIO UNITARIO</th>
                    <th>FLETE</th>
                  </tr>
                </thead>
                <tbody>
            `
          }

          // Añadir filas de productos para esta página
          pageProducts.forEach((product) => {
            productRowsHtml += `
              <tr>
                <td>${product.origin || ""}</td>
                <td>${product.description || ""}</td>
                <td>${product.lithology || ""}</td>
                <td class="numeric">${product.pv?.toFixed(2) || "0.00"}</td>
                <td>${product.um || "TON"}</td>
                <td class="numeric">${formatCurrency(product.price || 0)}</td>
                <td class="numeric">${product.freight ? formatCurrency(product.freight) : "-"}</td>
              </tr>
            `
          })

          // Añadir fila de total solo en la última página
          if (page === totalPages - 1) {
            productRowsHtml += `
              <tr class="total-row">
                <td colspan="6" style="text-align: right; font-weight: bold;">TOTAL:</td>
                <td class="numeric">${formatCurrency(Number.parseFloat(total))}</td>
              </tr>
            `
          }

          // Cerrar la tabla para esta página
          productRowsHtml += `
                </tbody>
              </table>
          `
        }
      } else {
        // Si no hay productos, mostrar una tabla vacía con una fila
        productRowsHtml = `
          <table class="products-table">
            <thead>
              <tr>
                <th>BANCO/CANTERA</th>
                <th>MATERIAL</th>
                <th>LITOLOGÍA</th>
                <th>P.V.</th>
                <th>UM</th>
                <th>PRECIO UNITARIO</th>
                <th>FLETE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td class="numeric">0.00</td>
                <td>TON</td>
                <td class="numeric">$0.00</td>
                <td class="numeric">-</td>
              </tr>
              <tr class="total-row">
                <td colspan="6" style="text-align: right; font-weight: bold;">TOTAL:</td>
                <td class="numeric">${formatCurrency(0)}</td>
              </tr>
            </tbody>
          </table>
        `
      }

      // Procesar premisas y notas
      const premisesHtml = processPremises(premises)
      const notesHtml = notes.replace(/\n/g, "<br>")

      // Crear estilos para la impresión con el diseño CEMEX
      const printStyles = `
@page {
  size: A4 portrait;
  margin: 0;
}

/* Variables para colores corporativos */
:root {
  --cemex-blue: #0001B5;
  --cemex-red: #FB2230;
  --cemex-light-gray: #f5f5f5;
  --cemex-gray: #e0e0e0;
  --cemex-dark-gray: #555;
}

/* Reset general */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  color: #000;
  background-color: #fff;
  margin: 0;
  padding: 0;
  font-size: 12pt;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}

/* HEADER CON FRANJAS DE COLOR - FIJO en cada página */
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: white;
  z-index: 1000;
}

.header-blue {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background-color: var(--cemex-blue);
  clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%);
}

.header-red {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background-color: var(--cemex-red);
  clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%);
}

.header-title {
  position: absolute;
  top: 50%;
  left: 30px;
  transform: translateY(-50%);
  color: white;
  font-size: 20px;
  font-weight: bold;
  z-index: 2;
}

/* CONTENIDO PRINCIPAL - Con margen para header y footer */
.content {
  padding-top: 80px;
  padding-bottom: 100px; 
  padding-left: 20mm;
  padding-right: 20mm;
  position: relative;
  z-index: 1;
}

/* Introducción */
.intro-text {
  margin-bottom: 15px;
}

/* TABLAS INFORMATIVAS */
.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  page-break-inside: avoid;
}

.info-table td {
  padding: 8px;
  border: 1px solid #000;
}

.info-table td:first-child,
.info-table td:nth-child(3) {
  font-weight: bold;
  width: 120px;
}

/* TABLA DE PRODUCTOS */
.products-table-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 20px;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  page-break-inside: avoid; /* Evitar que la tabla se corte dentro de una página */
}

.products-table thead {
  display: table-header-group; /* Repetir encabezados en cada página */
}

.products-table tr {
  page-break-inside: avoid; /* Evitar que filas se corten entre páginas */
}

.products-table th, 
.products-table td {
  padding: 8px;
  border: 1px solid #000;
  word-wrap: break-word;
}

.products-table th {
  background-color: var(--cemex-blue);
  color: white;
  font-weight: bold;
  text-align: left;
}

.products-table .numeric {
  text-align: right;
}

/* Clase para forzar salto de página */
.page-break {
  page-break-before: always;
  height: 80px; /* Espacio para el header */
  display: block;
}

/* TOTAL SIMPLE */
.total-row {
  background-color: var(--cemex-light-gray);
  font-weight: bold;
}

.total-row td:first-child {
  text-align: right;
  font-weight: bold;
}

.total-row td:last-child {
  text-align: right;
  font-weight: bold;
}

/* NOTAS Y CONDICIONES */
.notes {
  margin: 20px 0;
  page-break-inside: avoid;
}

.notes-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.notes ul {
  margin-left: 20px;
}

.notes li {
  margin-bottom: 8px;
  line-height: 1.4;
}

.conditions {
  margin-bottom: 25px;
  page-break-inside: avoid;
}

/* SECCIÓN DE FIRMA */
.firma-container {
  margin-top: 30px;
  padding-top: 20px;
  max-width: 350px;
  page-break-inside: avoid;
}

.firma-titulo {
  font-weight: bold;
  margin-bottom: 20px;
}

.firma-nombre {
  font-weight: bold;
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.firma-nombre svg {
  margin-right: 5px;
  color: var(--cemex-blue);
}

.firma-cargo {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.firma-cargo svg {
  margin-right: 5px;
  color: var(--cemex-blue);
}

.firma-telefono {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.firma-telefono svg {
  margin-right: 5px;
  color: var(--cemex-blue);
}

.firma-email {
  display: flex;
  align-items: center;
  color: var(--cemex-blue);
}

.firma-email svg {
  margin-right: 5px;
  color: var(--cemex-blue);
}

.email-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
  color: var(--cemex-blue);
}

.email-icon svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: var(--cemex-blue);
  stroke-width: 2;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}

/* FOOTER CON LOGO Y BOTONES - FIJO en cada página */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background-color: white;
  z-index: 1000;
}

.footer-content {
  position: relative;
  height: 60px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20mm;
}

/* Eliminar o comentar los estilos de numeración de páginas */
/*
.page-number {
  position: fixed;
  bottom: 30px;
  left: 20mm;
  font-size: 10px;
  color: var(--cemex-dark-gray);
  z-index: 1000;
}
*/

.footer-colors {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 20px;
}

.footer-blue {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background-color: var(--cemex-blue);
}

.footer-red {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background-color: var(--cemex-red);
}

.footer-logo {
  height: 30px;
  width: auto;
}

.footer-buttons {
  display: flex;
  gap: 10px;
}

/* Mejorar la compatibilidad de los enlaces en el PDF */
.footer-button {
  background-color: var(--cemex-blue);
  color: white !important;
  border: none;
  padding: 6px 12px;
  font-size: 11px;
  border-radius: 4px;
  text-decoration: none !important;
  cursor: pointer;
  display: inline-block;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}

/* NUMERACIÓN DE PÁGINAS */
.page-number {
  position: fixed;
  bottom: 30px;
  left: 20mm;
  font-size: 10px;
  color: var(--cemex-dark-gray);
  z-index: 1000;
}

/* CONTENEDOR PARA SECCIÓN FINAL */
.final-section {
  page-break-inside: avoid;
}

/* ESTILOS PARA IMPRESIÓN */
@media print {
  html, body {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  
  .header, .footer {
    position: fixed;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  
  /* Evitar que elementos se corten entre páginas */
  h1, h2, h3, .info-table {
    page-break-inside: avoid;
  }
  
  /* Asegurar que la tabla de productos se pagine correctamente */
  .products-table {
    page-break-inside: auto;
  }
  
  .products-table tr {
    page-break-inside: avoid;
  }
  
  .products-table thead {
    display: table-header-group;
  }
  
  /* Controlar el salto de página para la sección final */
  .final-section {
    page-break-before: auto;
  }
  
  /* Clase para forzar salto de página cuando sea necesario */
  .page-break {
    page-break-before: always;
    margin-top: 20px;
  }
  
  /* Asegurar que los elementos después de un salto de página tengan espacio adicional */
  .page-break > *:first-child {
    margin-top: 30px;
  }

  /* Asegurar que los íconos SVG se impriman correctamente */
  svg {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  .firma-nombre svg,
  .firma-cargo svg,
  .firma-telefono svg,
  .firma-email svg,
  .email-icon svg {
    display: inline-block !important;
    visibility: visible !important;
    color: var(--cemex-blue) !important;
    stroke: var(--cemex-blue) !important;
  }

  /* Asegurar que los enlaces se muestren correctamente en el PDF */
  .footer-button {
    color: white !important;
    text-decoration: none !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  
  a[href]:after {
    content: none !important;
  }
}

/* Mejoras para dispositivos móviles */
@media screen and (max-width: 767px) {
  body {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
  
  /* Asegurar que el contenido se ajuste al ancho del dispositivo */
  .content {
    padding-left: 10mm;
    padding-right: 10mm;
  }
  
  /* Ajustar tablas para dispositivos móviles */
  .products-table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .products-table {
    min-width: 600px; /* Asegurar que la tabla tenga un ancho mínimo */
  }
  
  /* Ajustar el tamaño de fuente para mejor legibilidad */
  .products-table th,
  .products-table td {
    font-size: 10pt;
  }
  
  /* Mantener el interlineado en la sección de premisas */
  .notes li {
    margin-bottom: 8px;
    line-height: 1.4;
  }
  
  /* Ajustar el footer para dispositivos móviles */
  .footer-content {
    padding: 0 10mm;
  }
  
  .footer-buttons {
    gap: 5px;
  }
  
  .footer-button {
    font-size: 10px;
    padding: 4px 8px;
  }
}

/* Estilos específicos para impresión desde dispositivos móviles */
@media print and (max-width: 767px) {
  /* Asegurar que los íconos SVG se impriman correctamente en móviles */
  .firma-icon svg, 
  .email-icon svg {
    display: inline-block !important;
    visibility: visible !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
    stroke: #0001B5 !important;
    color: #0001B5 !important;
  }
  
  /* Mantener el interlineado en la sección de premisas */
  .notes li {
    margin-bottom: 8px;
    line-height: 1.4;
    page-break-inside: avoid;
  }
  
  /* Ajustar el tamaño del logo en el footer para móviles */
  .footer img {
    height: 20px !important;
  }
}
`

      // Script para manejar la numeración de páginas y la impresión
      const scriptContent = `
// Comentar o eliminar esta función
/*
// Función para calcular y configurar la numeración de páginas
function setupPageNumbers() {
  try {
    // Contar cuántas tablas tenemos (una por página)
    const tables = document.querySelectorAll('.products-table');
    const productPages = tables.length;
    
    // Añadir una página más para la sección final
    const finalSection = document.querySelector('.final-section');
    const needsExtraPage = finalSection && finalSection.classList.contains('page-break');
    
    const totalPages = productPages + (needsExtraPage ? 1 : 0);
    
    // Actualizar el número de página
    const pageNumberElement = document.querySelector('.page-number');
    if (pageNumberElement) {
      pageNumberElement.textContent = 'Página 1 de ' + totalPages;
      
      // Crear elementos de numeración para cada página adicional
      for (let i = 1; i < totalPages; i++) {
        const pageNum = document.createElement('div');
        pageNum.className = 'page-number page-' + (i + 1);
        pageNum.textContent = 'Página ' + (i + 1) + ' de ' + totalPages;
        pageNum.style.display = 'none'; // Se mostrará solo en su página correspondiente
        document.body.appendChild(pageNum);
      }
    }
  } catch (error) {
    console.error('Error en setupPageNumbers:', error);
  }
}
*/

// Función para determinar si se necesita un salto de página
function checkPageBreak() {
  try {
    const finalSection = document.querySelector('.final-section');
    
    if (!finalSection) return;
    
    // Obtener la última tabla
    const tables = document.querySelectorAll('.products-table');
    const lastTable = tables[tables.length - 1];
    
    if (!lastTable) return;
    
    // Verificar si la última tabla está cerca del final de la página
    const tableBottom = lastTable.getBoundingClientRect().bottom;
    const viewportHeight = window.innerHeight;
    
    // Si la tabla ocupa más del 70% de la altura de la página, añadir un salto
    if (tableBottom > viewportHeight * 0.7) {
      finalSection.classList.add('page-break');
      finalSection.style.paddingTop = '30px';
    } else {
      finalSection.classList.remove('page-break');
      finalSection.style.paddingTop = '0';
    }
  } catch (error) {
    console.error('Error en checkPageBreak:', error);
  }
}

// Función para asegurar que los enlaces funcionen en el PDF
function setupPdfLinks() {
  try {
    // Obtener todos los enlaces en el footer
    const footerLinks = document.querySelectorAll('.footer-button');
    
    // Añadir atributos adicionales para mejorar la compatibilidad
    footerLinks.forEach(link => {
      // Asegurar que el enlace tenga el atributo href
      if (link.getAttribute('href')) {
        // Añadir atributos para mejorar la compatibilidad con PDF
        link.setAttribute('data-href', link.getAttribute('href'));
        link.setAttribute('title', 'Haga clic para abrir el enlace: ' + link.getAttribute('href'));
        
        // Añadir un manejador de eventos para abrir el enlace
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const url = this.getAttribute('href');
          if (url) {
            window.open(url, '_blank');
          }
        });
      }
    });
  } catch (error) {
    console.error('Error en setupPdfLinks:', error);
  }
}

// Añadir la llamada a la función en el onload
window.onload = function() {
  try {
    checkPageBreak();
    setupPdfLinks();
    
    // Esperar un momento para asegurar que todo esté renderizado
    setTimeout(function() {
      window.print();
    }, 1000);
  } catch (error) {
    console.error('Error en onload:', error);
    // Intentar imprimir de todos modos
    window.print();
  }
  
  // Mejorar la compatibilidad con dispositivos móviles
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    // Ajustar el zoom para dispositivos móviles
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    }
    
    // Asegurar que los SVG sean visibles en la impresión desde móviles
    const svgs = document.querySelectorAll('svg');
    svgs.forEach(svg => {
      svg.style.webkitPrintColorAdjust = 'exact';
      svg.style.printColorAdjust = 'exact';
      svg.style.colorAdjust = 'exact';
    });
  }
};

// Detectar cuando se completa la impresión
window.onafterprint = function() {
  try {
    // Enviar mensaje al padre para notificar que se completó la impresión
    window.parent.postMessage('printComplete', '*');
  } catch (error) {
    console.error('Error en onafterprint:', error);
  }
};
`

      // Escribir el contenido en el iframe
      frameDoc.open()
      frameDoc.write(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>${fileName}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${printStyles}</style>
  </head>
  <body>
    <!-- Header fijo en todas las páginas -->
    <div class="header">
      <div class="header-blue"></div>
      <div class="header-red"></div>
      <div class="header-title">Cotización Agregados</div>
    </div>
    
    <!-- Contenido principal -->
    <div class="content">
      <!-- Introducción -->
      <p class="intro-text">Adjuntamos para su consideración la cotización detallada de los materiales solicitados.</p>
      
      <!-- Información del cliente -->
      <table class="info-table">
        <tr>
          <td>CLIENTE:</td>
          <td>${clientName || "Cliente"}</td>
          <td>FECHA:</td>
          <td>${formatDate()}</td>
        </tr>
        <tr>
          <td>CONTACTO:</td>
          <td>${clientContact || "Contacto"}</td>
          <td>VIGENCIA:</td>
          <td>1 MES</td>
        </tr>
        <tr>
          <td>OBRA:</td>
          <td>${projectName || ""}</td>
          <td>MODALIDAD:</td>
          <td>RECOGIDO</td>
        </tr>
      </table>
      
      <!-- Tabla de productos centrada -->
      <div class="products-table-container">
        ${productRowsHtml}
      </div>

      <!-- Sección final (agrupada para control de salto de página) -->
      <div class="final-section">
        <!-- Premisas -->
        <div class="notes">
          <p class="notes-title">PREMISAS:</p>
          <ul>
            ${
              premisesHtml ||
              `
              <li>A estos precios se debe adicionar el 16 % de IVA</li>
              <li>Precios son sujetos a una orden de compra y/o contrato de suministro con el objetivo de garantizar la disponibilidad del producto</li>
              <li>El Peso Volumétrico (P.V.) mostrado es un dato estadístico, por lo tanto, este puede variar.</li>
              <li><strong>Favor de consultar el apartado de cláusulas para mayor información.</strong></li>
            `
            }
          </ul>
        </div>
        
        <!-- Notas -->
        ${
          notes
            ? `
          <div class="notes">
            <p class="notes-title">NOTAS:</p>
            <p>${notesHtml}</p>
          </div>
        `
            : ""
        }
        
        <!-- Condiciones -->
        <div class="conditions">
          <p>Esperamos que esta iniciativa sea desu agrado y quedamos atentos a cualquier duda o comentario.</p>
        </div>
        
        <!-- Firma del representante -->
        <div class="firma-container">
          <p class="firma-titulo">Atentamente</p>
          
          <div class="firma-nombre">
            <span class="firma-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0001B5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            ${firmante.name}
          </div>
          
          <div class="firma-cargo">
            <span class="firma-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0001B5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                <path d="M8 12h8"></path>
                <path d="M12 8v8"></path>
              </svg>
            </span>
            ${firmante.position}
          </div>
          
          <div class="firma-telefono">
            <span class="firma-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0001B5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </span>
            ${firmante.phone}
          </div>
          
          <div class="firma-email">
            <span class="email-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0001B5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </span>
            ${firmante.email}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer fijo en todas las páginas -->
    <div class="footer">
      <div class="footer-content">
        <!-- Eliminar la numeración de páginas -->
        <!-- <div class="page-number">Página 1 de 1</div> -->
        
        <div style="position: absolute; left: 0; right: 0; display: flex; justify-content: center; align-items: center; width: 100%; pointer-events: none;">
          <img src="/cemex-logo.png" alt="CEMEX Logo" style="height: 25px; width: auto;" />
        </div>
        
        <div style="flex: 1;"></div>
        <div class="footer-buttons">
          <a href="https://cemex.sharepoint.com/:b:/s/SeguimientosdeproyectosAGG/EWRaODkiiMFOhgxc04bpy7cBLq3dX727nfgIF9dhJKYddw?e=EQYIeN" target="_blank" class="footer-button" onclick="window.open(this.href, '_blank'); return false;">Cláusulas</a>
          <a href="https://cemex.sharepoint.com/:b:/s/SeguimientosdeproyectosAGG/EcQn857y9gRPp6W64OUCG2MBjLA4rKyjat3WW8vBFZAedw?e=DmkVWz" target="_blank" class="footer-button" onclick="window.open(this.href, '_blank'); return false;">Atención a Quejas</a>
        </div>
      </div>
      
      <div class="footer-colors">
        <div class="footer-blue"></div>
        <div class="footer-red"></div>
      </div>
    </div>
    
    <script>${scriptContent}</script>
  </body>
  </html>
`)
      frameDoc.close()

      // Manejar el evento de mensaje del iframe cuando se completa la impresión
      const handlePrintMessage = (event: MessageEvent) => {
        if (event.data === "printComplete") {
          window.removeEventListener("message", handlePrintMessage)
          setIsLoading(false)
          toast({
            title: "Impresión completada",
            description: "La cotización se ha enviado a la impresora",
          })
        }
      }
      window.addEventListener("message", handlePrintMessage)

      // Fallback por si onafterprint no se dispara
      setTimeout(() => {
        if (isLoading) {
          window.removeEventListener("message", handlePrintMessage)
          setIsLoading(false)
        }
      }, 10000) // Aumentar el timeout a 10 segundos para dar más tiempo
    } catch (error) {
      console.error("Error al imprimir:", error)
      setIsLoading(false)
      toast({
        title: "Error al imprimir",
        description: "Por favor, inténtelo de nuevo o contacte con soporte",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      className="bg-[#0001B5] hover:bg-[#00018c] flex items-center h-12 px-6"
      onClick={handlePrint}
      disabled={isLoading}
    >
      <Printer className="mr-2 h-5 w-5" />
      {isLoading ? "Imprimiendo..." : "Imprimir Cotización"}
    </Button>
  )
}
