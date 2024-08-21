import {StyleSheet} from 'react-native';
import { COLORS } from '../../configs/Colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: COLORS.TEXT,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  textContainer: {
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  email: {
    fontSize: 14,
    color: 'gray',
  },
  callIcon: {
    position: 'absolute',
    right: 10,
    backgroundColor: COLORS.CALL,
    borderRadius: 30,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName:{ fontSize: 14, fontWeight:"900",  color: 'white' },
  userEmail:{ fontSize: 14, color: 'white' },
  userInfoContainer:{ backgroundColor: COLORS.PRIMARY, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, paddingHorizontal:15 }

});
