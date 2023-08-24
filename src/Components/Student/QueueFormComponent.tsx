import React, {useContext, useEffect, useState} from "react";
import {Building, Campus, Exercise, QueueElement, Room, User} from "../../Types/types";
import {SelectedSubjectContext} from "../../Context/SelectedSubjectContext";
import {UserContext} from "../../Context/UserContext";
import {Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {addQueueElement, getQueueElementMessage} from "../../Services/QueueService";
import {getAllCampuses, getCampusBuildings, getRoom, getRoomsInBuilding} from "../../Services/LocationService";
import {getAvailableSubjectStudents, getSubjectExercises} from "../../Services/SubjectsService";
import {CheckBox} from "react-native-elements";
import {Dropdown, MultiSelect} from "react-native-element-dropdown";
// Using https://www.npmjs.com/package/react-native-element-dropdown for dropdowns
import RoomImageModal from "../Modals/RoomImageModal";
import {useNavigation} from '@react-navigation/native';
import {AppStackParamList} from "../../Navigator/AppNavigator";
import {StackNavigationProp} from "@react-navigation/stack";
import {getSingleQueueElement} from "../../Services/SingleQueueElementService";
import { Dimensions } from "react-native";


interface QueueFormProps {
    onJoinQueue: () => void;
}

/**
 * Component to join the queue
 * @param props onJoinQueue
 */
export const QueueFormComponent = ({
                                       onJoinQueue,
                                       mode,
                                       onCancel,
                                       onSaveChanges
                                   }: { onJoinQueue: () => void, mode: 'signup' | 'modify', onCancel: () => void, onSaveChanges: () => void }) => {

    type QueueFormNavigationProp = StackNavigationProp<AppStackParamList, 'landingScreen'>;
    const navigation = useNavigation<QueueFormNavigationProp>();

    /** General data     **/
    const {selectedSubject} = useContext(SelectedSubjectContext);
    const {user} = useContext(UserContext);
    const [campuses, setCampuses] = useState<Campus[] | null>(null)
    const [buildings, setBuildings] = useState<Building[] | null>(null)
    const [rooms, setRooms] = useState<Room[] | null>(null)
    const [showRoomImageModal, setShowRoomImageModal] = useState(false);

    /** signup form elements **/
    const [message, setMessage] = useState('');
    const [helpOrApproval, setHelpOrApproval] = useState<'help' | 'approval'>();
    const [isWorkingFromHome, setIsWorkingFromHome] = useState(false);

    /** Elements for exercises **/
    const [subjectExercises, setSubjectExercises] = useState<Exercise[] | null>(null);
    const [checkedExercises, setCheckedExercises] = useState<Record<number, boolean>>({});

    /** Signup as group elements **/
    const [isWorkingAsGroup, setIsWorkingAsGroup] = useState(false);
    const [groupMembers, setGroupMembers] = useState<User[]>([])
    const [availableUsers, setAvailableUsers] = useState<User[]>([])
    const [selectedGroupMemberIDs, setSelectedGroupMemberIDs] = useState<string[]>([]);

    /** Selected Campus, building and room **/
    const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null)
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [selectedTable, setSelectedTable] = useState<string | null>(null);

    /** Filter buildings and rooms based on selected campus and building **/
    const filteredBuildings = buildings?.filter((b) => b.campusID === selectedCampus?.campusID) || [];
    const filteredRooms = rooms?.filter((r) => r.buildingID === selectedBuilding?.buildingID) || [];
    const filteredTables = selectedRoom ? Array.from({length: selectedRoom.roomDesk}, (_, i) => i + 1) : [];

    const [myQueueElement, setMyQueueElement] = useState<QueueElement | null>(null);
    const [isReadyToRender, setIsReadyToRender] = useState(false);


    /**
     * Adds label wit full name to availableUsers
     * Used for MultiSelect to show full name when adding group members
     */
    const modifiedAvailableUsers = availableUsers.map((user) => ({
        ...user,
        label: user.firstName + " " + user.lastName
    }));

    /**
     * Creates data for the DropDown as DropDown expects a list with value and key
     */
    const tableData = filteredTables.map((tableNumber) => ({
        number: `Table ${tableNumber}`,
        tableID: tableNumber.toString(),
    }));

    /**
     * Okay so typescript is bugging with the dropdowns unless I do it like this
     * Sets roomName to roomNumber if the roomName is null
     * The DropDown doesn't allow me to compute this directly or in a method
     */
    const modifiedRoomData = filteredRooms.map((room) => ({
        ...room,
        roomName: room.roomName === null || room.roomName === "" ? `Room ${room.roomNumber}` : room.roomName,
    }));

    /**
     * Sets selected campus with matching id
     * Resets building, room and table
     * @param campusId id of the campus
     */
    const setSelectedCampusById = (campusId: number) => {
        const campus = campuses?.find(c => c.campusID === campusId);
        setSelectedCampus(campus || null);
        setSelectedBuilding(null);
        setSelectedRoom(null);
        setSelectedTable(null)
    };

    /**
     * Sets selected building with matching id
     * Resets  room and table
     * @param buildingId id of the building
     */
    const setSelectedBuildingById = (buildingId: number) => {
        const building = buildings?.find(b => b.buildingID === buildingId);
        setSelectedBuilding(building || null);
        setSelectedRoom(null);
        setSelectedTable(null)
    };


    /**
     * Sets selected room with matching id
     * Resets table
     * @param roomId id of the room
     */
    const setSelectedRoomById = (roomId: number) => {
        const room = rooms?.find(r => r.roomID === roomId);
        setSelectedRoom(room || null);
        setSelectedTable(null)
    };

    /**
     * Adds a group member
     * @param userID id of the member to add
     */
    const addGroupMember = (userID: number) => {
        const member = availableUsers?.find(u => u.userID === userID);
        if (member) {
            setGroupMembers([...groupMembers, member])
        }
    }

    /**
     * Handle save changes
     */
    const handleSaveChanges = async () => {
        console.log("checked: " + JSON.stringify(checkedExercises))
    }

    /**
     * Handle cancel button
     */
    const handleCancel = () => {
        onCancel()
    }

    /**
     * Handles join queue button
     */
    const handleJoinQueue = async (approvalOrHelp?: string) => {
        const noExercisesSelected = Object.values(checkedExercises).every((isChecked) => !isChecked);
        if (noExercisesSelected) {
            Alert.alert("Need to select exercises")
            return
        }
        if (!subjectExercises) {
            Alert.alert("Could not get exercises")
            return
        }
        if (!user) {
            Alert.alert("Not logged in")
            return
        }
        if (!selectedSubject) {
            Alert.alert("Error getting subject")
            return
        }
        if ((selectedCampus === null || selectedBuilding === null || selectedRoom === null || selectedTable === null) && !isWorkingFromHome) {
            Alert.alert("No location selected")
            return
        }
        if (approvalOrHelp === 'help') {
            setHelpOrApproval(approvalOrHelp)
        } else if (approvalOrHelp === 'approval') {
            setHelpOrApproval(approvalOrHelp)
        } else {
            Alert.alert("Need to select help or approval")
            return
        }
        const checkedExerciseNumbers = Object.entries(checkedExercises)
            .filter(([_, isChecked]) => isChecked, true)
            .map(([exerciseNumber, _]) => parseInt(exerciseNumber));

        const exercisesToSend = subjectExercises.filter((exercise) =>
            checkedExerciseNumbers.includes(exercise.exerciseNumber)
        );


        let group: User[] = [];
        selectedGroupMemberIDs.forEach((id, index) => {
            const member = availableUsers.find(user => user.userID === parseInt(id));
            if (member) group.push(member)
        })

        const attempt = await addQueueElement(user.token, selectedSubject.subjectId, (helpOrApproval === "help" ? 1 : 0), (isWorkingFromHome ? 0 : selectedRoom ? selectedRoom.roomID : 0), (isWorkingFromHome ? 0 : selectedTable ? parseInt(selectedTable) : 0), exercisesToSend, group, (message ? message : null))

        if (attempt) {
            Alert.alert("Placed in queue!")
            onJoinQueue();
        } else {
            Alert.alert("Error placing in queue")
        }
    }


    /**
     * Fetches all campuses from the api and sets them into the state
     */
    const fetchCampuses = async () => {
        const campus = await getAllCampuses()
        setCampuses(campus)
    }

    /**
     * Fetches all buildings for all campuses and puts them into the state
     * only if there is any campus in the state
     */
    const fetchBuildings = async () => {
        if (!campuses) return
        const buildings: Building[] = [];
        for (const campus of campuses) {
            const campusBuildings = await getCampusBuildings(campus.campusID);
            buildings.push(...campusBuildings);
        }
        setBuildings(buildings);
    }

    /**
     * Fetches all rooms for all buildings and puts them into state
     */
    const fetchRooms = async () => {
        if (!campuses || !buildings) return;
        const rooms: Room[] = [];
        for (const building of buildings) {
            const buildingRooms = await getRoomsInBuilding(building.campusID, building.buildingID)
            rooms.push(...buildingRooms)
        }
        setRooms(rooms)
    }

    /**
     * Gets all available users and places them into state
     */
    const fetchAvailableUsers = async () => {
        if (selectedSubject && !isWorkingAsGroup) {
            const available = await getAvailableSubjectStudents(selectedSubject.subjectId)
            if (available != null) {
                setAvailableUsers(available)
            }
        }
    }

    /**
     * Fetches every exercise in the subject
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

    const fetchQueueElement = async () => {
        if (user && selectedSubject) {
            try {
                const queueElement = await getSingleQueueElement(user.token, selectedSubject.subjectId, selectedSubject.userQueueElementID)
                setMyQueueElement(queueElement);
                if (queueElement === null || !queueElement) {
                    Alert.alert("Error", "Could not load data.")
                    onCancel
                }
                if (queueElement.roomID === 0) {
                    setIsWorkingFromHome(true)
                } else {
                    const room = await getRoom(user.token, queueElement.roomID);
                    if (buildings && rooms) {
                        const room = rooms.find(r => r.roomID === queueElement.roomID)
                        const buildingID = room?.buildingID

                        const building = buildings.find(b => b.buildingID === buildingID);
                        if (building && buildingID) {
                            setIsWorkingFromHome(false)
                            setSelectedCampusById(building.campusID)
                            setSelectedBuildingById(building.buildingID)
                            setSelectedRoomById(room?.roomID)
                            setSelectedTable(queueElement.tableID)
                        }
                    }
                }
                if (queueElement.queueElementHelp === true) {
                    await setHelpOrApproval('help')
                } else setHelpOrApproval('approval')

                //setCheckedExercises(queueElement.exercises)


                if (queueElement.members.length > 1) {
                    setIsWorkingAsGroup(true)
                } else {
                    setIsWorkingAsGroup(false)
                }
                const memberIDs: string[] = queueElement.members.map((member: User) => {
                    return member.userID;
                });

                const members: User[] = queueElement.members.map((member: User) => {
                    return member;
                });

                setGroupMembers(members)
                setSelectedGroupMemberIDs(memberIDs)

            } catch (error) {
                Alert.alert("Error loading data", "Could not get queueElement")
                onCancel
            }
            try {
                const message = await getQueueElementMessage(selectedSubject.subjectId, selectedSubject.userQueueElementID, user.token)
                setMessage(JSON.parse(message))
            } catch (error) {
                Alert.alert("Error loading data", "Could not get queueElement")
                onCancel
            }
        }
    }

    const fetchLocations = async () => {
        await fetchCampuses()
        await fetchBuildings()
        await fetchRooms()
    }

    useEffect(() => {
        if (myQueueElement && myQueueElement.exercises) {
            const updatedCheckedExercises = {...checkedExercises};

            myQueueElement.exercises.forEach((exerciseNumber: number) => {
                updatedCheckedExercises[exerciseNumber] = true;
            });
            setCheckedExercises(updatedCheckedExercises);

            fetchLocations()


            setIsReadyToRender(true);
        }
    }, [myQueueElement]);


    // Update checkedExercises whenever subjectExercises changes
    useEffect(() => {
        if (subjectExercises) {
            const updatedCheckedExercises = subjectExercises.reduce((acc, exercise) => {
                acc[exercise.exerciseNumber] = false;
                return acc;
            }, {} as Record<number, boolean>);
            setCheckedExercises(updatedCheckedExercises);
        }
    }, [subjectExercises]);


    //If no selected subject relog
    useEffect(() => {
        if (!selectedSubject || !user) {
            Alert.alert("There was an error please relog.")
            navigation.navigate('login');
        }
    }, [selectedSubject, navigation]);

    // Fetch available users if working as group is updated
    useEffect(() => {
        fetchAvailableUsers();
    }, [isWorkingAsGroup]);

    // Fetch campuses on mount
    useEffect(() => {
        fetchCampuses();
        fetchExercises();
        //if (mode == 'modify') {
        //fetchQueueElement()

        // }

    }, []);

    // Fetch buildings when campuses state is updated
    useEffect(() => {
        if (campuses) {
            fetchBuildings();
        }
    }, [campuses]);

    // Fetch rooms when buildings state is updated
    useEffect(() => {
        if (buildings) {
            fetchRooms();
        }
    }, [buildings]);

    /**
     * Handles show room button
     * Opens RoomImageModal which shows selected rooms' image
     */
    const handleShowRoom = async () => {
        setShowRoomImageModal(true);
    };

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
     * Render the checkboxes with exercises
     * Similar to the one in HelpingScreen
     * Maps the exercises into rows of two to get them rendered with two in width
     * @return a View with the checkboxes
     */
    const renderExercises = () => {
        if (!isReadyToRender && mode === 'modify') {
            return <Text>Loading...</Text>; // or return <View />;
        }

        const rows: number[][] = [];
        let currentRow: number[] = [];

        subjectExercises?.forEach((exercise, index) => {
            currentRow.push(exercise.exerciseNumber);
            if ((index + 1) % 2 === 0 || index + 1 === subjectExercises?.length) {
                rows.push(currentRow);
                currentRow = [];
            }
        });

        return (
            <View>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((exercise) => (
                            <View style={styles.contentContainerHalf}>
                            <CheckBox
                                key={exercise}
                                title={`Exercise ${exercise}`}
                                checked={checkedExercises[exercise]}
                                onPress={() => handleCheckChange(exercise)}
                                containerStyle={styles.checkboxContainer}
                            />
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        );
    };


    return (
        (!selectedSubject ? <Text>Error loading, please restart the app </Text> :
                <ScrollView style={styles.container}>
                    {selectedSubject.subjectQueueStatus > 0 && (
                        <View>
                            <Text style={styles.subheader}>Message for TA:</Text>
                            <TextInput
                                style={styles.input}
                                onChangeText={setMessage}
                                value={message}
                                placeholder="Message to the TA"
                            />

                            {
                                //TODO: Need Get-call to get assignments for the subject
                            }

                            <Text style={styles.subheader}>Select exercises:</Text>
                            {renderExercises()}

                                <Text style={styles.subheader}>Group settings:</Text>
                                <CheckBox
                                    title="Sign up as group"
                                    checked={isWorkingAsGroup}
                                    onPress={() => setIsWorkingAsGroup(!isWorkingAsGroup)}
                                    containerStyle={styles.checkboxContainerFull}
                                />
                            
                            {isWorkingAsGroup && (
                                <View>
                                    <MultiSelect style={styles.dropdown}
                                                 selectedTextStyle={styles.selectedTextStyle}
                                                 selectedStyle={styles.selectedStyle}
                                                 inputSearchStyle={styles.inputSearchStyle}
                                                 data={modifiedAvailableUsers}
                                                 value={selectedGroupMemberIDs}
                                                 search
                                                 searchPlaceholder="Search..."
                                                 placeholder="Select members"
                                                 labelField={"label"}
                                                 valueField={"userID"}
                                                 onChange={(item) => {
                                                     setSelectedGroupMemberIDs(item)
                                                 }}/>
                                </View>
                            )}

                                <Text style={styles.subheader}>Location:</Text>

                                <CheckBox
                                    title="Working from home"
                                    checked={isWorkingFromHome}
                                    onPress={() => setIsWorkingFromHome(!isWorkingFromHome)}
                                    containerStyle={styles.checkboxContainerFull}
                                />

                            


                            {!isWorkingFromHome && (
                                <View>

                                    <Dropdown style={styles.dropdown}
                                              selectedTextStyle={styles.selectedDropdownItem}
                                              value={selectedCampus ? selectedCampus : "select"}
                                              placeholder="Select Campus"
                                              data={campuses ? campuses : []} labelField={"campusName"}
                                              valueField={"campusID"} onChange={(item) => {
                                        setSelectedCampusById(item.campusID);
                                    }}/>

                                    <Dropdown style={styles.dropdown}
                                              selectedTextStyle={styles.selectedDropdownItem}
                                              value={selectedBuilding ? selectedBuilding : "Select "}
                                              placeholder="Select Building"
                                              data={filteredBuildings ? filteredBuildings : []}
                                              labelField={"buildingName"}
                                              valueField={"buildingID"} onChange={(item) => {
                                        setSelectedBuildingById(item.buildingID);
                                    }}/>

                                    <Dropdown style={styles.dropdown}
                                              selectedTextStyle={styles.selectedDropdownItem}
                                              value={selectedRoom ? selectedRoom : "Select"}
                                              placeholder="Select Room"
                                              data={modifiedRoomData}
                                              labelField={"roomName"}
                                              valueField={"roomID"} onChange={(item) => {
                                        setSelectedRoomById(item.roomID);
                                    }}/>

                                    <Dropdown style={styles.dropdown}
                                              selectedTextStyle={styles.selectedDropdownItem}
                                              maxHeight={300}
                                              value={selectedTable ? selectedTable : ""}
                                              placeholder="Select table"
                                              data={tableData ? tableData : []} labelField={"number"}
                                              valueField={"tableID"} onChange={(item) => {
                                        setSelectedTable(item.tableID);
                                    }}/>

                                    {selectedRoom ?
                                        <TouchableOpacity style={styles.button} onPress={handleShowRoom}>
                                            <Text style={styles.buttonText}>Show room</Text>
                                        </TouchableOpacity> : null}

                                </View>
                            )}
                            <RoomImageModal
                                visible={showRoomImageModal}
                                room={selectedRoom}
                                onClose={() => setShowRoomImageModal(false)}
                            />

                            {
                                mode === 'signup' ?
                                    <View style={styles.helpOrApproval}>

                                        <TouchableOpacity 
                                            style={styles.HelpApprovalButton} 
                                            onPress={() => {
                                                handleJoinQueue('approval');
                                              }}
                                            >
                                            <Text style={styles.nonSelectedButtonText}>Approval</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={styles.HelpApprovalButton} 
                                            onPress={() => {
                                                handleJoinQueue('help');
                                              }}        
                                              >                                    
                                              <Text style={styles.nonSelectedButtonText}>Help</Text>
                                        </TouchableOpacity>
                                    </View> :
                                    <View>
                                        <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
                                            <Text style={styles.buttonText}>Save Changes</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.button} onPress={handleCancel}>
                                            <Text style={styles.buttonText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                            }
                        </View>
                    )}
                </ScrollView>


        )

    )


}


var width = Dimensions.get('window').width; //full width

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 5,
        paddingBottom: 40,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        margin: 20,
    },
    subheader: {
        fontSize: 12,
        fontWeight: 'bold',
        marginVertical: 10,
        marginHorizontal: 10
    },
    input: {
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        margin: 10,
    },
    picker: {
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
    },
    checkbox: {
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 5,
        margin: 10,
    },
    helpOrApproval: {
        flexDirection: 'row',
        justifyContent: 'center',
        margin: 0,
    },
    HelpApprovalButton: {
        backgroundColor: '#b3d1ff',
        borderRadius: 10,
        padding: 20,
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center',
        width: width/2.25,
    },
    HelpApproveSelectedButton: {
        backgroundColor: '#0c47eb',
        borderRadius: 10,
        padding: 20,
        margin: 10,
        marginHorizontal: 10,
        alignItems: 'center',
        width: width/2.25,
        justifyContent: 'center',
    },
    nonSelectedButtonText: {
        color: '#003366', // Dark text color
        fontWeight: 'bold',
    },
    selectedButtonText: {
        color: '#ffffff', // White text color
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#007BFF',
        borderRadius: 10,
        padding: 20,
        margin: 10,
    },
    selectedButton: {
        backgroundColor: '#0056b3',
        borderRadius: 4,
        padding: 10,
        margin: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 10,
        marginVertical: 5,
    },
    selectedDropdownItem: {
        fontWeight: 'bold',
        color: 'blue',
    },
    inputSearchStyle: {
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        margin: 10,
    },
    selectedStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#b3d1ff',
        borderColor: '#b3d1ff',
        color: '#003366',
        margin: 10,
        padding: 10,
    },
    selectedTextStyle: {
        fontSize: 14,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    contentContainerHalf: {
        width: width/2,
        paddingHorizontal: 5,
    },
    checkboxContainer: {
        backgroundColor: "white",
        borderWidth: 0,
        borderRadius: 10,
        padding: 15,
    },
    checkboxContainerFull: {
        backgroundColor: "white",
        borderWidth: 0,
        borderRadius: 10,
        padding: 15,
        marginVertical: 4,
    },
});

