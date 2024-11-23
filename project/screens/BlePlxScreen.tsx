import React, {useCallback, useEffect, useState} from 'react';
import {
  AppState,
  View,
  Text,
  Button,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {BleManager as PlxBleManager, Device} from 'react-native-ble-plx';
import {StackNavigationProp} from '@react-navigation/stack';

import {SCREEN_NAMES} from '../constant/index';
import {RootStackParamList} from '../types';

type PushNotificationNavigationProp = StackNavigationProp<
  RootStackParamList,
  'BlePlxScreen'
>;

type Props = {
  navigation: PushNotificationNavigationProp;
};

interface BeaconInfo {
  id: string;
  name: string | null;
  [key: string]: any;
}

const BlePlxScreen: React.FC<Props> = ({navigation}) => {
  const [beaconInfos, setBeaconInfos] = useState<Map<string, BeaconInfo>>(
    new Map(),
  );

  const handleDiscoverPeripheral = useCallback((device: Device) => {
    if (device && device.id) {
      setBeaconInfos(prev => {
        const updatedBeacons = new Map(prev);
        updatedBeacons.set(device.id, {
          id: device.id,
          name: device.name || 'Unknown',
        });
        return updatedBeacons;
      });
    }
  }, []);

  useEffect(() => {
    const bleManager = new PlxBleManager();
    const subscription = bleManager.onStateChange(state => {
      if (state === 'PoweredOn') {
        bleManager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            console.error(error);
            return;
          }
          if (device) {
            handleDiscoverPeripheral(device);
          }
        });
      }
    }, true);

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        bleManager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            console.error(error);
            return;
          }
          if (device) {
            handleDiscoverPeripheral(device);
          }
        });
      } else {
        bleManager.stopDeviceScan();
      }
    };

    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    const scanInterval = setInterval(() => {
      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error(error);
          return;
        }
        if (device) {
          handleDiscoverPeripheral(device);
        }
      });
    }, 10000);

    return () => {
      appStateSubscription.remove();
      bleManager.stopDeviceScan();
      subscription.remove();
      clearInterval(scanInterval);
    };
  }, [handleDiscoverPeripheral]);

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentContainerStyle={{flexGrow: 1, padding: 16}}>
        <Text>Beacon 정보</Text>
        {[...beaconInfos.values()].map(beacon => (
          <View key={beacon.id} style={{marginVertical: 8}}>
            <Text>ID: {beacon.id}</Text>
            <Text>Name: {beacon.name}</Text>
          </View>
        ))}
        <Button
          title="PushNotification"
          onPress={() => navigation.navigate(SCREEN_NAMES.PUSH_NOTIFICATION)}
        />
        <Button
          title="BleManagerScreen"
          onPress={() => navigation.navigate(SCREEN_NAMES.BLE_MANAGER_SCREEN)}
        />
        <Button
          title="웹뷰 화면으로 이동"
          onPress={() =>
            navigation.navigate(SCREEN_NAMES.WEB_VIEW, {
              url: 'http://www.makestory.net',
            })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default BlePlxScreen;
