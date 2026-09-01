import React, {useState, useEffect} from 'react';
import {Dropdown} from 'react-native-element-dropdown';
import {StyleSheet, View} from 'react-native';

interface AlmacenSelectProps {
  almacenes: {almid: string; almnombre: string}[] | undefined;
  onSelect?: (value: string | null) => void;
  editable: boolean;
  hasError?: boolean;
}

export const SelectAlmacen: React.FC<AlmacenSelectProps> = ({
  almacenes = [],
  onSelect,
  editable,
  hasError = false,
}) => {
  const [value, setValue] = useState<string | null>(null);
  const [items, setItems] = useState<{label: string; value: string}[]>([]);

  useEffect(() => {
    setItems(
      almacenes.map(alm => ({
        label: alm.almnombre,
        value: alm.almid,
      })),
    );
  }, [almacenes]);

  return (
    <View style={styles.wrapper}>
      <Dropdown
        style={[
          styles.dropdown,
          !editable && styles.nonEditableDropdown,
          hasError && styles.errorDropdown,
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        containerStyle={styles.dropdownMenu}
        itemTextStyle={styles.itemTextStyle}
        activeColor="#EFF6FF"
        data={items}
        maxHeight={250}
        labelField="label"
        valueField="value"
        placeholder="Selecciona un Almacen"
        value={value}
        disable={!editable}
        dropdownPosition="bottom"
        onChange={item => {
          setValue(item.value);
          onSelect?.(item.value);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginRight: 5,
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
  nonEditableDropdown: {
    backgroundColor: '#F8F8FF',
  },
  errorDropdown: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
    backgroundColor: '#FEF2F2',
  },
});
