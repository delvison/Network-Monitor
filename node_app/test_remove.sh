#!/bin/bash
curl -H "Content-Type: application/json" -X DELETE -d "{\"mac\":\"$1\"}" http://192.168.1.50:3000/whoshome

