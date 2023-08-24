import React from "react";
import { Alert } from "react-native";

interface ConfirmDialogProps {
    title: string;
    message: string;
}

const ConfirmDialogComponent = ({ title, message }: ConfirmDialogProps) => {
    const showAlert = () => {
        return new Promise<boolean>((resolve) => {
            Alert.alert(title, message, [
                {
                    text: "Cancel",
                    onPress: () => resolve(false),
                    style: "cancel",
                },
                {
                    text: "OK",
                    onPress: () => resolve(true),
                },
            ]);
        });
    };

    return showAlert;
};

export default ConfirmDialogComponent;
