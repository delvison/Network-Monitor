#!/bin/bash
curl -H "Content-Type: application/json" -X DELETE -d "{\"mac\":\"$1\"}" http://localhost:3000/whoshome

