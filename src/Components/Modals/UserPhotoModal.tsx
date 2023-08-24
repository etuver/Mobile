import React from 'react';
import {View, Modal, Image, StyleSheet, Button} from 'react-native';

interface PhotoModalProps {
    visible: boolean;
    userPhotoUri: string | null;
    onClose: () => void;
}

/**
 * UserPhotoModal containing the image from userPhotoUri and a button to close the modal
 * Used to show the photo in a bigger element
 * @param visible If its visible or not
 * @param userPhotoUri Uri to the photo to show
 * @param onClose To close the modal
 */
const PhotoModal: React.FC<PhotoModalProps> = ({visible, userPhotoUri, onClose}) => {
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
                        source={userPhotoUri ? {uri: userPhotoUri} : require('../../../assets/user.png')}
                        style={styles.modalImage}
                    />
                    <Button title="Close" onPress={onClose} />
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

export default PhotoModal;