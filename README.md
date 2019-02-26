# DevopsProject

Milestone 1: Configuration Management and Build Milestone

Team 1 

The following tasks were required to be completed in this milestone:

1. Provisioning and configuring Jenkins server on a remote VM automatically using Ansible.
2. Using a combination of Jenkins-job-builder and Ansible, automatically set up build jobs for checkbox.io and iTrust.
3. Create a test script that will start and stop the checkbox.io service on the server.
4. Create a githook to trigger a build when push is made to the repo.

## Contribution:

Ragavi Swarnalatha Raman -> rraman2

Swetha Seelam Lakshmi Narayanan –> sseelam2
 
Srijani Hariraman –> sharira

Harish Annamalai Palaniappan –> hpalani

## Setting up the repository:
We need to setup servers for jenkins, checkbox.io and iTrust. Jenkins virtual machine is for setting up jenkins and also for running the build jobs of checkbox.io and iTrust. Checkbox.io and iTrust virtual machines are for deploying the project. We need to generate a ssh key inside the jenkins server and add it to the checkbox.io server and iTrust server.
To run this project, clone the "DevopsProject" repository into your machine and copy the milestone folder into your home directory.  </br>

Inventory files should be changed in the below two paths according to your virtual machines' configuration.
/home/swetha/DevopsProject/milestone1/ansible_scripts
/home/swetha/DevopsProject/milestone1/servers/jenkins

Run the below command to set up jenkins.
ansible-playbook jenkins.yml -i inventory --ask-vault-pass
Vault password is 12345.

## Setting up Jenkins server:
We wrote an ansible playbook to install jenkins server automatically by adding the jenkins repo key and downloading the stable version of jenkins. We also completed the setup wizard automatically using groovy script and installed the necessary plugins for jenkins.  

## Challenges faced:
We faced an issue while setting up the jenkins user and completing the set up wizard automatically. We resolved this by writing a groovy script under the jenkins_script module in ansible. Learnt about vault feature in ansible for encrypting password.

## Creating a build job for checkbox.io and the post-build job:
We have created the build job using jenkins job builder. For building the checkbox.io we are cloning the repository into the workspace of jenkins and running the jenkins-cli.jar on this giving the appropriate jenkins credentials. </br>
We have created a git hook for this process. Checkbox.io builds whenever code changes are pushed into git.</br>
Make changes in the below folder and push the code to git to see the checkbox.io build happen.</br>
/home/swetha/DevopsProject/milestone1/servers/jenkins/push_deploy/checkbox.io

## Challenges faced:
We were not able to build checkbox.io due to the  Anonymous read access error. We had to edit the following line <denyAnonymousReadAccess>false</denyAnonymousReadAccess> in the config.xml file under the jenkins folder.
 
## Creating a build job for iTrust and the post-build job:
We have created the build job using jenkins job builder. For building iTrust we are cloning the repository into the workspace of jenkins and running the jenkins-cli.jar on this giving the appropriate jenkins credentials. </br>
We have created a git hook for this process. iTrust builds whenever code changes are pushed into git.</br>
Make changes in the below folder and push the code to git to see the iTrust build happen.</br>
/home/swetha/DevopsProject/milestone1/servers/jenkins/push_deploy/iTrust

## Challenges faced:
We were not able to make the tests of iTrust pass. 

## Screencast Video:

Provisioning and configuring Jenkins server </br>
https://drive.google.com/file/d/1P6CRbilkWf46xHen8qOb3-NZgB9g_2qw/view?usp=sharing

Checkbox.io </br>
https://drive.google.com/file/d/16Oq-StbEQrrEjj_t-BK95-mLGIPsx3fp/view?usp=sharing

