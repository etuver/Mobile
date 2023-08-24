import React, {useContext, useEffect, useState} from "react";
import {Button, CheckBox} from 'react-native-elements';
import {View, Text, StyleSheet, SafeAreaView, Image, Alert, TouchableOpacity} from 'react-native';
import {Exercise, QueueElement, Room} from "../Types/types";
import {RouteProp} from '@react-navigation/native';
import {AppStackParamList} from "../Navigator/AppNavigator";
import {formatName} from "../Helpers";
import {NavigationProp} from '@react-navigation/native';
import {UserContext} from "../Context/UserContext";
import {getSubjectUserPhoto} from "../Services/UserService";
import {SelectedSubjectContext} from "../Context/SelectedSubjectContext";
import UserPhotoModal from "../Components/Modals/UserPhotoModal";
import {approveQueueElement, stopQueueElement} from "../Services/SingleQueueElementService";
import {getSubjectExercises} from "../Services/SubjectsService";
import {getRoom} from "../Services/LocationService";
import RoomImageModal from "../Components/Modals/RoomImageModal";

/**
 * Props for the component
 */
interface HelpingScreenProps {
    route: {
        params: {
            student: QueueElement;
        };
    };
    navigation: NavigationProp<AppStackParamList, 'HelpingScreen'>;

}

/**
 * The Screen component for the screen when a TA is assisting a QueueElement(student/ group of students)
 * Allows TA to see the QueueElements members(students), excercises, photo, message and approve their excercises.
 * @param route the parameters passed to the screen. (The QueueElement)
 * @param navigation used to manage navigation between screens.
 * @constructor
 */
const HelpingScreen = ({route, navigation}: {
    route: RouteProp<AppStackParamList, 'HelpingScreen'>;
    navigation: NavigationProp<AppStackParamList, 'HelpingScreen'>;
}) => {
    const {user} = useContext(UserContext)
    const {selectedSubject} = useContext(SelectedSubjectContext);
    const {student} = route.params;
    const [checkedExercises, setCheckedExercises] = useState<Record<number, boolean>>(
        student.exercises?.reduce((acc, exercise) => {
            acc[exercise] = true;
            return acc;
        }, {} as Record<number, boolean>) || {}
    );
    const [userPhotoUri, setUserPhotoUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [subjectExercises, setSubjectExercises] = useState<Exercise[] | null>(null);
    const [room, setRoom] = useState<Room | null>(null);
    const [showRoomImageModal, setShowRoomImageModal] = useState(false);


    /**
     * Handles the checkboxes for selected exercises
     * Updates the checkedExercises state when a checkbox is toggled.
     * @param exercise The exercise number associated with the checkbox
     */
    const handleCheckChange = (exercise: number) => {
        // Use the setCheckedExercises to update the checkedExercises state
        setCheckedExercises((prevState) => ({
            ...prevState,
            [exercise]: !prevState[exercise], // Togle the state of the excercise
        }));
    };


    /**
     * Gets the photo of the first student in the subjectQueueElement
     * Sets photoUri to null if no image is returned (status 204)
     * which will render a user icon instead
     */
    const getStudentUserPhoto = async () => {
        if (!user || !selectedSubject) {
            throw Error("Not logged in.")
        }
        const firstMemberUserID = student.members[0].userID; //Only the photo of the first user
        const response = await getSubjectUserPhoto(student.subjectID, firstMemberUserID, user.token);
        if (response.status === 204) {
            setUserPhotoUri(null);
        } else {
            const blob = await response.blob();
            const photoUri = URL.createObjectURL(blob);
            setUserPhotoUri(photoUri);
        }
        setIsLoading(false);
    }

    /**
     * Alert to confirm approval of queueElement
     * If cancel closes dialog and does nothing
     * If ok uses "handleApprove"
     */
    const handleApproveConfirmation = () => {
        const approvedExercises = student.exercises?.filter((exercise) => checkedExercises[exercise]);
        if (approvedExercises?.length === 0) {
            Alert.alert("No exercises selected")
        } else {
            Alert.alert("Confirm Approval", "Approve element and remove from  the queue?", [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                },
                {
                    text: "OK",
                    onPress: () => {
                        handleApprove();
                    },
                },
            ]);
        }
    };

    /**
     * Handles approving a queueElement
     * sends a list of Exercise-objects that match the numbers of the checkedExercises which is the checkboxes
     * If no checkboxes with checkedExercises is checked, throws an alert
     * Navigates back to subjectDetails /  queue
     */
    const handleApprove = async () => {
        if (!subjectExercises) {
            Alert.alert("No subject exercises available.");
            return;
        }

        const checkedExerciseNumbers = Object.entries(checkedExercises)
            .filter(([_, isChecked]) => isChecked)
            .map(([exerciseNumber, _]) => parseInt(exerciseNumber));

        const exercisesToSend = subjectExercises.filter((exercise) =>
            checkedExerciseNumbers.includes(exercise.exerciseNumber)
        );

        if (exercisesToSend.length === 0) {
            Alert.alert("No exercises selected");
        } else {
            if (!user) {
                throw Error("Not logged in");
            }

            const success = await approveQueueElement(
                student.subjectID,
                student.queueElementID,
                exercisesToSend
            );
            if (success) {
                navigation.navigate("subjectDetails");
            } else {
                Alert.alert("Failed to approve exercises");
            }
        }
    };

    /**
     * Fetches every exercises in the subject
     */
    const fetchExercises = async () => {
        if (!selectedSubject) {
            throw Error("No selected subject.");
        }
        const fetchedExercises = await getSubjectExercises(selectedSubject.subjectId);
        if (fetchedExercises) {
            setSubjectExercises(fetchedExercises);
        } else {
            console.error("Failed to fetch exercises.");
        }
    };

    /**
     * Handles if the TA cancels helping a student
     * tells the api that the queueElement status is no longer active and removes Ta as teacher
     * the navigates back to subjectDetails
     */
    const handleCancel = async () => {
        if (user === null || user === undefined || selectedSubject === null || selectedSubject === undefined) {
            throw Error("Not logged in, please relog.");
        } else {
            await stopQueueElement(user.token, selectedSubject.subjectId, student.queueElementID)
            navigation.navigate('subjectDetails')
        }
    };

    const handleChat = () => {
        //TODO: Implement chat
    }

    const handleShowRoom = async () => {
        await fetchRoom();
        setShowRoomImageModal(true);
    };


    /**
     * Method to fetch the room
     * only sets room if student.roomID is not 0
     */
    const fetchRoom = async () => {
        if (student.roomID !== 0 && user) {
            const fetchedRoom = await getRoom(user.token, student.roomID);
            setRoom(fetchedRoom);
        }
    }


    useEffect(() => {
        getStudentUserPhoto();
        fetchExercises();
        fetchRoom();

    }, []);

    const rows: number[][] = [];
    let currentRow: number[] = [];

    student.exercises?.forEach((exercise, index) => {
        currentRow.push(exercise);
        if ((index + 1) % 2 === 0) {
            rows.push(currentRow);
            currentRow = [];
        }
    });

    if (currentRow.length > 0) {
        rows.push(currentRow);
    }

    const renderExercises = () => {
        return (
            <View>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((exercise) => (
                            <CheckBox
                                key={exercise}
                                title={`Exercise ${exercise}`}
                                checked={checkedExercises[exercise]}
                                onPress={() => handleCheckChange(exercise)}
                                containerStyle={styles.checkboxContainer}
                            />
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.greenBox}>
                <Text style={styles.title}>You are now helping:</Text>
                {student.members.map((member, index) => (
                    <Text key={index} style={styles.name}>
                        {formatName(member.personFirstName, member.personLastName)}
                    </Text>
                ))}
                <Text>{student.queueElementHelp ? "Help" : "Approval"} </Text>
                <Text>{student.queueElementDesk === 0 ? "Working from home" : room?.roomName + " Table " + student.queueElementDesk}</Text>
                {
                    isLoading ? (
                        <Image source={require("../../assets/spinner.gif")} style={styles.profileImage}/>
                    ) : (<TouchableOpacity onPress={() => setShowPhotoModal(true)}>
                            <Image
                                source={userPhotoUri ? {uri: userPhotoUri} : require('../../assets/user.png')}
                                style={styles.profileImage}
                            /></TouchableOpacity>
                    )
                }
                <UserPhotoModal visible={showPhotoModal} userPhotoUri={userPhotoUri}
                                onClose={() => setShowPhotoModal(false)}/>
                <RoomImageModal
                    visible={showRoomImageModal}
                    room={room}
                    onClose={() => setShowRoomImageModal(false)}
                />


            </View>
            <Button title="Show Room" onPress={handleShowRoom}/>
            <Text style={styles.title}>Message:</Text>
            <Text>{student.message}</Text>
            <Text style={styles.title}> </Text>
            <Text style={styles.title}>Select exercises:</Text>
            {renderExercises()}
            <View style={styles.buttonContainer}>
                <Button title="Cancel" onPress={handleCancel}/>
                <Button title="Approve" onPress={handleApproveConfirmation}/>

            </View>
        </SafeAreaView>
    );

};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F0F0F0",
    },
    greenBox: {
        backgroundColor: "#5ECC7D",
        borderRadius: 15,
        padding: 20,
        marginBottom: 40,
        alignItems: "center",
        width: "80%",

    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    name: {
        fontSize: 16,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxContainer: {
        backgroundColor: "transparent",
        borderWidth: 0,
        padding: 0,
        marginLeft: 0,
        marginRight: 0,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginTop: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 75,
        marginTop: 10,
        borderColor: 'black',
        resizeMode: 'cover',
    },


});
export default HelpingScreen;

