# 🚀 Despliegue en Render

## Archivos de Configuración

Este proyecto está listo para desplegarse en Render con los siguientes archivos:

- ✅ `requirements.txt` - Dependencias de Python
- ✅ `runtime.txt` - Versión de Python (3.11.9)
- ✅ `Procfile` - Comando para iniciar la aplicación
- ✅ `render.yaml` - Configuración de Render
- ✅ `.gitignore` - Archivos que no se suben a Git

## Pasos para Desplegar

### 1. Preparar el Repositorio

```bash
# Asegúrate de estar en la rama main
git status

# Agrega todos los archivos nuevos
git add requirements.txt runtime.txt Procfile render.yaml app_web.py

# Haz commit de los cambios
git commit -m "Configuración para despliegue en Render"

# Sube los cambios a GitHub
git push origin main
```

### 2. Crear Servicio en Render

1. Ve a [render.com](https://render.com) y crea una cuenta (puedes usar GitHub)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub: `MiguelSernaMon/relacionespy`
4. Render detectará automáticamente la configuración de `render.yaml`
5. Click en **"Create Web Service"**

### 3. Configuración Automática

Render configurará automáticamente:
- ✅ Entorno: Python
- ✅ Build Command: `pip install -r requirements.txt`
- ✅ Start Command: `python app_web.py`
- ✅ Python Version: 3.11.9

### 4. Despliegue

- El despliegue inicial toma **3-5 minutos**
- Render mostrará los logs en tiempo real
- Una vez completado, recibirás una URL como: `https://mailboxes-relacionador.onrender.com`

## Variables de Entorno

El código detecta automáticamente si está en Render usando la variable `RENDER=true`:
- En **desarrollo (local)**: Abre navegador automáticamente en `localhost:8080`
- En **producción (Render)**: Escucha en `0.0.0.0` con el puerto que Render asigna

## Plan Gratuito de Render

✅ **Incluye:**
- 750 horas gratis al mes (más que suficiente)
- SSL/HTTPS automático
- Despliegue automático desde GitHub
- URL personalizada

⚠️ **Limitaciones:**
- El servicio gratuito se "duerme" después de 15 minutos de inactividad
- Primera solicitud después de dormir toma ~30 segundos en despertar

## Solución de Problemas

### Error de Build

Si falla el build, verifica:
1. `requirements.txt` tiene las versiones correctas
2. `runtime.txt` especifica Python 3.11.9
3. No hay archivos `.xlsx` siendo subidos (están en `.gitignore`)

### Error al Iniciar

Si el servicio no inicia:
1. Revisa los logs en Render Dashboard
2. Verifica que `app_web.py` esté en la raíz del proyecto
3. Confirma que el puerto se obtiene de `os.environ.get('PORT')`

## Actualizar el Servicio

Cada vez que hagas `git push` a la rama `main`, Render desplegará automáticamente:

```bash
git add .
git commit -m "Actualización del código"
git push origin main
```

## Dominios Personalizados

Con el plan gratuito puedes usar:
- URL de Render: `https://tu-app.onrender.com`
- Para dominio personalizado necesitas plan de pago

## Soporte

- Documentación: [docs.render.com](https://docs.render.com)
- Dashboard: [dashboard.render.com](https://dashboard.render.com)
