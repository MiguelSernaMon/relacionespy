let ehlpharmaPath = null;
let ofimaticPath = null;

const selectEhlpharmaBtn = document.getElementById('selectEhlpharma');
const selectOfimaticBtn = document.getElementById('selectOfimatic');
const processBtn = document.getElementById('processBtn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const ehlpharmaStatus = document.getElementById('ehlpharmaStatus');
const ofimaticStatus = document.getElementById('ofimaticStatus');
const ehlpharmaSection = document.getElementById('ehlpharmaSection');
const ofimaticSection = document.getElementById('ofimaticSection');

// Seleccionar archivo Ehlpharma
selectEhlpharmaBtn.addEventListener('click', async () => {
    const filePath = await window.electronAPI.selectFile('Selecciona Planilla Ehlpharma Bogotá');
    if (filePath) {
        ehlpharmaPath = filePath;
        const fileName = filePath.split(/[\\/]/).pop();
        ehlpharmaStatus.textContent = '✅ ' + fileName;
        ehlpharmaStatus.style.display = 'block';
        ehlpharmaSection.classList.add('has-file');
        checkFormReady();
    }
});

// Seleccionar archivo Ofimatic
selectOfimaticBtn.addEventListener('click', async () => {
    const filePath = await window.electronAPI.selectFile('Selecciona Planilla Ofimatic Bogotá');
    if (filePath) {
        ofimaticPath = filePath;
        const fileName = filePath.split(/[\\/]/).pop();
        ofimaticStatus.textContent = '✅ ' + fileName;
        ofimaticStatus.style.display = 'block';
        ofimaticSection.classList.add('has-file');
        checkFormReady();
    }
});

// Verificar si el formulario está listo
function checkFormReady() {
    processBtn.disabled = !(ehlpharmaPath && ofimaticPath);
}

// Procesar archivos
processBtn.addEventListener('click', async () => {
    if (!ehlpharmaPath || !ofimaticPath) {
        alert('Por favor, selecciona ambos archivos.');
        return;
    }
    
    // Ocultar botones y mostrar loading
    document.querySelector('.container > .file-section:nth-of-type(1)').style.display = 'none';
    document.querySelector('.container > .file-section:nth-of-type(2)').style.display = 'none';
    processBtn.style.display = 'none';
    loading.style.display = 'block';
    result.style.display = 'none';
    
    try {
        const response = await window.electronAPI.processBogota(ehlpharmaPath, ofimaticPath);
        
        loading.style.display = 'none';
        result.style.display = 'block';
        
        if (response.success) {
            result.className = 'result-section result-success';
            document.getElementById('resultContent').innerHTML = 
                '<h3>✅ ¡Proceso completado!</h3>' +
                '<p>' + response.message + '</p>' +
                '<p><strong>Archivo guardado en:</strong></p>' +
                '<small>' + response.outputPath + '</small>' +
                '<br><br><button onclick="resetForm()" class="reset-btn">🔄 Procesar otro archivo</button>';
        } else {
            result.className = 'result-section result-error';
            document.getElementById('resultContent').innerHTML = 
                '<h3>❌ Error</h3>' +
                '<p>' + response.error + '</p>' +
                (response.stack ? '<small>' + response.stack + '</small>' : '') +
                '<button onclick="resetForm()" class="reset-btn">🔄 Intentar de nuevo</button>';
        }
        
    } catch (error) {
        loading.style.display = 'none';
        result.style.display = 'block';
        result.className = 'result-section result-error';
        document.getElementById('resultContent').innerHTML = 
            '<h3>❌ Error de procesamiento</h3>' +
            '<p>' + error.message + '</p>' +
            '<button onclick="resetForm()" class="reset-btn">🔄 Intentar de nuevo</button>';
    }
});

// Resetear formulario
function resetForm() {
    ehlpharmaPath = null;
    ofimaticPath = null;
    
    document.querySelector('.container > .file-section:nth-of-type(1)').style.display = 'block';
    document.querySelector('.container > .file-section:nth-of-type(2)').style.display = 'block';
    processBtn.style.display = 'block';
    result.style.display = 'none';
    
    ehlpharmaStatus.style.display = 'none';
    ofimaticStatus.style.display = 'none';
    ehlpharmaSection.classList.remove('has-file');
    ofimaticSection.classList.remove('has-file');
    
    checkFormReady();
}
