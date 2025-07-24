@echo off
echo ================================================================
echo                    FitManager360 - Despliegue Automatico
echo ================================================================
echo.

echo [1/6] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Docker no esta instalado o no esta en PATH
    echo Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✅ Docker encontrado

echo.
echo [2/6] Verificando Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Docker Compose no esta disponible
    pause
    exit /b 1
)
echo ✅ Docker Compose encontrado

echo.
echo [3/6] Verificando que Docker este ejecutandose...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Docker no esta ejecutandose
    echo Por favor inicia Docker Desktop y ejecuta este script nuevamente
    pause
    exit /b 1
)
echo ✅ Docker esta ejecutandose

echo.
echo [4/6] Deteniendo contenedores existentes...
docker-compose down >nul 2>&1
echo ✅ Contenedores detenidos

echo.
echo [5/6] Construyendo imagenes Docker...
echo (Esto puede tomar varios minutos la primera vez)
docker-compose build
if %errorlevel% neq 0 (
    echo ❌ ERROR: Fallo en la construccion de imagenes
    pause
    exit /b 1
)
echo ✅ Imagenes construidas exitosamente

echo.
echo [6/6] Iniciando servicios...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ ERROR: Fallo al iniciar servicios
    pause
    exit /b 1
)
echo ✅ Servicios iniciados

echo.
echo ================================================================
echo                        🎉 DESPLIEGUE COMPLETADO
echo ================================================================
echo.
echo 🌐 Acceder a la aplicacion:
echo    Principal: http://localhost:8081
echo    Frontend:  http://localhost:3000
echo.
echo 👥 Usuarios de prueba:
echo    admin@fitmanager.com / password123
echo    entrenador@fitmanager.com / password123
echo    joga@fitmanager.com / password123
echo.
echo 🛠️ Comandos utiles:
echo    Ver logs:     docker-compose logs -f
echo    Ver estado:   docker-compose ps
echo    Detener:      docker-compose down
echo.
echo Presiona cualquier tecla para ver los logs en tiempo real...
pause >nul
docker-compose logs -f
