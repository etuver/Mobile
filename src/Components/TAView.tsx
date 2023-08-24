import React, {useState, useContext, useEffect} from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet, Alert} from 'react-native';
import {ParsedMessage, QueueElement, Room} from "../Types/types";
import {SelectedSubjectContext} from "../Context/SelectedSubjectContext";
import {UserContext} from "../Context/UserContext";
import {formatName, getQueueStatusText} from "../Helpers";
import {
    getSubjectQueue,
    pauseSubjectQueue,
    startSubjectQueue,
    stopSubjectQueue,
    changeSubjectQueueMessage, getQueueElementMessages
} from "../Services/QueueService";
import ChangeQueueMessageModal from "./Modals/ChangeQueueMessageModal";
import {AppStackParamList} from "../Navigator/AppNavigator";
import {StackNavigationProp} from "@react-navigation/stack";
import {useNavigation} from "@react-navigation/native";
import {startQueueElement} from "../Services/SingleQueueElementService";
import {getRoom} from "../Services/LocationService";

const TAView = () => {

    const {selectedSubject} = useContext(SelectedSubjectContext);
    const {user} = useContext(UserContext);
    const [queueData, setQueueData] = useState<QueueElement[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation<StackNavigationProp<AppStackParamList, 'landingScreen'>>();
    const [roomDetails, setRoomDetails] = useState<Map<number, Room>>(new Map());


    /**
     * Changes the Queuestatus of the subject
     * Stops the queue if queue is open
     * If queue is paused or stopped, opens the queue
     */
    const toggleQueueStatus = async () => {
        if (!selectedSubject || !user) {
            throw new Error("User is not logged in.");
        }
        try {
            if (selectedSubject.subjectQueueStatus === 0 || selectedSubject.subjectQueueStatus === 2) {
                await startSubjectQueue(selectedSubject.subjectId, user.token);
            } else if (selectedSubject.subjectQueueStatus === 1) {
                await stopSubjectQueue(selectedSubject.subjectId, user.token);
            } else {
                console.warn("Invalid queue status. No action taken.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error toggling queue status: " + error);
        }


    };

    /**
     * Pauses the queue
     */
    const handlePauseQueue = () => {
        if (!selectedSubject || !user) {
            throw new Error("User is not logged in.");
        }
        pauseSubjectQueue(selectedSubject.subjectId, user.token)
    }

    /**
     * Handles when a TA selects a queueElement(student) and changes to HelpingScreen
     * @param student the selected student
     */
    const handleStudentPress = async (student: QueueElement) => {
        if (user === null || user === undefined || selectedSubject === null || selectedSubject === undefined) {
            throw Error("Not logged in, please relog.");
        }
        if (student.status === 1 && student.teacher !== user.userID) {
            Alert.alert("Element is already getting assistance")
        } else {
            const startElement = await startQueueElement(user.token, selectedSubject.subjectId, student.queueElementID, user.userID)
            if (startElement) {
                let room: Room | null ;

                if (student.roomID !== 0) {
                    room = await getRoom(user.token, student.roomID);

                } else { //Not sure how else to solve this without calling the api i
                    room = {
                        roomID: 0,
                        campusID: 0,
                        buildingID: 0,
                        roomDesk: 0,
                        roomFloor: 0,
                        roomImgLink: "",
                        roomName: "Working from home",
                        roomNumber: "",
                    };
                }
                if (room === null || room === undefined) {
                    throw Error("no room");
                }
                navigation.navigate('HelpingScreen', {student});

            } else {
                Alert.alert("there was an error starting queueElement")
            }
        }
    };

    /**
     * Sends the new Queue message to the api
     * @param newMessage the new message
     */
    const saveMessage = async (newMessage: string) => {
        if (!selectedSubject || !user) {
            throw new Error('User is not logged in.');
        }
        await changeSubjectQueueMessage(selectedSubject.subjectId, user.token, newMessage);
        setModalVisible(false);
    };

    /**
     * Gets the subject queue and puts it unto useState
     * Then fetches the queueElementMessages and maps them with the queueElements
     */
    const fetchQueue = async () => {
        if (!selectedSubject || !user) {
            throw new Error("User is not logged in.");
        }
        try {
            const fetchedQueue = await getSubjectQueue(selectedSubject.subjectId, user.token);
            const allMessages = await getQueueElementMessages(selectedSubject.subjectId, user.token);
            let parsedMessages: ParsedMessage[] = [];

            // Check if allMessages is a valid JSON string
            try {
                parsedMessages = JSON.parse(allMessages);
            } catch (error) {
                console.warn("Error parsing allMessages JSON:", error);
                // If parsing fails, set parsedMessages to an empty array
                parsedMessages = [];
            }

            // Maps the queueElementMessages with the corresponding queueElement
            const queueWithMessages = fetchedQueue.map((queueElement: QueueElement) => {
                const studentMessage = parsedMessages.find((msg: ParsedMessage) => msg.key === queueElement.queueElementID.toString());
                if (studentMessage) {
                    return {...queueElement, message: studentMessage.value};
                } else {
                    return {...queueElement, message: "No message provided"};
                }
            });

            setQueueData(queueWithMessages);

            // Collect all unique room IDs and filter out roomID 0
            const uniqueRoomIDs = Array.from(new Set(fetchedQueue.map((queueElement) => queueElement.roomID))).filter((roomID) => roomID !== 0);

            // Fetch room details for each unique room ID
            const fetchedRooms = await Promise.all(uniqueRoomIDs.map((roomID) => getRoom(user.token, roomID)));

            // Update the roomDetails state variable
            fetchedRooms.forEach((room) => {
                if (room !== null) {
                    setRoomDetails((prevRoomDetails) => new Map(prevRoomDetails).set(room.roomID, room));
                }
            });




        } catch (error) {
            console.error(error);
            Alert.alert('Error fetching queue' + error);
        }
    };


    useEffect(() => {
        if (selectedSubject && user) {
            fetchQueue();
        }
    }, [selectedSubject]);


    /**
     * Helper method to sort the queue
     * Puts Help-elements first and then approval
     */
    const sortedQueueData = (): QueueElement[] => {
        return queueData.slice().sort((a, b) => {
            if (a.queueElementHelp && !b.queueElementHelp) {
                return -1;
            } else if (!a.queueElementHelp && b.queueElementHelp) {
                return 1;
            }
            return 0;
        });
    };

    /**
     * Renders each queueElement (student/group of students) as an item in the queue
     * Used in the Flatlist
     * @param item the queueElement
     */
    const renderItem = ({item}: { item: QueueElement }) => (
        <TouchableOpacity onPress={() => handleStudentPress(item)}>
            <View style={[
                styles.listItem,
                item.status === 1 ? {backgroundColor: 'rgb(187,255,156)'} : null,
            ]}>
                <View style={styles.nameAndExercise}>


                    <Text style={styles.name}>
                        {item.members.map((member, index) => {
                            if (index === 0) {
                                const formattedName = formatName(member.personFirstName, member.personLastName);
                                return <React.Fragment key={member.userID}>{formattedName}</React.Fragment>;
                            }
                            return null;
                        })}
                        {item.members.length > 1 && <Text style={styles.groupInfo}>{"\n"}With group</Text>}
                    </Text>


                    <Text>
                        {item.exercises ? "Excercises" : "No excercises selected"}
                        {item.exercises ? item.exercises.map((exercise, index) => (
                            <React.Fragment key={exercise}>
                                {` ${exercise}`}
                                {index + 1 !== item.exercises?.length ? ", " : ""}
                            </React.Fragment>
                        )) : ""}
                    </Text>

                </View>
                <View style={styles.locationAndHelp}>
                    {item.queueElementDesk === 0 ? <Text>Working from home</Text> :
                        (
                            <Text>
                                {
                                    roomDetails.has(item.roomID) ?
                                        `${roomDetails.get(item.roomID)?.roomName} Table ${item.queueElementDesk}` :
                                        `Desk ${item.queueElementDesk}`
                                }
                            </Text>
                        )}
                    <Text>{item.queueElementHelp ? "Help" : "Approval"}</Text>
                </View>
                <View style={styles.note}>
                    <Text>{item.message}</Text>
                </View>

            </View>
        </TouchableOpacity>
    );

    return (
        selectedSubject != null ?
            <View style={styles.container}>
                <Text style={styles.queueStatusText}>The queue
                    is {getQueueStatusText(selectedSubject.subjectQueueStatus)}</Text>

                <TouchableOpacity
                    style={[styles.button, {backgroundColor: selectedSubject.subjectQueueStatus === 1 ? '#FF0000' : '#007BFF'}]}
                    onPress={toggleQueueStatus}
                >
                    <Text style={styles.buttonText}>
                        {selectedSubject.subjectQueueStatus === 1 ? 'Close Queue' : 'Start Queue'}
                    </Text>
                </TouchableOpacity>


                {selectedSubject.subjectQueueStatus === 1 && (
                    <TouchableOpacity onPress={handlePauseQueue} style={[styles.button, {backgroundColor: '#FFA500'}]}>
                        <Text style={styles.buttonText}>Pause Queue</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={[styles.button, {backgroundColor: '#007BFF'}]}
                >
                    <Text style={styles.buttonText}>Message</Text>
                </TouchableOpacity>

                <ChangeQueueMessageModal
                    visible={modalVisible}
                    initialMessage={selectedSubject.notice || ''}
                    onSave={saveMessage}
                    onCancel={() => setModalVisible(false)}
                />

                {
                    sortedQueueData().length > 0 ? (
                        <FlatList
                            data={sortedQueueData()}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.queueElementID.toString()}
                            contentContainerStyle={styles.list}
                        />
                    ) : (
                        <Text style={styles.emptyQueueText}>No students in queue</Text>
                    )
                }

            </View> : <Text> Could not load course </Text>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    button: {
        marginHorizontal: 20,
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    list: {
        paddingBottom: 20,
    },
    listItem: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
    },
    itemContent: {
        flex: 1,
    },
    name: {
        fontWeight: 'bold',
        flexWrap: 'wrap',

    },
    nameAndExercise: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    locationAndHelp: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 5,
    },
    note: {
        marginTop: 5,
    },
    groupInfo: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    queueStatusText: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
    },
    message: {
        marginTop: 5,
        fontStyle: 'italic',
        color: '#666',
    },
    emptyQueueText: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 10,
    },


});


export default TAView;

