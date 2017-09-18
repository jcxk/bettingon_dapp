import React, { Component } from 'react';
import { Provider } from 'react-redux';
import Routes from '../routes';
import { Web3Provider } from 'react-web3';

import { BrowserRouter as Router } from 'react-router-dom';

export default class Root extends Component {
  render() {
    const { store, history } = this.props;
    return (

      <Provider store={store}>
          <Web3Provider passive={false} >
            <Router history={history} >
              <Routes />
            </Router>
          </Web3Provider>
      </Provider>

    );
  }
}
