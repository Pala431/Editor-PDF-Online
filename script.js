// ===== FUNCIONALIDADES BÁSICAS DEL EDITOR =====

// Cambiar formato de texto (negrita, cursiva, subrayado)
document.querySelectorAll('.format-btn[data-command]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const command = btn.getAttribute('data-command');
        document.execCommand(command, false, null); // Replace with modern API if available
        document.querySelector('.document-page').focus();
    });
});

// Cambiar fuente del texto
document.getElementById('font-family').addEventListener('change', (e) => {
    document.execCommand('fontName', false, e.target.value);
    document.querySelector('.document-page').focus();
});

// Cambiar tamaño de fuente (versión corregida)
document.getElementById('font-size').addEventListener('change', (e) => {
    const size = e.target.value;
    document.execCommand('fontSize', false, '7'); // Usamos 7 como valor base
    // Aplicamos el tamaño real mediante CSS
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = size;
        range.surroundContents(span);
    }
    document.querySelector('.document-page').focus();
});

// Alinear texto
document.querySelectorAll('.align-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const align = btn.getAttribute('data-align');
        document.execCommand('justify' + align, false, null);
        document.querySelector('.document-page').focus();
    });
});

// Cambiar color de texto
document.getElementById('text-color').addEventListener('input', (e) => {
    document.execCommand('foreColor', false, e.target.value);
    document.querySelector('.document-page').focus();
});

// Insertar imagen
document.getElementById('insert-image-btn').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('image-upload').click();
    document.querySelector('.document-page').focus();
});

document.getElementById('image-upload').addEventListener('change', (e) => {
    if (e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            document.execCommand('insertImage', false, evt.target.result);
            document.querySelector('.document-page').focus();
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

// Modo oscuro/claro
document.getElementById('dark-mode-toggle').addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    
    // Cambiar icono
    const icon = document.getElementById('dark-mode-toggle').querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }
    document.querySelector('.document-page').focus();
});

// Añadir nueva página
document.getElementById('add-page').addEventListener('click', (e) => {
    e.preventDefault();
    const newPage = document.createElement('div');
    newPage.className = 'document-page';
    newPage.contentEditable = 'true';
    newPage.innerHTML = '<p><br></p>'; // Espacio inicial
    document.getElementById('pdf-viewer').appendChild(newPage);
    newPage.focus();
    newPage.scrollIntoView({ behavior: "smooth" });
});

// ===== EXPORTAR DOCUMENTO =====
document.getElementById('download-pdf').addEventListener('click', async (e) => {
    e.preventDefault();
    const exportType = confirm("¿Exportar como PDF? (Aceptar = PDF / Cancelar = DOCX)");
    
    if (exportType && typeof jspdf !== 'undefined' && typeof html2canvas !== 'undefined') {
        // Exportar a PDF
        const pages = document.querySelectorAll('.document-page');
        const pdf = new jsPDF(); // Ensure jsPDF is imported
        
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const canvas = await html2canvas(page);
            const imgData = canvas.toDataURL('image/png');
            
            if (i > 0) pdf.addPage();
            
            pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
        }
        
        pdf.save('documento.pdf');
    } else {
        // Exportar a DOCX (usando docx.js)
        if (typeof docx !== 'undefined') { // Ensure docx.js is imported
            const { Document, Paragraph, TextRun, Packer } = docx;
            
            const paragraphs = [];
            const pages = document.querySelectorAll('.document-page');
            
            pages.forEach(page => {
                const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
                
                let currentNode;
                while (currentNode = walker.nextNode()) {
                    if (currentNode.nodeValue.trim() !== '') {
                        const parent = currentNode.parentElement;
                        paragraphs.push(new Paragraph({
                            children: [new TextRun({
                                text: currentNode.nodeValue,
                                bold: parent.tagName === 'STRONG' || parent.style.fontWeight === 'bold',
                                italic: parent.tagName === 'EM' || parent.style.fontStyle === 'italic',
                                underline: parent.style.textDecoration === 'underline',
                                size: parseInt(parent.style.fontSize || '16') * 2,
                                font: parent.style.fontFamily || 'Arial'
                            })]
                        }));
                    }
                }
                
                // Añadir salto de página entre páginas
                if (page !== pages[pages.length - 1]) {
                    paragraphs.push(new Paragraph({
                        children: [new TextRun({ text: "", break: 1 })]
                    }));
                }
            });
            
            // Crear y descargar DOCX
            const doc = new Document({ sections: [{ children: paragraphs }] });
            Packer.toBlob(doc).then(blob => {
                saveAs(blob, "documento.docx");
            });
        } else {
            alert("Error: Librería DOCX no cargada");
        }
    }
});

// Enfocar el documento al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.document-page').focus();
});

// ===== MEJORAS ADICIONALES =====
// Manejar el enfoque del documento cuando se hace clic en cualquier parte
document.addEventListener('click', (e) => {
    if (!e.target.closest('.document-page')) {
        document.querySelector('.document-page').focus();
    }
});
