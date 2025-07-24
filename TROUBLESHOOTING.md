# 🔧 Solución de Problemas - FitManager360

## Problemas Comunes y Soluciones

### 1. Error de Puerto 80 en NGINX

**Error**: `ports are not available: exposing port TCP 0.0.0.0:80`

**Causa**: El puerto 80 está siendo usado por IIS o World Wide Web Publishing Service en Windows.

**Solución**:
```bash
# 1. Detener servicios
docker-compose down

# 2. El puerto de NGINX ya está cambiado a 8081
# Verificar en docker-compose.yml que nginx use "8081:80"

# 3. Reiniciar servicios
docker-compose up -d
```

### 2. API Gateway se Reinicia Constantemente

**Síntomas**: El contenedor `fitmanager_api_gateway` se reinicia repetidamente.

**Solución**:
```bash
# Verificar logs
docker-compose logs -f api-gateway

# Posibles causas:
# - Servicios backend no están listos
# - Problemas de conectividad con MongoDB
# - Variables de entorno incorrectas
```

### 3. Error de Conexión a MongoDB

**Error**: `MongoNetworkError: failed to connect to server`

**Solución**:
```bash
# Verificar que MongoDB esté corriendo
docker-compose ps mongodb

# Reiniciar MongoDB
docker-compose restart mongodb

# Si persiste, reconstruir
docker-compose down -v
docker-compose up -d
```

### 4. Frontend No Carga

**Error**: `ERR_CONNECTION_REFUSED` en http://localhost:3000

**Solución**:
```bash
# Verificar logs del frontend
docker-compose logs -f frontend

# Verificar que el puerto 3000 esté libre
netstat -an | findstr :3000

# Reiniciar el frontend
docker-compose restart frontend
```

### 5. Error de Autenticación JWT

**Error**: `401 Unauthorized` o `Token expired`

**Solución**:
```bash
# Verificar que el auth-service esté corriendo
docker-compose ps auth-service

# Limpiar localStorage en el navegador
# F12 > Application > Storage > Local Storage > Clear All

# Reiniciar auth-service
docker-compose restart auth-service
```

### 6. Chat en Tiempo Real No Funciona

**Problema**: Los mensajes no se envían/reciben en tiempo real.

**Solución**:
```bash
# Verificar chat-service
docker-compose ps chat-service

# Verificar logs de WebSocket
docker-compose logs -f chat-service

# Verificar API Gateway (maneja WebSocket)
docker-compose logs -f api-gateway
```

### 7. Error de Permisos en Windows

**Error**: `Access denied` o `Permission denied`

**Solución**:
```bash
# Ejecutar PowerShell como Administrador
# Verificar que Docker Desktop esté corriendo

# Reiniciar Docker Desktop
# Reiniciar servicios
docker-compose down
docker-compose up -d
```

### 8. Servicios No Construyen

**Error**: `failed to build` o `unable to prepare context`

**Solución**:
```bash
# Limpiar caché de Docker
docker system prune -a

# Reconstruir sin caché
docker-compose build --no-cache

# Iniciar servicios
docker-compose up -d
```

### 9. Base de Datos Corrupta

**Problema**: Errores de datos o schemas inconsistentes.

**Solución**:
```bash
# ADVERTENCIA: Esto eliminará todos los datos
docker-compose down -v

# Eliminar volúmenes
docker volume prune

# Reiniciar limpio
docker-compose up -d
```

### 10. Error de Memoria Insuficiente

**Error**: `JavaScript heap out of memory`

**Solución**:
```bash
# Aumentar memoria disponible para Node.js
# Editar docker-compose.yml y agregar:
# environment:
#   - NODE_OPTIONS=--max-old-space-size=4096

# Reiniciar servicios
docker-compose down
docker-compose up -d
```

## Comandos de Diagnóstico

### Verificar Estado General
```bash
docker-compose ps
docker-compose logs --tail=50
```

### Verificar Conectividad
```bash
# Probar API Gateway
curl http://localhost:8080/health

# Probar servicios individuales
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # Routines
curl http://localhost:3003/health  # Chat
curl http://localhost:3004/health  # Stats
```

### Verificar Puertos
```bash
# Windows
netstat -an | findstr :3000
netstat -an | findstr :8080
netstat -an | findstr :8081

# Verificar todos los puertos de la aplicación
netstat -an | findstr "3000\|3001\|3002\|3003\|3004\|8080\|8081\|27017"
```

### Limpiar Todo (Restart Completo)
```bash
# Detener todo
docker-compose down -v

# Limpiar sistema Docker
docker system prune -a

# Reconstruir
docker-compose build --no-cache

# Iniciar limpio
docker-compose up -d
```

## Logs Útiles

### Ver Logs en Tiempo Real
```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f frontend
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
```

### Filtrar Logs por Errores
```bash
docker-compose logs 2>&1 | findstr "ERROR\|Error\|error"
```

## Contacto de Soporte

Si el problema persiste después de intentar estas soluciones:

1. **Documentar el error**: Capturar screenshots y logs
2. **Verificar versiones**: Node.js, Docker, sistema operativo
3. **Consultar documentación**: README.md y códigos de error
4. **Revisar issues**: GitHub issues para problemas similares

### Información del Sistema
```bash
node --version
docker --version
docker-compose --version
```

¡Mantén esta guía a mano para resolver problemas rápidamente! 🚀
