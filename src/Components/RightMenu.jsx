/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { range } from 'lodash';
import { t } from 'i18next';
import SendIcon from '@material-ui/icons/Send';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import Radium from 'radium';
import firebase from '../firebase';
import AuthDialog from './AuthDialog';
import { FirebaseAuthConsumer } from '@react-firebase/auth';
import { loggedOut } from '../Actions/auth';

const style = {
  button: {
    margin: '0 4px',
  },
  wrap: {
    alignSelf: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  instructions: {
    display: 'flex',
    width: '96px',
    height: '96px',
    paddingLeft: '30%',
    alignContent: 'center',
    flex: '0 1 auto',
  },
  instructionList: {
    listStyle: 'none',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
};

type State = {
  transferWidgetOpen: boolean,
  authWidgetOpen: boolean
};

class RightMenu extends React.Component<Props, State> {
  state: State = {
    transferWidgetOpen: false,
    authWidgetOpen: false
  };
  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  transfer = () => {
    if (this.context.store.getState().animations.size > 0) {
      this.setState({
        transferWidgetOpen: true,
      });
    }
  };

  confirmTransfer = () => {
    this.setState({
      transferWidgetOpen: false,
    });
    // Call your transfer service here if needed
    // transfer(this.context.store.getState().animations);
  };

  cancelTransfer = () => {
    this.setState({
      transferWidgetOpen: false,
    });
  };

  logout = () => {
    firebase.auth().signOut().then(() => {
      this.context.store.dispatch(loggedOut());
    });
  };

  authButton = ({ isSignedIn, user }) => {
    if (isSignedIn) {
      return [ 
        <Button
          key="logout"
          size="small"
          variant="contained"
          color="primary"
          onClick={this.logout}
          style={style.button}
          startIcon={<ExitToAppIcon />}
        >
          {t('menu.logout') + ' ' + user.email}
        </Button>
      ];
    } else {
      return [ 
        <Button
          key="openauth"
          size="small"
          variant="contained"
          color="primary"
          onClick={() => this.setState({ authWidgetOpen: true })}
          style={style.button}
        >
          {t('menu.login')}
        </Button>
      ];
    }
  };

  render() {
    const transferActions = [
      <Button
        key="a"
        variant="text"
        color="secondary"
        onClick={this.cancelTransfer}
        startIcon={<CloseIcon />}
      >
        {t('transfer_dialog.cancel')}
      </Button>,
      <Button
        key="b"
        variant="contained"
        color="primary"
        onClick={this.confirmTransfer}
        startIcon={<SendIcon />}
      >
        {t('transfer_dialog.transfer')}
      </Button>,
    ];

    const flashInstructions = range(4).map(i => `${i + 1}. ${t(`transfer_dialog.instructions${i}`)}`);

    return (
      <div style={style.wrap}>
        <Button
          onClick={this.transfer}
          size="small"
          variant="contained"
          color="primary"
          style={style.button}
          startIcon={<SendIcon />}
        >
          {t('menu.transfer')}
        </Button>
        <FirebaseAuthConsumer children={this.authButton} />
        <Dialog
          open={this.state.transferWidgetOpen}
          onClose={this.cancelTransfer}
          aria-labelledby="transfer-dialog-title"
        >
          <div style={{ padding: 16 }}>
            <div style={style.instructionList}>
              {flashInstructions.map(instruction => <div key={instruction}>{instruction}</div>)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              {transferActions}
            </div>
          </div>
        </Dialog>
        <AuthDialog 
          isOpen={this.state.authWidgetOpen} 
          close={() => this.setState({ authWidgetOpen: false })} 
        />
      </div>
    );
  }
}

export default connect(state => ({
  animations: state.animations
}))(RightMenu);
