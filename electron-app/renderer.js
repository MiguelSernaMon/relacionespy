// Estado de la aplicación
let file1Path = null;
let file2Path = null;
let outputFolderPath = null;
let currentMode = localStorage.getItem('selectedMode') || 'medellin';

// Elementos del DOM
const modoSelector = document.getElementById('modoSelector');
const modeIndicator = document.getElementById('modeIndicator');
const selectFile1Btn = document.getElementById('selectFile1');
const selectFile2Btn = document.getElementById('selectFile2');
const selectOutputFolderBtn = document.getElementById('selectOutputFolder');
const processBtn = document.getElementById('processBtn');
const formContainer = document.getElementById('formContainer');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const file1Status = document.getElementById('file1Status');
const file2Status = document.getElementById('file2Status');
const outputFolderStatus = document.getElementById('outputFolderStatus');
const file1Section = document.getElementById('file1Section');
const file2Section = document.getElementById('file2Section');
const file1Label = document.getElementById('file1Label');
const file2Label = document.getElementById('file2Label');
const infoMedellin = document.getElementById('infoMedellin');
const infoBogota = document.getElementById('infoBogota');
const infoDistrifarma = document.getElementById('infoDistrifarma');

// Cache DOM elements
const cachePanel = document.getElementById('cachePanel');
const cacheList = document.getElementById('cacheList');
const cacheBadge = document.getElementById('cacheBadge');
const cacheEmpty = document.getElementById('cacheEmpty');
const cacheActions = document.getElementById('cacheActions');
const clearCacheBtn = document.getElementById('clearCacheBtn');
const addToCacheBtn = document.getElementById('addToCacheBtn');

// Messenger Mappings DOM elements
const messengerMappingsBtn = document.getElementById('messengerMappingsBtn');
const messengerMappingsModal = document.getElementById('messengerMappingsModal');
const messengerMappingsClose = document.getElementById('messengerMappingsClose');
const messengerMappingsList = document.getElementById('messengerMappingsList');
const addMappingBtn = document.getElementById('addMappingBtn');
const saveMappingsBtn = document.getElementById('saveMappingsBtn');

// ============================================
// CACHE UI
// ============================================

async function loadCacheUI() {
    try {
        const cacheInfo = await window.electronAPI.getCacheInfo();
        renderCache(cacheInfo);
    } catch (e) {
        console.warn('Error cargando cache:', e);
    }
}

function renderCache(items) {
    // Badge
    cacheBadge.textContent = items.length;
    if (items.length === 0) {
        cacheBadge.classList.add('empty');
    } else {
        cacheBadge.classList.remove('empty');
    }

    // Lista
    cacheList.innerHTML = '';
    if (items.length === 0) {
        cacheList.innerHTML = `
            <div class="cache-empty">
                <span>🔍 No hay planillas madre cargadas aún</span>
                <small>Usa el botón ➕ para agregar planillas (incluso a futuro) — se mantienen hasta que las elimines</small>
            </div>
        `;
        clearCacheBtn.style.display = 'none';
        return;
    }

    clearCacheBtn.style.display = '';

    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cache-item';
        div.innerHTML = `
            <div class="cache-item-info">
                <div class="cache-item-name" title="${item.originalName}">📄 ${item.originalName}</div>
                <div class="cache-item-meta">
                    <span>📅 ${item.fecha}</span>
                    <span>🕐 ${item.hora}</span>
                    <span>💾 ${item.sizeMB} MB</span>
                    ${index === 0 ? '<span style="color:#28a745;font-weight:600;">★ Más reciente</span>' : ''}
                </div>
            </div>
            <button class="cache-item-remove" title="Eliminar esta planilla del caché" data-id="${item.id}">✕</button>
        `;
        cacheList.appendChild(div);
    });

    // Attach remove handlers
    cacheList.querySelectorAll('.cache-item-remove').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const fileId = e.currentTarget.dataset.id;
            const updatedCache = await window.electronAPI.removeCacheFile(fileId);
            renderCache(updatedCache);
        });
    });
}

// Clear all cache
clearCacheBtn.addEventListener('click', async () => {
    if (confirm('¿Estás seguro de limpiar todo el caché de planillas madre?')) {
        const updatedCache = await window.electronAPI.clearCache();
        renderCache(updatedCache);
    }
});

// Agregar planilla madre manualmente al caché
addToCacheBtn.addEventListener('click', async () => {
    try {
        addToCacheBtn.disabled = true;
        addToCacheBtn.textContent = '⏳ Seleccionando...';
        
        const result = await window.electronAPI.addToCache();
        
        if (result && result.error) {
            alert('Error al agregar al caché: ' + result.error);
        } else if (result && result.added > 0) {
            // Feedback visual breve
            addToCacheBtn.textContent = `✅ ${result.added} planilla(s) agregada(s)`;
            setTimeout(() => {
                addToCacheBtn.textContent = '➕ Agregar Planilla Madre';
            }, 2000);
        }
        // Siempre refrescar la UI del caché
        if (result && result.cacheInfo) {
            renderCache(result.cacheInfo);
        } else {
            loadCacheUI();
        }
    } catch (err) {
        console.error('Error en addToCache:', err);
        alert('Error al intentar agregar planilla: ' + err.message);
    } finally {
        addToCacheBtn.disabled = false;
        if (addToCacheBtn.textContent === '⏳ Seleccionando...') {
            addToCacheBtn.textContent = '➕ Agregar Planilla Madre';
        }
    }
});

// Cargar cache al iniciar
loadCacheUI();

// Cambio de modo
modoSelector.addEventListener('change', () => {
    currentMode = modoSelector.value;
    localStorage.setItem('selectedMode', currentMode);
    updateModeUI();
    resetFiles();
});

function updateModeUI() {
    // Ocultar todos los info boxes
    infoMedellin.style.display = 'none';
    infoBogota.style.display = 'none';
    infoDistrifarma.style.display = 'none';
    
    // Actualizar indicador de modo
    modeIndicator.textContent = currentMode.toUpperCase();
    modeIndicator.className = 'mode-indicator ' + currentMode;
    
    switch (currentMode) {
        case 'medellin':
            infoMedellin.style.display = 'block';
            file1Label.textContent = '1️⃣ Planilla Madre Medellín (.csv/.xlsx)';
            file2Label.textContent = '2️⃣ Planilla Ofimatic (.xlsx)';
            file2Section.style.display = 'block';
            processBtn.textContent = '3️⃣ ¡GENERAR ARCHIVO LIBRO2 MEDELLÍN!';
            break;
            
        case 'bogota':
            infoBogota.style.display = 'block';
            file1Label.textContent = '1️⃣ Planilla Ehlpharma Bogotá (.xlsx)';
            file2Label.textContent = '2️⃣ Planilla Ofimatic Bogotá (.xlsx)';
            file2Section.style.display = 'block';
            processBtn.textContent = '3️⃣ ¡GENERAR ARCHIVO LIBRO2 BOGOTÁ!';
            break;
            
        case 'distrifarma':
            infoDistrifarma.style.display = 'block';
            file1Label.textContent = '1️⃣ Archivo Distrifarma (.xlsx)';
            file2Section.style.display = 'none';
            processBtn.textContent = '2️⃣ ¡TRANSFORMAR ARCHIVO DISTRIFARMA!';
            break;
    }
}

function resetFiles() {
    file1Path = null;
    file2Path = null;
    outputFolderPath = null;
    file1Status.style.display = 'none';
    file2Status.style.display = 'none';
    outputFolderStatus.style.display = 'none';
    file1Section.classList.remove('has-file');
    file2Section.classList.remove('has-file');
    checkFormReady();
}

// Seleccionar archivo 1
selectFile1Btn.addEventListener('click', async () => {
    let title = 'Selecciona el primer archivo';
    if (currentMode === 'medellin') title = 'Selecciona Planilla Madre Medellín';
    if (currentMode === 'bogota') title = 'Selecciona Planilla Ehlpharma Bogotá';
    if (currentMode === 'distrifarma') title = 'Selecciona Archivo Distrifarma';
    
    const filePath = await window.electronAPI.selectFile(title);
    if (filePath) {
        file1Path = filePath;
        const fileName = filePath.split(/[\\/]/).pop();
        file1Status.textContent = '✅ ' + fileName;
        file1Status.style.display = 'block';
        file1Section.classList.add('has-file');
        checkFormReady();
    }
});

// Seleccionar archivo 2
selectFile2Btn.addEventListener('click', async () => {
    let title = 'Selecciona Planilla Ofimatic';
    if (currentMode === 'bogota') title = 'Selecciona Planilla Ofimatic Bogotá';
    
    const filePath = await window.electronAPI.selectFile(title);
    if (filePath) {
        file2Path = filePath;
        const fileName = filePath.split(/[\\/]/).pop();
        file2Status.textContent = '✅ ' + fileName;
        file2Status.style.display = 'block';
        file2Section.classList.add('has-file');
        checkFormReady();
    }
});

// Seleccionar carpeta de salida
selectOutputFolderBtn.addEventListener('click', async () => {
    const folderPath = await window.electronAPI.selectFolder('Selecciona dónde guardar el archivo');
    if (folderPath) {
        outputFolderPath = folderPath;
        const folderName = folderPath.split(/[\\/]/).pop();
        outputFolderStatus.textContent = '✅ ' + folderPath;
        outputFolderStatus.style.display = 'block';
    }
});

// Verificar si el formulario está listo
function checkFormReady() {
    if (currentMode === 'distrifarma') {
        processBtn.disabled = !file1Path;
    } else {
        processBtn.disabled = !(file1Path && file2Path);
    }
}

// Procesar archivos
processBtn.addEventListener('click', async () => {
    // Validar
    if (currentMode === 'distrifarma') {
        if (!file1Path) {
            alert('Por favor, selecciona el archivo.');
            return;
        }
    } else {
        if (!file1Path || !file2Path) {
            alert('Por favor, selecciona ambos archivos.');
            return;
        }
    }
    
    // Mostrar loading
    formContainer.style.display = 'none';
    loading.style.display = 'block';
    result.style.display = 'none';
    
    try {
        let response;
        
        switch (currentMode) {
            case 'medellin':
                response = await window.electronAPI.processMedellin(file1Path, file2Path, outputFolderPath);
                break;
            case 'bogota':
                response = await window.electronAPI.processBogota(file1Path, file2Path, outputFolderPath);
                break;
            case 'distrifarma':
                response = await window.electronAPI.processDistrifarma(file1Path, outputFolderPath);
                break;
        }
        
        loading.style.display = 'none';
        result.style.display = 'block';
        
        if (response.success) {
            result.className = 'result-section result-success';
            
            // Crear HTML con estadísticas
            let statsHTML = '';
            
            // Estadísticas de teléfonos
            let telefonosHTML = '';
            if (response.telefonosValidos !== undefined && response.telefonosTotales !== undefined) {
                const porcentajeTel = response.telefonosTotales > 0 
                    ? ((response.telefonosValidos / response.telefonosTotales) * 100).toFixed(1)
                    : 0;
                telefonosHTML = `
                    <div class="stats-box">
                        <h4>📱 Validación de Teléfonos</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">Teléfonos válidos:</span>
                                <span class="stat-value success">${response.telefonosValidos}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Total de teléfonos:</span>
                                <span class="stat-value">${response.telefonosTotales}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Teléfonos rechazados:</span>
                                <span class="stat-value error">${response.telefonosTotales - response.telefonosValidos}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Tasa de validez:</span>
                                <span class="stat-value ${porcentajeTel >= 80 ? 'success' : porcentajeTel >= 50 ? 'warning' : 'error'}">${porcentajeTel}%</span>
                            </div>
                        </div>
                        <p style="margin-top: 10px; font-size: 0.85em; color: #888;">
                            ℹ️ Solo se incluyen móviles colombianos válidos (10 dígitos, inician con 3)
                        </p>
                    </div>
                `;
            }
            
            if (currentMode !== 'distrifarma' && response.relacionados !== undefined) {
                const porcentaje = ((response.relacionados / response.totalPedidos) * 100).toFixed(1);
                statsHTML = `
                    <div class="stats-box">
                        <h4>📊 Estadísticas de Relación</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">Pedidos relacionados:</span>
                                <span class="stat-value success">${response.relacionados}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Total de pedidos:</span>
                                <span class="stat-value">${response.totalPedidos}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Pedidos sin relación:</span>
                                <span class="stat-value warning">${response.totalPedidos - response.relacionados}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Porcentaje de éxito:</span>
                                <span class="stat-value ${porcentaje >= 80 ? 'success' : porcentaje >= 50 ? 'warning' : 'error'}">${porcentaje}%</span>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // Debug info (temporal para diagnosticar)
            let debugHTML = '';
            if (response.debug) {
                const d = response.debug;
                debugHTML = `
                    <div class="stats-box" style="border-color: #ffc10740; background: #ffc10710;">
                        <h4>🔍 Debug Info (temporal)</h4>
                        <div style="font-size: 12px; font-family: monospace; line-height: 1.6;">
                            <div>Registros madre en caché: <strong>${d.registrosEnCache}</strong></div>
                            <div>Mapeos ID generados: <strong>${d.mapeosGenerados}</strong></div>
                            <div>Columnas en madre: <strong>${(d.columnasEnMadre || []).join(', ')}</strong></div>
                            <div>NITs ejemplo (ofimatic): <strong>${(d.nitsEnOfimatic || []).join(', ')}</strong></div>
                            <div>NITs ejemplo (madre): <strong>${(d.nitsEnMadre || []).join(', ')}</strong></div>
                        </div>
                    </div>
                `;
            }
            
            document.getElementById('resultContent').innerHTML = 
                '<h3>✅ ¡Proceso completado!</h3>' +
                '<p>' + response.message + '</p>' +
                statsHTML +
                telefonosHTML +
                debugHTML +
                '<p><strong>Archivo guardado en:</strong></p>' +
                '<small>' + response.outputPath + '</small>' +
                '<br><br><button onclick="resetForm()" class="reset-btn">🔄 Procesar otro archivo</button>';
            
            // Actualizar panel de caché después de procesar
            if (response.cacheInfo) {
                renderCache(response.cacheInfo);
            } else {
                loadCacheUI();
            }
        } else {
            result.className = 'result-section result-error';
            document.getElementById('resultContent').innerHTML = 
                '<h3>❌ Error</h3>' +
                '<p>' + response.error + '</p>' +
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

// Resetear formulario completo
function resetForm() {
    formContainer.style.display = 'block';
    result.style.display = 'none';
    resetFiles();
    loadCacheUI(); // Refrescar panel de caché
}

// ============================================
// MESSENGER MAPPINGS UI
// ============================================

// Abrir modal de mapeos de mensajeros
messengerMappingsBtn.addEventListener('click', async () => {
    await loadMessengerMappings();
    messengerMappingsModal.style.display = 'block';
});

// Cerrar modal
messengerMappingsClose.addEventListener('click', () => {
    messengerMappingsModal.style.display = 'none';
});

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (event) => {
    if (event.target === messengerMappingsModal) {
        messengerMappingsModal.style.display = 'none';
    }
});

// Cargar mapeos de mensajeros
async function loadMessengerMappings() {
    try {
        const mappings = await window.electronAPI.getMessengerMappings();
        renderMessengerMappings(mappings.mappings);
    } catch (error) {
        console.error('Error cargando mapeos de mensajeros:', error);
        alert('Error al cargar los mapeos de mensajeros: ' + error.message);
    }
}

// Renderizar lista de mapeos
function renderMessengerMappings(mappings) {
    messengerMappingsList.innerHTML = '';
    
    if (!mappings || mappings.length === 0) {
        messengerMappingsList.innerHTML = `
            <div class="mapping-empty">
                <span>🔍 No hay mapeos configurados</span>
                <small>Usa el botón ➕ para agregar nuevos mapeos</small>
            </div>
        `;
        return;
    }
    
    mappings.forEach((mapping, index) => {
        const div = document.createElement('div');
        div.className = 'mapping-item';
        div.innerHTML = `
            <div class="mapping-item-info">
                <div class="mapping-item-code">
                    <input type="text" class="mapping-code-input" value="${mapping.code || ''}" 
                           placeholder="Código (ej: BOGOTA08)" data-index="${index}">
                </div>
                <div class="mapping-item-arrow">→</div>
                <div class="mapping-item-name">
                    <input type="text" class="mapping-name-input" value="${mapping.name || ''}" 
                           placeholder="Nombre del mensajero" data-index="${index}">
                </div>
            </div>
            <button class="mapping-item-remove" title="Eliminar este mapeo" data-index="${index}">✕</button>
        `;
        messengerMappingsList.appendChild(div);
    });
    
    // Attach event listeners to inputs
    messengerMappingsList.querySelectorAll('.mapping-code-input, .mapping-name-input').forEach(input => {
        input.addEventListener('input', () => {
            saveMappingsBtn.disabled = false;
        });
    });
    
    // Attach remove handlers
    messengerMappingsList.querySelectorAll('.mapping-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            removeMapping(index);
        });
    });
}

// Agregar nuevo mapeo
addMappingBtn.addEventListener('click', () => {
    const currentMappings = getCurrentMappings();
    currentMappings.push({ code: '', name: '' });
    renderMessengerMappings(currentMappings);
    saveMappingsBtn.disabled = false;
});

// Eliminar mapeo
function removeMapping(index) {
    const currentMappings = getCurrentMappings();
    if (index >= 0 && index < currentMappings.length) {
        currentMappings.splice(index, 1);
        renderMessengerMappings(currentMappings);
        saveMappingsBtn.disabled = false;
    }
}

// Obtener mapeos actuales del DOM
function getCurrentMappings() {
    const mappings = [];
    const codeInputs = messengerMappingsList.querySelectorAll('.mapping-code-input');
    const nameInputs = messengerMappingsList.querySelectorAll('.mapping-name-input');
    
    for (let i = 0; i < codeInputs.length; i++) {
        const code = codeInputs[i].value.trim();
        const name = nameInputs[i].value.trim();
        
        // Solo incluir si tiene código
        if (code) {
            mappings.push({ code, name });
        }
    }
    
    return mappings;
}

// Guardar mapeos
saveMappingsBtn.addEventListener('click', async () => {
    try {
        saveMappingsBtn.disabled = true;
        saveMappingsBtn.textContent = '⏳ Guardando...';
        
        const currentMappings = getCurrentMappings();
        
        // Validar que haya al menos un mapeo
        if (currentMappings.length === 0) {
            alert('Debe haber al menos un mapeo configurado.');
            saveMappingsBtn.disabled = false;
            saveMappingsBtn.textContent = '💾 Guardar Cambios';
            return;
        }
        
        // Validar códigos únicos
        const codes = currentMappings.map(m => m.code.toUpperCase());
        const uniqueCodes = [...new Set(codes)];
        if (codes.length !== uniqueCodes.length) {
            alert('Los códigos de mensajero deben ser únicos.');
            saveMappingsBtn.disabled = false;
            saveMappingsBtn.textContent = '💾 Guardar Cambios';
            return;
        }
        
        const success = await window.electronAPI.saveMessengerMappings({ mappings: currentMappings });
        
        if (success) {
            saveMappingsBtn.textContent = '✅ Guardado';
            setTimeout(() => {
                saveMappingsBtn.textContent = '💾 Guardar Cambios';
            }, 2000);
        } else {
            alert('Error al guardar los mapeos.');
            saveMappingsBtn.disabled = false;
            saveMappingsBtn.textContent = '💾 Guardar Cambios';
        }
    } catch (error) {
        console.error('Error guardando mapeos:', error);
        alert('Error al guardar los mapeos: ' + error.message);
        saveMappingsBtn.disabled = false;
        saveMappingsBtn.textContent = '💾 Guardar Cambios';
    }
});

// Inicializar UI
modoSelector.value = currentMode;
updateModeUI();
