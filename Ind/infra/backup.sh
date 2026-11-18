#!/bin/sh
set -eu
umask 077
ROOT=/opt/it-school
OUT="$ROOT/backups/database-$(date -u +%Y%m%d-%H%M%S).dump"
docker compose --project-name it-school --env-file "$ROOT/runtime.env" -f "$ROOT/current/compose.yaml" exec -T db pg_dump -U it_school -d it_school -Fc > "$OUT.tmp"
mv "$OUT.tmp" "$OUT"
# Keep the most recent 14 successful daily backups; never touch other files.
python3 - "$ROOT/backups" <<'PY'
import re, sys
from pathlib import Path
folder=Path(sys.argv[1]).resolve()
if folder!=Path('/opt/it-school/backups'): raise SystemExit('Unexpected backup directory')
files=sorted((p for p in folder.iterdir() if re.fullmatch(r'database-\d{8}-\d{6}\.dump',p.name) and p.is_file() and p.stat().st_size>0),key=lambda p:p.name,reverse=True)
for path in files[14:]: path.unlink()
PY
printf '%s\n' "$OUT"
