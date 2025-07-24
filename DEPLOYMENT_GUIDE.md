# 🚀 Guía de Despliegue - FitManager360

## 📋 Requisitos Previos

### Software Requerido

- **Docker Desktop** (versión 4.0 o superior)
- **Docker Compose** (incluido con Docker Desktop)
- **Git** (opcional, para clonar el repositorio)

### Verificar Instalación

```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar que Docker esté ejecutándose
docker ps
```

## 📦 Instalación Paso a Paso

### 1. Descomprimir el Proyecto

```bash
# Descomprimir el archivo ZIP en tu directorio de trabajo
# Por ejemplo: C:\Projects\FitManager360_IIBim
```

### 2. Navegar al Directorio

```bash
cd FitManager360_IIBim
```

### 3. Construir las Imágenes Docker

```bash
# Construir todas las imágenes (primera vez)
docker-compose build
```

### 4. Ejecutar la Aplicación

```bash
# Ejecutar todos los servicios
docker-compose up -d

# Ver los logs en tiempo real (opcional)
docker-compose logs -f
```

### 5. Verificar que Todo Funcione

```bash
# Verificar estado de contenedores
docker-compose ps

# Deberías ver algo como:
# NAME                     STATUS
# fitmanager_nginx         Up
# fitmanager_frontend      Up
# fitmanager_auth_service  Up
# fitmanager_chat_service  Up
# fitmanager_routine_service Up
# fitmanager_stats_service Up
# fitmanager_mongodb       Up
```

## 🌐 Acceso a la Aplicación

### URLs Principales

- **Aplicación Principal**: http://localhost:8081
- **Frontend Directo**: http://localhost:3000
- **API Gateway**: http://localhost:8080

### Servicios Backend (para desarrollo)

- **Auth Service**: http://localhost:3001
- **Routine Service**: http://localhost:3002
- **Chat Service**: http://localhost:3003
- **Stats Service**: http://localhost:3004
- **MongoDB**: localhost:27017

## 🔧 Comandos Útiles

### Gestión de Contenedores

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Reiniciar servicios específicos
docker-compose restart frontend chat-service

# Ver logs de un servicio específico
docker-compose logs -f chat-service

# Reconstruir un servicio específico
docker-compose build frontend
docker-compose up -d frontend
```

### Solución de Problemas

```bash
# Limpiar todo y empezar de nuevo
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d

# Ver logs detallados
docker-compose logs --tail=100 [nombre-servicio]

# Entrar a un contenedor
docker-compose exec frontend sh
docker-compose exec mongodb mongosh
```

## 📊 Verificación del Sistema

### 1. Verificar Servicios

```bash
# Verificar health checks
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Routine Service
curl http://localhost:3003/health  # Chat Service
curl http://localhost:3004/health  # Stats Service
```

### 2. Verificar Base de Datos

```bash
# Entrar a MongoDB
docker-compose exec mongodb mongosh
docker-compose exec mongodb mongosh "mongodb://admin:password123@mongodb:27017/admin" #con credenciales
# Verificar bases de datos
show dbs
use fitmanager_auth
show collections
# Mostrar elementos dentro de la base de datos
db.users.find().pretty()
```

### 3. Verificar Frontend

- Abrir http://localhost:8081
- Iniciar sesión con usuario de prueba
- Verificar chat en tiempo real
- Verificar dashboard y estadísticas

## 🛠️ Desarrollo

### Estructura del Proyecto

```
FitManager360_IIBim/
├── frontend/              # React Frontend
├── backend/
│   ├── auth-service/     # Servicio de autenticación
│   ├── routine-service/  # Servicio de rutinas
│   ├── chat-service/     # Servicio de chat
│   └── stats-service/    # Servicio de estadísticas
├── docker-compose.yml    # Configuración Docker
└── nginx.conf           # Configuración NGINX
```

### Modo Desarrollo

```bash
# Para desarrollo con hot reload
docker-compose -f docker-compose.dev.yml up -d

# O ejecutar servicios individualmente
cd backend/auth-service
npm install
npm run dev
```

## 🔒 Configuración de Seguridad

### Variables de Entorno

Las siguientes variables están configuradas en `docker-compose.yml`:

- `JWT_SECRET`: Clave secreta para JWT
- `MONGODB_URI`: URI de conexión a MongoDB
- `NODE_ENV`: Entorno de ejecución

### Puertos Expuestos

- 8081: NGINX (Puerto principal)
- 3000: Frontend React
- 3001-3004: Servicios backend
- 27017: MongoDB

## 📱 Funcionalidades Disponibles

### ✅ Autenticación

- Login/Register con JWT
- Gestión de sesiones
- Protección de rutas

### ✅ Dashboard

- Resumen de entrenamientos
- Estadísticas personales
- Gráficos de progreso

### ✅ Rutinas

- Crear/editar/eliminar rutinas
- Gestión de ejercicios
- Seguimiento de progreso

### ✅ Chat en Tiempo Real

- Mensajería instantánea
- Salas de chat
- Usuarios en línea
- Notificaciones

### ✅ Estadísticas

- Métricas de rendimiento
- Historial de entrenamientos
- Análisis de progreso

## 🆘 Solución de Problemas Comunes

### Error: "Port already in use"

```bash
# Verificar qué está usando el puerto
netstat -ano | findstr :8081
# Cambiar el puerto en docker-compose.yml si es necesario
```

### Error: "Cannot connect to MongoDB"

```bash
# Reiniciar MongoDB
docker-compose restart mongodb
# Verificar logs
docker-compose logs mongodb
```

### Error: "Frontend not loading"

```bash
# Reconstruir frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Error: "Socket.io connection failed"

```bash
# Verificar chat-service
docker-compose logs chat-service
# Reiniciar si es necesario
docker-compose restart chat-service
```

## 📞 Contacto y Soporte

Para soporte técnico o dudas:

- Revisar logs: `docker-compose logs -f`
- Verificar estado: `docker-compose ps`
- Reiniciar servicios: `docker-compose restart [servicio]`

## 🎯 Próximos Pasos

1. **Accede**: http://localhost:8081
2. **Inicia sesión** con usuarios de prueba
3. **Explora** las funcionalidades
4. **Desarrolla** nuevas características

---

🚀 **¡Disfruta usando FitManager360!**
