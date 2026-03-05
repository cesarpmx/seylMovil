import React, { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { StyleSheet } from 'react-native';

interface EmpresaSelectProps {
  empresas: { empid: number; empnomcorto: string }[] | undefined;
  onSelect?: (value: number | null) => void;
  editableEmpresa: boolean;
}

export const SelectEmpresa: React.FC<EmpresaSelectProps> = ({ empresas = [], onSelect, editableEmpresa }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<number | null>(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const formattedItems = empresas.map(emp => ({
      label: emp.empnomcorto,
      value: emp.empid,
    }));
    setItems(formattedItems);
  }, [empresas]);

  return (
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={(val) => {
        setValue(val);
        onSelect?.(val);
      }}
      setItems={setItems}
      placeholder="Selecciona una Empresa"
      style={[
        styles.dropdown,
        !editableEmpresa && styles.nonEditableDropdown, // Aplica estilo no editable si corresponde
      ]}
      containerStyle={styles.dropdownContainer}
      dropDownContainerStyle={styles.dropdownMenu}
      textStyle={styles.dropdownText}
      onChangeValue={onSelect}
      disabled={!editableEmpresa} 
      // disabled={!editableEmpresa} // Desactiva interacción si no es editable
    />
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    flex: 1,
    marginRight: 5,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  nonEditableDropdown: {
    backgroundColor: '#F8F8FF',
    pointerEvents: 'none',
  },
});
