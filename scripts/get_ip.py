# Python Program to Get IP Address 
import socket 
hostname = socket.gethostname() 
IPAddr = socket.gethostbyname(hostname) 
print("Your Computer Name is:" + hostname) 
print("Your Computer IP Address is:" + IPAddr) 

from requests import get

ip = get('https://api.ipify.org').text
print('My public IP address is: {}'.format(ip))

