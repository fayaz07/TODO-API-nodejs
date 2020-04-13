<!--
(#installation-and-configuration)
-->
### Installation and Configuration
---
First thing we need to do is to install **nodejs**, you can find the installation steps and archives from the official website [here](https://nodejs.org/en/). It is recommended to use the LTS version of node to avoid any kind of interruptions.

Get the installation package or archive from the official website [here](https://nodejs.org/dist/latest-v10.x/)

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
export PATH=/usr/local/node-v10.11.0-linux-x64/bin:$PATH
```

#### Mongodb installation and configuration
In case you face any issues, refer official [docs](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)

**Installing mongodb v4.2**
a. Import the public key used by the package management system.
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
```

 b. Create a list file for MongoDB
```bash
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
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
echo "mongodb-org hold" | sudo dpkg --set-selections
echo "mongodb-org-server hold" | sudo dpkg --set-selections
echo "mongodb-org-shell hold" | sudo dpkg --set-selections
echo "mongodb-org-mongos hold" | sudo dpkg --set-selections
echo "mongodb-org-tools hold" | sudo dpkg --set-selections
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
(#running-the-project)
-->
### Running the project
---

1. Install the required dependencies by the following command
```bash
npm install
```
2. Run the project
```bash
npm run dev
```


