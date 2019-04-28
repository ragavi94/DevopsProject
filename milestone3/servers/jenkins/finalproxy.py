import urllib.request as request
import random
import threading 
import time
import urllib
import sys
import http.server
import socketserver

servers = {}
PORT = 1012

class myHandler(http.server.SimpleHTTPRequestHandler):
	global servers
	def do_GET(self):
		#print(self.path)
		self.send_response(307)
		canary_down = checkCanary(servers['canary'])
		if(random.randint(1,101)>75 and not canary_down):
			url = "http://"+servers['canary']
			new_path = '%s%s'%(url,self.path)
			print("Request sent to Canary server")
		else:
			url = "http://"+servers['production']
			new_path = '%s%s'%(url,self.path)
			print("Request sent to Production server")
		self.send_header('Location',new_path)
		self.end_headers()

def checkCanary(ip):
	#print("Canary server is: ",canary_down)
	url = 'http://'+ip
	print(url)
	count = 0
	while(count<=2):
		try:
			urllib.request.urlopen(url,timeout=1)
			time.sleep(.3)
			return(False)
		except urllib.error.URLError as e:
			count+=1
			if(count==2):
				print("Canary server is down")
				count = 0
				return(True)
			time.sleep(.3)
				

f = open("checkbox_inventory")
lines = f.readlines()
#print(lines)
production = lines[-1].split()[0]
canary = lines[-2].split()[0]

servers['production']=production+':80'
servers['canary']=canary+':80'
#print(servers)

while(True):
	try:
		handler = socketserver.TCPServer(("",PORT),myHandler)
		print("Received request")
		handler.serve_forever()
		handler.server_close() 
	except KeyboardInterrupt:
        	print("Interrupted")
        	sys.exit(0)
