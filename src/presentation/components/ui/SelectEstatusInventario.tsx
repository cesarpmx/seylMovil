import React, { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

export const SimpleDropdown = ({ rawItems, initialValue, onChangeValue, placeholder }) => {
    const [open, setOpen] = useState(false); // Estado para manejar la apertura del dropdown
    const [value, setValue] = useState(initialValue); // Estado local para cada dropdown

    const handleChangeValue = (newValue) => {
        setValue(newValue); // Actualiza solo el estado local de este dropdown
        onChangeValue(newValue); // Llama a la función prop que maneja el valor
    };

    return (
        <DropDownPicker
            items={rawItems} // Opciones disponibles
            value={value} // Valor seleccionado local
            setValue={handleChangeValue} // Actualiza solo el valor local
            open={open} // Controla si el dropdown está abierto o cerrado
            setOpen={setOpen} // Cambia el estado de apertura
            placeholder={placeholder} // Texto de marcador de posición
            zIndex={1000}
            listMode="SCROLLVIEW" // Modo de visualización de lista
            onSelectItem={() => setOpen(false)} // Cierra el dropdown después de seleccionar una opción
        />
    );
};

export default SimpleDropdown;

