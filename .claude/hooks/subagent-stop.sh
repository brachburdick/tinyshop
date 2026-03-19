#!/usr/bin/env bash
# SubagentStop hook: Verify session summary exists before allowing subagent completion.
#
# This hook reads the subagent's output to find the expected session summary path.
# If the file does not exist, it blocks completion with an error message.
#
# Expected environment:
#   CLAUDE_SUBAGENT_OUTPUT — the subagent's final output text
#   CLAUDE_SUBAGENT_NAME   — the subagent's role name

set -euo pipefail

# Extract session summary path from subagent output
# Look for the pattern: "Session summary written to `path`"
SUMMARY_PATH=$(echo "${CLAUDE_SUBAGENT_OUTPUT:-}" | grep -oP '(?<=Session summary written to `)[^`]+' | head -1)

if [ -z "$SUMMARY_PATH" ]; then
  echo "BLOCK: Subagent did not declare a session summary path. Expected: 'Session summary written to \`path\`'" >&2
  exit 1
fi

if [ ! -f "$SUMMARY_PATH" ]; then
  echo "BLOCK: Session summary not found at declared path: $SUMMARY_PATH" >&2
  exit 1
fi

echo "OK: Session summary exists at $SUMMARY_PATH"
exit 0
