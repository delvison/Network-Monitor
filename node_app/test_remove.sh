#!/bin/bash
curl -H "Content-Type: application/json" -X DELETE -d "{\"mac\":\"$1\"}" http://127.0.0.1:3000/whoshome

