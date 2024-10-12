import React from 'react';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {Alert} from 'react-native';
import {RootStackParamList} from '../types';

type WebViewScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WebView'
>;
type WebViewScreenRouteProp = RouteProp<RootStackParamList, 'WebView'>;

type Props = {
  navigation: WebViewScreenNavigationProp;
  route: WebViewScreenRouteProp;
};

const WebViewScreen: React.FC<Props> = ({navigation, route}) => {
  const {url} = route.params; // WebView에서 로드할 URL

  const handleNavigationChange = (event: any) => {
    const newUrl = event.url;

    if (newUrl !== url) {
      // 웹뷰에서 링크 클릭 시 React Native로 URL 전달
      Alert.alert(
        '페이지 이동',
        `새로운 페이지로 이동합니다: ${newUrl}`,
        [
          {
            text: '확인',
            onPress: () => {
              // 현재 Stack 닫기
              navigation.pop();
              // 새로운 URL을 가진 WebView 화면 열기
              navigation.push('WebView', {url: newUrl});
            },
          },
          {text: '취소', style: 'cancel'},
        ],
        {cancelable: true},
      );

      return false; // React Native에서 처리했으므로, WebView에서 기본 동작 방지
    }

    return true; // 기본 동작 허용
  };

  // 웹뷰에서 메시지 수신
  const handleMessage = (event: WebViewMessageEvent) => {
    const message = event.nativeEvent.data; // 웹뷰에서 보낸 메시지

    Alert.alert(
      '웹에서 수신한 메시지',
      `메시지: ${message}`,
      [
        {
          text: '확인',
          onPress: () => {
            // 현재 스택 닫고
            navigation.pop();
            // 새로운 웹뷰로 이동
            navigation.push('WebView', {url: message});
          },
        },
        {text: '취소', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  return (
    <WebView
      source={{uri: url}}
      style={{flex: 1}}
      onShouldStartLoadWithRequest={handleNavigationChange} // URL 이동 감지
      onMessage={handleMessage} // 메시지 수신 처리
    />
  );
};

export default WebViewScreen;

/*
웹페이지에서 JavaScript로 React Native에 메시지 보내기

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebView Example</title>
</head>
<body>
  <h1>웹뷰 테스트</h1>
  <button onclick="sendMessageToReactNative()">React Native로 메시지 보내기</button>

  <script>
    function sendMessageToReactNative() {
      const newUrl = "https://example.com/new-page"; // 이동할 URL
      window.ReactNativeWebView.postMessage(newUrl); // React Native로 메시지 전송
    }
  </script>
</body>
</html>

*/
