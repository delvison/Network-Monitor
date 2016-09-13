#!/usr/bin/env python2.7

import time
import datetime
import os
import sys
import select
import subprocess
import json
from pprint import pprint
from scapy.all import *
# from twilio.rest import TwilioRestClient

OKGREEN = '\033[92m'
FAIL = '\033[91m'
ENDC = '\033[0m'
ERROR = FAIL+"ERROR: "+ENDC
OKBLUE = '\033[94m'

connected = {}
mac_defs = {}
checking = False

def get_lan_ip():
  """
  Gets the current LAN's IP by connecting to google and extracting the IP from
  the socket.
  """
  s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
  s.connect(("google.com", 80))
  ip = s.getsockname()
  s.close()
  return ip[0]

def get_gateway_ip(gateway_ip=None):
  # Gets the gateway ip. Returns [gateway_ip, ip_range]
  myip = get_lan_ip()
  ip_list = myip.split('.')
  del ip_list[-1]
  ip_list.append('*')
  ip_range = '.'.join(ip_list)
  del ip_list[-1]
  ip_list.append('1')# assumed default gateway is "XXX.XXX.XXX.1"
  if gateway_ip is not None:
    # print "Gateway IP provided as "+gateway_ip
    return [gateway_ip, ip_range]
  else:
    # print "Gateway IP provided as "+'.'.join(ip_list)
    return ['.'.join(ip_list), ip_range]

def get_ip_macs(ips):
  """
  Returns a list of tupples containing the (ip, mac address)
  of all of the computers on the network
  """
  answers, uans = arping(ips, verbose=0)
  res = []
  for answer in answers:
    mac = answer[1].hwsrc
    ip  = answer[1].psrc
    res.append((ip, mac))
    # res.append(specific_target)
  return res

def load_macs(filename):
    """
    Loads devics and their corresponding MAC addresses from a given json file
    """
    global mac_defs
    with open(filename) as data_file:
        data = json.load(data_file)
    for each in data:
        mac_defs[each['MAC'].lower()] = each['device']

def check_connected(gateway_ip,ip_range):
    global mac_defs, connected,checking
    devices = get_ip_macs(ip_range)
    subprocess.call('clear', shell=True) # clear the shell
    i = 0
    for device in devices:
       if device[1] in mac_defs.keys():
           print '%s)\t%s\t%s\t%s%s' % (i, device[0],device[1],mac_defs[device[1]],ENDC)
           if device[1] not in connected.keys():
# notify
               if checking:
                   print OKGREEN+mac_defs[device[1]] + " just connected!"+ENDC
                   os.system('aplay blip.wav -R 1')
                   say = "espeak \""+mac_defs[device[1]]+"\" "
                   os.system(say)
           connected[device[1]] = datetime.datetime.now()
       else:
           print '%s)\t%s\t%s' % (i, device[0], device[1] )
           os.system("espeak \"foreign device detected\"")

      # See if we have the gateway MAC
       # if device[0] == gateway_ip:
       #   gateway_mac = device[1]
       i+=1
    checking =True

def stalk_loop():
    while True:
        gateway_ip, ip_range = get_gateway_ip()
        check_connected(gateway_ip, ip_range)
        time.sleep(5)
        check_for_disconnections()

def check_for_disconnections():
    global connected, mac_defs
    to_be_removed = []
    for each in connected:
        diff = datetime.datetime.now() - connected[each]
        diff = diff.total_seconds()
        print(OKBLUE +"%20s%20s"+ENDC) % (mac_defs[each], str(diff))
        if diff >= 600:
            to_be_removed.append(each)
    for each in to_be_removed:
        connected.pop(each)
        print FAIL+mac_defs[each] +" disconnected "+ENDC

# def send_text(msg):
#     client = TwilioRestClient()
#     client.messages.create(from_='+16313537388',
#                        to='+15162590083',
#                        body=msg)

if __name__=="__main__":
    load_macs('mac_addresses.json')
    stalk_loop()
