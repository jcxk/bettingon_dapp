import BaseContractManager from './baseContractManager';


const contractBasePath = '../../../build/contracts/';

class PriceUpdater extends BaseContractManager {

  constructor (web3, opts = {}) {
    let contractName = 'PriceUpdater';
    if (opts.env === 'development') {
       opts['json'] = require("../../build/contracts/"+contractName+".json");
    } else {
      opts['address'] = mainNetAddress;
    }
    opts['config'] = [];
    super(web3, opts);
    this.account="";
  }


}

export default PriceUpdater;

