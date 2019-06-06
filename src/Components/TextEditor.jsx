// @flow
import { Divider, Slider, TextField, Toggle } from 'material-ui';
import { MAX_TEXT_LENGTH } from '../variables';
import { t } from 'i18next';
import Radium from 'radium';
import React from 'react';
import AnimationPreview from './AnimationPreview';
import font from 'font';
import type { Animation } from 'Reducer';
import Button from '@material-ui/core/Button';
import SocialShare from 'material-ui/svg-icons/social/share';

type Props = {
  animation: Animation,
  currentText?: ?string,
  onUpdate: (Animation) => any,
  onShare: (Animation) => any
};

type State = {
  livePreview: boolean,
};

const style = {
  noShrink: {
    flexShrink: 0,
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

@Radium
class TextEditor extends React.Component<Props, State> {
  state: State = {
    livePreview: true,
  };
  handleChange(prop: string, e: SyntheticEvent<any>) {
    const { animation } = this.props;

    e.target.value = this.deUmlaut(e.target.value);
    e.target.value = e.target.value.split('').filter(c => font[c.charCodeAt(0)]).join('');
    // $FlowFixMe
    e.target.value = e.target.value.substring(0, MAX_TEXT_LENGTH);
    this.props.onUpdate(
      Object.assign({}, animation, {
        // $FlowFixMe
        [prop]: e.target.value,
      })
    );
  }
  handleSpeedChange = (e: SyntheticEvent<*>, value: number) => {
    const { animation } = this.props;

    this.props.onUpdate(
      Object.assign({}, animation, {
        speed: value,
      })
    );
  };
  handleDelayChange = (e: SyntheticEvent<*>, value: number) => {
    const { animation } = this.props;

    this.props.onUpdate(
      Object.assign({}, animation, {
        delay: value,
      })
    );
  };
  handleRepeatChange = (e: SyntheticEvent<*>, value: number) => {
    const { animation } = this.props;

    this.props.onUpdate(
      Object.assign({}, animation, {
        repeat: value,
      })
    );
  };
  handleDirectionChange = (e: SyntheticEvent<*>, toggled: boolean) => {
    const { animation } = this.props;

    this.props.onUpdate(
      Object.assign({}, animation, {
        direction: toggled ? 1 : 0,
      })
    );
  };
  handlePreviewChange = (e: SyntheticEvent<*>, toggled: boolean) => {
    this.setState({
      livePreview: toggled,
    });
  };
  deUmlaut = (value) => {
    value = value.replace('ä', 'ae');
    value = value.replace('ö', 'oe');
    value = value.replace('ü', 'ue');
    value = value.replace('Ä', 'Ae');
    value = value.replace('Ö', 'Oe');
    value = value.replace('Ü', 'Ue');
    value = value.replace('ß', 'ss');
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
           style={{alignSelf: 'flex-end', marginTop: '10px', marginBottom: '-20px'}}
           onClick={() => this.props.onShare(animation)}
         >
           {<SocialShare />} Share
         </Button>
        <AnimationPreview animation={animation} />
        <Divider />
        <TextField
          style={style.noShrink}
          id="text"
          value={animation.text || ' '}
          onChange={this.handleChange.bind(this, 'text')}
          floatingLabelText={t('textEditor.textPlaceholder')}
          placeholder={t('textEditor.textPlaceholder')}
          floatingLabelFixed
        />
        <TextField
          style={style.noShrink}
          id="name"
          value={animation.name}
          onChange={this.handleChange.bind(this, 'name')}
          floatingLabelText={t('textEditor.name')}
          placeholder={t('textEditor.name')}
          floatingLabelFixed
        />
        <div style={[style.sliderContainer, style.noShrink]}>
          <p style={style.sliderLabel}>{t('textEditor.speed')}</p>
          <Slider
            description={t('textEditor.speed')}
            style={style.slider}
            value={animation.speed}
            step={1}
            min={0}
            max={15}
            onChange={this.handleSpeedChange}
          />
          {animation.speed}
        </div>
        <div style={[style.sliderContainer, style.noShrink]}>
          <p style={style.sliderLabel}>{t('textEditor.delay')}</p>
          <Slider
            description={t('textEditor.delay')}
            style={style.slider}
            value={animation.delay}
            step={0.5}
            min={0}
            max={7.5}
            onChange={this.handleDelayChange}
          />
          {animation.delay}
        </div>
        <div style={[style.sliderContainer, style.noShrink]}>
          <p style={style.sliderLabel}>{t('textEditor.repeat')}</p>
          <Slider
            description={t('textEditor.repeat')}
            style={style.slider}
            value={animation.repeat}
            step={1}
            min={0}
            max={15}
            onChange={this.handleRepeatChange}
          />
          {animation.repeat}
        </div>
        <div style={[style.sliderContainer, style.noShrink]}>
          <Toggle
            label={t('textEditor.rtl')}
            toggled={Boolean(animation.direction)}
            onToggle={this.handleDirectionChange}
          />
        </div>
        <div style={[style.sliderContainer, style.noShrink]}>
          <Toggle label={t('textEditor.livePreview')} toggled={livePreview} onToggle={this.handlePreviewChange} />
        </div>
      </div>
    );
  }
}

export default TextEditor;
