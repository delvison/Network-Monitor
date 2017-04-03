

  Network Monitor
  ===============

  ### About

  I live in a house with a lot of people. I always thought to myself how nice it would be to know who is home while I'm at home or away. I thought to myself that a good method of indicating who is home would be checking who's phone is connected to the wifi. To solve this problem I wrote a python script that uses ARP to detect what devices are on the same network. Of course, this first had me map out all of the MAC addresses of the devices in my home to determine what device belongs to what person. At first I made the script play a noise and speak out the name of the device every time a new device would connect to the network. As you can imagine, it did not take long before it proved to be an annoyance. As a result, I thought it more intuitive to build a web application that can simply display to me who is home and who is not. Thus, I built a nodejs application that incorporates an API which the python script can broadcast to. The nodejs application then uses redis to store the information locally. By using websockets between the nodejs server app and the view, i can also live update the page. As a result, I can now leave this page open at all times on my machine and know at any time what devices are connected to the network :)

  ![](./resources/sample.png)
  ### Python Script

  The main python script is called check_connections.py. It uses ARP to determine who is on the same network. The usage is as follows:


    usage: check_connections.py [-h] [-g G] [-f F] [-e E]

    optional arguments:
      -h, --help  show this help message and exit
      -g G        specify a gateway. default gateway will be 192.168.1.1
      -f F        specify a JSON file with device names and their corresponding
                  MAC addresses. Format should be [{"device": "some device",
                  "MAC":"some mac"}]. default will be mac_addresses.json
      -e E        specify a text file containing MAC addresses to exclude from
                  monitoring. text file must have one MAC address per line.
                  default file will be blacklist.txt


  #### mac_addresses.json
  Please note that the script will attempt to read a JSON file (mac_addresses.json) that contains the mac addresses and aliases of the devices on your network. It's format should be as follows:


    [
      {
        "device": "Bruce Wayne's Phone",
        "MAC": "24:DA:9B:5B:74:F0"
      }, {
        "device": "Spike Spigel's Phone",
        "MAC": "00:16:cf:af:75:e8"
      }
    ]


  #### blacklist.txt
  I implemented a blacklist feature to keep from monitoring undesired devices on the network such as a chromecast or router, etc. A blacklist file should be a plain textfile with a MAC address on each line like so:


    24:DA:9B:5B:74:F0
    00:16:cf:af:75:e8
