#!/bin/bash
# restart the mock ledger on 8765 with a fresh class list
for p in $(pgrep -x node); do if tr '\0' ' ' < /proc/$p/cmdline | grep -q "mock_server.js 8765"; then kill $p; fi; done
sleep 0.5
cd "$(dirname "$0")/.." && (nohup node backend/mock_server.js 8765 30 > /tmp/mock.log 2>&1 &)
sleep 0.8
curl -s "http://localhost:8765/?action=setroster&key=testkey&class=10c-b&label=Math%2010C%20%C2%B7%20Block%20B&names=Ava%20Brown%0ABen%20Lee%0ARyan%20Cathcart&mode=add" >/dev/null && echo "mock ready"
