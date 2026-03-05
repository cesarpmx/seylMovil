import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MyIcon } from '../../components/ui/MyIcon';

const ActionBar = ({ onSearchPress, onAddPress, onDeletePress, buttonVisibility }) => {
  return (
    <View style={styles.actionBar}>
     {buttonVisibility?.search && (
        <TouchableOpacity style={[styles.iconButton, styles.searchButton]} onPress={onSearchPress}>
          <MyIcon name="search-outline" size={25} white />
        </TouchableOpacity>
      )}
      {buttonVisibility?.add && (
        <TouchableOpacity style={[styles.iconButton, styles.addButton]} onPress={onAddPress}>
          <MyIcon name="plus-outline" size={25} white />
        </TouchableOpacity>
      )}
      {buttonVisibility?.delete && (
        <TouchableOpacity style={[styles.iconButton, styles.deleteButton]} onPress={onDeletePress}>
          <MyIcon name="trash-outline" size={25} white />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  iconButton: {
    width: 105,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#4CAF50', 
  },
  addButton: {
    backgroundColor: '#2196F3', 
  },
  deleteButton: {
    backgroundColor: '#F44336', 
  },
});

export default ActionBar;
