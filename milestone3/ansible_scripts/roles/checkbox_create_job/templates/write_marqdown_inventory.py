import os
lines = file('/home/vagrant/deploy/checkbox_inventory', 'r').readlines()
#print lines 
del lines[-2]
#print lines
f=open('/home/vagrant/deploy/checkbox_marqdown_inventory','w+')

for l in lines:
    f.write(l)
