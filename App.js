import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import BuilderScreen from './screens/BuilderScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';

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
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Builder" component={BuilderScreen} />
        <Tab.Screen name="Workout" component={WorkoutScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

