# react-native

ReactNative 인프런 강의 참고 프로젝트!

https://www.inflearn.com/course/%EB%A7%9B%EC%A7%91-%EC%A7%80%EB%8F%84%EC%95%B1-%EB%A7%8C%EB%93%A4%EA%B8%B0-reactnative-nestjs

`study.git/ReactNative/환경구축.md` 내용 참고!

강의에서 사용하는버전은 React Native 0.72.6 버전

## 백엔드 소스코드 (3-7 백엔드 서버 실행하기 강의에 사용됩니다)

- [수업 자료] 파일 다운로드 또는 https://github.com/InKyoJeong/Matzip/tree/server > Code > Download ZIP
- 강의별 소스코드
  https://github.com/InKyoJeong/Matzip/tree/lecture/섹션-수업코드

# 유용한 추가 패키지 설치

```bash
# React Native WebView 설치
npm install react-native-webview

# React Navigation 관련 패키지 설치
npm install @react-navigation/native @react-navigation/stack react-navigation-stack

# 추가적으로 필요한 패키지 설치 (주의! react-native 에 맞는 버전 설치!!)
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler@^2.16.0

# TypeScript 관련 패키지 설치 (개발 환경)
npm install --save-dev @types/react-native @types/react-navigation @types/react-navigation-stack
```

iOS 의 경우, 신규 NPM 설치 후

```
cd ios && pod install
```

# 주의사항

Geolocation 권한:  
사용자 위치를 가져오기 위해서는 Android 및 iOS에서 위치 권한이 필요합니다. AndroidManifest.xml 파일과 Info.plist 파일에서 위치 권한을 설정해야 합니다.

# 네이티브 설정(iOS/Android)

iOS 와 Android 환경에서 react-native-webview 와 react-navigation 의 네이티브 디펜던시를 처리하기 위해  
추가적으로 네이티브 설정을 해야 할 수 있습니다.

## iOS:

WebView 나 네이티브 모듈을 사용하는 라이브러리를 추가한 후에는 CocoaPods 명령을 실행해야 합니다.

```
cd ios && pod install
```

## Android:

React Native가 자동으로 링크되지 않으면, MainApplication.java 에 수동으로 패키지를 추가해야 할 수 있습니다.  
하지만 최신 버전의 React Native에서는 보통 자동으로 처리됩니다.
