/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

const { NotificationManager } = NativeModules;

// const eventEmitter = new NativeEventEmitter(NotificationManager);

import { WebView } from 'react-native-webview';
import Biometrics from 'react-native-biometrics';
import TouchID from 'react-native-touch-id';


function App(): React.JSX.Element {
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [isFaceRequired, setIsFaceRequired] = useState(false);
  // Construct the URL with the query string
  // let url = `http://10.100.7.243:3000/login?source=${source}`;
  const url =
    'http://10.100.7.243:3000/login?' +
    new URLSearchParams({
      source: 'mobile',
    });
  const [biometryType, setBiometryType] = useState('');

  const checkBiometrics = () => {
    TouchID.isSupported({
      faceid: true, // Specify that Face ID is required
    })
      .then(biometryType => {
        setBiometryType(biometryType);
        authenticate();
      })
      .catch(error => console.error('Biometrics check error:', error));
  };

  const authenticate = () => {
    TouchID.authenticate('Authenticate to proceed', {
      faceid: true, // Specify that Face ID is required
    })
      .then(success => {
        // if (webviewRef.current) {
        const postData = {
          Success: success,
          ExpirationDate: expirationDate,
        };
        webviewRef.current?.postMessage(JSON.stringify(postData));
        setIsFaceRequired(false);
        // }
      })
      .catch(error => {
        // console.error('Authentication failed:', error) 
        if (
          error.name === 'LAErrorUserCancel' ||
          error.name === 'LAErrorSystemCancel'
        ) {
          // Handle cancellation
          const cancelData = {
            onCancel: true,
          };
          webviewRef.current?.postMessage(JSON.stringify(cancelData));
          setIsFaceRequired(false);
        }
      });
  };

  function onMessage(data: any) {
    setIsFaceRequired(data.nativeEvent.data);
    // alert(data.nativeEvent.data);
  }

  function sendDataToWebView() {
    if (webviewRef.current) {
      webviewRef.current.postMessage(url);
    }
  }

  useEffect(() => {
    if (isFaceRequired) {
      checkBiometrics();
    }
  }, [isFaceRequired]);

  useEffect(() => {
    sendDataToWebView();
    setExpirationDate(new Date(Date.now() + 20 * 60 * 1000));
    NotificationManager.getNativeString((nativeString: string) => {
      console.log(nativeString + ' from native module');
    });
    NotificationManager.getDeviceToken(deviceToken => {
      console.log(deviceToken + ' from native module Device Token');
    });
  }, []);

  const webviewRef = useRef<WebView | null>(null);

  // const [permissions, setPermissions] = useState({});

  // useEffect(() => {
  //   const type = 'notification';
  //   PushNotificationIOS.addEventListener(type, onRemoteNotification);
  //   return () => {
  //     PushNotificationIOS.removeEventListener(type);
  //   };
  // });

  // const onRemoteNotification = (notification) => {
  //   const isClicked = notification.getData().userInteraction === 1;

  //   if (isClicked) {
  //     // Navigate user to another screen
  //   } else {
  //     // Do something else with push notification
  //   }
  //   // Use the appropriate result based on what you needed to do for this notification
  //   const result = PushNotificationIOS.FetchResult.NoData;
  //   notification.finish(result);
  // };
  // eventEmitter.addListener('DeviceTokenReceived', event => {
  //   console.log(event); // This will log the device token
  // });
  // useEffect(() => {
  //   // Request permissions when component mounts
  //   PushNotificationIOS.requestPermissions();

  //   // Add event listener for receiving notifications
  //   const subscription = PushNotificationIOS.addEventListener(
  //     'notification',
  //     handleNotification
  //   );

  //   // Add event listener for getting device token
  //   const tokenSubscription = PushNotificationIOS.addEventListener(
  //     'register',
  //     handleRegister
  //   );

  //   return () => {
  //     // Remove event listeners when component unmounts
  //     subscription.remove();
  //     tokenSubscription.remove();
  //   };
  // }, []);

  // const handleNotification = (notification) => {
  //   // Handle received notification
  //   console.log('Received Notification:', notification);
  // };

  // const handleRegister = (deviceToken) => {
  //   // Handle device token
  //   console.log('Device Token:', deviceToken);
  // };

  // const [permissions, setPermissions] = useState({});

  // useEffect(() => {
  //   const type = 'notification';
  //   PushNotificationIOS.addEventListener(type, onRemoteNotification);
  //   return () => {
  //     PushNotificationIOS.removeEventListener(type);
  //   };
  // });

  // const onRemoteNotification = (notification) => {
  //   const isClicked = notification.getData().userInteraction === 1;

  //   if (isClicked) {
  //     // Navigate user to another screen
  //   } else {
  //     // Do something else with push notification
  //   }
  //   // Use the appropriate result based on what you needed to do for this notification
  //   const result = PushNotificationIOS.FetchResult.NoData;
  //   notification.finish(result);
  // };

  // const sendTestNotification = () => {
  //   // Send a test notification
  //   PushNotificationIOS.presentLocalNotification({
  //     alertTitle: 'Test Notification',
  //     alertBody: 'This is a test notification',
  //     applicationIconBadgeNumber: 1, // Increment app badge number
  //   });
  // };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => sendDataToWebView()}
          style={{
            padding: 20,
            width: 300,
            marginTop: 100,
            backgroundColor: '#6751ff',
            alignItems: 'center',
          }}>
          <Text style={{ fontSize: 20, color: 'white' }}>
            Send Data To WebView / Website
          </Text>
        </TouchableOpacity>
      </View> */}
      <WebView
        // source={{
        //   uri: 'http://10.100.7.243:3000?source=mobile',
        //   method: 'POST',
        // }}
        source={{
          uri: url,
          method: 'POST',
        }}
        ref={webviewRef}
        onMessage={onMessage}
      />
      {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Biometry Type: {biometryType}</Text>
        <Button title="Check Biometrics" onPress={checkBiometrics} />
      </View> */}
      {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button title="Send Test Notification" onPress={sendTestNotification} />
      </View> */}
    </SafeAreaView>
  );
}

export default App;
