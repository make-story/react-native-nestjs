import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';

import {SCREEN_NAMES} from '../constant/index';
import {RootStackParamList} from '../types';

// Navigation Prop 타입 정의
type SplashScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Splash'
>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

const SplashScreen: React.FC<Props> = ({navigation}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      /*navigation.replace(SCREEN_NAMES.WEB_VIEW, {
        url: 'http://www.makestory.net',
      });*/
      navigation.replace(SCREEN_NAMES.PUSH_NOTIFICATION);
    }, 2000);
    return () => clearTimeout(timer); // 타이머 정리
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>힐링하다</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default SplashScreen;
