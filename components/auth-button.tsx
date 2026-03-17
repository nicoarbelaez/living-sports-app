import React, { useState, ReactNode } from "react";
import { Pressable, View } from "react-native";
import { MotiView, MotiText } from "moti";
import { useAuth } from "@/providers/AuthProvider";

export interface AuthButtonProps {
  icon: ReactNode;
  text: string;
  onPress: () => void;
  /**
   * Additional Tailwind classes for the button container.
   * e.g., "bg-black" for GitHub or "bg-[#F2F2F7]" for Google.
   */
  containerClassName?: string;
  /**
   * Additional Tailwind classes for the text.
   * e.g., "text-white" for GitHub or "text-black" for Google.
   */
  textClassName?: string;
}

export default function AuthButton({
  icon,
  text,
  onPress,
  containerClassName = "bg-[#F2F2F7]",
  textClassName = "text-black",
}: AuthButtonProps) {
  const { isLoading, setIsLoading } = useAuth();
  const [isPressed, setIsPressed] = useState(false);
  const handleOnPress = () => {
    setIsLoading(true);
    onPress();
  };

  return (
    <MotiView
      animate={{ scale: isPressed ? 0.95 : 1 }}
      transition={{
        type: "spring",
        damping: 10,
        mass: 0.5,
      }}>
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={handleOnPress}
        disabled={isLoading}>
        <View
          className={`w-full h-14 rounded-2xl flex-row items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${containerClassName}`}>
          <View className="mr-3">{icon}</View>
          <MotiText className={`text-base font-semibold ${textClassName}`}>
            {isLoading ? "Cargando..." : text}
          </MotiText>
        </View>
      </Pressable>
    </MotiView>
  );
}
