var BettingonUITestDeploy = artifacts.require("./BettingonUITestDeploy.sol");

//rinkeby oraclize "0x146500cfd35B22E4A392Fe0aDc06De1a1368Ed48",

module.exports = function(deployer) {

    deployer.deploy(
        BettingonUITestDeploy,
        "0x6f485c8bf6fc43ea212e93bbf8ce046c7f1cb475",
         {gas:5000000}
    ).then(async () =>  {
        var d = await BettingonUITestDeploy.deployed();
        let pu = await d.pu();
        console.log(pu);
        web3.eth.getAccounts((a,b) => {
            web3.eth.sendTransaction(
                {
                    from: b[0] , to: pu,
                    value: web3.toWei(0.05, 'ether')
                }, function(error,result){
                    console.log(error);
                    console.log(result);
                });
        });

    });

};

