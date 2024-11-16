```tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Button, Switch, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging"; // Firebase Cloud Messaging (FCM) 사용
import axios from "axios"; // 서버와 통신하기 위해 사용

//import {SCREEN_NAMES} from '../constant/index';
//import {RootStackParamList} from '../types';

export const App = () => {
  // 알람 권한 요청 함수
  const askNotificationPermission = useCallback(() => {
    Alert.alert("혜택 알람 받기", "할인, 쿠폰 정보를 다음에 받으시겠습니까?", [
      {
        text: "할인, 쿠폰 정보 다음에 받기",
        onPress: () => {
          // 30일 후 다시 알림을 요청하는 로직
          setTimeout(
            () => askNotificationPermission(),
            30 * 24 * 60 * 60 * 1000
          );
        },
      },
      {
        text: "혜택 알람 받기",
        onPress: () => {
          messaging()
            .requestPermission()
            .then(() => {
              // 권한 요청 성공 시 서버에 저장
              messaging()
                .getToken()
                .then((token: any) => {
                  axios.post("http://localhost:3000/api/notification/allow", {
                    token,
                  });
                });
            })
            .catch((error: any) => console.log("Permission rejected", error));
        },
      },
    ]);
  }, []);

  useEffect(() => {
    // 앱 초기 로드 시 권한 확인
    messaging()
      .hasPermission()
      .then((enabled: any) => {
        if (!enabled) {
          askNotificationPermission();
        }
      });
  }, [askNotificationPermission]);

  return (
    <View>
      <Button title="혜택 알람 받기" onPress={askNotificationPermission} />
    </View>
  );
};

const NotificationSettings = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isDeviceSettingEnabled, setIsDeviceSettingEnabled] = useState(false);

  useEffect(() => {
    const loadNotificationSetting = async () => {
      const savedSetting = await AsyncStorage.getItem("notificationsEnabled");
      if (savedSetting !== null) {
        setIsNotificationsEnabled(savedSetting === "true");
      }
      const deviceSetting = await messaging().hasPermission();
      setIsDeviceSettingEnabled(
        deviceSetting === messaging.AuthorizationStatus.AUTHORIZED
      );
    };
    loadNotificationSetting();
  }, []);

  const handleInitialChoice = async (choice: boolean) => {
    if (!isDeviceSettingEnabled) {
      Alert.alert(
        "알림 설정 필요",
        "디바이스 설정에서 알림 권한을 허용해주세요."
      );
      return;
    }
    setIsNotificationsEnabled(choice);
    await AsyncStorage.setItem("notificationsEnabled", choice.toString());
    sendNotificationSettingToServer(choice);

    if (choice) {
      await messaging().requestPermission();
      const token = await messaging().getToken();
      sendDeviceTokenToServer(token);
    }
  };

  const toggleNotificationSetting = async () => {
    if (!isDeviceSettingEnabled) {
      Alert.alert(
        "알림 설정 필요",
        "디바이스 설정에서 알림 권한을 허용해주세요."
      );
      return;
    }
    const newValue = !isNotificationsEnabled;
    setIsNotificationsEnabled(newValue);
    await AsyncStorage.setItem("notificationsEnabled", newValue.toString());
    sendNotificationSettingToServer(newValue);

    if (newValue) {
      await messaging().requestPermission();
      const token = await messaging().getToken();
      sendDeviceTokenToServer(token);
    }
  };

  const sendNotificationSettingToServer = async (value: boolean) => {
    try {
      await axios.post("http://your-server-address/api/notifications", {
        userId: "user-id", // Replace with actual user ID
        notificationsEnabled: value,
      });
    } catch (error) {
      console.error("Error sending notification setting to server:", error);
    }
  };

  const sendDeviceTokenToServer = async (token: string) => {
    try {
      await axios.post("http://your-server-address/api/device-token", {
        userId: "user-id", // Replace with actual user ID
        deviceToken: token,
      });
    } catch (error) {
      console.error("Error sending device token to server:", error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {/* Initial Prompt */}
      <View style={{ marginBottom: 20 }}>
        <Text>앱 푸시 알림을 설정하시겠습니까?</Text>
        <Button title="앱푸시 받기" onPress={() => handleInitialChoice(true)} />
        <Button title="다음에" onPress={() => handleInitialChoice(false)} />
      </View>

      {/* Toggle in Settings */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}
      >
        <Text>알람 설정</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={toggleNotificationSetting}
        />
      </View>
    </View>
  );
};

export default NotificationSettings;
```
