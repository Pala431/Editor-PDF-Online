// Cambiar formato (negrita, cursiva, subrayado)
document.querySelectorAll('.format-btn[data-command]').forEach(btn => {
    btn.addEventListener('click', () => {
      const command = btn.getAttribute('data-command');
      document.execCommand(command, false, null);
    });
  });
  
  // Cambiar fuente
  document.getElementById('font-family').addEventListener('change', (e) => {
    document.execCommand('fontName', false, e.target.value);
  });
  
  // Cambiar tamaño de fuente
  document.getElementById('font-size').addEventListener('change', (e) => {
    document.execCommand('fontSize', false, "7"); // tamaño genérico
    const fontElements = document.getElementsByTagName("font");
    for (let i = 0; i < fontElements.length; i++) {
      if (fontElements[i].size == "7") {
        fontElements[i].removeAttribute("size");
        fontElements[i].style.fontSize = e.target.value;
      }
    }
  });
  
  // Alinear texto
  document.querySelectorAll('.align-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const align = btn.getAttribute('data-align');
      document.execCommand('justify' + align, false, null);
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
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(evt) {
      document.execCommand('insertImage', false, evt.target.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  });
  
  // Modo oscuro
  document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
  });
  
  // Añadir página
  document.getElementById('add-page').addEventListener('click', () => {
    const pdfViewer = document.getElementById('pdf-viewer');
    const newPage = document.createElement('div');
    newPage.className = 'document-page';
    newPage.contentEditable = 'true';
    newPage.innerHTML = '<p><br></p>';
    pdfViewer.appendChild(newPage);
    newPage.scrollIntoView({ behavior: "smooth" });
  });
  