// @flow
import React from 'react';
import Radium from 'radium';
import { range } from 'lodash';
import { t } from 'i18next';
import { List } from 'immutable';
import { MAX_ANIMATION_FRAMES } from '../variables';

// Updated imports: using Button, Slider, TextField from @material-ui/core and icons from @material-ui/icons
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import TextField from '@material-ui/core/TextField';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import ShareIcon from '@material-ui/icons/Share';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import PauseCircleOutlineIcon from '@material-ui/icons/PauseCircleOutline';

import AnimationPreview from './AnimationPreview';
import Frame from './Frame';
import type { Animation } from 'Reducer';
import { getFrameColumns } from '../utils';

const style = {
  buttons: {},
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
    cursor: 'default',
  },
  buttonWrapper: {
    marginBottom: 15,
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 15,
  },
  slider: {
    marginTop: 0,
    marginBottom: 0,
    flex: '1 1 75%',
    marginLeft: 15,
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

const MOUSE_MODE_NOTHING = 'MOUSE_MODE_NOTHING';
const MOUSE_MODE_PAINT = 'MOUSE_MODE_PAINT';
const MOUSE_MODE_ERASE = 'MOUSE_MODE_ERASE';

type Props = {
  animation: Animation,
  onUpdate: (Animation) => any,
  onShare: (Animation) => any
};

type State = {
  mouseMode: string,
  playing: boolean
};

const EMPTY_DATA = List(range(8).map(() => 0x00));

class PixelEditor extends React.Component<Props, State> {
  state: State = {
    mouseMode: MOUSE_MODE_NOTHING,
    playing: false,
  };

  handleChange = (prop: string, e: SyntheticKeyboardEvent<*>) => {
    const { animation } = this.props;
    this.props.onUpdate({
      ...animation,
      [prop]: e.target.value.substring(0, 200)
    });
  };

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

  handleNextFrame = () => {
    const { animation } = this.props;
    if (animation.animation.currentFrame + 1 === MAX_ANIMATION_FRAMES - 1) {
      return;
    }
    if (animation.animation.currentFrame + 1 >= animation.animation.frames) {
      this.props.onUpdate({
        ...animation,
        animation: {
          data: animation.animation.data.concat(EMPTY_DATA),
          currentFrame: animation.animation.currentFrame + 1,
          length: animation.animation.length + 1,
          frames: animation.animation.frames + 1,
        },
      });
    } else {
      this.props.onUpdate({
        ...animation,
        animation: {
          data: animation.animation.data,
          currentFrame: animation.animation.currentFrame + 1,
          length: animation.animation.length,
          frames: animation.animation.frames,
        },
      });
    }
  };

  handlePreviousFrame = () => {
    const { animation } = this.props;
    if (animation.animation.currentFrame - 1 < 0) {
      return;
    }
    this.props.onUpdate({
      ...animation,
      animation: {
        data: animation.animation.data,
        currentFrame: animation.animation.currentFrame - 1,
        length: animation.animation.length,
        frames: animation.animation.frames,
      },
    });
  };

  handleDeleteFrame = () => {
    const { animation } = this.props;
    let newdata;
    if (animation.animation.currentFrame === 0 && animation.animation.frames === 1) {
      newdata = EMPTY_DATA;
      this.props.onUpdate({
        ...animation,
        animation: {
          data: newdata,
          currentFrame: 0,
          length: animation.animation.length,
          frames: animation.animation.frames,
        },
      });
      return;
    }
    newdata = animation.animation.data.slice(0, 8 * animation.animation.currentFrame);
    newdata = newdata.concat(animation.animation.data.slice(8 * animation.animation.currentFrame + 8));
    const newCurrentFrame = animation.animation.currentFrame === 0 ? 0 : animation.animation.currentFrame - 1;
    this.props.onUpdate({
      ...animation,
      animation: {
        data: newdata,
        currentFrame: newCurrentFrame,
        length: animation.animation.length - 1,
        frames: animation.animation.frames - 1,
      },
    });
  };

  handleCopyFrame = () => {
    const { animation } = this.props;
    if (animation.animation.currentFrame + 1 === MAX_ANIMATION_FRAMES - 1) {
      return;
    }
    const currentFrameData = animation.animation.data.slice(
      8 * animation.animation.currentFrame,
      8 * animation.animation.currentFrame + 8
    );
    let newdata = animation.animation.data.slice(0, 8 * animation.animation.currentFrame + 8);
    newdata = newdata.concat(currentFrameData, animation.animation.data.slice(8 * animation.animation.currentFrame + 8));
    this.props.onUpdate({
      ...animation,
      animation: {
        data: newdata,
        currentFrame: animation.animation.currentFrame + 1,
        length: animation.animation.length + 1,
        frames: animation.animation.frames + 1,
      },
    });
  };

  mouseDown = (y: number, x: number) => {
    const isOn = this.animationPointIsOn(y, x);
    this.setState({ mouseMode: isOn ? MOUSE_MODE_ERASE : MOUSE_MODE_PAINT });
    this.setAnimationPoint(y, x, !isOn);
  };

  mouseUp = (y: number, x: number) => {
    this.setState({ mouseMode: MOUSE_MODE_NOTHING });
  };

  mouseOver = (y: number, x: number) => {
    if (this.state.mouseMode !== MOUSE_MODE_NOTHING) {
      this.setAnimationPoint(y, x, this.state.mouseMode === MOUSE_MODE_PAINT);
    }
  };

  animationPointIsOn(y: number, x: number) {
    const { animation } = this.props;
    const data = animation.animation.data;
    const column = data[8 * animation.animation.currentFrame + x];
    const bitIndex = 7 - y;
    return column & (1 << bitIndex);
  }

  setAnimationPoint(y: number, x: number, isOn: boolean) {
    const { animation } = this.props;
    let data = animation.animation.data.slice();
    let column = data[8 * animation.animation.currentFrame + x];
    const bitIndex = 7 - y;
    if (isOn) {
      column |= 1 << bitIndex;
    } else {
      column &= ~(1 << bitIndex);
    }
    data[8 * animation.animation.currentFrame + x] = column;
    this.props.onUpdate({
      ...animation,
      animation: {
        data: data,
        currentFrame: animation.animation.currentFrame,
        length: animation.animation.length,
        frames: animation.animation.frames,
      },
    });
  }

  render() {
    const { animation } = this.props;
    const { playing } = this.state;
    let pixelPreviewCursor = 'auto';
    if (this.state.mouseMode === MOUSE_MODE_PAINT) {
      pixelPreviewCursor = 'pointer';
    } else if (this.state.mouseMode === MOUSE_MODE_ERASE) {
      pixelPreviewCursor = 'crosshair';
    }
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
         <div>
           { playing ? <AnimationPreview animation={animation} /> : 
             <Frame
                columns={getFrameColumns(animation, animation.animation.currentFrame)}
                cursor={pixelPreviewCursor}
                mouseDownCallback={this.mouseDown.bind(this)}
                mouseUpCallback={this.mouseUp.bind(this)}
                mouseOverCallback={this.mouseOver.bind(this)}
             />
           }
         </div>
         <div>
           <Button
             size="small"
             variant="text"
             color="primary"
             onClick={() => { this.setState(s => ({playing: !s.playing}))}}
             startIcon={ playing ? <PauseCircleOutlineIcon /> : <PlayCircleOutlineIcon />}
           >
             { playing ? "Pause" : "Play" }
           </Button>
           Frame {animation.animation.currentFrame + 1} / {animation.animation.frames}
         </div>
         <div style={style.buttonWrapper}>
           <Button
             variant="text"
             color="primary"
             disabled={playing || animation.animation.currentFrame === 0}
             onClick={this.handlePreviousFrame}
             startIcon={<SkipPreviousIcon />}
           >
             {t('pixelEditor.previousFrame')}
           </Button>
           <Button
             variant="text"
             color="primary"
             onClick={this.handleDeleteFrame}
             startIcon={<DeleteForeverIcon />}
             disabled={playing}
           >
             Delete
           </Button>
           <Button
             variant="text"
             color="primary"
             onClick={this.handleCopyFrame}
             startIcon={<FileCopyIcon />}
             disabled={playing}
           >
             Copy
           </Button>
           <Button
             variant="text"
             color="primary"
             disabled={playing}
             onClick={this.handleNextFrame}
             endIcon={<SkipNextIcon />}
           >
             {t('pixelEditor.nextFrame')}
           </Button>
         </div>
         <TextField
           style={style.textField}
           id="name"
           value={animation.name}
           onChange={(e) => this.handleChange('name', e)}
           label={t('pixelEditor.name')}
           placeholder={t('pixelEditor.name')}
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
           <span style={style.sliderLabel}>{t('pixelEditor.repeat')}</span>
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
      </div>
    );
  }
}

export default PixelEditor;
