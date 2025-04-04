import React from 'react';
import { t } from 'i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import LinkIcon from '@material-ui/icons/Link';

type Props = {
  animation?: Animation,
  close: Function
};

type State = {
  copied: boolean
};

class ShareWidget extends React.Component<Props, State> {
  state: State = {
    copied: false
  };

  render() {
    const { animation } = this.props;
    const shareString = encodeURIComponent(btoa(JSON.stringify(animation)));

    if (!animation) {
      return null;
    }
    const url = `${HOST}${BASE_URL}/?s=${shareString}`;

    return (
      <Dialog open={true} onClose={this.props.close}>
        <div style={{ padding: 16 }}>
          <h2>{t('share_dialog.title')}</h2>
          <p>{t('share_dialog.instructions')}</p>
          <CopyToClipboard text={url} onCopy={() => this.setState({copied: true})}>
            <Button variant="contained" color="primary" startIcon={<LinkIcon />} autoFocus>
              {t('share_dialog.link')}
            </Button>
          </CopyToClipboard>
          { this.state.copied && <div>Copied!</div> }
          <div style={{ marginTop: 16 }}>
            <Button variant="text" color="primary" onClick={this.props.close} startIcon={<CloseIcon />}>
              {t('share_dialog.close')}
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }
}

export default ShareWidget;
