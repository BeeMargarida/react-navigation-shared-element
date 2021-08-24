import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { Button, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  SharedElement,
  createSharedElementStackNavigator,
} from "react-navigation-shared-element";

const Stack = createStackNavigator();
const SharedElementStack = createSharedElementStackNavigator();

const forFade = ({ current, closing }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

const Screen1 = (props: any) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ height: 150, width: 150 }}>
        <SharedElement style={{ flex: 1 }} id="item">
          <View style={{ height: 150, width: 150, backgroundColor: "red" }}>
            <View
              style={{
                height: 150,
                width: 150,
                backgroundColor: "yellow",
                borderRadius: 500,
              }}
            />
          </View>
        </SharedElement>
      </View>
      <Button
        title="press"
        onPress={() => {
          props.navigation.navigate("screen2");
        }}
      />
    </SafeAreaView>
  );
};

const Screen2 = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, flexDirection: "column" }}>
        <View style={{ flex: 1 }} />
        <View style={{ flex: 1 }}>
          <SharedElement style={{ flex: 1, alignItems: "center" }} id="item">
            <View style={{ height: 300, width: 300, backgroundColor: "blue" }}>
              <View
                style={{
                  height: 300,
                  width: 300,
                  backgroundColor: "yellow",
                  borderRadius: 500,
                }}
              />
            </View>
          </SharedElement>
        </View>
      </View>
    </SafeAreaView>
  );
};

const InnerStack = () => (
  <SharedElementStack.Navigator mode="modal" headerMode="none">
    <SharedElementStack.Screen
      name="screen1"
      component={Screen1}
      options={{
        cardStyleInterpolator: forFade,
      }}
    />
    <SharedElementStack.Screen
      name="screen2"
      component={Screen2}
      sharedElements={(route, otherRoute, showing) => {
        const { model } = route.params;
        return [
          {
            id: "item",
            otherId: "item",
            animation: "move",
          },
        ];
      }}
    />
  </SharedElementStack.Navigator>
);

export default () => (
  <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="root"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="root" component={InnerStack} />
      </Stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
);
