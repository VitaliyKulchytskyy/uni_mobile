import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Text, View, TouchableOpacity, TextInput } from "react-native";
import "../global.css"

export default function App() {
  const colors = ["red", "green", "blue", "pink", "cyan", "yellow"];
  const [index, setIndex] = useState(0)

  return (
    <View 
      className='flex-1 justify-center items-center'
      style={[{"backgroundColor": colors[index]}]}>
      <Text className="text-[16px] font-semibold italic color-white p-10">
        {colors[index]}
      </Text>
      <TouchableOpacity 
        className='bg-orange-300 p-3 mt-4 h-[10%] w-[75%] justify-center items-center'   
        onPress={() => setIndex(Math.floor(Math.random() * colors.length))}
      >
        <Text 
          className='text-center text-base text-white font-bold text-[20px]'
        >Change color</Text>
      </TouchableOpacity>
    </View>
  );
}