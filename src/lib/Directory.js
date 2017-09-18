import BaseContractManager from './baseContractManager';


class Directory extends BaseContractManager {

  constructor (web3, opts = {}) {
    if (opts.env === 'development') {
       opts['json'] = require("dappcontracts/Directory.json");
    }
    opts['config'] = [];
    super(web3, opts);

  }

  async setName(newName){
    let opts = this.getOptions();
    console.log(opts);
    return await this.doTransaction(
      this.contract.setName(newName, this.getOptions())
    )

  }

}

export default Directory;

