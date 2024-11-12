import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Button, Text, View } from "react-native";
import "../global.css"


function FirstPageScreen({ navigation }) {
  return (
    <View className="flex-1 justify-center m-4">
      <Button
        title="Next page"
        onPress={() => navigation.navigate("SecondPage")}
      />
    </View>
  );
}

function SecondPageScreen({ navigation }) {
  return (
    <View className="justify-center items-center flex-1">
      <Text className="italic">Second Page</Text>
    </View>
  );
}

export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FirstPage"
        component={FirstPageScreen}
        options={{ title: "First Page" }}
      />
      <Stack.Screen 
        name="SecondPage" 
        component={SecondPageScreen} 
        options={{ title: "Second Page" }}
      />
    </Stack.Navigator>
  );
}
