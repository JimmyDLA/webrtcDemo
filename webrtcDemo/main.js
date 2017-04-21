import React, { Component } from 'react';
import { Platform, View, Text, Button, Alert, TouchableOpacity } from 'react-native';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  getUserMedia
} from 'react-native-webrtc';

const onButtonPress = () => {
  Alert.alert('Button has been pressed!');
};

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
      <View style={styles.container}>
        <RTCView streamURL={this.state.videoURL} style={styles.video}/>

        <TouchableOpacity style={styles.answer}>
          <Text style={styles.text}>
            Answer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.decline}>
          <Text style={styles.text}>
            Decline
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.end}>
          <Text style={styles.text}>
            End
          </Text>
        </TouchableOpacity>


      </View>

    );
  }
}
const styles = {
  end:{
    position: 'absolute',
    left: 275,
    top: 1000,
    borderColor: 'white',
    borderWidth: 3,
    backgroundColor: 'rgb(255,25,50)',
    height:128,
    width: 250,
    borderRadius: 64,
    flex:1,
    justifyContent: 'center',
    alignItems: 'center'
    // display:'none'
  },
  decline: {
    position: 'absolute',
    left: 120,
    top: 1000,
    borderColor: 'white',
    borderWidth: 3,
    backgroundColor: 'rgb(255,25,50)',
    height:128,
    width: 128,
    borderRadius: 64,
    flex:1,
    justifyContent: 'center',
    alignItems: 'center'

  },
  container : {
    flex: 1,
    backgroundColor: "rgb(100,100,255)",
    borderWidth : 1,
    borderColor : "rgb(0,0,0)"
  },
  video : {
    flex: 1,
    borderWidth: 1
  },
  answer: {
    //flex: 1,
    position: 'absolute',
    left: 550,
    top: 1000,
    borderColor: 'white',
    borderWidth: 3,
    backgroundColor: 'rgb(0,165,0)',
    height:128,
    width: 128,
    borderRadius: 64,
    flex:1,
    justifyContent: 'center',
    alignItems: 'center'
    // display: "none"
  },
  text: {
    fontSize: 35,
    color: 'white'
  }

}


export default Main;
