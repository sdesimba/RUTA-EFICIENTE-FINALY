#!/bin/bash
set -e  # Para el script si cualquier comando falla

# ─── Colores ───────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}▶${NC} $1"; }
ok()  { echo -e "${GREEN}✓${NC} $1"; }
warn(){ echo -e "${YELLOW}⚠${NC} $1"; }
err() { echo -e "${RED}✗${NC} $1"; exit 1; }

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   RutaEficiente — Mobile Build Script      ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ─── Verificaciones previas ────────────────────────────────
log "Verificando requisitos..."

command -v node >/dev/null 2>&1 || err "Node.js no encontrado"
command -v yarn >/dev/null 2>&1 || err "Yarn no encontrado"
command -v npx >/dev/null 2>&1  || err "npx no encontrado"
ok "Requisitos OK"

# ─── API URL ───────────────────────────────────────────────
if [ -z "$NEXT_PUBLIC_API_URL" ]; then
  warn "NEXT_PUBLIC_API_URL no definida."
  warn "La app mobile necesita un backend externo para generar itinerarios."
  warn "Ejemplo: export NEXT_PUBLIC_API_URL=https://tu-api.com"
  warn "Continuando con modo mock (sin IA)..."
  echo ""
fi

# ─── Backup de archivos que se van a modificar ────────────
log "Haciendo backup de configuración..."
cp next.config.js next.config.js.backup
mkdir -p .build_backup
[ -d app/api ] && cp -r app/api .build_backup/api
ok "Backup OK"

# Función de restauración por si falla algo
cleanup() {
  log "Restaurando configuración original..."
  [ -f next.config.js.backup ] && mv next.config.js.backup next.config.js
  [ -d .build_backup/api ] && cp -r .build_backup/api app/ 2>/dev/null
  rm -rf .build_backup
}
trap cleanup EXIT

# ─── Quitar API routes (no van en export estático) ─────────
log "Quitando API routes del build estático..."
rm -rf app/api
ok "API routes excluidas"

# ─── Aplicar config mobile ─────────────────────────────────
log "Aplicando configuración mobile..."
cp next.config.mobile.js next.config.js
ok "Config mobile aplicada"

# ─── Limpiar build anterior ────────────────────────────────
log "Limpiando build anterior..."
rm -rf out .next
ok "Limpieza OK"

# ─── Build estático ────────────────────────────────────────
log "Generando build estático (esto puede tardar 1-2 min)..."
NODE_ENV=production yarn build || err "El build falló. Revisa los errores arriba."
ok "Build completado → carpeta /out"

# ─── Verificar que /out existe ─────────────────────────────
[ -d "out" ] || err "La carpeta /out no se generó. El build falló silenciosamente."
INDEX_FILES=$(find out -name "index.html" | wc -l)
log "Archivos HTML generados: $INDEX_FILES"

# ─── Sync Capacitor ────────────────────────────────────────
log "Sincronizando con Capacitor Android..."
npx cap sync android || err "cap sync falló. ¿Tienes Java y Android SDK instalados?"
ok "Capacitor sync OK"

# ─── Fin ───────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✓ Build completado con éxito             ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Próximos pasos:"
echo -e "  ${YELLOW}1.${NC} npx cap open android     → abre Android Studio"
echo -e "  ${YELLOW}2.${NC} Build > Generate Signed APK"
echo -e "  ${YELLOW}3.${NC} Selecciona: Release + V1+V2 signature"
echo ""

