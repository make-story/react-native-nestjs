/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, Button, SafeAreaView} from 'react-native';
//import PushNotificationIOS from '@react-native-community/push-notification-ios';
import BackgroundGeolocation from 'react-native-background-geolocation';
import PushNotification from 'react-native-push-notification';
import {StackNavigationProp} from '@react-navigation/stack';

import {SCREEN_NAMES} from '../constant/index';
import {RootStackParamList} from '../types';

// 상점의 위치 정보 배열
const STORES = [
  {id: 'store1', name: 'Store 1', latitude: 37.5665, longitude: 126.978},
  {id: 'store2', name: 'Store 2', latitude: 37.5651, longitude: 126.9895},
  // 필요한 만큼 상점을 추가하세요
];

type PushNotificationNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PushNotification'
>;

type Props = {
  navigation: PushNotificationNavigationProp;
};

const PushNotificationScreen: React.FC<Props> = ({navigation}) => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // 현재 위치와 상점 위치를 비교하여 근처에 있는 상점이 있는지 확인하는 함수
  const checkNearbyStores = useCallback(
    (latitude: number, longitude: number) => {
      STORES.forEach(store => {
        const distance = getDistanceFromLatLonInMeters(
          latitude,
          longitude,
          store.latitude,
          store.longitude,
        );
        if (distance <= 100) {
          // 거리가 100미터 이내인 경우
          PushNotification.localNotification({
            title: '쿠폰 알림',
            message: `${store.name}에서 사용가능한 쿠폰이 있습니다!`,
          });
        }
      });
    },
    [],
  );

  /*useEffect(() => {
    // 위치 정보가 업데이트될 때 호출되는 이벤트 리스너 설정
    BackgroundGeolocation.onLocation(({coords}) => {
      const {latitude, longitude} = coords;
      setLocation({latitude, longitude});
      checkNearbyStores(latitude, longitude); // 위치를 기반으로 상점 확인
    });

    // BackgroundGeolocation 설정
    BackgroundGeolocation.ready(
      {
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH, // 높은 정확도로 위치 측정
        distanceFilter: 50, // 위치 업데이트 간격 (미터 단위)
        stopOnTerminate: false, // 앱 종료 시에도 위치 추적 유지
        startOnBoot: true, // 디바이스 부팅 시 위치 추적 시작
      },
      state => {
        if (!state.enabled) {
          BackgroundGeolocation.start(); // 위치 추적 시작
        }
      },
    );

    return () => {
      BackgroundGeolocation.removeAllListeners(); // 컴포넌트 언마운트 시 리스너 제거
    };
  }, [checkNearbyStores]);*/

  // 두 좌표 간의 거리를 계산하는 함수 (미터 단위)
  const getDistanceFromLatLonInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371e3; // 지구의 반지름 (미터 단위)
    const dLat = ((lat2 - lat1) * Math.PI) / 180; // 위도 차이 (라디안 단위)
    const dLon = ((lon2 - lon1) * Math.PI) / 180; // 경도 차이 (라디안 단위)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // 두 좌표 간의 거리 (미터 단위)
    return distance;
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1, padding: 16}}>
        <Text>Push Notification Screen</Text>
        {/* 현재 위치 정보를 화면에 출력 */}
        {location && (
          <View style={{marginVertical: 16}}>
            <Text>현재 위치:</Text>
            <Text>위도: {location.latitude}</Text>
            <Text>경도: {location.longitude}</Text>
          </View>
        )}
        <Button
          title="로컬 알림 테스트"
          onPress={() => {
            PushNotification.localNotification({
              title: '알림 테스트',
              message: '로컬 알림이 성공적으로 전송되었습니다!',
            });
          }}
        />
        <Button
          title="BleManagerScreen"
          onPress={() => navigation.navigate(SCREEN_NAMES.BLE_MANAGER_SCREEN)}
        />
        <Button
          title="BlePlxScreen"
          onPress={() => navigation.navigate(SCREEN_NAMES.BLE_PLX_SCREEN)}
        />
        <Button
          title="웹뷰 화면으로 이동"
          onPress={() =>
            navigation.navigate(SCREEN_NAMES.WEB_VIEW, {
              url: 'http://www.makestory.net',
            })
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default PushNotificationScreen;
