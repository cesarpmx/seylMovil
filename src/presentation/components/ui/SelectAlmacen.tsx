import React, {useState, useEffect} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import {StyleSheet} from 'react-native';

interface AlmacenSelectProps {
  almacenes: {almid: string; almnombre: string}[] | undefined;
  onSelect?: (value: number | null) => void;
  editable: boolean;
  hasError?: boolean;
}

export const SelectAlmacen: React.FC<AlmacenSelectProps> = ({
  almacenes = [],
  onSelect,
  editable,
  hasError = false,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<number | null>(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const formattedItems = almacenes.map(alm => ({
      label: alm.almnombre,
      value: alm.almid,
    }));
    setItems(formattedItems);
  }, [almacenes]);

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
      placeholder="Selecciona un Almacen"
      listMode="SCROLLVIEW"
      style={[
        styles.dropdown,
        !editable && styles.nonEditableDropdown, // Aplica estilo no editable si corresponde
        hasError && styles.errorDropdown,
      ]}
      containerStyle={styles.dropdownContainer}
      dropDownContainerStyle={styles.dropdownMenu}
      textStyle={styles.dropdownText}
      onChangeValue={onSelect}
      disabled={!editable} // Desactiva interacción si no es editable
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
  errorDropdown: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
    backgroundColor: '#FEF2F2',
  },
});
