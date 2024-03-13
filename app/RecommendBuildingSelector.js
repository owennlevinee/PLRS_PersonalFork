import React, { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const RecommendBuildingSelector = ({ buildings }) => {
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  return (
    <View>
      <Text style={{ textAlign: 'center', padding: 25 }}>Select saved building</Text>
      <Dropdown
        style={styles.select}
        placeholderStyle={styles.dropdownText}
        selectedTextStyle={styles.dropdownText}
        inputSearchStyle={styles.dropdownText}
        data={buildings}
        search
        maxHeight={300}
        labelField="building_name"
        valueField="building_id"
        placeholder="Select item"
        searchPlaceholder="Search..."
        value={selectedBuilding}
        onChange={item => setSelectedBuilding(item.building_id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  select: {
    borderColor: 'gray',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 8,
  },
  dropdownText: {
    fontSize: 16,
  }
});
  
export default RecommendBuildingSelector
