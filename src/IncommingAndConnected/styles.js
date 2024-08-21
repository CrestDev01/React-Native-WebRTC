import {StyleSheet} from 'react-native';
import { COLORS } from '../../configs/Colors';
import { width } from './IncommingAndConnected';

export const styles = 
StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  remoteStream: {
    width: '100%',
    height: '100%',
  },
  myStreamWrapper: {
    position: 'absolute',
    top: 20,
    right: 20,
    height: width * 0.6 + 8,
    width: width * 0.6 + 8,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  myStream: {
    height: width * 0.6,
    width: width * 0.6,
  },
  controls: {
    flexDirection: "row",
    position: "absolute",    
    justifyContent: "space-evenly",
    width: "100%",
    bottom:0,
    backgroundColor:'black',
    padding:12
    },
    iconStyle: {
    borderWidth: 1.5,
    borderColor: "#2B3034",
    },
    messageOverlay: {
      position: 'absolute',      
      height:"100%", width:"100%",
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignSelf:'center',
      alignContent: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      bottom:70,
    },
    messageText: {
      color: 'white',
      fontSize: 16,
      textAlign: 'center',
    },
    });

