// src/components/common/Header.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import colors from "@/constants/colors";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  backgroundColor?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showMenu = false,
  rightComponent,
  onBackPress,
  onMenuPress,
  containerStyle,
  titleStyle,
  backgroundColor = colors.primary,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <>
      <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />
      <View style={[styles.container, { backgroundColor }, containerStyle]}>
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          )}
          {showMenu && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onMenuPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="menu" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.rightContainer}>
          {rightComponent || <View style={styles.placeholder} />}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    width: "100%",
    paddingTop: Platform.OS === "ios" ? 0 : 0,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 60,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: 60,
  },
  iconButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 24,
  },
});

export default Header;
