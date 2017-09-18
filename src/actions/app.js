export function placeBet(betObj) {
  return {
    type: 'PLACE_BET', payload: betObj
  };
}

export function betConfig(obj) {
    return {
        type: 'CONFIG_BET', payload: obj
    };
}

export function contractsAdresses(obj) {
    return {
        type: 'SET_CONTRACT_ADDRESSES', payload: obj
    };
}

export function setMemberName(name) {

    return {
        type: 'SET_MEMBERNAME', payload: name
    };
}

export function getRounds(obj) {
    return {
        type: 'GET_ROUNDS', payload: obj
    };
}




