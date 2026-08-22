#!/bin/bash
# SessionStart hook: make LibreOffice able to open Office documents.
#
# The base image ships libreoffice-core/-common only. Without the per-format
# packages there is no Calc/Writer/Impress import filter, so soffice reports
# "source file could not be loaded" for every .xlsx/.docx/.pptx, and the
# xlsx skill's recalc.py hangs until it times out instead of failing fast.
# Installing the three packages here keeps the document skills working.
set -uo pipefail

# Web/remote sessions only; local machines are the user's own to manage.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

command -v soffice >/dev/null 2>&1 || exit 0
[ "$(id -u)" -eq 0 ] || exit 0

missing=()
for pkg in libreoffice-calc libreoffice-writer libreoffice-impress; do
  # Compare the status field, not `dpkg -s`'s exit code: a removed-but-not-purged
  # package is still "config-files" and would be reported as present.
  [ "$(dpkg-query -W -f='${db:Status-Status}' "$pkg" 2>/dev/null)" = "installed" ] \
    || missing+=("$pkg")
done
[ ${#missing[@]} -eq 0 ] && exit 0

export DEBIAN_FRONTEND=noninteractive
echo "Installing LibreOffice document filters: ${missing[*]}" >&2

if ! apt-get install -y -qq "${missing[@]}" >/dev/null 2>&1; then
  apt-get update -qq >/dev/null 2>&1
  apt-get install -y -qq "${missing[@]}" >/dev/null 2>&1 || {
    echo "LibreOffice filter install failed; .xlsx/.docx/.pptx conversion will not work." >&2
    exit 0
  }
fi

echo "LibreOffice document filters installed." >&2
exit 0
