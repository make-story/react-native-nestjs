/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  Text,
  View,
} from 'react-native';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {SCREEN_NAMES} from './constant/index';

import SplashScreen from './screens/SplashScreen';
import WebViewScreen from './screens/WebViewScreen';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import {RootStackParamList} from './types';
import PushNotificationScreen from './screens/PushNotification';
import BleManagerScreen from './screens/BleManagerScreen';
import BlePlxScreen from './screens/BlePlxScreen';

const styles = StyleSheet.create({
  block: {
    padding: 16,
    backgroundColor: '#26a69a',
  },
  dateText: {
    fontSize: 24,
    color: 'white',
  },
});

const Stack = createStackNavigator<RootStackParamList>();

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View>
      <Text
        style={[
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  // 리액트 네이티브 공식 제공 기본 컴포넌트
  /*return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            Edit <Text>App.tsx</Text> to change this screen and then come back
            to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );*/

  // 리액트 네이티브 화면
  /*return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );*/

  // 웹뷰
  return (
    <NavigationContainer>
      <Stack.Navigator
        //initialRouteName={SCREEN_NAMES.SPLASH}
        initialRouteName={SCREEN_NAMES.PUSH_NOTIFICATION}
        screenOptions={{headerShown: false}}>
        <Stack.Screen name={SCREEN_NAMES.SPLASH} component={SplashScreen} />
        <Stack.Screen
          name={SCREEN_NAMES.PUSH_NOTIFICATION}
          component={PushNotificationScreen}
        />
        <Stack.Screen
          name={SCREEN_NAMES.BLE_MANAGER_SCREEN}
          component={BleManagerScreen}
        />
        <Stack.Screen
          name={SCREEN_NAMES.BLE_PLX_SCREEN}
          component={BlePlxScreen}
        />
        <Stack.Screen
          name={SCREEN_NAMES.WEB_VIEW}
          component={WebViewScreen}
          initialParams={{url: 'http://www.makestory.net'}} // 기본 URL 설정
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
