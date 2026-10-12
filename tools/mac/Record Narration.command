#!/bin/bash
# Records the explainer narration with a Mac voice. Run:  bash "Record Narration.command" --siri   (or a voice name, e.g. "Evan (Enhanced)"; add --test to try one line)
# Everything shown in the window is also saved to narration_log.txt in this folder.
cd "$(dirname "$0")" || exit 1
LOG="narration_log.txt"
exec > >(tee "$LOG") 2>&1
echo "Math 10C Practice — recording explainer narration   ($(date))"
echo "macOS $(sw_vers -productVersion 2>/dev/null)"
echo
if ! SWIFT=$(xcrun --find swift 2>&1); then
  echo "Apple's command-line developer tools aren't ready yet:"
  echo "  $SWIFT"
  echo "A window should open: click Install, wait for it to finish, then run this again."
  xcode-select --install
  read -n1 -r -p "Press any key to close."; echo; exit 1
fi
echo "Swift: $SWIFT"
swift --version 2>&1 | head -1
echo
echo "Starting the recorder. The first run takes up to a minute to get going — please wait…"
echo
swift make_narration.swift "$@"
rc=$?
echo
echo "(finished with code $rc)"
read -n1 -r -p "Press any key to close this window."; echo
