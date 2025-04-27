// ===== FUNCIONES DE FORMATO =====
document.querySelectorAll('.format-btn[data-command]').forEach(btn => {
    btn.addEventListener('click', () => {
        const command = btn.getAttribute('data-command');
        document.execCommand(command, false, null);
    });
});

document.getElementById('font-family').addEventListener('change', (e) => {
    document.execCommand('fontName', false, e.target.value);
});

document.getElementById('font-size').addEventListener('change', (e) => {
    document.execCommand('fontSize', false, "7");
    document.querySelectorAll('font[size="7"]').forEach(el => {
        el.style.fontSize = e.target.value;
        el.removeAttribute("size");
    });
});

document.querySelectorAll('.align-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.execCommand('justify' + btn.getAttribute('data-align'), false, null);
    });
});

document.getElementById('text-color').addEventListener('input', (e) => {
    document.execCommand('foreColor', false, e.target.value);
});

// ===== IMÁGENES =====
document.getElementById('insert-image-btn').addEventListener('click', () => {
    document.getElementById('image-upload').click();
});

document.getElementById('image-upload').addEventListener('change', (e) => {
    if (e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (evt) => document.execCommand('insertImage', false, evt.target.result);
        reader.readAsDataURL(e.target.files[0]);
    }
});

// ===== MODO OSCURO =====
document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
});

// ===== PÁGINAS =====
document.getElementById('add-page').addEventListener('click', () => {
    const newPage = document.createElement('div');
    newPage.className = 'document-page';
    newPage.contentEditable = 'true';
    newPage.innerHTML = '<p><br></p>';
    document.getElementById('pdf-viewer').appendChild(newPage);
    newPage.scrollIntoView({ behavior: "smooth" });
});

// ===== DESCARGAR (VERSIÓN MEJORADA) =====
document.getElementById('download-pdf').addEventListener('click', async () => {
    // Opción 1: Exportar como PDF (requiere las librerías en el head)
    if (typeof jspdf !== 'undefined' && typeof html2canvas !== 'undefined') {
        const canvas = await html2canvas(document.querySelector('.document-page'));
        const pdf = new jspdf.jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait'
        });
        pdf.addImage(canvas, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), 0);
        pdf.save('documento.pdf');
    } 
    // Opción 2: Exportar como HTML (fallback)
    else {
        const blob = new Blob([`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Documento Exportado</title>
                <style>${[...document.styleSheets].map(sheet => [...sheet.cssRules].map(rule => rule.cssText).join('')}</style>
            </head>
            <body>${document.querySelector('.document-page').innerHTML}</body>
            </html>
        `], { type: 'text/html' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'documento.html';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
});
