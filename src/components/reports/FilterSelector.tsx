// src/components/reports/FilterSelector.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import colors from "@/constants/colors";

interface FilterOption {
  id: string;
  label: string;
  value: string | null;
  icon: string;
}

interface FilterSelectorProps {
  options: FilterOption[];
  selectedValue: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
}

const FilterSelector: React.FC<FilterSelectorProps> = ({
  options,
  selectedValue,
  onValueChange,
  placeholder = "Chọn...",
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const getSelectedOption = () => {
    return options.find((option) => option.value === selectedValue);
  };

  const selectedOption = getSelectedOption();

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleSelect = (option: FilterOption) => {
    onValueChange(option.value);
    toggleModal();
  };

  const renderOptionItem = ({ item }: { item: FilterOption }) => {
    const isSelected = item.value === selectedValue;

    return (
      <TouchableOpacity
        style={[styles.optionItem, isSelected && styles.selectedOptionItem]}
        onPress={() => handleSelect(item)}
      >
        <View style={styles.optionContent}>
          <Ionicons
            name={item.icon as any}
            size={20}
            color={isSelected ? colors.primary : colors.gray600}
          />
          <Text
            style={[
              styles.optionLabel,
              isSelected && styles.selectedOptionLabel,
            ]}
          >
            {item.label}
          </Text>
        </View>

        {isSelected && (
          <Ionicons name="checkmark" size={20} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.selectorButton} onPress={toggleModal}>
        <View style={styles.selectedOptionContainer}>
          {selectedOption ? (
            <>
              <Ionicons
                name={selectedOption.icon as any}
                size={20}
                color={colors.primary}
              />
              <Text style={styles.selectedValueText}>
                {selectedOption.label}
              </Text>
            </>
          ) : (
            <Text style={styles.placeholderText}>{placeholder}</Text>
          )}
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.gray600} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn</Text>
              <TouchableOpacity onPress={toggleModal}>
                <Ionicons name="close" size={24} color={colors.gray700} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              renderItem={renderOptionItem}
              keyExtractor={(item) => item.id}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectedOptionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedValueText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.gray500,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "50%",
    maxHeight: 500,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  selectedOptionItem: {
    backgroundColor: colors.primary + "10",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  selectedOptionLabel: {
    fontWeight: "500",
    color: colors.primary,
  },
});

export default FilterSelector;
