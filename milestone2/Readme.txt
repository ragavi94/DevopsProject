DevopsProject

Milestone 2: Test + Analysis

Team 1

ITrust Git Repo:  https://github.com/sseelam2/iTrust2-v4.git

Checkbox Git Repo:  https://github.com/sseelam2/checkbox.io.git

The following tasks were required to be completed in this milestone:

1. Added coverage support to jenkins using the Jacoco plugin to display a coverage trend report after each commit.

2. Developed a tool that automatically commits new random changes to source code which will trigger a build and run of the test suite. A fuzzer.js file takes care of the 
changing the values in the src files/ mutation etc and finally does a commit to the branch fuzzer of the iTrust repo, and calls a jenkins build.

3. Test prioritization analysis:

All reports generated using each build is stored in the jenkins server at the /home/vagrant folder and organized based on job run date and time. A node js file that parses these
reports and does prioritization based on time to execute and number of failed tests has been written. 

4. Analysis : (To be written)

iTrust

Checkbox


Contribution:

Ragavi Swarnalatha Raman -> rraman2 and Swetha Seelam Lakshmi Narayanan –> sseelam2 

Worked on Jenkins coverage support , fuzzer test files and Test prioritization

Srijani Hariraman –> sharira and Harish Annamalai Palaniappan –> hpalani

Worked on the analysis of iTrust and Checkbox by extending the build jobs to do static analysis on the source code with Custom metrics.

 
Setting up the repository and Jenkins server:

1. do a git clone of the repo in your home directory

https://github.ncsu.edu/sseelam2/DevopsProject.git

2. cd into milestone2/servers/jenkins

3. Do baker bake to create the jenkins server with IP 192.168.33.72

4. Add your id_rsa.pub ssh key into the jenkins server. 

You should now be able to run the ansible playbooks. You might want to stop the jenkins server vm, increase the RAM size and run it again if the build 
seems to get stuck.We noticed it was mostly due to memory issues.

Run Ansible Playbooks:

We ve consolidated all variables across diffrent roles into a single vars file in the root directory. All secrets have been
encrypted using Ansible Vault.

To Run the Jenkins Setup:

ansible-playbook jenkins.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone2/ansible_scripts/vars/main.yml

To Run the Checkbox Setup and Static Analysis: (Builds to be seen at 192.168.33.72:8080)

ansible-playbook checkbox.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone2/ansible_scripts/vars/main.yml

To Run the Checkbox Setup and Analysis: (Builds to be seen at 192.168.33.72:5001)


ansible-playbook itrust.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone2/ansible_scripts/vars/main.yml


To Run the ITrust Job to call pre-push trigget, run fuzzer, make random changes based on fuzzer file and commit them to remote 
ITrust Fuzzer Branch, follwed by Test Suite runs, Jacoco Coverage and Test Prioritization on the reports.

sudo ansible-playbook fuzzer_tests.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone2/ansible_scripts/vars/main.yml

See reports at /home/vagrant/report.txt on the jenkins server (192.168.33.72)

To run a static analysis on ITrust source code using the checkstyle plugin, report warnings and errors. Make changes on pom.xml 
to change attributes like "failsOnViolation"/"failsOnError" and see the build failure.

ansible-playbook itrust_build_coverage.yml -i inventory --ask-vault-pass -e @~/DevopsProject/milestone2/ansible_scripts/vars/main.yml

See all checkstyle reports at /var/lib/jenkins/workspace/itrust_job/iTrust2-v4/iTrust2/target/checkstyle-result.xml in the 
jenkins server (192.168.33.72)


Challenges faced: 

As mentioned, the build job seemed to get stuck midway when the itrust test suite ran. We discovered that it was due to memory issues as a vagrant vm gets issued only 
1 GB of RAM initially. We stopped the job, increased the RAM to 4 GB or greater and ran the playbook again and the problem got solved.

add 
1. change /home/harish in vars
2. ram size of vm in baker.yml









Screencast:

Coverage Support for Jenkins, Fuzzer and Test Prioritization:

https://drive.google.com/file/d/1gLvFTmHrfLtir00OufavASlMZzO7GdnI/view?usp=sharing

Analysis - ITrust using Checkstyle:

https://drive.google.com/file/d/1P11qojmGdPpp2D-x3TEhIyrypgrDm_dI/view?usp=sharing

Analysis - Checkbox







 

