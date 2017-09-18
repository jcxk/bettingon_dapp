
module.exports = {
     contracts_directory:  "./node_modules/bettingon/contracts",
     mainnet: {
	   network_id: 1,
	   host: "localhost",
	   port: 8545,
	   gas: 4000000,
	   gasPrice: 4e9
	 },  
     networks: {
	  rinkeby: {
	    network_id: 4,
	    host: "localhost",
	    port: 8545,
	    gas: 4000000,
	    gasPrice: 20e9
	  },  
    development: {
      host: 'localhost',
      port: 8545,
      gas: 4700000,
      network_id: '*' // Match any network id
    }
  }
}
