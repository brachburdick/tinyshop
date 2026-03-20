#!/usr/bin/env bash
# Eval runner for Tinyshop convention checks.
# Usage: .agent/evals/run-evals.sh [category]
# Categories: conventions, sse, contracts, all (default)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CATEGORY="${1:-all}"

echo "=== Tinyshop Eval Suite ==="
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

list_evals() {
  local dir="$1"
  local category="$2"

  if [ ! -d "$dir" ]; then
    return
  fi

  echo "## $category"
  local count=0
  for eval_file in "$dir"/*.eval.md; do
    [ -f "$eval_file" ] || continue
    count=$((count + 1))
    name=$(basename "$eval_file" .eval.md)
    desc=$(grep -m1 "^## Should:" "$eval_file" 2>/dev/null | sed 's/^## Should: //' || echo "No description")
    echo "  [$count] $name — $desc"
  done
  echo "  Total: $count eval(s)"
  echo ""
}

case "$CATEGORY" in
  conventions)
    list_evals "$SCRIPT_DIR/conventions" "Conventions"
    ;;
  sse)
    list_evals "$SCRIPT_DIR/sse" "SSE"
    ;;
  contracts)
    list_evals "$SCRIPT_DIR/contracts" "Contracts"
    ;;
  all)
    list_evals "$SCRIPT_DIR/conventions" "Conventions"
    list_evals "$SCRIPT_DIR/sse" "SSE"
    list_evals "$SCRIPT_DIR/contracts" "Contracts"
    ;;
  *)
    echo "Usage: $0 [conventions|sse|contracts|all]" >&2
    exit 1
    ;;
esac

echo "---"
echo "To run evals against an agent, integrate with your LLM testing framework."
echo "Each .eval.md contains input/expected/fail-if criteria for automated testing."
