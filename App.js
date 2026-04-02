import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import BuilderScreen from './screens/BuilderScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import { WorkoutProvider } from './context/WorkoutContext';

const Tab = createBottomTabNavigator();

function Placeholder({ title }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{title}</Text>
    </View>
  );
}

export default function App() {
  return (
    <WorkoutProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: '#1e1e1e' },
            tabBarActiveTintColor: '#e63946',
            tabBarInactiveTintColor: '#999',
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <Ionicons
                  name={focused ? 'home' : 'home-outline'}
                  size={24}
                  color={focused ? '#e63946' : '#999'}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Builder"
            component={BuilderScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <Ionicons
                  name={focused ? 'construct' : 'construct-outline'}
                  size={24}
                  color={focused ? '#e63946' : '#999'}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Workout"
            component={WorkoutScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <Ionicons
                  name={focused ? 'play-circle' : 'play-circle-outline'}
                  size={24}
                  color={focused ? '#e63946' : '#999'}
                />
              ),
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <Ionicons
                  name={focused ? 'time' : 'time-outline'}
                  size={24}
                  color={focused ? '#e63946' : '#999'}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <Ionicons
                  name={focused ? 'settings' : 'settings-outline'}
                  size={24}
                  color={focused ? '#e63946' : '#999'}
                />
              ),
            }}
          />
      </Tab.Navigator>
    </NavigationContainer>
  </WorkoutProvider>
  );
}

