React Native 0.72.6을 사용하여 비콘과 가까워질 때 '쿠폰이 있습니다.'라는 푸시 알림을 받는 앱을 만드는 방법을 단계별로 설명드리겠습니다. 이 과정에서는 비콘 SDK를 설정하고, 비콘 및 Geofencing을 활용하여 사용자가 특정 장소에 도달했을 때 푸시 알림을 전송하는 기능을 구현합니다.

### 1. **환경 설정**

#### 1-1. **React Native 프로젝트 초기화**

```bash
npx react-native init BeaconApp --version 0.72.6
cd BeaconApp
```

#### 1-2. **필수 패키지 설치**

비콘 인식과 위치 기반 알림을 위해 다음과 같은 라이브러리가 필요합니다.

- `react-native-ble-manager`: BLE(Bluetooth Low Energy) 비콘과 통신하기 위해 사용됩니다.
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

`App.js` 파일에서 BLE 모듈과 푸시 알림을 초기화합니다.

```javascript
import React, { useEffect } from "react";
import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  AppState,
} from "react-native";
import BleManager from "react-native-ble-manager";
import PushNotification from "react-native-push-notification";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import BackgroundGeolocation from "react-native-background-geolocation";

const App = () => {
  useEffect(() => {
    // BLE 초기화
    BleManager.start({ showAlert: false });
    const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

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
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "active" || nextAppState === "background") {
        startScan();
      }
    };
    AppState.addEventListener("change", handleAppStateChange);

    // 비콘 발견 이벤트 핸들러 등록
    const handleDiscoverPeripheral = (peripheral) => {
      if (peripheral.name && peripheral.name.includes("Beacon")) {
        // 비콘 근처에 있을 때 푸시 알림 전송
        PushNotification.localNotification({
          title: "쿠폰 알림",
          message: "쿠폰이 있습니다.",
        });
      }
    };
    bleManagerEmitter.addListener(
      "BleManagerDiscoverPeripheral",
      handleDiscoverPeripheral
    );

    // Geofencing 설정
    BackgroundGeolocation.on("geofence", (geofence) => {
      console.log("[geofence] -", geofence);
      if (geofence.action === "ENTER") {
        PushNotification.localNotification({
          title: "매장 방문 알림",
          message: "특정 매장을 방문하셨습니다. 쿠폰이 있습니다!",
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
            radius: 200, // 반경 200미터
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
      bleManagerEmitter.removeListener(
        "BleManagerDiscoverPeripheral",
        handleDiscoverPeripheral
      );
      AppState.removeEventListener("change", handleAppStateChange);
      BackgroundGeolocation.removeAllListeners();
    };
  }, []);

  return null;
};

export default App;
```

#### 3-2. **비콘 스캔 및 Geofencing 설정**

- `BleManager.scan([], 5, true)`은 5초 동안 BLE 장치들을 스캔합니다.
- `handleDiscoverPeripheral` 함수는 주변에 비콘이 발견되었을 때 호출되며, `peripheral.name`을 통해 비콘을 확인하고, 근처에 비콘이 있을 때 푸시 알림을 전송합니다.
- `BackgroundGeolocation`을 사용하여 사용자가 특정 매장 위치에 도달하면 푸시 알림을 보냅니다.
- `AppState`를 사용하여 앱이 백그라운드에 있을 때에도 스캔을 유지할 수 있도록 설정합니다.

### 4. **테스트 및 디버깅**

#### 4-1. **물리 디바이스에서 테스트**

- 비콘 기능과 위치 기반 알림은 시뮬레이터에서 테스트할 수 없기 때문에 **실제 iPhone**을 사용해야 합니다.
- iPhone을 Mac에 연결하고, Xcode에서 물리 디바이스를 선택하여 빌드 및 실행합니다.

#### 4-2. **비콘 및 위치 준비**

- 실제 비콘 장치를 준비하여 Bluetooth 범위 내에 위치시킵니다.
- 매장의 위도와 경도 정보를 사용하여 Geofencing을 설정합니다.

### 5. **추가 고려사항**

- **백그라운드 상태 유지**: 앱이 백그라운드에서도 비콘 및 Geofencing을 감지해야 하므로, iOS의 **백그라운드 모드** 설정을 잘 구성해야 합니다. `AppState`를 사용하여 백그라운드 상태에서도 스캔을 유지하도록 설정합니다.
- **배터리 최적화**: Bluetooth 스캔과 위치 추적은 배터리 소모가 크므로 필요할 때만 스캔을 시작하고 종료하는 로직을 추가하는 것이 좋습니다.

### 요약

1. **React Native 프로젝트 초기화 및 필수 패키지 설치**.
2. **iOS 네이티브 설정**을 통해 권한 요청 및 백그라운드 모드 설정.
3. **BLE 모듈 및 Geofencing 설정**을 통해 비콘과 특정 매장 방문 시 푸시 알림 전송.
4. **물리 디바이스**에서 테스트하며 비콘 및 Geofencing 동작 확인.

이 과정을 통해 비콘과 가까워지거나 특정 매장을 방문했을 때 '쿠폰이 있습니다.'라는 푸시 알림을 받는 React Native 앱을 구현할 수 있습니다. 필요한 부분에 따라 코드를 확장하거나 커스터마이징할 수 있습니다.
