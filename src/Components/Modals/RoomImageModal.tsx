import React, {useEffect, useState} from 'react';
import {Modal, View, Image, StyleSheet, Button} from 'react-native';
import {Room} from '../../Types/types';
import {getRoomImage} from "../../Services/LocationService";

interface RoomImageModalProps {
    visible: boolean;
    room?: Room | null;
    onClose: () => void;
}

const RoomImageModal = ({room, visible, onClose}: RoomImageModalProps) => {

    const [roomImageUri, setRoomImageUri] = useState<string | null>(null);

    useEffect(() => {
        if (visible && room) {
            if (room.roomImgLink){
                if (room.roomImgLink.slice(0, 2) === "cr") {
                    console.log("Custom image")
                    //TODO: implement the damn custom viewer
                }
            }
            else {
                fetchRoomImage(room);
            }
        }
    }, [visible, room]);



    const fetchRoomImage = async (room: Room)=> {
            try {
                const response = await getRoomImage(room);
                if (response.status == 200){
                  setRoomImageUri(response.url)
                }else setRoomImageUri(null)
                //const imageURL = response.url;
                //console.log(roomImageUri)
                //setRoomImageUri(imageURL)
                //return imageURL;
            } catch (error) {
                console.error(error);
                return null;
            }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Image
                        source={roomImageUri? {uri: roomImageUri} : require('../../../assets/404.png')}
                        style={styles.modalImage}
                    />
                    <Button title="Close" onPress={onClose}/>
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
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    modalImage: {
        width: 300,
        height: 300,
        borderRadius: 20,
        marginBottom: 20,
    },
});


export default RoomImageModal;
