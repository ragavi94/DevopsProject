sudo sed -i 's/username root/username mysql-server/' "/var/lib/jenkins/workspace/{{ itrust_name }}/iTrust2-v4/iTrust2/src/main/java/db.properties.template"
sudo sed -i 's/password/password {{ mysql_password }}/' "/var/lib/jenkins/workspace/{{ itrust_name }}/iTrust2-v4/iTrust2/src/main/java/db.properties.template"
sudo sed -i 's/username/username swarna.ragz@gmail.com/' "/var/lib/jenkins/workspace/{{itrust_name}}/iTrust2-v4/iTrust2/src/main/java/email.properties.template"
sudo sed -i 's/password/password Ramswar3151\&/' "/var/lib/jenkins/workspace/{{itrust_name}}/iTrust2-v4/iTrust2/src/main/java/email.properties.template"
cd /var/lib/jenkins/workspace/itrust_job/iTrust2-v4/iTrust2/src/main/java
cp /var/lib/jenkins/workspace/{{itrust_name}}/iTrust2-v4/iTrust2/src/main/java/db.properties.template /var/lib/jenkins/workspace/{{itrust_name}}/iTrust2-v4/iTrust2/src/main/java/db.properties
cp /var/lib/jenkins/workspace/{{itrust_name}}/iTrust2-v4/iTrust2/src/main/java/email.properties.template /var/lib/jenkins/workspace/{{itrust_name}}/iTrust2-v4/iTrust2/src/main/java/email.properties
         
