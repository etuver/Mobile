import React, {useContext, useEffect} from "react";
import {View, Text, FlatList, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {Subject} from "../Types/types";
import {UserContext} from "../Context/UserContext";
import {SubjectsContext} from "../Context/SubjectsContext";
import {SelectedSubjectContext} from "../Context/SelectedSubjectContext";
import {getSubjectsForUser, getSubjectRoles} from "../Services/SubjectsService";
import {getQueueStatusText} from "../Helpers";


/**
 * Landing page after logging in
 * Contains a list of all subjects for the user
 */
const LandingScreen = ({navigation}: any) => {
    const {user} = useContext(UserContext)
    const {subjects, setSubjects, subjectRoles, setSubjectRoles} = useContext(SubjectsContext);
    const {setSelectedSubject} = useContext(SelectedSubjectContext)

    //Checks if a user is TA in a subject based on subjectId
    //returns true if TA
    const isTA = (subjectId: number) => {
        const role = subjectRoles.find((role) => role.subjectID === subjectId);
        return role && role.subjectrole < 3;
    };

    /**
     * When a user clicks on a subject in the list
     * Sets the clicked subject as selected subject
     * and redirect to that subject's page
     * @param subject the clicked subject
     */
    const handleSubjectPress = (subject: Subject) => {
        setSelectedSubject(subject)
        navigation.navigate('subjectDetails')
    }

    useEffect(() => {
        const fetchData = async () => {
            if (user != null) {
                try {
                    const fetchedSubjects = await getSubjectsForUser(user.userID);
                    const fetchedSubjectRoles = await getSubjectRoles(user.userID);
                    setSubjects(fetchedSubjects);
                    setSubjectRoles(fetchedSubjectRoles);
                } catch (error) {
                    Alert.alert("Could not load subjects")
                    console.error("Error fetching data:", error);
                }
            }
        };

        fetchData();
    }, []);

    /**
     * Renders a specific subject in the list
     * Shows name, status and if user is TA
     * @param item the subject to render
     */
    const renderItem = ({item}: { item: Subject }) => {
        const isUserTA = isTA(item.subjectId);


        return (
            <TouchableOpacity
                style={styles.subjectItem}
                onPress={() => handleSubjectPress(item)}
            >
                <View style={{flexDirection: 'column'}}>
                    <Text style={styles.subjectName}>{item.subjectName}</Text>
                    <Text style={styles.subjectName}>{item.subjectCode}</Text>
                    {isUserTA && <Text style={styles.taNote}>Teaching assistant</Text>}
                </View>
                <Text style={styles.queueStatus}>
                    <Text style={styles.queueStatus}>{getQueueStatusText(item.subjectQueueStatus)}</Text>
                </Text>
            </TouchableOpacity>
        );
    };

    return (

        <View style={styles.container}>
            <Text style={styles.title}>My Subjects</Text>
            {subjects.length > 0 ? (

                <FlatList
                    data={subjects}
                    renderItem={({item}) => renderItem({item})}
                    keyExtractor={(item) => item.subjectId.toString()}
                />
            ) : (
                <Text>Loading subjects...</Text>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 5,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 20,
    },
    subjectItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderColor: '#fff',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 10,
        margin: 10,
        padding: 20,
        flexWrap: 'wrap',
    },
    subjectName: {
        fontSize: 18,
    },
    queueStatus: {
        fontSize: 16,
        fontWeight: 'bold',
        width: 60,
    },
    taNote: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'green',
    },
});

export default LandingScreen