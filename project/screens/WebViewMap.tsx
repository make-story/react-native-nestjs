import React from 'react';
import {Button, View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WebView'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const MapPage: React.FC<Props> = ({navigation}) => {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button
        title="지도 보기"
        onPress={() =>
          navigation.navigate('WebView', {url: 'https://map.kakao.com'})
        }
      />
    </View>
  );
};

export default MapPage;
