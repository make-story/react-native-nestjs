import React, {useEffect, useState} from 'react';
import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  AppState,
  View,
  Text,
  Button,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import BackgroundGeolocation from 'react-native-background-geolocation';
import PushNotification from 'react-native-push-notification';
import {StackNavigationProp} from '@react-navigation/stack';

import {SCREEN_NAMES} from '../constant/index';
import {RootStackParamList} from '../types';

type PushNotificationNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PushNotification'
>;

type Props = {
  navigation: PushNotificationNavigationProp;
};

const PushNotificationScreen: React.FC<Props> = ({navigation}) => {
  const [beaconInfo, setBeaconInfo] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    // BLE 초기화
    BleManager.start({showAlert: false});
    const bleManagerEmitter = NativeModules.BleManager
      ? new NativeEventEmitter(NativeModules.BleManager)
      : null;
    if (!NativeModules.BleManager) {
      console.error(
        'BleManager is not properly linked. Make sure the native module is linked correctly.',
      );
      return;
    }

    // 푸시 알림 설정
    PushNotification.configure({
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      requestPermissions: Platform.OS === 'ios',
    });

    // 비콘 스캔 시작
    const startScan = () => {
      BleManager.scan([], 5, true).then(() => {
        console.log('Scanning...');
      });
    };

    // 앱 상태에 따라 스캔 시작
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' || nextAppState === 'background') {
        startScan();
      }
    };
    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    // 비콘 발견 이벤트 핸들러 등록
    const handleDiscoverPeripheral = (peripheral: any) => {
      if (peripheral.name && peripheral.name.includes('Beacon')) {
        // 비콘 근처에 있을 때 푸시 알림 전송 및 화면에 비콘 정보 출력
        PushNotification.localNotification({
          title: '쿠폰 알림',
          message: '쿠폰이 있습니다.',
        });
        setBeaconInfo(
          `Beacon 발견: ${peripheral.name} (${
            peripheral.id
          }) - ${JSON.stringify(peripheral)}`,
        );
      }
    };
    if (bleManagerEmitter) {
      bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverPeripheral,
      );
    }

    // Geofencing 설정
    BackgroundGeolocation.on('geofence', (geofence: {action: string}) => {
      console.log('[geofence] -', geofence);
      if (geofence.action === 'ENTER') {
        PushNotification.localNotification({
          title: '매장 방문 알림',
          message: '특정 매장을 방문하셨습니다. 쿠폰이 있습니다!',
        });
      }
    });

    // 위치 업데이트 설정
    BackgroundGeolocation.on(
      'location',
      (location: {coords: {latitude: any; longitude: any}}) => {
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      },
    );

    BackgroundGeolocation.ready(
      {
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        distanceFilter: 10,
        stopTimeout: 1,
        debug: false,
        logLevel: BackgroundGeolocation.LOG_LEVEL_OFF,
        startOnBoot: true,
        stopOnTerminate: false,
        locationAuthorizationRequest: 'Always',
      },
      state => {
        if (!state.enabled) {
          BackgroundGeolocation.start();
        }

        // 전국의 여러 매장 위치에 대한 Geofence 추가
        const storeLocations = [
          {
            identifier: 'store-1',
            latitude: 37.4219999,
            longitude: -122.0840575,
          },
          {identifier: 'store-2', latitude: 37.33182, longitude: -122.03118},
          // 추가적인 매장 위치를 여기에 정의
        ];

        storeLocations.forEach(store => {
          BackgroundGeolocation.addGeofence({
            identifier: store.identifier,
            radius: 200, // 반경 200미터
            latitude: store.latitude,
            longitude: store.longitude,
            notifyOnEntry: true,
            notifyOnExit: false,
          });
        });
      },
    );

    // 앱이 백그라운드에서도 비콘을 감지할 수 있도록 설정
    startScan();

    return () => {
      if (bleManagerEmitter) {
        bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
      }
      appStateSubscription.remove();
      BackgroundGeolocation.removeAllListeners();
    };
  }, []);

  return (
    <View>
      <Text>Push Notification Screen</Text>
      {beaconInfo && <Text>{beaconInfo}</Text>}
      {location && (
        <Text>
          현재 위치: 위도 {location.latitude}, 경도 {location.longitude}
        </Text>
      )}
      <Button
        title="웹뷰 화면으로 이동"
        onPress={() =>
          navigation.navigate(SCREEN_NAMES.WEB_VIEW, {
            url: 'http://www.makestory.net',
          })
        }
      />
    </View>
  );
};

export default PushNotificationScreen;
