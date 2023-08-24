import {NavigationContainer, RouteProp,} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from "../Screens/LoginScreen";
import LandingScreen from "../Screens/LandingScreen";
import SubjectDetailsScreen from "../Screens/SubjectDetailsScreen";
import HelpingScreen from "../Screens/HelpingScreen";
import {QueueElement} from "../Types/types";


//const Stack = createStackNavigator();

const Stack = createStackNavigator<AppStackParamList>();


const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="login">
        <Stack.Screen name="login" component={LoginScreen} />
          <Stack.Screen name="landingScreen" component={LandingScreen}  options={{title: 'Courses'}}  />
          <Stack.Screen name="subjectDetails" component={SubjectDetailsScreen} options={{title:'Course Details'}}/>
          <Stack.Screen name="HelpingScreen" component={HelpingScreen} options={{title: "Helping"}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export type AppStackParamList = {
    login: undefined;
    landingScreen: undefined;
    subjectDetails: undefined;
    HelpingScreen: { student: QueueElement };
};

type StudentDetailsScreenRouteProp = RouteProp<AppStackParamList, 'HelpingScreen'>;

type StudentDetailsProps = {
    route: StudentDetailsScreenRouteProp;
};



export default AppNavigator;
