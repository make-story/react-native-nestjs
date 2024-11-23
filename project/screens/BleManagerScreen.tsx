import React, {useCallback, useEffect, useState} from 'react';
import {
  NativeEventEmitter,
  NativeModules,
  AppState,
  View,
  Text,
  Button,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import {StackNavigationProp} from '@react-navigation/stack';

import {SCREEN_NAMES} from '../constant/index';
import {RootStackParamList} from '../types';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

type PushNotificationNavigationProp = StackNavigationProp<
  RootStackParamList,
  'BleManagerScreen'
>;

type Props = {
  navigation: PushNotificationNavigationProp;
};

interface BeaconInfo {
  id: string;
  name: string | null;
  [key: string]: any;
}

const BleManagerScreen: React.FC<Props> = ({navigation}) => {
  const [beaconInfos, setBeaconInfos] = useState<Map<string, BeaconInfo>>(
    new Map(),
  );

  const handleDiscoverPeripheral = useCallback((peripheral: any) => {
    if (peripheral && peripheral.id) {
      setBeaconInfos(prev => {
        const updatedBeacons = new Map(prev);
        updatedBeacons.set(peripheral.id, {
          id: peripheral.id,
          name: peripheral.name || 'Unknown',
        });
        return updatedBeacons;
      });
    }
  }, []);

  useEffect(() => {
    BleManager.start({showAlert: false});

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        BleManager.scan([], 10, true).then(() => {
          console.log('Scanning...');
        });
      }
    };

    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    const bleManagerSubscription = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      handleDiscoverPeripheral,
    );

    const scanInterval = setInterval(() => {
      BleManager.scan([], 10, true).then(() => {
        console.log('Scanning for beacons...');
      });
    }, 10000);

    return () => {
      appStateSubscription.remove();
      bleManagerSubscription.remove();
      clearInterval(scanInterval);
    };
  }, [handleDiscoverPeripheral]);

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentContainerStyle={{flexGrow: 1, padding: 16}}>
        <View style={{flex: 1, padding: 16}}>
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default BleManagerScreen;
