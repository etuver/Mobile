import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, Dimensions} from 'react-native';

interface MessageModalProps {
    visible: boolean;
    initialMessage: string;
    onSave: (newMessage: string) => void;
    onCancel: () => void;
}


const {width} = Dimensions.get('window');


const MessageModal: React.FC<MessageModalProps> = ({visible, initialMessage, onSave, onCancel,}) => {
    const [messageInput, setMessageInput] = useState(initialMessage);

    useEffect(() => {
        setMessageInput(initialMessage);
    }, [initialMessage]);


    const handleSave = () => {
        onSave(messageInput);
    };

    const handleCancel = () => {
        setMessageInput(initialMessage);
        onCancel();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleCancel}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Change Queue Message</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={setMessageInput}
                        value={messageInput}
                        placeholder="Enter new message"
                    />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.button, {backgroundColor: '#007BFF'}]}
                            onPress={handleSave}
                        >
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, {backgroundColor: '#FF0000'}]}
                            onPress={handleCancel}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};


const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        width: width * 0.9,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
        width: '100%',
        minHeight: 40,
    },
    button: {
        borderRadius: 4,
        padding: 10,
        paddingHorizontal: 20,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});
export default MessageModal;
