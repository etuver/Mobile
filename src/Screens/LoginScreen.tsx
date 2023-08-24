import React, {useState, useContext} from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from "react-native";
import {UserContext} from "../Context/UserContext";
import {postlogin} from "../Services/UserService";

const LoginScreen = ({ navigation}: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {setUser} = useContext(UserContext)

    /**
     * Send post-call to log in with email and password
     */
    const handleLogin = async () => {
        try {
           const data = await postlogin(email, password)

            //Get user data from the api data
            const user = {
                userID: data.userID,
                roleID: data.roleID,
                email: data.personEmail,
                firstName: data.personFirstName,
                lastName: data.personLastName,
                courses: data.courses,
                token: data.token,
            };

           setUser(user) // Set the user to selectedUser in context

            navigation.navigate('landingScreen')
        }catch (error){
            Alert.alert("Failed to log in")
        }
      };

return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
      },
      button: {
        backgroundColor: '#007BFF',
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
      },
      buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
      },
    });

    export default LoginScreen;
