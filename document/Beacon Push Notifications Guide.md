React Native 0.72.6을 사용하여 비콘과 가까워질 때 '해당 매장에서 사용 가능한 쿠폰이 있습니다.'라는 푸시 알림을 받는 앱을 만드는 방법을 단계별로 설명드리겠습니다. 이 과정에서는 비콘 SDK를 설정하고, 비콘 및 Geofencing을 활용하여 사용자가 특정 장소에 도달했을 때 푸시 알림을 전송하는 기능을 구현합니다.

### 1. **환경 설정**

#### 1-1. **React Native 프로젝트 초기화**

```bash
npx react-native init BeaconApp --version 0.72.6
cd BeaconApp
```

#### 1-2. **필수 패키지 설치**

비콘 인식과 위치 기반 알림을 위해 다음과 같은 라이브러리가 필요합니다.

- `react-native-ble-manager`: BLE(Bluetooth Low Energy) 비콘과 통신하기 위해 사용됩니다. (주의! 리액트 네이티브 0.72.x 의 경우 react-native-ble-manager@11.x 설치)
- `@react-native-community/push-notification-ios` 및 `react-native-push-notification`: 로컬 푸시 알림을 관리하기 위해 사용합니다.
- `react-native-background-geolocation`: Geofencing을 설정하여 사용자가 특정 위치에 도달했을 때 알림을 받기 위해 사용합니다.

```bash
npm install react-native-ble-manager @react-native-community/push-notification-ios react-native-push-notification react-native-background-geolocation
```

### 2. **iOS 네이티브 설정**

#### 2-1. **Xcode 설정**

- `ios` 디렉토리에서 `.xcworkspace` 파일을 열어 Xcode에서 프로젝트를 엽니다.
- **Signing & Capabilities**에서 Apple Developer 계정을 연결합니다.
- **Background Modes** 설정에서 **Uses Bluetooth LE accessories**, **Background Fetch**, **Location updates**, 및 **Remote notifications**를 활성화합니다.
- **Push Notifications**와 **Background Modes**에서 **Remote notifications**도 활성화해야 합니다.

#### 2-2. **Info.plist 수정**

`ios/BeaconApp/Info.plist` 파일에 Bluetooth 사용 권한 및 위치 권한을 추가합니다.

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>블루투스를 사용하여 비콘과 연결합니다.</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>앱이 근처의 비콘을 감지하거나 특정 매장을 방문했을 때 쿠폰 알림을 보내기 위해 위치 정보를 사용합니다.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>앱이 근처의 비콘을 감지하거나 특정 매장을 방문했을 때 위치 정보를 사용합니다.</string>
<key>UIBackgroundModes</key>
<array>
  <string>bluetooth-central</string>
  <string>location</string>
  <string>fetch</string>
  <string>remote-notification</string>
</array>
```

### 3. **비콘 및 Geofencing 감지 및 푸시 알림 코드 구현**

#### 3-1. **BLE 및 푸시 알림 초기화**

`App.tsx` 파일에서 BLE 모듈과 푸시 알림을 초기화합니다.

```tsx
import React, { useEffect, useState } from "react";
import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  AppState,
  View,
  Text,
  Button,
} from "react-native";
import BleManager from "react-native-ble-manager";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import BackgroundGeolocation from "react-native-background-geolocation";
import PushNotification from "react-native-push-notification";
import { StackNavigationProp } from "@react-navigation/stack";

import { SCREEN_NAMES } from "../constant/index";
import { RootStackParamList } from "../types";

type PushNotificationNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PushNotification"
>;

type Props = {
  navigation: PushNotificationNavigationProp;
};

const PushNotificationScreen: React.FC<Props> = ({ navigation }) => {
  const [beaconInfo, setBeaconInfo] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    // BLE 초기화
    BleManager.start({ showAlert: false });
    const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

    if (!NativeModules.BleManager) {
      console.error(
        "BleManager is not properly linked. Make sure the native module is linked correctly."
      );
      return;
    }

    // 푸시 알림 설정
    PushNotification.configure({
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
        if (Platform.OS === "ios") {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      requestPermissions: Platform.OS === "ios",
    });

    // 비콘 스캔 시작
    const startScan = () => {
      BleManager.scan([], 5, true).then(() => {
        console.log("Scanning...");
      });
    };

    // 앱 상태에 따라 스캔 시작
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" || nextAppState === "background") {
        startScan();
      }
    };
    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // 비콘 발견 이벤트 핸들러 등록
    const handleDiscoverPeripheral = (peripheral: any) => {
      if (peripheral.name && peripheral.name.includes("Beacon")) {
        // 비콘 근처에 있을 때 푸시 알림 전송 및 화면에 비콘 정보 출력
        PushNotification.localNotification({
          title: "쿠폰 알림",
          message: "해당 매장에서 사용 가능한 쿠폰이 있습니다.",
        });
        setBeaconInfo(
          `Beacon 발견: ${peripheral.name} (${
            peripheral.id
          }) - ${JSON.stringify(peripheral)}`
        );
      }
    };
    bleManagerEmitter.addListener(
      "BleManagerDiscoverPeripheral",
      handleDiscoverPeripheral
    );

    // Geofencing 설정
    BackgroundGeolocation.on("geofence", (geofence: { action: string }) => {
      console.log("[geofence] -", geofence);
      if (geofence.action === "ENTER") {
        PushNotification.localNotification({
          title: "매장 방문 알림",
          message: "해당 매장에서 사용 가능한 쿠폰이 있습니다.",
        });
      }
    });

    // 위치 업데이트 설정
    BackgroundGeolocation.on(
      "location",
      (location: { coords: { latitude: any; longitude: any } }) => {
        if (location?.coords?.latitude && location?.coords?.longitude) {
          setLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      }
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
        locationAuthorizationRequest: "Always",
      },
      (state) => {
        if (!state.enabled) {
          BackgroundGeolocation.start();
        }

        // 전국의 여러 매장 위치에 대한 Geofence 추가
        const storeLocations = [
          {
            identifier: "store-1",
            latitude: 37.4219999,
            longitude: -122.0840575,
          },
          { identifier: "store-2", latitude: 37.33182, longitude: -122.03118 },
          // 추가적인 매장 위치를 여기에 정의
        ];

        storeLocations.forEach((store) => {
          BackgroundGeolocation.addGeofence({
            identifier: store.identifier,
            radius: 100, // 반경 100미터
            latitude: store.latitude,
            longitude: store.longitude,
            notifyOnEntry: true,
            notifyOnExit: false,
          });
        });
      }
    );

    // 앱이 백그라운드에서도 비콘을 감지할 수 있도록 설정
    startScan();

    return () => {
      bleManagerEmitter.removeAllListeners("BleManagerDiscoverPeripheral");
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
            url: "http://www.makestory.net",
          })
        }
      />
    </View>
  );
};

export default PushNotificationScreen;
```

위 코드에서는 **비콘 근처**에 있을 때와 **특정 위치 범위 안**에 들어
