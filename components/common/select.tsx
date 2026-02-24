/**
 * Select/Picker Component
 * Dropdown style selector
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, Dimensions } from '@/constants';

interface SelectOption<T> {
  label: string;
  value: T;
}

interface SelectProps<T> {
  label?: string;
  placeholder?: string;
  value: T | null;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Select<T>({
  label,
  placeholder = 'Select...',
  value,
  options,
  onChange,
  error,
  containerStyle,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = Colors.light;

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[styles.select, error && styles.selectError]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectText,
            !selectedOption && styles.placeholder,
          ]}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      
      {error && <Text style={styles.error}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>{label ?? 'Select'}</Text>
            <FlatList
              data={options}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onChange(item.value);
                    setIsOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  select: {
    height: Dimensions.inputHeight,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background,
  },
  selectError: {
    borderColor: Colors.light.error,
  },
  selectText: {
    fontSize: FontSize.md,
    color: Colors.light.text,
    flex: 1,
  },
  placeholder: {
    color: Colors.light.textMuted,
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.light.error,
    marginTop: Spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  dropdown: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    maxHeight: 400,
    overflow: 'hidden',
  },
  dropdownTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.light.text,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  optionSelected: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
  optionText: {
    fontSize: FontSize.md,
    color: Colors.light.text,
  },
  optionTextSelected: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
