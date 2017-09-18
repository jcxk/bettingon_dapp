import React from 'react';
import { Page, Section } from 'react-page-layout';
import {connect} from 'react-redux';

export class ContractPage extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
      return (
        <Page layout="public">
          <Section slot="main">
            <div>
                <p>Bettingon at{this.props.contracts.bettingon}</p>
                <p>PriceUpdater at {this.props.contracts.priceUpdater}</p>
                <p>Directory at {this.props.contracts.directory}</p>
            </div>
          </Section>
        </Page>
        );
    }
}


function mapStateToProps(state) {
  return {
    contracts: state.app.contracts
  }
}

export default connect(mapStateToProps)(ContractPage)
