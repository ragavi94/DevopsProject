const got    = require("got");
const chalk  = require('chalk');
const os     = require('os');


var config = {};
// Retrieve our api token from the environment variables.
config.token = process.env.DOTOKEN;

if( !config.token )
{
	console.log(chalk`{red.bold DOTOKEN is not defined!}`);
	console.log(`Please set your environment variables with appropriate token.`);
	console.log(chalk`{italic You may need to refresh your shell in order for your changes to take place.}`);
	process.exit(1);
}


const headers =
{
	'Content-Type':'application/json',
	Authorization: 'Bearer ' + config.token
};

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
  }


class DigitalOceanProvider
{
	constructor(sshid,dropletid,ipaddr)
	{
		this.sshid = sshid;
		this.dropletid = dropletid;
		this.ipaddr = ipaddr;
	}

	async createSSH(key)
	{

		var data = 
		{
			"name": "devopsSSH",
			"public_key": key
		};

		let response = await got.post("https://api.digitalocean.com/v2/account/keys", 
		 {
		 	headers:headers,
		 	json:true,
		 	body: data
		 }).catch( err => 
		 	console.error(chalk.red(`createSSH: ${err}`)) 
		 );
							 
		if( !response ) return;

		if( response.body.ssh_key )
		{
			//console.log(response.body.ssh_key.id)
			this.sshid = response.body.ssh_key.id;
		}

	}

	async getSSH(id)
	{

		let response = await got(`https://api.digitalocean.com/v2/account/keys/${id}`, { headers: headers, json:true })
							 .catch(err => console.error(`getSSH ${err}`));
							 
		if( !response ) return;

		if( response.body.ssh_key )
		{
			console.log(response.body.ssh_key.id)
		}

	}

	async createDroplet (dropletName, region, imageName, sshid)
	{
		if( dropletName == "" || region == "" || imageName == "" )
		{
			console.log( chalk.red("You must provide non-empty parameters for createDroplet!") );
			return;
		}

		var data = 
		{
			"name": dropletName,
			"region":region,
			"size":"2gb",
			"image":imageName,
			"ssh_keys":[sshid],
			"backups":false,
			"ipv6":false,
			"user_data":null,
			"private_networking":null
		};

		//console.log("Attempting to create: "+ JSON.stringify(data) );

		 let response = await got.post("https://api.digitalocean.com/v2/droplets", 
		 {
		 	headers:headers,
		 	json:true,
		 	body: data
		 }).catch( err => 
		 	console.error(chalk.red(`createDroplet: ${err}`)) 
		 );

		 if( !response ) return;

		 //console.log(response.statusCode);
		 //console.log(response.body);

		 if(response.statusCode == 202)
		 {
		 	//console.log(chalk.green(`Created droplet id ${response.body.droplet.id}`));
			this.dropletid = response.body.droplet.id;
		 }
	}

	async dropletInfo (id)
	{
		if( typeof id != "number" )
		{
			console.log( chalk.red("You must provide an integer id for your droplet!") );
			return;
		}

		let response = await got(`https://api.digitalocean.com/v2/droplets/${id}`, { headers: headers, json:true })
							 .catch(err => console.error(`dropletInfo ${err}`));
							 

		if( !response ) return;

		if( response.body.droplet )
		{
			let droplet = response.body.droplet;
			let nlist = droplet.networks.v4;

			for( let iter of nlist)
			{
				//console.log(`ip address of droplet: ${iter.ip_address}`)
				this.ipaddr = iter.ip_address;

			}

			// Print out IP address
		}

	}

	async deleteDroplet(id)
	{
		if( typeof id != "number" )
		{
			console.log( chalk.red("You must provide an integer id for your droplet!") );
			return;
		}

		let response = await got.delete(`https://api.digitalocean.com/v2/droplets/${id}`, { headers: headers, json:true })
							 .catch(err => console.error(`deleteDroplet ${err}`));
							 

		if( !response ) return;

		// No response body will be sent back, but the response code will indicate success.
		// Specifically, the response code will be a 204, which means that the action was successful with no returned body data.
		if(response.statusCode == 204)
		{
			console.log(`Deleted droplet ${id}`);
		}

	}

};


async function provision()
{
	let client = new DigitalOceanProvider(0,0,"");
	let client1 = new DigitalOceanProvider(0,0,"");
	let client2 = new DigitalOceanProvider(0,0,"");
	let client3 = new DigitalOceanProvider(0,0,"");
	
	
	
	//var myhost = require("os").userInfo().username;
	var myhost = process.argv.slice(2);
	var fs = require('fs');
	var public_key = fs.readFileSync(myhost+"/id_rsa.pub").toString();
	
	await client.createSSH(public_key);
	
	var ssh_id = client.sshid;
	
	//await client.getSSH(ssh_id);

	// #############################################
	// #3 Create an droplet with the specified name, region, and image
	// Comment out when completed. ONLY RUN ONCE!!!!!
	var name = "master"+os.hostname();
	var name1 = "worker1"+os.hostname();
	var name2 = "worker2"+os.hostname();
	var name3 = "worker3"+os.hostname();
	
	
	var region = "nyc3"; // Fill one in from #1
	var image = "ubuntu-16-04-x64"; // Fill one in from #2
	await client.createDroplet(name, region, image, ssh_id);
	await client1.createDroplet(name1, region, image, ssh_id);
	await client2.createDroplet(name2, region, image, ssh_id);
	await client3.createDroplet(name3, region, image, ssh_id);
	

	var dropletId = client.dropletid;
	await sleep(20000);
	var dropletId1 = client1.dropletid;
	await sleep(20000);
	var dropletId2 = client2.dropletid;
	await sleep(20000);
	var dropletId3 = client3.dropletid;
	await sleep(20000);

	
	await client.dropletInfo(dropletId);
	await client1.dropletInfo(dropletId1);
	await client2.dropletInfo(dropletId2);
	await client3.dropletInfo(dropletId3);
	
	// #############################################

	//await client.deleteDroplet(dropletId);
	console.log(client.ipaddr);
	console.log(client1.ipaddr);
	console.log(client2.ipaddr);
	console.log(client3.ipaddr);
	
}

(async () => {
	await provision();
})();

