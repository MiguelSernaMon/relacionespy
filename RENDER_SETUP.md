# 🚀 Despliegue en Render - Guía Rápida

## ✅ Requisitos Cumplidos

- ✅ `requirements.txt` actualizado con pandas 2.2.3 (compatible con Python 3.13)
- ✅ `app_web.py` configurado para escuchar en 0.0.0.0 con puerto dinámico
- ✅ Código subido a GitHub en rama `develop`

## 📝 Configuración en Render (Manual)

### 1. Crear Web Service

1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. Inicia sesión con GitHub
3. Click en **"New +"** → **"Web Service"**
4. Busca y selecciona tu repositorio: `MiguelSernaMon/relacionespy`

### 2. Configuración del Servicio

**Configuración básica:**
- **Name:** `mailboxes-relacionador` (o el nombre que prefieras)
- **Region:** Oregon (US West)
- **Branch:** `develop` (o `main` si prefieres)
- **Root Directory:** (dejar vacío)
- **Environment:** Python 3
- **Build Command:** 
  ```
  pip install -r requirements.txt
  ```
- **Start Command:**
  ```
  python app_web.py
  ```

### 3. Variables de Entorno (Opcional)

En la sección "Environment":
- Click en "Add Environment Variable"
- Key: `RENDER`
- Value: `true`

### 4. Plan y Despliegue

- **Instance Type:** Free
- Click en **"Create Web Service"**

### 5. Esperar el Despliegue

- El build toma aproximadamente **3-5 minutos**
- Verás los logs en tiempo real
- Una vez completado, tu app estará disponible en:
  ```
  https://mailboxes-relacionador.onrender.com
  ```
  (o el nombre que hayas elegido)

## ⚠️ Notas Importantes

### Plan Gratuito:
- ✅ 750 horas gratis al mes
- ⚠️ El servicio se "duerme" después de 15 minutos sin uso
- ⚠️ Primera solicitud después de dormir toma ~30 segundos

### Versiones:
- **Python:** 3.13.4 (detectado automáticamente por Render)
- **pandas:** 2.2.3 (compatible con Python 3.13)
- **openpyxl:** 3.1.5

## 🔄 Actualizaciones Futuras

Cada vez que hagas `git push` a la rama configurada, Render desplegará automáticamente:

```bash
# Hacer cambios en tu código
git add .
git commit -m "Descripción de cambios"
git push origin develop  # o main
```

## 🐛 Solución de Problemas

### Build falla con error de pandas:
- ✅ Ya solucionado: usando pandas 2.2.3

### Aplicación no responde:
- El servicio puede estar dormido (espera 30 segundos)
- Verifica los logs en Render Dashboard

### Puerto incorrecto:
- ✅ Ya configurado: la app lee el puerto de `os.environ.get('PORT')`

## 📚 Recursos

- Dashboard: [dashboard.render.com](https://dashboard.render.com)
- Documentación: [docs.render.com](https://docs.render.com)
- Logs: Disponibles en el dashboard de tu servicio

## 🎯 URL Final

Tu aplicación estará disponible en:
```
https://[tu-nombre-de-servicio].onrender.com
```

¡Listo para usar! 🎉
