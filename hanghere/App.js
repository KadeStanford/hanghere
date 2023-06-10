import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Image, ImageBackground, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Calendar } from 'react-native-calendars';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axios from 'axios';
import cheerio from 'cheerio';
import Geocoder from 'react-native-geocoding';
import MapView, { Marker } from 'react-native-maps';
import firebase from 'firebase/app';
import 'firebase/database';
import auth from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword} from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, collectionGroup, query, getDoc, updateDoc, useDoc, onSnapshot } from 'firebase/firestore';
import { where } from 'firebase/firestore';
import { firestore } from 'firebase/firestore';



const firebaseConfig = {
  apiKey: "AIzaSyA1dX3F9-U6Z0rE6emqlRwobziW53IJWVw",
  authDomain: "master-inn-388700.firebaseapp.com",
  projectId: "master-inn-388700",
  storageBucket: "master-inn-388700.appspot.com",
  messagingSenderId: "429119430572",
  appId: "1:429119430572:web:509162fa32607290aa2409",
  measurementId: "G-M9MMK7SH78"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const CustomArrowComponent = ({ direction }) => {
  const icon = direction === 'left' ? 'chevron-back' : 'chevron-forward';

  return <Ionicons name={icon} size={24} color="white" />;
};

const loadFonts = async () => {
  await Font.loadAsync({
    'BowlbyOneSC-Regular': require('./fonts/BowlbyOneSC-Regular.ttf'),
  });
};

const handleDateSelect = (date) => {
  console.log('Selected date:', date);
};

const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CalendarScreen = () => {
  const navigation = useNavigation();
  const currentDate = getCurrentDate();
  const [events, setEvents] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentCity, setCurrentCity] = useState(null);
  const counter = useRef(0);

  useEffect(() => {
    const loadAppFonts = async () => {
      await loadFonts();
    };

    loadAppFonts();
  }, []);

  useEffect(() => {
    const initializeGeocoder = async () => {
      await Geocoder.init('AIzaSyA1dX3F9-U6Z0rE6emqlRwobziW53IJWVw'); // Replace with your API key
    };

    initializeGeocoder();
  }, []);

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.error('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setCurrentLocation({ latitude, longitude });

      // Reverse geocoding to retrieve city
      const response = await Geocoder.from({ latitude, longitude });
      const address = response.results[0].formatted_address;
      const city = address.split(',')[0]; // Extract the city from the address

      setCurrentCity(city);

      fetchEvents(latitude, longitude); // Fetch events after getting the location
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  if (counter.current === 0) {
    handleGetLocation();
    counter.current++;
  }


  const fetchEvents = async (latitude, longitude) => {
    try {
      const encodedLocation = encodeURIComponent(`${latitude},${longitude}`);
      const url = `https://www.google.com/search?q=events+near+me&rlz=1C1SQJL_enUS919US919&sxsrf=...&uact=5&oq=events+near+&gs_lcp=...&ibp=htl;events&rciv=evn&sa=X&ved=2ahUKEwi2xbeJh6b_AhVakokEHUBXDAQQ8eoFKAJ6BAgVEA8#fpstate=tldetail&htivrt=events&htidocid=L2F1dGhvcml0eS9ob3Jpem9uL2NsdXN0ZXJlZF9ldmVudC8yMDIzLTA2LTAzfDEyNDYwODI0OTQ4OTQ1Mjc0MDEw&near=${encodedLocation}`;
  
      const response = await axios.get(url);
      const htmlContent = response.data;
  
      const $ = cheerio.load(htmlContent);
  
      const events = [];
  
      $('.YOGjf').each((index, element) => {
        const eventName = $(element).text();
        const eventDescription = $('.PVlUWc').eq(index).text();
        const eventAddress1 = $('.n3VjZe').eq(index).text();
        const eventAddress = $('.U6txu').eq(index).text();
  
        // Extract the latitude and longitude from the event address using Geocoding
        Geocoder.from(eventAddress).then((response) => {
          const { lat, lng } = response.results[0].geometry.location;
  
          events.push({
            name: eventName,
            address1: eventAddress1,
            address: eventAddress,
            description: eventDescription,
            latitude: lat,
            longitude: lng,
          });
  
          console.log('Event:', eventName);
          console.log('Address:', eventAddress1);
          console.log('Address:', eventAddress);
          console.log('Description:', eventDescription);
          console.log('Latitude:', lat); // Display the latitude
          console.log('Longitude:', lng); // Display the longitude
          console.log('---');
  
          if (index === $('.YOGjf').length - 1) {
            // Process the events and set them to the state after all events have been processed
            setEvents(events);
          }
        });
      });
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
  
  
  return (
  <ImageBackground source={require('./images/bglines.png')} style={styles.container}>
      <Calendar
        current={currentDate}
        markedDates={{}}
        theme={{
          backgroundColor: '#4d25ef',
          calendarBackground: '#4d25ef',
          textSectionTitleColor: '#ffffff',
          selectedDayBackgroundColor: '#4d25ef',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#4d25ef',
          dayTextColor: '#ffffff',
          textDisabledColor: 'rgba(255, 255, 255, 0.3)',
          dotColor: '#00adf5',
          selectedDotColor: '##ff55ea',
          monthTextColor: 'white',
          indicatorColor: '#ff55ea',
          textMonthFontFamily: 'BowlbyOneSC-Regular',
          textDayHeaderFontFamily: 'BowlbyOneSC-Regular',
          textDayFontSize: 20,
          textDayHeaderFontSize: 12,
          weekVerticalMargin: 7,
          textDayFontFamily: 'BowlbyOneSC-Regular',
          todayBackgroundColor: '#ffffff',
        }}
        onDayPress={handleDateSelect}
        style={styles.calendar}
        renderArrow={(direction) => (
          <CustomArrowComponent direction={direction} />
        )}
      />
      {currentCity && ( // Display the current city
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>Events Near: {currentCity}</Text>
        </View>
      )}
      {events.length > 0 && (
        <FlatList
          data={events}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.eventItem}>
              <Text style={styles.eventTitle}>{item.name}</Text>
              <Text style={styles.eventName}>{item.address1}</Text>
              <Text style={styles.eventName}>{item.address}</Text>
              <Text style={styles.eventDescription}>{item.description}</Text>
            </View>
          )}
        />
      )}
       <View style={styles.menuBar}>
        <TouchableOpacity onPress={() => { navigation.navigate('Map', { events: events }); }} style={styles.buttonBar}>
          <Text style={styles.buttonTextbar}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { navigation.navigate('Logged In'); }} style={styles.buttonBarSelected}>
          <Text style={styles.buttonTextbar}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { navigation.navigate('Friends'); }} style={styles.buttonBar}>
          <Text style={styles.buttonTextbar}>Friends</Text>
        </TouchableOpacity>

      </View>

      <StatusBar style="auto" />
    </ImageBackground>
  );
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const usernameRef = useRef('');
  const passwordRef = useRef('');
  const auth = getAuth(app);

 const handleLogin = async () => {
  try {
    const username = usernameRef.current;
    const password = passwordRef.current;

    const userCredential = await signInWithEmailAndPassword(auth, username, password);
    const user = userCredential.user;
    console.log("Logged in user:", user);
    navigation.navigate('Logged In');
  } catch (error) {
    console.error("Error logging in:", error);
  }
};

  return (
    <ImageBackground source={require('./images/bglines.png')} style={styles.container}>
      <Text style={styles.headertext}>HangHere</Text>
      <StatusBar style="auto" />
      <Image style={styles.logo} source={require('./images/hangherelogo.png')} />
      <TextInput
        style={styles.inputuser}
        placeholder="Username"
        placeholderTextColor="#9d5dfe"
        onChangeText={(text) => (usernameRef.current = text)}
      />
      <TextInput
        style={styles.inputpass}
        placeholder="Password"
        placeholderTextColor="#9d5dfe"
        secureTextEntry={true}
        onChangeText={(text) => (passwordRef.current = text)}
      />
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.button}>
  <Text style={styles.buttonText}>Signup</Text>
</TouchableOpacity>


    </ImageBackground>
  );
};

const SignupScreen = () => {
  const navigation = useNavigation();
  const usernameRef = useRef('');
  const passwordRef = useRef('');
  const auth = getAuth(app);

  const handleSignup = async () => {
    try {
      const username = usernameRef.current;
      const password = passwordRef.current;

      // Implement your signup logic using Firebase authentication
      // Example:
      await createUserWithEmailAndPassword(auth, username, password);

      // Get the authenticated user's email and UID
      const user = auth.currentUser;
      const email = user.email;
      const uid = user.uid;

      // Create a new document in Firestore for the user
      const firestore = getFirestore(app);
      const usersCollectionRef = collection(firestore, 'userData');
      const userDocRef = doc(usersCollectionRef, email); // Use email as document ID
      const userData = {
        username,
        email,
        uid,
        friendList: [], // Initialize friendList as an empty array
      };

      await setDoc(userDocRef, userData);

      // Navigate to the logged-in screen after successful signup
      navigation.navigate('Logged In');
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <ImageBackground source={require('./images/bglines.png')} style={styles.container}>
      <Text style={styles.headertext}>HangHere</Text>
      <StatusBar style="auto" />
      <Image style={styles.logo} source={require('./images/hangherelogo.png')} />
      <Text style={styles.smalltext}>Create an Account!</Text>
      <TextInput
        style={styles.inputuser}
        placeholder="Email"
        placeholderTextColor="#9d5dfe"
        onChangeText={(text) => (usernameRef.current = text)}
      />
            <TextInput
        style={{    height: 40,
          width: 300,
          borderColor: '#4d25ef',
          borderWidth: 3,
          marginTop: -20,
          borderRadius: 10,
          paddingLeft: 10,
          backgroundColor: '#ffffff',}}
        placeholder="Email"
        placeholderTextColor="#9d5dfe"
        onChangeText={(text) => (usernameRef.current = text)}
      />
      <TextInput
        style={styles.inputpass}
        placeholder="Password"
        placeholderTextColor="#9d5dfe"
        secureTextEntry={true}
        onChangeText={(text) => (passwordRef.current = text)}
      />
      <TouchableOpacity onPress={handleSignup} style={styles.button}>
        <Text style={styles.buttonText}>Signup</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const FriendsScreen = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    // Get the current user's email
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      setCurrentUserEmail(user.email);
    }
  }, []);

  const handleSearch = async () => {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const usersCollectionRef = collection(firestore, 'userData');
    const userDocRef = doc(usersCollectionRef, searchEmail);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      setSearchResult(userData);
    } else {
      setSearchResult(null);
    }
  };

  const handleAddFriend = async () => {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const userDocRef = doc(collection(firestore, 'userData'), currentUserEmail);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const updatedFriendList = [...userData.friendList, searchResult.email];

      await userDocRef.update({
        friendList: updatedFriendList,
      });

      // Optionally, you can display a success message or navigate to a different screen here
      console.log('Friend added successfully!');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.inputFriend}
        value={searchEmail}
        onChangeText={setSearchEmail}
        placeholder="Enter email"
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#9d5dfe"
      />
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {searchResult && (
        <View>
          <Text>Search Result:</Text>
          <Text>Email: {searchResult.email}</Text>
          <Text>UID: {searchResult.uid}</Text>
          <TouchableOpacity style={styles.button} onPress={handleAddFriend}>
            <Text style={styles.buttonText}>Add Friend</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};




const MapScreen = ({ route }) => {
  
  const navigation = useNavigation();
  const [currentLocation, setCurrentLocation] = useState(null);
  const events = route.params?.events || []; // Get the events array from the route params

  useEffect(() => {
    // Request permission to access the user's location
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      // Get the user's current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });
    })();
  }, []);

  return (
    <View style={styles.container}>
      {currentLocation && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {events.map((event, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: event.latitude,
                longitude: event.longitude,
              }}
              title={event.name}
              description={event.description}
            />
          ))}
        </MapView>
      )}
             <View style={styles.menuBar}>
        <TouchableOpacity onPress={() => { navigation.navigate('Map', { events: events }); }} style={styles.buttonBarSelected}>
          <Text style={styles.buttonTextbar}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { navigation.navigate('Logged In'); }} style={styles.buttonBar}>
          <Text style={styles.buttonTextbar}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { navigation.navigate('Friends'); }} style={styles.buttonBar}>
          <Text style={styles.buttonTextbar}>Friends</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const Stack = createNativeStackNavigator();

export default function App() {
  const app = initializeApp(firebaseConfig);
  
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    

    const loadAppFonts = async () => {
      await loadFonts();
      setFontsLoaded(true);
    };

    loadAppFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // Render null or a loading screen while fonts are being loaded
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} /> 
        <Stack.Screen name="Logged In" component={CalendarScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Friends" component={FriendsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
     
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '97%',
  },
  container1: {
    flex: 1,
    backgroundColor: '#9d5dfe',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#9d5dfe',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  menuBar: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: 80,
    backgroundColor: '#4d25ef',
    alignContent: 'center',
  },
  buttonBarSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3c17d1',
    width: '3%',
    borderRadius: 10,
    height: '50%',
  },
  buttonBar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextbar: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'BowlbyOneSC-Regular',
  },
  calendar: {
    width: 400,
    height: 350,
    borderRadius: 10,
    marginTop: 50,
    shadowColor: 'rgba(0,0,0, .6)', // IOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1.8,
  },
  headertext: {
    fontFamily: 'BowlbyOneSC-Regular',
    fontSize: 50,
    marginTop: 50,
    color: '#ffffff',
  },
  text: {
    fontFamily: 'BowlbyOneSC-Regular',
    fontSize: 50,
    marginTop: -20,
    color: '#ffffff',
  },
  logo: {
    width: 300,
    height: 380,
    marginTop: -60,
  },
  inputuser: {
    height: 40,
    width: 300,
    borderColor: '#4d25ef',
    borderWidth: 3,
    marginTop: -20,
    borderRadius: 10,
    paddingLeft: 10,
    backgroundColor: '#ffffff',
  },
  inputpass: {
    height: 40,
    width: 300,
    borderColor: '#4d25ef',
    borderWidth: 3,
    marginTop: 30,
    borderRadius: 10,
    paddingLeft: 10,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#4d25ef',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 50,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'BowlbyOneSC-Regular',
  },
  locationContainer: {
    borderRadius: 10,
    padding: 10,
    marginTop: 15,
    fontFamily: 'BowlbyOneSC-Regular',
  },
  locationText: {
    color: 'white',
    fontSize: 17,
    fontFamily: 'BowlbyOneSC-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 5 },
    textShadowRadius: 5,
  },
  eventItem: {
    backgroundColor: 'rgba(77, 37, 239, 0.5)',
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    fontFamily: 'BowlbyOneSC-Regular',
    width: 390,
  },
  eventName: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'BowlbyOneSC-Regular',
    textDecorationLine: 'underline',
    textAlign: 'center',
    color: '#ff38c0',    
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  eventTitle: {
    color: 'white',
    fontSize: 20,
    marginBottom: 5,
    fontFamily: 'BowlbyOneSC-Regular',
    textAlign: 'center', 
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  eventDescription: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'BowlbyOneSC-Regular',
    textAlign: 'center',
  },
  smalltext: {
    fontSize: 20,
    fontFamily: 'BowlbyOneSC-Regular',
    textAlign: 'center',
    marginTop: -35,
    marginBottom: 20,
    color: '#ffffff',
  },
  inputFriend: {
    height: 40,
    width: 300,
    borderColor: '#4d25ef',
    borderWidth: 3,
    marginTop: 50,
    borderRadius: 10,
    paddingLeft: 10,
    backgroundColor: '#ffffff',
  },
  results: {
    fontSize: 20,
    fontFamily: 'BowlbyOneSC-Regular',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    color: '#ffffff',
  },
  searchText : {  
    fontSize: 20,
    fontFamily: 'BowlbyOneSC-Regular',
    textAlign: 'center',
    marginTop: 80,
    color: '#ffffff',
  },
  searchButton: {
    backgroundColor: '#4d25ef',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
  },


});
