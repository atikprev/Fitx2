# FitManager360 - Plataforma Integral para Gimnasios

FitManager360 es una plataforma completa de gestión de gimnasios desarrollada con arquitectura de microservicios. Incluye autenticación, gestión de rutinas, chat en tiempo real, estadísticas y un dashboard administrativo.

## 🎯 Descripción
Aplicación web con arquitectura de microservicios para la gestión integral de gimnasios, donde los usuarios pueden:
- ✅ Llevar seguimiento de entrenamientos y dietas
- ✅ Comunicarse en tiempo real con otros usuarios
- ✅ Ver estadísticas de progreso personal
- ✅ Gestionar rutinas de ejercicios (CRUD)
- ✅ Administrar perfil con métricas corporales (IMC, peso, altura)
- ✅ Crear y unirse a salas de chat
- ✅ Visualizar dashboard con gráficos y estadísticas

## 🏗️ Arquitectura de Microservicios

### Frontend
- **React** con Socket.io para comunicación en tiempo real
- **Dashboard** con resumen de entrenamientos y progreso
- **Gestión de rutinas** con operaciones CRUD

### Backend (Microservicios)
- **API Gateway** - Punto de entrada único y enrutamiento
- **Auth Service** - Autenticación y autorización con JWT
- **Routine Service** - Gestión de rutinas de ejercicios
- **Chat Service** - Chat en tiempo real con WebSocket
- **Stats Service** - Estadísticas y métricas de progreso

### Patrones Implementados
- ✅ **API Gateway** - Enrutamiento centralizado
- ✅ **Service Discovery** - Descubrimiento automático de servicios
- ✅ **Circuit Breaker** - Tolerancia a fallos
- ✅ **Event Sourcing** - Registro de eventos

### Tecnologías
- **Frontend**: React, Socket.io, Axios
- **Backend**: Node.js, Express.js, Socket.io
- **Base de Datos**: MongoDB
- **Containerización**: Docker & Docker Compose
- **Seguridad**: JWT, bcrypt
- **Gateway**: NGINX (reverse proxy)

## 🚀 Instalación y Ejecución

### Requisitos Previos
- Node.js 18+
- Docker & Docker Compose
- MongoDB (incluido en Docker)

### Instalación
```bash
# Instalar dependencias de todos los servicios
npm run install-all

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar en producción
npm start
```

### Puertos
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Auth Service: http://localhost:3001
- Routine Service: http://localhost:3002
- Chat Service: http://localhost:3003
- Stats Service: http://localhost:3004
- MongoDB: mongodb://localhost:27017

## 📁 Estructura del Proyecto

```
FitManager360/
├── frontend/                 # React App
├── backend/
│   ├── api-gateway/         # API Gateway
│   ├── auth-service/        # Servicio de Autenticación
│   ├── routine-service/     # Servicio de Rutinas
│   ├── chat-service/        # Servicio de Chat
│   └── stats-service/       # Servicio de Estadísticas
├── docker-compose.yml       # Configuración Docker
├── nginx.conf              # Configuración NGINX
└── README.md
```

## 🔐 Seguridad
- **JWT Tokens** para autenticación
- **Bcrypt** para hash de contraseñas
- **CORS** configurado correctamente
- **Rate limiting** en API Gateway
- **Input validation** en todos los servicios

## 📊 Funcionalidades

### Usuario
- ✅ Login/Registro/Recuperación de contraseña
- ✅ CRUD de rutinas de ejercicios
- ✅ Dashboard con resumen de entrenamientos
- ✅ Progreso físico (peso, medidas)
- ✅ Chat en tiempo real

### Microservicios
- ✅ Separación por dominio de negocio
- ✅ Base de datos independiente por servicio
- ✅ Comunicación via REST API y WebSocket
- ✅ Tolerancia a fallos y recuperación

## 🐳 Docker
Todos los servicios están containerizados y orquestados con Docker Compose para fácil despliegue local y en la nube.

## 🧪 Testing
```bash
# Ejecutar tests
npm test
```

## 📝 Contribuir
1. Fork el proyecto
2. Crear feature branch
3. Commit cambios
4. Push al branch
5. Crear Pull Request
