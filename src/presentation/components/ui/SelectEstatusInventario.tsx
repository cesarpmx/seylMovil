import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

export const SimpleDropdown = ({ rawItems, initialValue, onChangeValue, placeholder, listMode = 'SCROLLVIEW', hasError = false, dropDownDirection = 'BOTTOM', disabled = false }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(initialValue);

    return (
        <DropDownPicker
            items={rawItems}
            value={value}
            setValue={setValue}
            open={open}
            setOpen={setOpen}
            placeholder={placeholder}
            zIndex={1000}
            listMode={listMode}
            dropDownDirection={dropDownDirection}
            disabled={disabled}
            disabledStyle={styles.disabledDropdown}
            onChangeValue={(val) => onChangeValue?.(val)}
            onSelectItem={() => setOpen(false)}
            style={[styles.dropdown, hasError && styles.errorDropdown, disabled && styles.disabledDropdown]}
            dropDownContainerStyle={styles.dropdownMenu}
            textStyle={styles.dropdownText}
        />
    );
};

const styles = StyleSheet.create({
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

