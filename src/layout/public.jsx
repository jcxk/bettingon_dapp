import React, { Component } from 'react';
import { Slot } from 'react-page-layout';

import {AppBar} from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Drawer from 'material-ui/Drawer';
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { Container, Divider,Grid, Header, Image, Segment,List, Menu, Dropdown, Button, Table } from 'semantic-ui-react';
import Identicon from 'react-blockies';
import * as AppActions from "actions/app";

import ContractManager from "lib/contractManager.js";
import PriceUpdater from "lib/PriceUpdater";
import Directory from "lib/Directory";

class PublicLayout extends Component {
  constructor(props,context) {
    super(props,context);
    this.state = {activeItem: 'home'};
    this.setUserName = this.setUserName.bind(this);
  }


  async initContracts(){

      let containerContract = await ContractManager.getContractByPathAndAddr(
          'BettingonUITestDeploy',
          window.web3.currentProvider
      );
      let adrObj = {
          bettingon: await containerContract.bon(),
          priceUpdater:await containerContract.pu(),
          directory: await containerContract.d()
      };
      this.props.dispatch(
          AppActions.contractsAdresses(adrObj)
      );
      this.initDirectory();
  }

  componentDidMount(){
      this.initContracts();
  }

  async initDirectory() {

      this.directory = new Directory(window.web3,{
          env : 'development' ,
          account: this.props.app.account,
          address: this.props.app.contracts.directory }
         );
      await this.directory.init();

      let memberName = await this.directory.contract.getName(this.props.app.account);
      this.props.dispatch(
          AppActions.setMemberName(
              (memberName.length < 1) ? this.props.app.account.substring(2,8) : memberName

          )
      );


  }

  async setUserName(name) {
      let tx = await this.directory.setName(name);
      if (tx.transactionHash != undefined) {
          this.props.dispatch(
              AppActions.setMemberName(name)
          );
      }
  }

  render() {

    const { activeItem } = this.state;
    let winners = _.times(6, (index) => {
      return(
        <Table.Row key={index}>
          <Table.Cell>
            <Header as='h4'>
              <Header.Content>{index}.MRX</Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell>{_.random(1200)}</Table.Cell>
        </Table.Row>
    )});

    const blockies = (this.props.app.name != null) ?
        <Menu.Item position="right"  >

                <Identicon
                    seed={this.props.app.account}
                    spotcolor="#000"
                    bgcolor="#ECF0F1"
                    height={32}
                    width={32}
                />

                <a style={{fontSize:12}} onClick={(e,v) => {e.preventDefault();this.setUserName(prompt("name", "jcxk"))}}>[{this.props.app.name}]</a>

        </Menu.Item>
        : null;
    return (
      <div>
        <header>
          <Menu size='massive'>
            <Menu.Item as={NavLink} exact to='/'>Home</Menu.Item>
            <Menu.Item as={NavLink} to='/about'>About</Menu.Item>
            <Menu.Item as={NavLink}  to='/contract'>Contract</Menu.Item>
              {blockies}
          </Menu>

        </header>

        <Grid container stretched  celled >
            <Grid.Column stretched  floated="left" >
                <Slot name="main" />
            </Grid.Column>
        </Grid>

        <Grid container celled>Footer</Grid>
      </div>
    );
  }
}

PublicLayout.contextTypes = {
    web3: PropTypes.object
};

function mapStateToProps(state) {
    return {
        app: state.app
    }
}

export default connect(mapStateToProps)(PublicLayout);

