/* @flow */

import React, { Component } from 'react';
import FastImage from 'react-native-fast-image';
import ViewTransformer from 'react-native-view-transformer';

let DEV = false;

type Props = {
  pixels?: {
    width: number,
    height: number,
  },

  enableTransform?: boolean,
  enableScale?: boolean,
  enableTranslate?: boolean,
  onSingleTapConfirmed?: Function,
  onTransformGestureReleased?: Function,
  onViewTransformed?: Function,
  onLoadStart?: Function,
  onLoad?: Function,
  source:Object,
  style:Object,
};

type State = {
  pixels?: {
    width: number,
    height: number,
  },

  imageLoaded: boolean,
  keyAccumulator: number,
  width: number,
  height: number,
};

export default class TransformableImage extends Component<Props, State> {
  static enableDebug() {
    DEV = true;
  }

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
      keyAccumulator: 1,
    };
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
        ref="viewTransformer"
        key={`viewTransformer#${this.state.keyAccumulator}`} // when image source changes, we should use a different node to avoid reusing previous transform state
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
        style={this.props.style}
      >
        <FastImage
          source={this.props.source}
          style={[this.props.style, { backgroundColor: 'transparent' }]}
          resizeMode="contain"
          onLoadStart={this.onLoadStart.bind(this)}
          onLoad={this.onLoad.bind(this)}
        />
      </ViewTransformer>
    );
  }

  onLoadStart(e: Object) {
    if(this.props.onLoadStart) {
      this.props.onLoadStart(e);
    }
    this.setState({
      imageLoaded: false,
    });
  }

  onLoad(e: Object) {
    if(this.props.onLoad) {
      this.props.onLoad(e);
    }
    this.setState({
      pixels: { width: e.nativeEvent.width, height:e.nativeEvent.height },
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

  getViewTransformerInstance() {
    return this.refs.viewTransformer;
  }
}

function sameSource(source, nextSource) {
  if (source === nextSource) {
    return true;
  }
  if (source && nextSource) {
    if (source.uri && nextSource.uri) {
      return source.uri === nextSource.uri;
    }
  }
  return false;
}
