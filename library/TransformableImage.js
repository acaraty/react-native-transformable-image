/* @flow */

import React, { Component } from 'react';
import { Image } from 'react-native';

import ViewTransformer from 'react-native-view-transformer';

type Props = {|
  pixels: {
    width: number,
    height: number,
  },

  enableTransform?: boolean,
  enableScale?: boolean,
  enableTranslate?: boolean,
  onSingleTapConfirmed: Function,
  onTransformGestureReleased: Function,
  onViewTransformed: Function,
  onLoadStart?: Function,
  onLoad?: Function,
|};

type State = {|
  width: number,
  height: number,
  imageLoaded: boolean,
  pixels?: {
    width: number,
    height: number,
  },
|};

export default class TransformableImage extends Component<Props, State> {
  static defaultProps = {
    enableTransform: true,
    enableScale: true,
    enableTranslate: true,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      imageLoaded: false,
      pixels: undefined,
    };
  }

  componentDidMount() {
    if (!this.props.pixels) {
      this.getImageSize(this.props.source);
    }
  }

  render() {
    let maxScale = 1;
    let contentAspectRatio;
    let width;
    let height; // pixels

    if (this.props.pixels) {
      // if provided via props
      width = this.props.pixels.width;
      height = this.props.pixels.height;
    } else if (this.state.pixels) {
      // if got using Image.getSize()
      width = this.state.pixels.width;
      height = this.state.pixels.height;
    }

    if (width && height) {
      contentAspectRatio = width / height;
      if (this.state.width && this.state.height) {
        maxScale = Math.max(width / this.state.width, height / this.state.height);
        maxScale = Math.max(1, maxScale);
      }
    }

    return (
      <ViewTransformer
        enableTransform={this.props.enableTransform && this.state.imageLoaded} // disable transform until image is loaded
        enableScale={this.props.enableScale}
        enableTranslate={this.props.enableTranslate}
        enableResistance
        onTransformGestureReleased={this.props.onTransformGestureReleased}
        onViewTransformed={this.props.onViewTransformed}
        onSingleTapConfirmed={this.props.onSingleTapConfirmed}
        maxScale={maxScale}
        contentAspectRatio={contentAspectRatio}
        onLayout={this.onLayout.bind(this)}
      >
        <Image
          style={{ backgroundColor: 'transparent' }}
          resizeMode="contain"
          onLoadStart={this.onLoadStart.bind(this)}
          onLoad={this.onLoad.bind(this)}
          capInsets={{ left: 0.1, top: 0.1, right: 0.1, bottom: 0.1 }} // on iOS, use capInsets to avoid image downsampling
        />
      </ViewTransformer>
    );
  }

  onLoadStart(e: Object) {
    if (this.props.onLoadStart) {
      this.props.onLoadStart(e);
    }
    this.setState({
      imageLoaded: false,
    });
  }

  onLoad(e: Object) {
    if (this.props.onLoad) {
      this.props.onLoad(e);
    }
    this.setState({
      imageLoaded: true,
    });
  }

  onLayout(e: Object) {
    const { width, height } = e.nativeEvent.layout;
    if (this.state.width !== width || this.state.height !== height) {
      this.setState({
        width,
        height,
      });
    }
  }

  getImageSize(source: Object) {
    if (!source) return;

    if (typeof Image.getSize === 'function') {
      if (source && source.uri) {
        Image.getSize(source.uri, (width, height) => {
          if (width && height) {
            if (this.state.pixels && this.state.pixels.width === width && this.state.pixels.height === height) {
              // no need to update state
            } else {
              this.setState({ pixels: { width, height } });
            }
          }
        });
      }
    }
  }
}
