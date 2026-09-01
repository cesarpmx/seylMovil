import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import { StyleSheet, View } from 'react-native';

interface EmpresaSelectProps {
  empresas: { empid: number; empnomcorto: string }[] | undefined;
  onSelect?: (value: number | null) => void;
  editableEmpresa: boolean;
  hasError?: boolean;
}

export const SelectEmpresa: React.FC<EmpresaSelectProps> = ({
  empresas = [],
  onSelect,
  editableEmpresa,
  hasError = false,
}) => {
  const [value, setValue] = useState<number | null>(null);
  const [items, setItems] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    setItems(
      empresas.map(emp => ({
        label: emp.empnomcorto,
        value: emp.empid,
      })),
    );
  }, [empresas]);

  return (
    <View style={styles.wrapper}>
      <Dropdown
        style={[
          styles.dropdown,
          !editableEmpresa && styles.nonEditableDropdown,
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
        placeholder="Selecciona una Empresa"
        value={value}
        disable={!editableEmpresa}
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
