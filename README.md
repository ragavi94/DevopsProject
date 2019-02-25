# DevopsProject

Milestone 1: Configuration Management and Build Milestone

Team 1 

The following tasks were required to be completed in this milestone:

1. Provisioning and configuring Jenkins server on a remote VM automatically using Ansible.
2. Using a combination of Jenkins-job-builder and Ansible, automatically set up build jobs for checkbox.io and iTrust.
3. Create a test script that will start and stop the che	ckbox.io service on the server.
4. Create a githook to trigger a build when push is made to the repo.

# Contribution:

Ragavi Swarnalatha Raman -> rraman2

Swetha Seelam Lakshmi Narayanan –> sseelam2
 
Srijani Hariraman –> sharira

Harish Annamalai Palaniappan –> hpalani

# Setting up Jenkins server:
We wrote an ansible playbook to install jenkins server automatically by adding the jenkins repo key and downloading the stable version of jenkins. We also completed the setup wizard automatically using groovy script and installed the necessary plugins for jenkins.  

# Challenges faced:
We faced an issue while setting up the jenkins user and completing the set up wizard automatically. We resolved this by writing a groovy script under the jenkins_script module in ansible.  

# Creating a build job for checkbox.io and the post-build job:
We have created the build job using jenkins job builder. For building the checkbox.io we are cloning the repository into the workspace of jenkins and running the jenkins-cli.jar on this giing the appropriate jenkins credentials. 

# Challenges faced:
We were not able to build checkbox.io due to the  Anonymous read access error. We had to edit the following line <denyAnonymousReadAccess>false</denyAnonymousReadAccess> in the config.xml file under the jenkins folder.
 
# Creating a build job for iTrust and the post-build job:
We have created the build job using jenkins job builder. For building iTrust we are cloning the repository into the workspace of jenkins and running the jenkins-cli.jar on this giing the appropriate jenkins credentials.

# Challenges faced:


# Screencast Video:

