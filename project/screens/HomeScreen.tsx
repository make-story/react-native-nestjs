import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import Swiper from 'react-native-swiper';
import {WebView} from 'react-native-webview';
import {StackNavigationProp} from '@react-navigation/stack';

//import {SCREEN_NAMES} from '../constant/index';
import {RootStackParamList} from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const menuItems = [
    {name: '지도', action: () => navigation.navigate('Map')},
    {name: '메뉴2', action: () => {}},
    {name: '메뉴3', action: () => {}},
    {name: '메뉴4', action: () => {}},
  ];

  return (
    <View style={{flex: 1}}>
      {/* 상단 슬라이드 배너 */}
      <View style={{height: 200}}>
        <Swiper autoplay>
          <Image
            source={{uri: 'https://example.com/banner1.jpg'}}
            style={styles.bannerImage}
          />
          <Image
            source={{uri: 'https://example.com/banner2.jpg'}}
            style={styles.bannerImage}
          />
        </Swiper>
      </View>

      {/* 웹뷰 메인 페이지 */}
      <WebView source={{uri: 'https://example.com/main'}} style={{flex: 1}} />

      {/* 그리드 메뉴 */}
      <View style={styles.gridContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.gridItem}
            onPress={item.action}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  gridItem: {
    width: '40%',
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
  },
});

export default HomeScreen;
