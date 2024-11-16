import React, {useEffect} from 'react';
import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  AppState,
  View,
  Text,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import BackgroundGeolocation from 'react-native-background-geolocation';
import PushNotification from 'react-native-push-notification';

const PushNotificationScreen: React.FC = () => {
  useEffect(() => {
    // BLE 초기화
    // 주의! NativeModules.BleManagerModule 대신 NativeModules.BleManager를 사용합니다. (v1.0.0 이후)
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
        // 비콘 근처에 있을 때 푸시 알림 전송
        PushNotification.localNotification({
          title: '쿠폰 알림',
          message: '쿠폰이 있습니다.',
        });
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
    </View>
  );
};

export default PushNotificationScreen;
