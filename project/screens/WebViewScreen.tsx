import React, {useRef} from 'react';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {Alert, Button, View} from 'react-native';

import {SCREEN_NAMES} from '../constant/index';
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
  const {url = 'http://www.makestory.net'} = route.params; // WebView에서 로드할 URL
  const webViewRef = useRef<WebView>(null); // WebView 참조

  // 초기 메시지 전달 (injectedJavaScript)
  // 웹페이지가 로드될 때 초기 메시지를 전달하고 싶다면, WebView의 injectedJavaScript prop을 사용할 수 있습니다.
  const initialJavaScript = `
    (function() {
      window.postMessage(JSON.stringify({ type: 'init', content: 'Page loaded from React Native' }), '*');
    })();
  `;

  // 웹뷰에서 URL 변경 시
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
              navigation.push(SCREEN_NAMES.WEB_VIEW, {url: newUrl});
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

  // 웹뷰에서 메시지 전송
  const sendMessageToWeb = () => {
    // 웹뷰 내부의 웹페이지로 메시지 전달
    const message = JSON.stringify({
      type: 'greeting',
      content: 'Hello from React Native!',
    });

    // 웹 페이지의 window 객체에 postMessage로 메시지 전달
    webViewRef.current?.injectJavaScript(`
      (function() {
        window.postMessage(${message}, '*');
      })();
    `);
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
            navigation.push(SCREEN_NAMES.WEB_VIEW, {url: message});
          },
        },
        {text: '취소', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  return (
    <View style={{flex: 1}}>
      <WebView
        ref={webViewRef}
        source={{uri: url}}
        originWhitelist={['*']}
        style={{flex: 1}}
        javaScriptEnabled={true}
        allowsInlineMediaPlayback={true}
        injectedJavaScript={initialJavaScript} // 웹페이지 로드 시 실행할 JavaScript 코드
        onShouldStartLoadWithRequest={handleNavigationChange} // URL 이동 감지
        onMessage={handleMessage} // 메시지 수신 처리
      />

      {/* 버튼을 눌렀을 때 웹 페이지로 메시지 전달 */}
      <Button title="Send Message to Web" onPress={sendMessageToWeb} />
    </View>
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
  <h1>React Native와 웹 페이지 간의 통신</h1>
  <button onclick="sendMessageToReactNative()">React Native로 메시지 보내기</button>
  <div id="message">메시지를 기다리는 중...</div>

  <script>
    function sendMessageToReactNative() {
      const newUrl = "https://example.com/new-page"; // 이동할 URL
      window.ReactNativeWebView.postMessage(newUrl); // React Native로 메시지 전송
    }
    // 웹페이지에서 메시지 수신
    window.addEventListener('message', (event) => {
      const message = event.data;
      document.getElementById('message').innerText = `수신된 메시지: ${JSON.stringify(message)}`;
    });
  </script>
</body>
</html>

*/
