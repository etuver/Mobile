import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/Navigator/AppNavigator';
import {UserContext} from "./src/Context/UserContext";
import { SubjectsContext} from "./src/Context/SubjectsContext";
import {Subject, SubjectRole, User} from "./src/Types/types";
import {useState} from "react";
import { SelectedSubjectContext } from './src/Context/SelectedSubjectContext';


export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectRoles, setSubjectRoles] = useState<SubjectRole[]>([]);
  const subjectsContextValue = { subjects, setSubjects, subjectRoles, setSubjectRoles };



  return (
      <UserContext.Provider value={{ user, setUser }}>
        <SubjectsContext.Provider value={subjectsContextValue}>
          <SelectedSubjectContext.Provider value={{ selectedSubject, setSelectedSubject }}>
          <AppNavigator/>
          </SelectedSubjectContext.Provider>
        </SubjectsContext.Provider>
      </UserContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
