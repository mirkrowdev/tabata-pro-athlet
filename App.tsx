import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { setupNotifications } from './utils/workoutNotification';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import BuilderScreen from './screens/BuilderScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import HistoryScreen from './screens/HistoryScreen';
import SessionDetailScreen from './screens/SessionDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import { WorkoutProvider } from './context/WorkoutContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HistoryList" component={HistoryScreen} />
      <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
    </Stack.Navigator>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{title}</Text>
    </View>
  );
}

export default function App() {
  useEffect(() => {
    setupNotifications();
  }, []);

  return (
    <SafeAreaProvider>
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
              component={HistoryStack}
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
    </SafeAreaProvider>
  );
}

