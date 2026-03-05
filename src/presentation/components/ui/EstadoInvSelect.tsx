import React, { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { StyleSheet } from 'react-native';

interface EstadoInvSelectProps {
    estatusArry: { statusValue: string; statusName: string }[] | undefined;
  onSelect?: (value: number | null) => void;
  editableEstado: boolean;
}

export const EstadoInvSelect: React.FC<EstadoInvSelectProps> = ({ estatusArry = [], onSelect, editableEstado }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<number | null>(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const formattedItems = estatusArry.map(edo => ({
      label: edo.statusName,  
      value: edo.statusValue,
    }));
    setItems(formattedItems);
  }, [estatusArry]);

  return (
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
      placeholder="Selecciona un Estado"
      style={[
        styles.dropdown,
        !editableEstado && styles.nonEditableDropdown, // Aplica estilo no editable si corresponde
      ]}
      containerStyle={styles.dropdownContainer}
      dropDownContainerStyle={styles.dropdownMenu}
      textStyle={styles.dropdownText}
      onChangeValue={onSelect}
      disabled={!editableEstado} // Desactiva interacción si no es editable
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
