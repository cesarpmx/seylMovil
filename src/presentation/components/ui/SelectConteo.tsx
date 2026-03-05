import React, {useState, useEffect} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import {StyleSheet} from 'react-native';

interface ConteoSelectProps {
  conteosArr: {conteoValue: number; conteoName: string}[] | undefined;
  onSelect?: (value: number | null) => void;
  editableConteo: boolean;
}

export const SelectConteo: React.FC<ConteoSelectProps> = ({
  conteosArr = [],
  onSelect,
  editableConteo,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<number | null>(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const formattedItems = conteosArr.map(cont => ({
      label: cont.conteoName,
      value: cont.conteoValue,
    }));
    setItems(formattedItems);
  }, [conteosArr]);

  return (
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
      placeholder="Selecciona un Conteo"
      style={[
        styles.dropdown,
        !editableConteo && styles.nonEditableDropdown, // Aplica estilo no editable si corresponde
      ]}
      containerStyle={styles.dropdownContainer}
      dropDownContainerStyle={styles.dropdownMenu}
      textStyle={styles.dropdownText}
      onChangeValue={onSelect}
      disabled={!editableConteo}
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
