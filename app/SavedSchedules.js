import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import DataContext from './context/data-context.js';
import ScheduleView from './ScheduleView.js';
import ScheduleEditor from './ScheduleEditor.js';
import { useNavigation } from '@react-navigation/native';
import { stylesSavedschedules } from './Styles.js';
import { LinearGradient } from 'expo-linear-gradient';
 

const Schedules = () => {
  //Initialize states
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  //Iniitalize hooks
  const ctx = useContext(DataContext);
  const Stack = createStackNavigator();
  const navigation = useNavigation();

  //GET functions
  async function getBuildingData() {
    const buildingResponse = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/buildings`);
    if (buildingResponse.ok && ctx.setBuildings)
      ctx.setBuildings(await buildingResponse.json());
    else
      throw new Error('Building network response was not ok');
  }

  async function getScheduleData() {
    setLoading(true);
    const scheduleResponse = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/schedules?get_items=true&user_id=1`);
    if (scheduleResponse.ok) {
      setSchedules(await scheduleResponse.json());
      setLoading(false);
    } else {
      throw new Error('Schedule network response was not ok');
    }    
  }

  //POST, PUT, DELETE functions
  const saveSchedule = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/schedules`, {
        method: selectedSchedule.schedule_id ? 'PUT' : 'POST',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          ...selectedSchedule
        }),
      });

      if (!response.ok) throw new Error('Failed to save schedule');

      const data = await response.json();

      if (response.status === 200) {
        if (selectedSchedule.schedule_id) {
          setSchedules(prevSchedules => {
            const scheduleIndex = prevSchedules.findIndex(schedule => schedule.schedule_id === selectedSchedule.schedule_id);
            let newSchedules = [...prevSchedules];
            newSchedules[scheduleIndex] = selectedSchedule;
            return newSchedules;
          });
        } else {
          selectedSchedule.schedule_id = data.schedule_id;
          setSchedules(prevSchedules => [...prevSchedules, selectedSchedule]);
        }

        navigation.navigate('SchedulesList');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const deleteSchedule = async (schedule_id) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/schedules?schedule_id=${schedule_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete schedule with schedule_id', schedule_id);
      
      setSchedules(prevSchedules => {
        const scheduleIndex = prevSchedules.findIndex(schedule => schedule.schedule_id === selectedSchedule.schedule_id);
        let newSchedules = [...prevSchedules];
        newSchedules.splice(scheduleIndex, 1);
        return newSchedules;
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };
  
  //

  const toggleScheduleEditor = (schedule) => {
    if (schedule !== null) {
      setSelectedSchedule(schedule);
      navigation.navigate('EditSchedule');
    } else {
      setSelectedSchedule(null);
      navigation.navigate('SchedulesList');
    }
  };

  const createSchedule = () => {
    const newSchedule = {
      name: 'New Schedule',
      items: [{
        building_id: 1,
        arrival_time: '7:00:00',
        arrival_weekdays: [1, 3]
      }]
    };
    toggleScheduleEditor(newSchedule);
  };

  // get buildings and schedules on page load
  useEffect(() => {
      getBuildingData();
      getScheduleData();
  }, []);

  return <Stack.Navigator>
    <Stack.Screen
      name="SchedulesList"
      options={() => ({ title: 'Schedules' })}
    >
      {() => (
        <SchedulesList
          schedules={schedules}
          loading={loading}
          refreshSchedules={getScheduleData}
          toggleScheduleEditor={toggleScheduleEditor}
          createSchedule={createSchedule}
          deleteSchedule={deleteSchedule}
        />
      )}
    </Stack.Screen>
    <Stack.Screen
      name="EditSchedule"
      options={() => ({
        title: selectedSchedule?.name?.length ? selectedSchedule.name : 'Edit Schedule',
        headerRight: () => <TouchableOpacity onPress={saveSchedule}><Text>Save</Text></TouchableOpacity>
      })}
    >
      {() => <ScheduleEditor schedule={selectedSchedule} setSchedule={setSelectedSchedule} />}
    </Stack.Screen>
  </Stack.Navigator>
}

const SchedulesList = ({ schedules, loading, refreshSchedules, toggleScheduleEditor, createSchedule, deleteSchedule }) => {
  
  return (
    <View style={stylesSavedschedules.container}>
    <LinearGradient
        colors={['#ae3b54', '#284b85']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshSchedules} />}
        >
        {schedules.length > 0 && schedules.map((schedule) => (
          <ScheduleView key={schedule.schedule_id} schedule={schedule} onPress={toggleScheduleEditor} onDelete={deleteSchedule}/>
        ))}
        <TouchableOpacity style={stylesSavedschedules.button} onPress={createSchedule}>
          <Text style={stylesSavedschedules.buttonText}>Create Schedule</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Schedules;