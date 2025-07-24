#!/bin/bash

echo "================================================================"
echo "                    FitManager360 - Despliegue Automatico"
echo "================================================================"
echo

echo "[1/6] Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker no esta instalado"
    echo "Por favor instala Docker desde: https://www.docker.com/get-started"
    exit 1
fi
echo "✅ Docker encontrado"

echo
echo "[2/6] Verificando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "❌ ERROR: Docker Compose no esta disponible"
    echo "Por favor instala Docker Compose"
    exit 1
fi
echo "✅ Docker Compose encontrado"

echo
echo "[3/6] Verificando que Docker este ejecutandose..."
if ! docker ps &> /dev/null; then
    echo "❌ ERROR: Docker no esta ejecutandose"
    echo "Por favor inicia Docker y ejecuta este script nuevamente"
    exit 1
fi
echo "✅ Docker esta ejecutandose"

echo
echo "[4/6] Deteniendo contenedores existentes..."
docker-compose down &> /dev/null
echo "✅ Contenedores detenidos"

echo
echo "[5/6] Construyendo imagenes Docker..."
echo "(Esto puede tomar varios minutos la primera vez)"
if ! docker-compose build; then
    echo "❌ ERROR: Fallo en la construccion de imagenes"
    exit 1
fi
echo "✅ Imagenes construidas exitosamente"

echo
echo "[6/6] Iniciando servicios..."
if ! docker-compose up -d; then
    echo "❌ ERROR: Fallo al iniciar servicios"
    exit 1
fi
echo "✅ Servicios iniciados"

echo
echo "================================================================"
echo "                        🎉 DESPLIEGUE COMPLETADO"
echo "================================================================"
echo
echo "🌐 Acceder a la aplicacion:"
echo "    Principal: http://localhost:8081"
echo "    Frontend:  http://localhost:3000"
echo
echo "👥 Usuarios de prueba:"
echo "    admin@fitmanager.com / password123"
echo "    entrenador@fitmanager.com / password123"
echo "    joga@fitmanager.com / password123"
echo
echo "🛠️ Comandos utiles:"
echo "    Ver logs:     docker-compose logs -f"
echo "    Ver estado:   docker-compose ps"
echo "    Detener:      docker-compose down"
echo
echo "Presiona Enter para ver los logs en tiempo real..."
read
docker-compose logs -f
