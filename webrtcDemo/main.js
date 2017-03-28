import React, { Component } from 'react';
import { Platform } from 'react-native';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  getUserMedia
} from 'react-native-webrtc';

class Main extends Component {

  state = {
    videoURL : null,
    isFront : true
  }

  componentDidMount(){
    const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
    const pc = new RTCPeerConnection(configuration);
    const { isFront } = this.state;
    MediaStreamTrack.getSources(sourceInfos => {
      console.log('MediaStreamTrack.getSources', sourceInfos);
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if(sourceInfo.kind === 'video' && sourceInfo.facing === (isFront ? 'front' : 'back')) {
          videoSourceId = sourceInfo.id;
        }
      }
      getUserMedia({
        audio: true,
        video: {
          mandatory: {
            minWidth: 500, // Provide your own width, height and frame rate here
            minHeight: 300,
            minFrameRate: 30
          },
          facingMode: (isFront ? 'user' : 'environment'),
          optional: (videoSourceId ? [{sourceId: videoSourceId}] : [])
        }
      }, (stream) => {
        console.log('Streaming ok = ', stream);
        this.setState({
          videoURL : stream.toURL()
        });
        pc.addStream(stream);
      }, error => {
          console.log("Oooops we got an error!", error.message);
          throw error;
      });
    });
    pc.createOffer((desc) => {
      pc.setLocalDescription(desc, () => {
        // Send pc.localDescription to peer
        console.log('pc.setLocalDescription');
      }, (e) => { throw e; });
    }, (e) => { throw e; });

    pc.onicecandidate = (event) => {
      console.log('onicecandidate', event);
    };
  }

  render(){
    return(
      <RTCView streamURL={this.state.videoURL} style={styles.container}/>

    );
  }
}
const styles = {
  container : {
    flex: 1,
    backgroundColor: "rgb(100,100,255)",
    borderWidth : 1,
    borderColor : "rgb(0,0,0)"
  }
}


export default Main;
