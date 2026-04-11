#!/bin/bash
INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt')
RESULTS=$(enzyme petri -p "/Users/batsirai/SweetContent" --query "$PROMPT" 2>/dev/null)
if [ $? -eq 0 ] && [ -n "$RESULTS" ]; then
  ESCAPED=$(echo "$RESULTS" | jq -Rs .)
  echo "{\"additionalContext\": $ESCAPED}"
fi
