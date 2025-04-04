/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import { t } from 'i18next';
import Radium from 'radium';
import firebase from '../firebase';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import { signedUp, loggedIn, syncLibrary } from 'Actions/auth';

const style = {
  signupHint: {
    marginTop: '50px'
  }
};

type Props = {
  isOpen: boolean,
  close: () => void,
};

type State = {
  view: string,
  email: string,
  password: string,
  error: string,
};

@Radium
class AuthDialog extends React.Component<Props, State> {

  state: State = {
    view: 'login',
    email: '',
    password: '',
    error: '',
  };

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.props.loggedIn(user['uid']);
      }
    });
  }

  login = () => {
    const { email, password } = this.state;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((res) => {
        this.props.loggedIn(res.user['uid']);
        this.props.syncLibrary(res.user['uid'], this.props.animations);
        this.close();
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
  }

  signup = () => {
    const { email, password } = this.state;
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((res) => {
        this.props.signedUp(res.user.uid, this.props.animations);
        this.close();
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
  }

  resetPwd = () => {
    firebase.auth().sendPasswordResetEmail(this.state.email).then(() => {
      alert(t('auth_dialog.resetlink_sent_notification'));
      this.close();
    }).catch((error) => {
      this.setState({ error: error.message });
    });
  }

  close = () => {
    this.setState({ view: 'login', error: '' });
    this.props.close();
  }

  render() {
    const { isOpen } = this.props;

    const submitButton = {
      login: <Button key="l" variant="contained" color="primary" onClick={this.login}>{t('auth_dialog.login')}</Button>,
      signup: <Button key="s" variant="contained" color="primary" onClick={this.signup}>{t('auth_dialog.signup')}</Button>,
      reset: <Button key="r" variant="contained" color="primary" onClick={this.resetPwd}>{t('auth_dialog.reset')}</Button>,
    }[this.state.view];

    return (
      <Dialog open={isOpen}>
        <DialogTitle>{t('auth_dialog.title')}</DialogTitle>
        <DialogContent>
          <TextField
            id="email"
            onChange={(e) => this.setState({ email: e.target.value })}
            label={t('auth_dialog.email')}
            autoFocus
            fullWidth
          />
          <br />
          { (this.state.view !== 'reset') && 
            <TextField
              id="password"
              type="password"
              autoComplete="current-password"
              onChange={(e) => this.setState({ password: e.target.value })}
              label={t('auth_dialog.password')}
              fullWidth
            />
          }
          { (this.state.view === 'login') && (
            <DialogContentText style={{ fontSize: '0.7rem', marginTop: '30px' }}>
              { t('auth_dialog.account_missing') }{' '}
              <a href="#" onClick={() => this.setState({ view: 'signup' })}><strong>{t('auth_dialog.create_account')}</strong></a>
              <br />
              <a href="#" onClick={() => this.setState({ view: 'reset' })}>{t('auth_dialog.forgot_pwd')}</a>
            </DialogContentText>
          )}
          { (this.state.error) && (
            <DialogContentText style={{ color: 'darkred' }}>
              { this.state.error }
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button key="c" onClick={this.close} startIcon={<CloseIcon />}>
            {t('share_dialog.close')}
          </Button>
          { submitButton }
        </DialogActions>
      </Dialog>
    );
  }
}

export default connect(
  (state) => ({ animations: state.animations }),
  { signedUp, loggedIn, syncLibrary }
)(AuthDialog);
