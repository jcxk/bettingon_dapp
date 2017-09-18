import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import BetForm from './BetForm';
import * as AppActions from "actions/app";
import ContractManager from "lib/contractManager.js";
import PriceUpdater from "lib/PriceUpdater";
import Directory from "lib/Directory";
import moment from 'moment';
require("moment-duration-format");
import * as _ from 'lodash';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import { Page, Section } from 'react-page-layout';
import { Container, Grid, Dimmer, Loader } from 'semantic-ui-react';
import CandlebarGraph from "../../components/CandlebarGraph"

export class Home extends React.Component {



    constructor(props, context) {
        super(props, context);
        this.placeBet = this.placeBet.bind(this);
    }




    async getContracts(web3, account, containerContract) {
        let env = web3.version.network == 1 ? 'production' : 'development';
        console.log(web3.version.network, 'web3 network');
        let opts = {
            env : env ,
            account: account,
            address: await containerContract.bon() }
        ;

        this.contractManager = new ContractManager(web3, opts);
        await this.contractManager.init();
        console.log(this.contractManager);




        this.props.dispatch(
            AppActions.betConfig(
                this.contractManager.config
            )
        );

        this.props.dispatch(
            AppActions.getRounds(
                await this.contractManager.getRounds(
                    await this.contractManager.getRoundCount(Date.now())
                )
            )
        );
        this.contractManager.watchEvents().watch( (error, result) => {
            if (error == null) {
                switch (result.event) {
                    case "LogBet":
                    case "LogPriceSet":
                    case "LogWinner":
                        this.props.dispatch(
                            {
                                type: result.event+'_WEB3', payload: result.args
                            });
                        break;
                    default:
                        console.log(result,'other events');
                }
            }

        });

    }

    async web3init(account){

        if (typeof web3 !== 'undefined') {
            window.web3 = new Web3(web3.currentProvider);
        } else {
            console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
            window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        }
        let bettingonUI = await ContractManager.getContractByPathAndAddr('BettingonUITestDeploy', window.web3.currentProvider);

        await this.getContracts(window.web3,account, bettingonUI);

    }

    componentDidMount() {
        console.log(this.context);
        this.web3init(this.context.web3.selectedAccount);

    }



    async placeBet(values) {
      console.log(values);
      let resolvedRound = 0;
      let betTx = await this.contractManager.uiBid(values.expected_value);
      console.log(betTx,'txxxx');
      console.log('vamossss');
    }

    renderBetForm() {

        if (this.props.app.rounds.length > 0) {
            let currentRound = this.props.app.rounds[this.props.app.rounds.length - 1] ;
            const avgBets= _.meanBy(currentRound.bets, (p) => p.target);
            //let roundDuration = moment.duration(this.props.app.config.betCycleLength.toNumber(), "seconds");
            return (
            <div>
                <table width="100%">
                  <tbody>
                  <tr>
                    <td>OPEN ROUND:</td><td>#{this.props.app.rounds[0].roundId}</td>
                  </tr>
                  <tr>
                    <td>BETS:</td><td>{currentRound.bets.length}</td>
                  </tr>
                  <tr>
                    <td>JACKPOT: </td><td>{this.props.app.config.boat.toNumber()}</td>
                  </tr>
                  <tr>
                    <td>AVERAGE:</td><td>{(avgBets>0) ? avgBets/1000 : 0}</td>
                  </tr>
                  <tr>
                    <td>TIME TO CLOSE:</td><td>Bets are for price published till
                    {moment.unix(currentRound.closeDate).local().format("YYYY-MM-DD HH:mm")}</td>
                  </tr>
                  </tbody>
                </table>
              <MuiThemeProvider>
                <BetForm onSubmit={this.placeBet}/>
              </MuiThemeProvider>
            </div>

            );
        } else {
          return(
            <Dimmer active>
             <Loader />
          </Dimmer>
          );
        }
    }

    render() {

      const columns = [

        {
          Header: 'Round',
          accessor: 'roundId',
          Cell: props => { return '#'+props.value}
        },
        {
          Header: 'Total Bets',
          accessor: 'bets',
          Cell: props => { return props.value.length}
        },
        {
          Header: 'Status',
          accessor: 'status',
          Cell: props => { return this.contractManager.getStatus(props.value)}
        },
        {
          Header: 'Time to Close',
          accessor: 'closeDate',
          Cell: props => {

            return moment.unix(props.value).local().format('YYYY-MM-DD HH:mm')
          }
        },
        {
          Header: 'Options',
          Cell: (props) => {

            if (props.row.status == 6) {
              return (
                <button onClick={(e) => {
                  e.preventDefault();
                  this.contractManager.withdraw(props.row.roundId)
                }}>Withdraw</button>
              )
            }
            if (props.row.status == 4) {
              return (
                <button onClick={(e) => {
                  e.preventDefault();
                  this.contractManager.forceResolve(props.row.roundId);
                }}>Resolve Round</button>
              )
            }
          }
        }
      ];



      return (


        <Page layout="public">
          <Section slot="main">


            <Grid container stretched  celled >
              <Grid.Column  floated="left" width={5}>
                {this.renderBetForm()}
              </Grid.Column>
              <Grid.Column  floated="left" width={5}>
                  <CandlebarGraph
                      rounds={this.props.app.rounds}
                      width={370}
                      scale={1.0}
                      height={250}
                      config={this.props.app.config}
                  />
              </Grid.Column>
            </Grid>

                <ReactTable
                loading={this.props.app.rounds == false}
                data={this.props.app.rounds}
                columns={columns}
                sorted={[{
                  id: 'round',
                  desc: true
                }]}
                />

          </Section>
        </Page>
        )
    }
}

Home.contextTypes = {
    web3: PropTypes.object
};

function mapStateToProps(state) {
    console.log(state.app, 'refresh state');
    return {
        app: state.app
    }
}

export default connect(mapStateToProps)(Home)
