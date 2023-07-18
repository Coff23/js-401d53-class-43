import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, TouchableWithoutFeedback, Modal, Slider } from 'react-native';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';

const WATER_INTAKE_GOAL = 250; // ml
const NOTIFICATION_INTERVAL = 60 * 60 * 1000;
const DIV_COUNT = 8;
const MAX_OPACITY = 1;
const pepTalk = ['You got this!', 'More water!', 'You are doing amazing!', 'Keep going!', 'Every sip matters!', 'Almost there!', 'Your efforts will pay off!'];

const App = () => {
  const [splashes, setSplashes] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPepTalk, setCurrentPepTalk] = useState('');
  const [waterIntake, setWaterIntake] = useState(0);

  useEffect(() => {
    const getNotificationPermissions = async () => {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      if (status !== 'granted') {
        console.log('Notification permissions not granted!');
      }
    };
    getNotificationPermissions();
  }, []);

  useEffect(() => {
    const scheduleNotifications = async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const now = new Date();
      const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0);

      const notificationIds = [];
      while (endTime.getTime() < now.getTime() + 24 * 60 * 60 * 1000) {
        const notificationId = await Notifications.scheduleLocalNotificationAsync(
          {
            title: 'Drink Water',
            body: 'It\'s time to drink water!',
            android: {
              channelId: 'water-reminder',
            },
          },
          {
            time: endTime.getTime(),
            repeat: 'hour',
          }
        );
        notificationIds.push(notificationId);
        endTime.setTime(endTime.getTime() + NOTIFICATION_INTERVAL);
      }

      console.log('Scheduled notifications:', notificationIds);
    };

    scheduleNotifications();
  }, []);

  const handleDrinkWater = () => {
    const newCurrentIntake = waterIntake + WATER_INTAKE_GOAL;
    setWaterIntake(newCurrentIntake);

    const randomIndex = Math.floor(Math.random() * pepTalk.length);
    setCurrentPepTalk(pepTalk[randomIndex]);
  };

  const calculateDivOpacity = (divIndex) => {
    const progress = waterIntake / (WATER_INTAKE_GOAL * DIV_COUNT);
    const filledDivs = Math.floor(progress * DIV_COUNT);
    const remainingProgress = progress * DIV_COUNT - filledDivs;

    if (divIndex < filledDivs) {
      return MAX_OPACITY;
    } else if (divIndex === filledDivs && filledDivs !== DIV_COUNT) {
      return remainingProgress;
    } else {
      return 0;
    }
  };


  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleCloseSettingsModal = () => {
    setShowSettings(false);
  };

  const handlePress = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const splash = {
      x: locationX - 200,
      y: locationY - 400,
      scale: new Animated.Value(0),
      opacity: new Animated.Value(1),
    };

    setSplashes((prevSplashes) => [...prevSplashes, splash]);

    Animated.parallel([
      Animated.timing(splash.scale, {
        toValue: 1.5,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(splash.opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSplashes((prevSplashes) => prevSplashes.filter((item) => item !== splash));
    });
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <Text style={styles.pepTalk}>{currentPepTalk}</Text>
        <Text style={styles.header}>Water Intake Tracker</Text>
        <Text style={styles.intakeText}>Water Intake: {waterIntake} ml</Text>
        <TouchableOpacity style={styles.button} onPress={handleDrinkWater}>
          <Text style={styles.buttonText}>Drink Water</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          {[...Array(DIV_COUNT)].map((_, index) => (
            <View
              key={index}
              style={[styles.progressDiv, { opacity: calculateDivOpacity(index) }]}
            />
          ))}
        </View>
      <View style={styles.bottomNavbar}>
        <TouchableOpacity style={styles.navbarItem}>
          <Text style={styles.navbarText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navbarItem}>
          <Text style={styles.navbarText}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navbarItem} onPress={handleSettingsClick}>
          <Text style={styles.navbarText}>Settings</Text>
        </TouchableOpacity>
      </View>
      {showSettings && (
        <View style={styles.settingsContainer}>
          <Text>Settings Page</Text>
          {/* Add your settings components here */}
        </View>
      )}
      {splashes.map((splash, index) => (
        <Animated.View
          key={index}
          style={[
            styles.splash,
            {
              transform: [
                { translateX: splash.x },
                { translateY: splash.y },
                { scale: splash.scale },
              ],
              opacity: splash.opacity,
              backgroundColor: 'blue',
            },
          ]}
        />
      ))}
      <Modal visible={showSettings} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Settings</Text>
            <Text>Set daily water intake goal</Text>
            <Slider
              style={styles.slider}
              minimumValue={1000}
              maximumValue={5000}
              step={100}
              value={waterIntake}
              onValueChange={(value) => setWaterIntake(value)}
            />
            <TouchableOpacity onPress={handleCloseSettingsModal}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    </TouchableWithoutFeedback >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  intakeText: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3f51b5',
    borderRadius: 5,
  },
  buttonText: {
    // color: 'white',
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  progressDiv: {
    flex: 1,
    height: 10,
    marginHorizontal: 2,
    backgroundColor: 'blue',
  },
  pepTalk: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  bottomNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    height: 100,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navbarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navbarText: {
    fontSize: 16,
  },
  settingsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  splash: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3f51b5',
    borderRadius: 5,
    marginTop: 20,
  },
});

export default App;
