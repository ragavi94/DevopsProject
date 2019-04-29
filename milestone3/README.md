
Milestone3: DEPLOYMENT, FEATURE FLAGS , INFRASTRUCTURE UPGRADE AND CANARY RELEASE

DEPLOYMENT: 

We deploy Itrust and Checkbox.io into remote production servers in this component. A post receive Git hook that gets called whenever a change is pushed from the development environment, builds and tests the changes on the jenkins server. A successful build triggers a post build task that provisions and sets up itrust and checkboxio on the remote server created on Digital Ocean.

