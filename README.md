# matellio-network

### HL Fabric config
  

1 organization org1.matelliofabric  
1 orderer
1 peer
1 channel mychannel

## Prerequisites Installation

Let's install the required thing one by one.

For more details check this link https://hyperledger-fabric.readthedocs.io/en/release-2.2/prereqs.html

### Set Home directory (if not set already)

  

`sudo nano ~/.profile`

  

Then, add the following information to the end of your file:

  

`export HOME=/home/ubuntu`

**Replace ubuntu with username**

  

then hit **ctrl+x** then y and then enter key

  

Next, refresh your profile by running the following command:

  

`source ~/.profile`


### Install GIT

  

`sudo apt-get install git`

  

### Install Curl

  

https://curl.se/download.html

  
  

### Install jq

  

`sudo apt-get install jq`

  

#### Install docker

  

Update the apt package index and install packages to allow apt to use a repository over HTTPS:

https://docs.docker.com/engine/install/ubuntu/

  

`sudo apt-get update`

  

`sudo apt-get install ca-certificates -y`

`sudo apt-get install curl `

`sudo apt-get install gnupg `

`sudo apt-get install lsb-release`

  
  

  

##### Add Docker’s official GPG key:

  

  

`curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg`

  

  

##### Install Docker Engine

  

`

echo \

"deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \

$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

`

  

Update the apt package index, and install the latest version of Docker Engine and containerd, or go to the next step to install a specific version:

  

  

`sudo apt-get update`

  

`sudo apt-get install docker-ce docker-ce-cli containerd.io`

  

  

Verify that Docker Engine is installed correctly by running the hello-world image.

  

  

`sudo docker run hello-world`

  

#### Linux Post install steps

https://docs.docker.com/engine/install/linux-postinstall/

  

`sudo groupadd docker`

`sudo usermod -aG docker $USER`

`newgrp docker`

  

##### Installing Docker Compose

  

`sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`

  

  

Next, set the correct permissions so that the docker-compose command is executable:

  

`sudo chmod +x /usr/local/bin/docker-compose`

  

  

To verify that the installation was successful, you can run:

  

`docker-compose --version`
#### Install Go language:

  

  

This link was taken from the Go website and will redirect here before the file downloads

  

  

`curl -OL https://golang.org/dl/go1.16.7.linux-amd64.tar.gz`

  

  

To verify the integrity of the file you downloaded, run the sha256sum command and pass it to the filename as an argument:

  

  

**sha256sum go1.16.7.linux-amd64.tar.gz**

  

  

Then unzip the files

  

`sudo tar -C /usr/local -xvf go1.16.7.linux-amd64.tar.gz`

  

  

##### Setting Go Paths

  

In this step, you will set paths in your environment

  

`sudo apt-get install nano`

  

`sudo nano ~/.profile`

  

  

Then, add the following information to the end of your file:

  

`export PATH=$PATH:/usr/local/go/bin`

  

  

then hit **ctrl+x** then y and then enter key

  

Next, refresh your profile by running the following command:

  

`source ~/.profile`

  

  

After, check if you can execute go commands by running go version

  

  

`go version`

  

  

## Hyperledger Fabric Installation

  

https://hyperledger-fabric.readthedocs.io/en/release-2.2/install.html

  

`cd /home/${user}`

  

**for eg. `cd /home/ubuntu`**

  

#### Install Fabric binaries

`curl -sSL https://bit.ly/2ysbOFE | bash -s`

  

This will clone the **fabric-samples** repo. The cloned folder contains the required binaries.

  

#### Clone the repository

**Make sure to clone the repo in home directory at the same level where fabric-samples is cloned**

  

https://github.com/navpreet-debut/matellio-fabric-task

  

**Run following command one by one to setup the network**

`cd matellio-fabric-task`


#### Network Scripts

`chmod +x setup-network.sh`

`chmod +x setup-channel.sh`

`chmod +x scripts/envVar.sh`

`chmod +x scripts/set-env.sh`

`chmod +x deploy-cc.sh`

##### Deploy the network containers

`./setup-network.sh`

##### Create channel

`./setup-channel`

##### Deploy/upgrade chaincode

This will deploy the sample-chaincode. Please edit the file if you want to install any other chaincode. Set the following values as per requirement

***To upgrade the chaincode. Edit the deploy-chaincode.sh file*** 

 Increment the CC_SEQUENCE number


> export CC_SEQUENCE="1"

Save the file and follow next steps.

`./deploy-cc.sh`

##### Test chaincode 
***Make sure to install nodejs before starting the test run***

`cd sdk`

Install npm packages
`npm i `

`node app.js`


##### Check World State

Open browser http://localhost:5984/_utils/#database
Credentials 
Username: admin
Password: adminpw
