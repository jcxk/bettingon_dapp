import * as _ from 'lodash';

const initialState = {
    contracts: {
       bettingon: null,
       priceUpdater: null,
       directory: null
    },
    directory: {
        /*
        "0xffcf8fdee72ac11b5c542428b35eef5769c409f0": {
            name: 'jcxk'
        }
        */
    },
    accountChanged: false,
    account: null,
    env: 'production',
    config: false,
    rounds: []
};

export default function appReducer(state = initialState, action) {

    switch (action.type) {
      case 'LogBet_WEB3':
            console.log(action.payload.roundId.toNumber());
            let r = _.find(state.rounds, ['roundId', action.payload.roundId.toNumber() ]);

            let betObj = {
              account: action.payload.account,
              target: action.payload.targets[0].toNumber()
            };
            let b = _.find(r, betObj);
            console.log(b);
            if (r != null && b==null) {
              r.betCount++;
              r.bets.push(betObj);
            }
            return {
                ...state
            };
      case "web3/RECEIVE_ACCOUNT":
      case "web3/CHANGE_ACCOUNT":
            return {
                ...state,
                account : action.address,
                accountChanged : true
                //name:  state.directory[action.address] != undefined ? state.directory[action.address].name : action.address.substring(2,8)
            };
        case 'SET_CONTRACT_ADDRESSES':
            return {
                ...state,
                contracts : action.payload
            };

      case 'SET_MEMBERNAME':
            return {
                ...state,
                name : action.payload,
                accountChanged: false
            };
      case 'CONFIG_BET':
            return {
                ...state,
                config : action.payload
            };
      case 'GET_ROUNDS':
            return {
                ...state,
                rounds : action.payload
            };
        default:
            return state;
    }
}
