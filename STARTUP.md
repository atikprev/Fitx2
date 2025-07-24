# 🚀 Guía de Inicio Rápido - FitManager360

## 1. Prerrequisitos
- Node.js 18+
- Docker Desktop
- Git

## 2. Instalación

### Opción A: Con Docker (Recomendado)
```bash
# 1. Instalar todas las dependencias
npm run install-all

# 2. Iniciar con Docker Compose
docker-compose up -d

# 3. Verificar que todos los servicios estén corriendo
docker-compose ps
```

### Opción B: Manual
```bash
# 1. Instalar dependencias
npm run install-all

# 2. Iniciar servicios backend
npm run start:backend

# 3. En otra terminal, iniciar frontend
npm run start:frontend
```

## 3. Acceso a la Aplicación

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **NGINX Load Balancer**: http://localhost:8081
- **MongoDB**: mongodb://localhost:27017

## 4. Primer Uso

1. **Registrar usuario**: Ve a http://localhost:3000/register
2. **Iniciar sesión**: Usa tus credenciales en http://localhost:3000/login
3. **Explorar dashboard**: Ve estadísticas y métricas
4. **Crear rutinas**: Gestiona tus entrenamientos
5. **Chatear**: Únete a salas de chat en tiempo real
6. **Actualizar perfil**: Configura tus datos personales

## 5. Comandos Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Detener todos los servicios
docker-compose down

# Reconstruir servicios
docker-compose build --no-cache

# Limpiar volúmenes
docker-compose down -v
```

## 6. Solución de Problemas

### Puerto ocupado
```bash
# Verificar puertos en uso
netstat -an | findstr :3000
netstat -an | findstr :8080
```

### Problemas de conexión
```bash
# Verificar estado de servicios
docker-compose ps

# Reiniciar servicios
docker-compose restart
```

### Base de datos
```bash
# Conectar a MongoDB
docker exec -it fitmanager360_mongodb mongo

# Ver bases de datos
show dbs
```

## 7. Estructura de Usuarios de Prueba

Una vez registrado, puedes crear múltiples usuarios para probar el chat y funcionalidades colaborativas.

## 8. Desarrollo

Para desarrollo activo:
```bash
# Modo desarrollo con hot-reload
npm run dev

# Tests
npm run test

# Logs detallados
npm run logs
```

¡Listo! Ya tienes FitManager360 funcionando 🎉
