
Milestone3: DEPLOYMENT, FEATURE FLAGS , INFRASTRUCTURE UPGRADE AND CANARY RELEASE

DEPLOYMENT: 

We deploy Itrust and Checkbox.io into remote production servers in this component. A post receive Git hook that gets called whenever a change is pushed from the development environment, builds and tests the changes on the jenkins server. A successful build triggers a post build task that provisions and sets up itrust and checkboxio on the remote server created on Digital Ocean.

![prod](https://media.github.ncsu.edu/user/8418/files/cc828f80-6a05-11e9-9401-1a3083433096)



To run the deployment script that creates a change in the Checkbox.io and ITrust Repository, do a git push, trigger a post receive Git Hook , run Jenkins Build and tests , Provison and Deploy the Application, run the following script. 

CheckBox.io:

1. Setup Jenkins Server:

sudo ansible-playbook jenkins.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone3/ansible_scripts/vars/main.yml

2. Create Jenkins Jobs, Copy scripts:

sudo ansible-playbook checkbox.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone3/ansible_scripts/vars/main.yml

3. Deploy Checkbox.io on a Remote Server:

sudo ansible-playbook checkboxDeploy.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone3/ansible_scripts/vars/main.yml

ITrust:

1. Setup Jenkins Server:

sudo ansible-playbook jenkins.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone3/ansible_scripts/vars/main.yml

2. Create Jenkins Jobs, Copy scripts and Change Jenkins Ports to 5001:

sudo ansible-playbook itrust.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone3/ansible_scripts/vars/main.yml

3. Deploy ITrust on a Remote Production Server:

sudo ansible-playbook itrustDeploy.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone3/ansible_scripts/vars/main.yml


