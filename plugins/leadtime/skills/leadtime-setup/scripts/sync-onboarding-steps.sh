#!/usr/bin/env bash
#
# sync-onboarding-steps.sh
# -------------------------
# Generates assets/onboarding-steps.json from the Gleap onboarding collection.
#
# Source of truth is the help-center collection "Leadtime Video Tutorials".
# Order, docIds, source article titles, and embedded onboarding videos come from
# the articles. skills/leadtime-setup/assets/chapter-overlay.json is the only
# manually maintained overlay for chapter, step type, and optional English title.
#
# Run this when videos or ordering change in the help center:
#   bash skills/leadtime-setup/scripts/sync-onboarding-steps.sh
#
# Requirement: Gleap API access. By default this uses the wrapper from the
# leadtime-gleap-docs skill, which handles auth and project headers. In plugin
# or CI contexts, set GLEAP_API to the available Gleap client.
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
COLL="${LEADTIME_ONBOARDING_COLLECTION:-698b07684e136f284e67cb47}"
GLEAP_API="${GLEAP_API:-$HOME/.claude/skills/leadtime-gleap-docs/scripts/gleap-api.sh}"
OVERLAY="$HERE/assets/chapter-overlay.json"
OUT="$HERE/assets/onboarding-steps.json"

if [ ! -f "$GLEAP_API" ]; then
  echo "ERROR: Gleap API wrapper not found: $GLEAP_API" >&2
  echo "Set GLEAP_API=/path/to/gleap-api.sh or install leadtime-gleap-docs." >&2
  exit 1
fi

bash "$GLEAP_API" GET "/helpcenter/collections/$COLL/articles" --raw \
| jq --slurpfile ov "$OVERLAY" '
    ($ov[0]) as $o
    | to_entries
    | map(
        .key as $i | .value as $a
        | ($a.content.de | [.. | objects? | select(.type=="youtube") | .attrs] | first) as $yt
        | ($o[($a.docId|tostring)] // {chapter:"Z",type:"learn",core:false}) as $m
        | {
            order:      ($i + 1),
            chapter:    $m.chapter,
            type:       $m.type,
            core:       ($m.core // false),
            import:     ($m.import // false),
            docId:      $a.docId,
            title:      ($m.title // $a.title.en // $a.title.de),
            videoUrl:   ($yt.src // null),
            videoStart: ($yt.start // 0),
            articleUrl: "https://help.leadtime.de/de/articles/\($a.docId)"
          }
      )
  ' > "$OUT"

echo "OK: $OUT ($(jq length "$OUT") steps, $(jq '[.[]|select(.videoUrl)]|length' "$OUT") with video)"
