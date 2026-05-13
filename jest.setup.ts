/**
 * Avoid real @expo/vector-icons font loading (async setState) which triggers
 * "not wrapped in act(...)" noise in tests. Icons are not under test.
 */
jest.mock('@expo/vector-icons', () => {
  const React = require('react') as typeof import('react');
  const { View } = require('react-native') as typeof import('react-native');

  const MockIcon = () => React.createElement(View, { testID: 'mock-vector-icon' });

  return {
    AntDesign: MockIcon,
    Entypo: MockIcon,
    EvilIcons: MockIcon,
    Feather: MockIcon,
    FontAwesome: MockIcon,
    Fontisto: MockIcon,
    Foundation: MockIcon,
    Ionicons: MockIcon,
    MaterialCommunityIcons: MockIcon,
    MaterialIcons: MockIcon,
    Octicons: MockIcon,
    SimpleLineIcons: MockIcon,
    Zocial: MockIcon,
  };
});
