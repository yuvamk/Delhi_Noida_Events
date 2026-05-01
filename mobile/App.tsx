import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';

import { AuthProvider } from './src/contexts/AuthContext';
import { RootStackParamList, TabParamList } from './src/navigation/types';
import { colors } from './src/theme/colors';

import HomeScreen from './src/screens/HomeScreen';
import EventsScreen from './src/screens/EventsScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import SearchScreen from './src/screens/SearchScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DelhiEventsScreen from './src/screens/DelhiEventsScreen';
import NoidaEventsScreen from './src/screens/NoidaEventsScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AboutScreen from './src/screens/AboutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerHigh,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎪</Text>,
        }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          tabBarLabel: 'Bookmarks',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔖</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <SafeAreaProvider>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="EventDetail" component={EventDetailScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Events" component={EventsScreen} />
            <Stack.Screen name="DelhiEvents" component={DelhiEventsScreen} />
            <Stack.Screen name="NoidaEvents" component={NoidaEventsScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
          </Stack.Navigator>
        </SafeAreaProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
