#!/bin/bash
# Records the explainer narration with Ryan's Personal Voice. Double-click, or run:  bash "Record Narration.command"
cd "$(dirname "$0")" || exit 1
echo "Math 10C Practice — recording explainer narration"
echo
if ! xcrun --find swift >/dev/null 2>&1; then
  echo "This needs Apple's free command-line developer tools (one-time install, a few minutes)."
  echo "A window will open: click Install, wait for it to finish, then run this again."
  xcode-select --install
  read -n1 -r -p "Press any key to close."; echo; exit 1
fi
swift make_narration.swift "$@"
echo
read -n1 -r -p "Press any key to close this window."; echo
