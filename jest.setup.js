jest.mock('react-native/Libraries/Utilities/BackHandler', () => {
  return {
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
    removeEventListener: jest.fn(),
    exitApp: jest.fn(),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    PanGestureHandler: View,
    State: {},
    Directions: {},
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const View = require('react-native').View;
  const inset = {top: 0, right: 0, bottom: 0, left: 0};
  const mockContext = React.createContext(inset);
  return {
    SafeAreaProvider: ({children}) => children,
    SafeAreaView: ({children}) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({x: 0, y: 0, width: 390, height: 844}),
    SafeAreaConsumer: ({children}) => children(inset),
    SafeAreaInsetsContext: mockContext,
    SafeAreaFrameContext: mockContext,
  };
});

jest.mock('react-native-screens', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    enableScreens: jest.fn(),
    ScreenContainer: View,
    Screen: View,
    NativeScreen: View,
    NativeScreenContainer: View,
    ScreenStack: View,
    ScreenStackHeaderConfig: View,
    ScreenStackHeaderSubview: View,
    SearchBar: View,
  };
});
