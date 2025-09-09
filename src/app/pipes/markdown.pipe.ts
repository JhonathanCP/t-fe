import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    let html = value;

    // Convertir títulos
    html = html.replace(/^### (.*$)/gim, '<h3 class="markdown-h3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="markdown-h2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="markdown-h1">$1</h1>');

    // Convertir texto en negrita
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convertir tablas de manera más robusta
    // Primero, identificar líneas de tabla
    const lines = html.split('\n');
    let processedLines: string[] = [];
    let inTable = false;
    let tableRows: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detectar si es una línea de tabla (contiene | al inicio y final)
      if (line.startsWith('|') && line.endsWith('|')) {
        // Omitir líneas de separación de tabla (contienen solo guiones y |)
        const isHeaderSeparator = line.replace(/\|/g, '').trim().match(/^-+$/);
        if (isHeaderSeparator) {
          continue; // Saltar esta línea
        }
        
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        
        // Procesar la fila de la tabla
        const cells = line.split('|').slice(1, -1); // Quitar el primer y último elemento vacío
        const processedCells = cells.map(cell => `<td>${cell.trim()}</td>`).join('');
        tableRows.push(`<tr>${processedCells}</tr>`);
        
      } else {
        // Si estábamos en una tabla y ya no, cerrarla
        if (inTable) {
          processedLines.push('<table class="markdown-table">');
          processedLines.push(...tableRows);
          processedLines.push('</table>');
          inTable = false;
          tableRows = [];
        }
        
        // Agregar la línea normal
        if (line.trim() !== '') {
          processedLines.push(line);
        }
      }
    }
    
    // Si terminamos en una tabla, cerrarla
    if (inTable) {
      processedLines.push('<table class="markdown-table">');
      processedLines.push(...tableRows);
      processedLines.push('</table>');
    }

    // Unir las líneas procesadas
    html = processedLines.join('\n');

    // Convertir saltos de línea
    html = html.replace(/\n/g, '<br>');

    // Convertir emojis de números con círculo
    html = html.replace(/## (\d+)️⃣/g, '<h2 class="markdown-step"><span class="step-number">$1</span>');
    html = html.replace(/(\d+)️⃣/g, '<span class="step-emoji">$1️⃣</span>');

    // Convertir listas con viñetas
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(\<li\>.*?\<\/li\>)/gis, '<ul class="markdown-list">$1</ul>');

    // Convertir bloques de código o destacados
    html = html.replace(/`(.*?)`/g, '<code class="markdown-code">$1</code>');

    return html;
  }
}
