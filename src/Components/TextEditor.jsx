// @flow
import React from 'react';
import Divider from '@material-ui/core/Divider';
import Slider from '@material-ui/core/Slider';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import { t } from 'i18next';
import Radium from 'radium';
import AnimationPreview from './AnimationPreview';
import font from 'font';
import type { Animation } from 'Reducer';
import Button from '@material-ui/core/Button';
import ShareIcon from '@material-ui/icons/Share';
import { colors } from 'material-ui/styles';

const style = {
  noShrink: {
    flexShrink: 0,
  },
  textField: {
    flexShrink: 0,
    width: '256px',
    marginBottom: '16px',
  },
  wrapper: {
    display: 'inline-flex',
    flex: '1 1 0',
    flexDirection: 'column',
    overflowX: 'auto',
    overflowY: 'auto',
    padding: 20,
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 15,
  },
  slider: {
    marginTop: 0,
    marginBottom: -10,
    flex: '1 1 75%',
    marginRight: 15,
  },
  sliderLabel: {
    marginTop: -10,
    marginBottom: 0,
    flex: '1 1 25%',
    marginRight: 10,
    fontFamily: 'Roboto, sans-serif',
  },
};

type Props = {
  animation: Animation,
  currentText?: ?string,
  onUpdate: (Animation) => any,
  onShare: (Animation) => any
};

type State = {
  livePreview: boolean,
};

class TextEditor extends React.Component<Props, State> {
  state: State = {
    livePreview: true,
  };

  handleChange(prop: string, e: SyntheticEvent<any>) {
    const { animation } = this.props;
    let value = e.target.value;
    value = this.deUmlaut(value);
    value = value.split('').filter(c => font[c.charCodeAt(0)]).join('');
    value = value.substring(0, 200);
    this.props.onUpdate({
      ...animation,
      [prop]: value,
    });
  }

  handleSpeedChange = (e, value: number) => {
    const { animation } = this.props;
    this.props.onUpdate({
      ...animation,
      speed: value,
    });
  };

  handleDelayChange = (e, value: number) => {
    const { animation } = this.props;
    this.props.onUpdate({
      ...animation,
      delay: value,
    });
  };

  handleRepeatChange = (e, value: number) => {
    const { animation } = this.props;
    this.props.onUpdate({
      ...animation,
      repeat: value,
    });
  };

  handleDirectionChange = (e, checked: boolean) => {
    const { animation } = this.props;
    this.props.onUpdate({
      ...animation,
      direction: checked ? 1 : 0,
    });
  };

  handlePreviewChange = (e, checked: boolean) => {
    this.setState({
      livePreview: checked,
    });
  };

  deUmlaut = (value) => {
    value = value.replace(/ä/g, 'ae');
    value = value.replace(/ö/g, 'oe');
    value = value.replace(/ü/g, 'ue');
    value = value.replace(/Ä/g, 'Ae');
    value = value.replace(/Ö/g, 'Oe');
    value = value.replace(/Ü/g, 'Ue');
    value = value.replace(/ß/g, 'ss');
    return value;
  };

  render() {
    const { animation } = this.props;
    const { livePreview } = this.state;

    return (
      <div style={style.wrapper}>
        <Button
           size="small"
           variant="outlined"
           color="primary"
           style={{ alignSelf: 'flex-end', marginTop: '10px', marginBottom: '-20px', minHeight: '34px' }}
           onClick={() => this.props.onShare(animation)}
         >
           <ShareIcon /> Share
         </Button>
        <AnimationPreview animation={animation} />
        <Divider style={{ marginBottom: '16px', background: 'transparent' }} />
        <TextField
          style={style.textField}
          id="text"
          value={animation.text || ''}
          onChange={(e) => this.handleChange('text', e)}
          label={t('textEditor.textPlaceholder')}
          placeholder={t('textEditor.textPlaceholder')}
        />
        <TextField
          style={style.textField}
          id="name"
          value={animation.name}
          onChange={(e) => this.handleChange('name', e)}
          label={t('textEditor.name')}
          placeholder={t('textEditor.name')}
        />
        <div style={style.sliderContainer}>
          <span style={style.sliderLabel}>{t('textEditor.speed')}</span>
          <Slider
            style={style.slider}
            value={animation.speed}
            step={1}
            min={0}
            max={15}
            onChange={this.handleSpeedChange}
          />
          {animation.speed}
        </div>
        <div style={style.sliderContainer}>
          <span style={style.sliderLabel}>{t('textEditor.delay')}</span>
          <Slider
            style={style.slider}
            value={animation.delay}
            step={0.5}
            min={0}
            max={7.5}
            onChange={this.handleDelayChange}
          />
          {animation.delay}
        </div>
        <div style={style.sliderContainer}>
          <span style={style.sliderLabel}>{t('textEditor.repeat')}</span>
          <Slider
            style={style.slider}
            value={animation.repeat}
            step={1}
            min={0}
            max={15}
            onChange={this.handleRepeatChange}
          />
          {animation.repeat}
        </div>
        <div style={style.sliderContainer}>
          <span style={style.sliderLabel}>{t('textEditor.rtl')}</span>
          <Switch
            checked={Boolean(animation.direction)}
            onChange={this.handleDirectionChange}
          />
        </div>
        <div style={style.sliderContainer}>
          <span style={style.sliderLabel}>{t('textEditor.livePreview')}</span>
          <Switch
            checked={livePreview}
            onChange={this.handlePreviewChange}
          />
        </div>
      </div>
    );
  }
}

export default TextEditor;
