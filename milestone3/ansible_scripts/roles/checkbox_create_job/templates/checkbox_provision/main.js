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
			"name": "checkbox_access",
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
			"size":"1gb",
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

	async dropletInfo (id,loop_i)
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
				this.ipaddr[loop_i] = iter.ip_address;
				//console.log(this.ipaddr[loop_i]);

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
	let client = new DigitalOceanProvider(0,0,[]);
	
	//var myhost = require("os").userInfo().username;
	var myhost = "vagrant";
	var fs = require('fs');
	var public_key = fs.readFileSync("/home/"+myhost+"/.ssh/io_rsa.pub").toString();
	await client.createSSH(public_key);
	
	var ssh_id = client.sshid;
	//console.log(ssh_id);
	//await client.getSSH(ssh_id);

	// #############################################
	// #3 Create an droplet with the specified name, region, and image
	// Comment out when completed. ONLY RUN ONCE!!!!!
	var loop_i = 2;
	for (loop_i=0;loop_i<2;loop_i++){
		var name = "rraman2"+"checkboxio"+"-"+loop_i;
		var region = "nyc3"; // Fill one in from #1
		var image = "ubuntu-16-04-x64"; // Fill one in from #2 
		await client.createDroplet(name, region, image, ssh_id);
		var dropletId = client.dropletid;
		//console.log(dropletId);
		await sleep(20000);
		await client.dropletInfo(dropletId,loop_i);

	}
		
	
	// #############################################

	//await client.deleteDroplet(dropletId);
	console.log(client.ipaddr.join(','));

}

(async () => {
	await provision();
})();
