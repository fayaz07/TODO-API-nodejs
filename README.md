<img  src="https://i.morioh.com/1f14860de0.png">
Image Source: Internet

# Todo app API with Node.js, Express.js and Mongodb

### Contents
1. [Install and configure Node.js](#installation-of-nodejs)
2. [Mongodb Installation and Configuration](#mongodb-installation-configuration)
3. [Setup and Run the Project](#setup-and-run-the-project)

<!--
(#installation-of-nodejs)
-->
### Installation of Node.js
---
First thing we need to do is to install **nodejs**, you can find the installation steps and archives from the official website [here](https://nodejs.org/en/). It is recommended to use the LTS version of node to avoid any kind of interruptions.  

Get the installation package or archive from the official website [here](https://nodejs.org/dist/v12.16.2/)

If you have downloaded the ubuntu-archive, then you might set the path. Open up your terminal and edit ```.bashrc``` file and add the below line at the end of the file.

```bash
gedit .bashrc
```
> Note: .bashrc will be located at your home directory
  

The above command will open up text-editor with ```.bashrc``` file, add the following line by replacing the path with path of your ```nodejs``` installation directory.

```bash
export PATH=<NODEJS-INSTALLATION-PATH>/bin:$PATH
```

Ex:
```bash
export PATH=/usr/local/node-v12.16.2-linux-x64/bin:$PATH
```

### Install nodejs from command line

1. Update the dependencies
```bash
sudo apt update
```

2. Install ```nodejs```
```bash
sudo apt install nodejs
```

3. Install ```npm```
```bash
sudo apt install npm
``` 

### Install specific version using CURL

1. Install ```curl```
```bash
sudo apt update
sudo apt upgrade
sudo apt install curl
```
2. Get ```nodejs``` PPA
Switch to root directory
```bash
cd ~
```

```bash
curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
```

3. Run the script under sudo:
```bash
sudo bash nodesource_setup.sh
```

4. Install nodejs
```bash
sudo apt install nodejs
```

5. In order for some npm packages to work (those that require compiling code from source, for example), you will need to install the build-essential package:
```bash
sudo apt install build-essential
```


<!-- 
(#mongodb-installation-configuration)
-->
#### Mongodb installation and configuration

In case you face any issues, refer official [docs](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)

  

**Installing mongodb v4.2**

a. Import the public key used by the package management system.

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
```
b. Create a list file for MongoDB

```bash
echo  "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
```
c. Reload local package database.

```bash
sudo apt-get update
```

d. Install the MongoDB packages

```bash
sudo apt-get install -y mongodb-org
```

e. Optional. Although you can specify any available version of MongoDB

```bash
echo  "mongodb-org hold" | sudo dpkg --set-selections
echo  "mongodb-org-server hold" | sudo dpkg --set-selections
echo  "mongodb-org-shell hold" | sudo dpkg --set-selections
echo  "mongodb-org-mongos hold" | sudo dpkg --set-selections
echo  "mongodb-org-tools hold" | sudo dpkg --set-selections
```

  

**Configure mongodb**

  

a. Create a directory to store data

```bash
sudo mkdir /data
sudo mkdir /data/db
```

b. Grant required permissions

```bash
sudo chown -R `id -un` /data/db
```

  

**Start mongodb services**

```bash
# start mongodb service
sudo service mongod start
# Check status of the service
sudo service mongod status
```

  

**Initialize MongoDB**

```bash
sudo mongod
```

The above command will start a ```MongoDB``` instance running on your local machine. I will pick a port to run the database, possibly it will be ```27017```, so your db will be hosted at

```js
mongodb://localhost:27017/
```

  

**MongoDB shell**

Here you can execute your db queries. Initialize the shell by following command

  

```bash
mongo
```

  

<!--
(#setup-and-run-the-project)
-->

### Setup and run the project
---

  

1. Install the required dependencies by the following command

```bash

npm install

```
2. Setup public & private keys for ```Access``` and ```Refresh``` tokens
Open your terminal and type the below commands to create secure private key and extracting public key from the private key.

Creating private key for access token
```bash
openssl genrsa -out private.pem 2048
```
Expected output:
```
Generating RSA private key, 2048 bit long modulus (2 primes)
....................................................+++++
.+++++
```
Extracting public key for access token
```bash
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
```
Expected output:
```
writing RSA key
```

Creating private key for refresh token
```bash
openssl genrsa -out privater.pem 2048
```
Expected output:
```
Generating RSA private key, 2048 bit long modulus (2 primes)
....................................................+++++
.+++++
```
Extracting public key for refresh token
```bash
openssl rsa -in privater.pem -outform PEM -pubout -out publicr.pem
```
Expected output:
```
writing RSA key
```

and place these 4 files inside ```keys``` directory in root of the project

For more info on openssl, click [here](https://www.openssl.org/)

3. Setup environment variables
Rename the ```.env.example``` as ```.env``` and fill up your details there. 
#### SendGrid
Create an account at SendGrid [SendGrid](https://sendgrid.com/). 
Create a new API Key [here](https://app.sendgrid.com/settings/api_keys)
Verify a sender email and use that email in the ```.env``` file, to verify click [here](https://app.sendgrid.com/settings/sender_auth/senders/new)

4. Rename ```config.js.example``` file as ```config.js``` and setup the port, mongodb database name and credentials if any in ```config.js``` file.

5. Run the project with nodemon

```bash
npm run dev
```
or Run as normal project
```bash
npm start
```
