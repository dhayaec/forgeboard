#!/usr/bin/env bash
# =============================================================================
# Release script — builds, tags, and optionally deploys ForgeBoard.
#
# Usage:
#   ./scripts/release.sh              # dry-run (default)
#   ./scripts/release.sh --dry-run   # explicit dry-run
#   ./scripts/release.sh --push     # tag + build + push images
#   ./scripts/release.sh --push --no-build  # tag only (already built)
#
# Prerequisites:
#   - pnpm installed
#   - docker installed (for --push)
#   - logged into container registry (for --push)
# =============================================================================

set -euo pipefail

DRY_RUN=true
PUSH=false
NO_BUILD=false

while ((${#})); do
  case "$1" in
    --push)    DRY_RUN=false; PUSH=true; shift ;;
    --dry-run) DRY_RUN=true;  shift ;;
    --no-build) NO_BUILD=true; shift ;;
    *)         echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

log()  { printf "${GREEN}[release]${NC} %s\n" "$*"; }
warn() { printf "${YELLOW}[release] WARNING:${NC} %s\n" "$*"; }
die()  { printf "${RED}[release] ERROR:${NC} %s\n" "$*"; exit 1; }

# ── Guards ────────────────────────────────────────────────────────────────────
command -v pnpm >/dev/null 2>&1 || die "pnpm not found — install first: https://pnpm.io/installation"

# ── Parse version from package.json ──────────────────────────────────────────
PKG_VERSION=$(node -e "console.log(require('./package.json').version)")
log "Current version: $PKG_VERSION"

# ── Prompt for next version ──────────────────────────────────────────────────
read -rp "Next version [current: $PKG_VERSION] (leave blank to keep current): " NEXT_VERSION
NEXT_VERSION=${NEXT_VERSION:-$PKG_VERSION}

if [[ "$NEXT_VERSION" != "$PKG_VERSION" ]]; then
  log "Updating version in package.json: $PKG_VERSION → $NEXT_VERSION"
  if $DRY_RUN; then
    warn "[dry-run] Would update package.json version to $NEXT_VERSION"
  else
    node -e "const p=require('./package.json'); p.version='$NEXT_VERSION'; require('fs').writeFileSync('package.json', JSON.stringify(p, null, 2)+'\n');"
  fi
fi

# ── Generate changelog entry ─────────────────────────────────────────────────
log "Changelog entry:"
git log --oneline --since="$(git log -1 --format=%ci HEAD~1 2>/dev/null || echo '1970-01-01')" --until=HEAD -- . | \
  sed 's/^[0-9a-f]* //' | \
  while read -r line; do
    printf "  • %s\n" "$line"
  done

# ── Build ─────────────────────────────────────────────────────────────────────
if ! $NO_BUILD; then
  log "Building..."
  if $DRY_RUN; then
    warn "[dry-run] Would run: pnpm build"
  else
    pnpm build || die "Build failed"
    log "Build complete."
  fi
else
  warn "Skipping build (--no-build)"
fi

# ── Tag ───────────────────────────────────────────────────────────────────────
TAG="v$NEXT_VERSION"
log "Git tag: $TAG"
if $DRY_RUN; then
  warn "[dry-run] Would tag: git tag $TAG && git push origin $TAG"
else
  git tag "$TAG" && git push origin "$TAG"
  log "Pushed tag $TAG"
fi

# ── Docker push ───────────────────────────────────────────────────────────────
if $PUSH; then
  if ! command -v docker >/dev/null 2>&1; then
    warn "Docker not found — skipping image push"
  else
    log "Tagging Docker image..."
    if $DRY_RUN; then
      warn "[dry-run] Would tag + push: docker tag forgeboard:$PKG_VERSION registry.example.com/forgeboard:$TAG"
    else
      docker tag "forgeboard:$PKG_VERSION" "registry.example.com/forgeboard:$TAG" 2>/dev/null || true
      docker push "registry.example.com/forgeboard:$TAG"
      log "Image pushed."
    fi
  fi
fi

# ── Done ──────────────────────────────────────────────────────────────────────
if $DRY_RUN; then
  warn "Dry run complete — re-run with --push to apply"
else
  log "Release $TAG complete."
fi
