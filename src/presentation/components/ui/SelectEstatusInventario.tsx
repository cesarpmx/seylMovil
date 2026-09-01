import React, {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';

// Wrapper genérico sobre Dropdown de react-native-element-dropdown.
// Mantiene la firma pública anterior para no romper consumidores.
export const SimpleDropdown = ({
  rawItems,
  initialValue,
  onChangeValue,
  placeholder,
  hasError = false,
  disabled = false,
  dropDownDirection,
}: any) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const position =
    dropDownDirection === 'TOP' || dropDownDirection === 'top'
      ? 'top'
      : 'bottom';

  return (
    <View style={styles.wrapper}>
      <Dropdown
        style={[
          styles.dropdown,
          hasError && styles.errorDropdown,
          disabled && styles.disabledDropdown,
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        containerStyle={styles.dropdownMenu}
        itemTextStyle={styles.itemTextStyle}
        activeColor="#EFF6FF"
        data={rawItems || []}
        maxHeight={250}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        disable={disabled}
        dropdownPosition={position}
        onChange={item => {
          setValue(item.value);
          onChangeValue?.(item.value);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: '#fff',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#333',
  },
  itemTextStyle: {
    fontSize: 14,
    color: '#333',
  },
  errorDropdown: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
    backgroundColor: '#FEF2F2',
  },
  disabledDropdown: {
    backgroundColor: '#F1F5F9',
    opacity: 1,
  },
});

export default SimpleDropdown;
