#!/bin/zsh
# =====================================================================
# qa/shots.sh — מייצר צילומי מסך מהפרוטוטיפ החי דרך index.html
#   שימוש:  ./qa/shots.sh <תיקיית-יעד> [שם-צילום ...]
#   בלי שמות — מצלם את כל מה שרשום ב-qa/shot-boot.js
# הסקריפט מחזיר את js/main.js למצבו המקורי גם אם משהו נכשל.
# =====================================================================
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:?צריך תיקיית יעד}"; shift || true
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BAK="$(mktemp -t hkmain)"
W=${SHOT_W:-1680}; H=${SHOT_H:-1050}

mkdir -p "$OUT"
cp "$ROOT/js/main.js" "$BAK"
cleanup(){ cp "$BAK" "$ROOT/js/main.js"; rm -f "$BAK"; }
trap cleanup EXIT INT TERM

# הזרקת הבוטסטרפ
{ echo; echo "/* --- זמני: צינור הצילומים --- */"; cat "$ROOT/qa/shot-boot.js"; } >> "$ROOT/js/main.js"

if [ "$#" -gt 0 ]; then
  KEYS=("$@")
else
  KEYS=($(grep -oE "^    '[a-z0-9-]+'" "$ROOT/qa/shot-boot.js" | tr -d " '"))
fi

ok=0; bad=0
for k in $KEYS; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --incognito \
    --window-size=$W,$H --virtual-time-budget=17000 \
    --screenshot="$OUT/$k.png" "file://$ROOT/index.html?shot=$k" >/dev/null 2>&1
  if [ -s "$OUT/$k.png" ]; then
    sz=$(stat -f%z "$OUT/$k.png")
    if [ "$sz" -gt 25000 ]; then printf '  ✓ %-16s %6s KB\n' "$k" $((sz/1024)); ok=$((ok+1))
    else printf '  ⚠ %-16s ריק? %s B\n' "$k" "$sz"; bad=$((bad+1)); fi
  else
    printf '  ✗ %-16s נכשל\n' "$k"; bad=$((bad+1))
  fi
done
echo "— $ok הצליחו · $bad דורשים בדיקה — $OUT"
