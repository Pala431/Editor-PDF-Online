// ===== FUNCIONALIDADES BÁSICAS DEL EDITOR =====

// Cambiar formato de texto (negrita, cursiva, subrayado)
document.querySelectorAll('.format-btn[data-command]').forEach(btn => {
    btn.addEventListener('click', () => {
        const command = btn.getAttribute('data-command');
        document.execCommand(command, false, null);
    });
});

// Cambiar fuente del texto
document.getElementById('font-family').addEventListener('change', (e) => {
    document.execCommand('fontName', false, e.target.value);
});

// Cambiar tamaño de fuente
document.getElementById('font-size').addEventListener('change', (e) => {
    document.execCommand('fontSize', false, "7");
    document.querySelectorAll('font[size="7"]').forEach(el => {
        el.style.fontSize = e.target.value;
        el.removeAttribute("size");
    });
});

// Alinear texto
document.querySelectorAll('.align-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.execCommand('justify' + btn.getAttribute('data-align'), false, null);
    });
});

// Cambiar color de texto
document.getElementById('text-color').addEventListener('input', (e) => {
    document.execCommand('foreColor', false, e.target.value);
});

// Insertar imagen
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

// Modo oscuro/claro
document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    
    // Cambiar icono
    const icon = document.getElementById('dark-mode-toggle').querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }
});

// Añadir nueva página
document.getElementById('add-page').addEventListener('click', () => {
    const newPage = document.createElement('div');
    newPage.className = 'document-page';
    newPage.contentEditable = 'true';
    newPage.innerHTML = '<p><br></p>'; // Espacio inicial
    document.getElementById('pdf-viewer').appendChild(newPage);
    newPage.scrollIntoView({ behavior: "smooth" });
});

// ===== EXPORTAR DOCUMENTO =====
document.getElementById('download-pdf').addEventListener('click', async () => {
    const exportType = confirm("¿Exportar como PDF? (Aceptar = PDF / Cancelar = DOCX)");
    
    if (exportType && typeof jspdf !== 'undefined' && typeof html2canvas !== 'undefined') {
        // Exportar a PDF
        const canvas = await html2canvas(document.querySelector('.document-page'));
        const pdf = new jspdf.jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait'
        });
        pdf.addImage(canvas, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), 0);
        pdf.save('documento.pdf');
    } else {
        // Exportar a DOCX (usando docx.js)
        if (typeof docx !== 'undefined') {
            const { Document, Paragraph, TextRun, Packer } = docx;
            
            // Convertir contenido a párrafos
            const paragraphs = [];
            const walker = document.createTreeWalker(
                document.querySelector('.document-page'), 
                NodeFilter.SHOW_TEXT
            );
            
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
                            size: (parseInt(parent.style.fontSize || '16') * 2, // half-points
                            font: parent.style.fontFamily || 'Arial'
                        })]
                    }));
                }
            }
            
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

// ===== INICIALIZACIÓN (OPCIONAL) =====
// Cargar las librerías dinámicamente si no están presentes
function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        document.head.appendChild(script);
    });
}

// Verificar y cargar librerías necesarias
if (typeof jspdf === 'undefined') {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
        .then(() => { window.jsPDF = window.jspdf.jsPDF; });
}

if (typeof html2canvas === 'undefined') {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
}

if (typeof docx === 'undefined') {
    loadScript('https://unpkg.com/docx@7.8.2/build/index.js');
}

if (typeof saveAs === 'undefined') {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js');
}
