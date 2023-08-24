import React, {useContext} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SelectedSubjectContext} from "../Context/SelectedSubjectContext";
import { UserContext} from "../Context/UserContext";
import { SubjectsContext} from "../Context/SubjectsContext";
import TAView from "../Components/TAView";
import StudentView from "../Components/StudentView";

/**
 * Main screen for a subject
 * Shows the subject details
 * Shows a TAView if the user is TA in the course (queue),
 * otherwise shows a StudentView (signupform, queue status etc)
 */
const SubjectDetailsScreen = ({ navigation }: any) => {
    const { subjectRoles } = useContext(SubjectsContext);
    const { selectedSubject } = useContext(SelectedSubjectContext);

    const isTA = (subjectId: number) => {
        const role = subjectRoles.find((role) => role.subjectID === subjectId);
        return role && role.subjectrole < 3;
    };

    if(selectedSubject != null){
        return (

            <View style={{ flex: 1 }}>
                <Text style={styles.courseTitle}> {selectedSubject.subjectName}</Text>
                { !isTA(selectedSubject.subjectId) ? (
                    <StudentView />

                ) : (
                    <TAView />

                )}
            </View>
        );} else{
    return (
        <View style={{ flex: 1 }}>
            <Text>No subject selected</Text>
        </View>
    );
}

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    courseTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    queueStatus: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SubjectDetailsScreen
