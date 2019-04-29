
# Basic Repository Setup and Steps to Run:

1. do a git clone of the repo in your home directory,

      https://github.ncsu.edu/sseelam2/DevopsProject.git

2. cd into milestone3/servers/jenkins

3. Do baker bake to create the jenkins server with IP 192.168.33.72

4. Add your id_rsa.pub ssh key into the jenkins server. 

5. Go to ~/DevopsProject/milestone2/ansible_scripts/vars/main.yml and change the following paths to your home directory.

    itrust_dir : /home/harish/Project
    devops_milestone_dir : /home/harish
  
6. The default size of the Jenkins Server VM in the baker.yml file is 4GB. To change it, go to
          ~/DevopsProject/milestone2/servers/jenkins/baker.yml
   
7. Add your digital ocean access key to the file in the path, /DevopsProject/milestone3/ansible_scripts/access . This enables
provisioning Remote Servers on Digital Ocean.

8. Some ansible playbooks on running prompts you for values, file paths etc.

9. Ansible Vault has been used to encrypt secrets/passwords, whenever prompted, type "12345"

10. The deployment gets triggered from the Jenkins server, so all the Digital Ocean servers contain SSH Keys of the Jenkins
server. To access the Provisioned Digital Ocean servers via SSH, Login to the Jenkins server and use respective SSH keys.
(io_rsa for Checkboxio and do_rsa for ITrust).

11. All ansible scrips to be run at "~/DevopsProject/milestone2/ansible_scripts" unless mentioned specifically where to be run.


## Milestone3: DEPLOYMENT, FEATURE FLAGS , INFRASTRUCTURE UPGRADE AND CANARY RELEASE

### DEPLOYMENT: 

We deploy Itrust and Checkbox.io into remote production servers in this component. A post receive Git hook that gets called whenever a change is pushed from the development environment, builds and tests the changes on the jenkins server. A successful build triggers a post build task that provisions and sets up itrust and checkboxio on the remote server created on Digital Ocean.

![prod](https://media.github.ncsu.edu/user/8418/files/cc828f80-6a05-11e9-9401-1a3083433096)



To run the deployment script that creates a change in the Checkbox.io and ITrust Repository, do a git push, trigger a post receive Git Hook , run Jenkins Build and tests , Provison and Deploy the Application, run the following script. 


### CheckBox.io: 

1. Setup Jenkins Server:

sudo ansible-playbook jenkins.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone3/ansible_scripts/vars/main.yml


2. Create Jenkins Jobs, Copy scripts:

sudo ansible-playbook checkbox.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone3/ansible_scripts/vars/main.yml


3. Deploy Checkbox.io on a Remote Server:

sudo ansible-playbook checkboxDeploy.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone3/ansible_scripts/vars/main.yml


### ITrust:

1. Setup Jenkins Server:

sudo ansible-playbook jenkins.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone3/ansible_scripts/vars/main.yml


2. Create Jenkins Jobs, Copy scripts and Change Jenkins Ports to 5001:

sudo ansible-playbook itrust.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone3/ansible_scripts/vars/main.yml


3. Deploy ITrust on a Remote Production Server:


sudo ansible-playbook itrustDeploy.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone3/ansible_scripts/vars/main.yml


### Feature Flags for ITrust:

![feature flags](https://media.github.ncsu.edu/user/8898/files/b7f5c580-6a0c-11e9-8642-035720748aa5)


We have implemented feature flags using a configuration server in which we have installed a redis server and a redis cli. Redis is an open source in memory data structure store used as a database. We are using redis to store a key value pair. Feature flag being the key and true or false being the value. We can toggle between these feature flags and change the output as desired.

To check this feature out, 

1. SSH into the ITrust Production Server. On the vm, type 'redis-cli' to access the redis client that helps you configure the
redis confgiuration server. 

2. Login to ITrust Application as Admin and traverse to /admin/hospitals (Manage hospitals via the Main Menu). Initially, 
you should see a server 500 error because the Redis configuration is set to NIL. 

3. On the Redis Cli, type "set FeatureFlag True" and refresh the page. This should make the "Manage Hospitals" page visible now.

4. On the Redis Cli, type "set FeatureFlag False" and refresh the page. This should make the "Feature Coming Soon!" page visible now.

Hence, we see that Feature Flags and Redis DB is useful in a Production Environment to control visibility of certain Pages/features of the application being deployment. 

### INFRASTRUCTURE UPGRADE - CHECKBOX.IO:


![upgrade](https://media.github.ncsu.edu/user/8898/files/e4114680-6a0c-11e9-8d14-a62ece3c8146)

Microservices isolate functionalities of a software  into modules that helps you keep the software distributed, enables ease of testing and high availability. We use a kubernetes cluster with master and 3 worker nodes to host the microservice that converts a markdown into html.

We also modified the existing checkboxio server code to make http post calls to the kubernetes cluster's Ip and  render the markdown rather than making a local function call. The 3 worker nodes introduces high availability. Server failure on one of the worker nodes does not affect the functionality or service.

Initially we have created 4 droplets in digital ocean, in which one of them is master and the other  3 act as worker nodes.
To create the droplets on digital ocean:

cd DevopsProject/milestone3/ansible_scripts/kubernetes
sudo ansible-playbook create.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone3/ansible_scripts/vars/main.yml


To install the updates and initialize setup on master and worker nodes and to deploy the built image on worker nodes:

cd DevopsProject/milestone3/ansible_scripts/kubernetes

sudo ansible-playbook main.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone3/ansible_scripts/vars/main.yml

This script has to be run 4 times after the first task to get access to all 4 droplets.

 The required updates and kubernetes application package has been installed on the master and the slave nodes. A kubernetes cluster has been formed with the master and the 3 nodes by copying the tokens generated from the master to the worker nodes. We have a Dockerfile which runs a node script to convert the marqdown to html and this built image from the Dockerfile is pushed to the dockerhub. We create a deployment on the worker nodes using the built image on the 3 worker nodes. A HTTP request with marqdown has been sent from the checkbox deployment server to the master node. The master node acts as a load balancer and sends this to one of the 3 worker nodes, from where we obtain the http respone with the html content, that would be displayed on the page. 


Execute a script which would send the marqdown to html conversion as a http request to the load balancing IP instead of calling the marqdown.render locally.  This script returns a prompt to which we have to provide the master IP and nodeport, which is set as an environment variable in the checkbox production server.

cd DevopsProject/milestone3/ansible_scripts/

sudo ansible-playbook checkbox_marqdown.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone3/ansible_scripts/vars/main.yml

1. You should now be able to see the MArqdown getting rendered on the "researchers.html" page of Checkbox.io 
 
2. Destroy a worker VM on Digital Ocean and refresh the page. The Marqdown is still rendered demonstrating high availabiltyof the Microservice.


### SPECIAL COMPONENT - CANARY RELEASE FOR CHECKBOX.IO:

Canary releases are used when a new feature of a software are tested on production by introducing it only to a specific set of audience. We implemented canary release as a special milestone on our checkboxio application. A custom proxy server script is used to load balance the user traffic and redirect it to the Production and the canry server on a 75:25 ratio. The script also monitors rhe canary server for failure / manual shut down and redirects 100% traffic to the original production server on these cases.

![canary](https://media.github.ncsu.edu/user/8418/files/40bf3200-6a0a-11e9-996f-6a4f72bb8b30)


1. Run the CheckBox deploy script following the instructions above, to deploy Checkbox.io on Two Servers. One of which will be Canary Server. 

2. Git Clone the CheckBox Repo from here. https://github.com/sseelam2/checkbox.git

3. Run "git checkout canary"

4. Make some changes on the checkbox/public_html/index.html file. 

5. Do a git add , git commit and git push to canary by "git push origin canary".

The Git push triggers a Post receive Git hook that checks if the branch is canary, runs a script to select one among the
two Production Servers as a Canary Server and Deploys the new branch code changes on it and Restarts the server. 

6. Visit both the servers to see a difference on their features (the new addition). 

7. The proxy server that redirects between the two Production servers is present in the following path on the Jenkins Server. 

"~/DevopsProject/milestone3/ansible_scripts/roles/deploy/roles/deploy_checkbox_canary/tasks".

SSH inside the Jenkins server, cd to the mentioned path and Run the file using "sudo python3 proxy.py"
The proxy server starts on port 1012. Visit "192.168.33.72:1012" several times to see the switch between the canary and the
production servers. 

Canary Check: Destroy the Canary checkbox VM on Digital Ocean. You should now see all redirections happening to the original
Production Server.

Thus with our implementation in the final milestone, we are not only able to handle constant flow of changes to the application code, test it and deploy but also enhance the user and developer experience by introducing components like feature flags, high availability microservices and deployment strategies like canary releases.

## Screencast :

1. Deployment of Checkbox.io and Itrust Applications:

https://drive.google.com/open?id=1zBrLMEuAu3ysbQbOWbJdjdXWKTqJvV-U

2. Feature Flags for ITrust:

https://drive.google.com/open?id=1CU2cjfIrI2q7wDAcztjL_I37H42azLVV

3. Infrastructure Upgrade for Checkbox.io

https://drive.google.com/file/d/1yXLzaSQBZg9b_pTGJzTkcC7MN4im-6_j/view?usp=sharing

4. Canary Release on Checkbox.io

https://drive.google.com/open?id=19GdDPZdM71Om__f46jq2MwTvmNkmuErM










