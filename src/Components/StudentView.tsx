import React, {useState, useContext, useEffect} from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity, View, Image, Alert} from 'react-native';
import {UserContext} from "../Context/UserContext";
import {SelectedSubjectContext} from "../Context/SelectedSubjectContext";
import {getQueueStatusText} from "../Helpers";
import {QueueFormComponent} from "./Student/QueueFormComponent";
import {getSubjectQueue} from "../Services/QueueService";
import {QueueElement} from "../Types/types";
import {getSpecificSubject} from "../Services/SubjectsService";
import {removeQueueElement} from "../Services/SingleQueueElementService";
import ConfirmDialogComponent from "./Modals/ConfirmDialogComponent";


const StudentView = () => {

    /** General data     **/
    const {selectedSubject, setSelectedSubject} = useContext(SelectedSubjectContext);
    const {user} = useContext(UserContext);
    const [inQueue, setInQueue] = useState<boolean>()
    const [subjectQueue, setSubjectQueue] = useState<QueueElement[] | null>(null)
    //const [call, setCall] = useState<boolean>(false)
    //const [myQueueElement, setMyQueueElement] = useState<QueueElement | null>(null)
    const [queuePosition, setQueuePosition] = useState<number | null>(null)
    const [modifyQueue, setModifyQueue] = useState<boolean>(false)


    const handleLeaveQueue = async () => {
        if (user && selectedSubject) {
            const confirmDialog = ConfirmDialogComponent({
                title: "Confirm",
                message: "Leave queue?",
            });
            const confirmed = await confirmDialog();
            if (confirmed) {
                const success = await removeQueueElement(user.token, selectedSubject.subjectId, selectedSubject.userQueueElementID)
                if (success === true) {
                    Alert.alert("Left queue")
                    await checkIfInQueue() // Should do update
                } else Alert.alert("Error leaving queue")
            } else await checkIfInQueue() // Should do update
        }
    };

    const handleModifyQueue = () => {
        setModifyQueue(true)
    };

    /**
     * Fetches the subject queue from api
     */
    const fetchSubjectQueue = async () => {
        if (selectedSubject && user) {
            const queue = await getSubjectQueue(selectedSubject.subjectId, user.token)
            setSubjectQueue(queue);
        }
    }

    /**
     * Gets the subject and updates selectedSubject
     */
    const fetchSubject = async () => {
        if (selectedSubject && user) {
            const subject = await getSpecificSubject(user.token, selectedSubject.subjectId)
            setSelectedSubject(subject)
        }
    }

    /**
     * Function to check if the user is in queue in selectedSubject.
     * If the user is in queue, sets the userQueueElementID to selectedSubject
     * Updates the inQueue state, and gets queue Position
     */
    const checkIfInQueue = async () => {
        if (selectedSubject && user) {
            const subject = await getSpecificSubject(user.token, selectedSubject.subjectId)
            const isInQueue = subject.userQueueElementID > 0;
            selectedSubject.userQueueElementID = subject.userQueueElementID
            if (isInQueue !== inQueue) {
                setInQueue(isInQueue);
            }
            if (inQueue) getQueuePos()
        }
    }

    /**
     * Function to get position in the queue
     * Sets the position to queuePosition state
     * Iterates through the queue and gets index +1 for the users' queueElement
     * Would rather read it directly from the subjectQueue but api doesnt return
     * positions for elements for student roles
     */
    const getQueuePos = () => {
        if (subjectQueue && inQueue && selectedSubject) {
            const queueElement = subjectQueue.findIndex(queueElement => queueElement.queueElementID === selectedSubject.userQueueElementID);
            const pos = parseInt(queueElement.toString()) + 1
            if (pos) {
                setQueuePosition(pos)
            }
        }
    }


    const updateSubjectQueue = () => {
        //TODO: Implement an update function instead of the various ones over to simplify updating queue/status/position etc
    }

    // Checks and updates inQueue and queuePosition
    useEffect(() => {
        checkIfInQueue()
        if (!inQueue){
            setModifyQueue(false)
        }
        if (inQueue) {
            //fetchMyQueueElement();
            getQueuePos()
        }
    }, [selectedSubject, inQueue, subjectQueue]);


    useEffect(() => {
        fetchSubject()
        fetchSubjectQueue()
        checkIfInQueue()
    }, []);

    return (
        selectedSubject != null ?
            <ScrollView style={styles.container}>
                <View style={styles.queueStatusContainer}>
                    <Text>
                        The queue is {getQueueStatusText(selectedSubject.subjectQueueStatus)}
                    </Text>

                    <Image
                        source={require("../../assets/queue.png")}
                        style={styles.queueIcon}
                    />
                    <Text>{subjectQueue ? subjectQueue.length : ""}</Text>

                </View>

                <View style={styles.queueStatusContainer}>
                    <Text>Message from teachers:{'\n'}{selectedSubject.notice}</Text>
                </View>
                {inQueue ? (
                    <View style={styles.positionBox}>
                        <Text style={styles.positionText}>Your Position:</Text>
                        <Text style={styles.positionNumber}>{queuePosition}</Text>
                    </View>

                ) : null}

                {inQueue ? (
                    <View>
                        {modifyQueue ? <QueueFormComponent mode={'modify'}
                                                           onJoinQueue={() => setInQueue(true)}
                                                           onCancel={() => setModifyQueue(false)}
                                                           onSaveChanges={() => setModifyQueue(false)}
                            /> :
                            <TouchableOpacity style={styles.button} onPress={handleModifyQueue}>
                                <Text style={styles.buttonText}>Edit</Text>
                            </TouchableOpacity>

                        }
                        <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveQueue}>
                            <Text style={styles.buttonText}>Leave Queue</Text>
                        </TouchableOpacity>

                    </View>
                ) : (
                    selectedSubject.subjectQueueStatus > 0 &&
                    <QueueFormComponent mode={'signup'}
                                        onJoinQueue={() =>{ setInQueue(true), setModifyQueue(false)}}
                                        onCancel={() => setModifyQueue(false)}
                                        onSaveChanges={() => setModifyQueue(false)}/>
                )}

            </ScrollView>
            : null);
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 0,
    },
    queueStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
    },
    queueIcon: {
        width: 25,
        height: 25,
        marginLeft: 10,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#007BFF',
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
    },
    leaveButton: {
        backgroundColor: '#AD262E',
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    positionBox: {
        backgroundColor: "#2C95F6",
        paddingVertical: 60,
        paddingHorizontal: 60,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 30,
        maxWidth: "70%",
        alignSelf: "center",
    },
    positionText: {
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
        alignSelf: "center"
    },
    positionNumber: {
        color: "white",
        fontSize: 50,
        fontWeight: "bold",
    },


});


export default StudentView;