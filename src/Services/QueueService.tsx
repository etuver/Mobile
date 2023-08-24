import {Exercise, QueueElement, User} from "../Types/types";
import {Alert} from "react-native";

//const API_BASE_URL = "https://qs2.idi.ntnu.no/api";
const API_BASE_URL = "https://qs-dev.idi.ntnu.no/api";


/**
 * Get-Call to get the queue of a subject
 * @param subjectID The subjectID of the subject where you want the queue
 * @param bearerToken Token to identify
 * @returns a array of QueueElements
 */
export const getSubjectQueue = async (subjectID: number, bearerToken: string) => {
    const response = await fetch(`${API_BASE_URL}/subjects/${subjectID}/queue`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching subject queue: ${response.statusText}`);
    }

    const data = await response.json();

    const queueElements: QueueElement[] = data.queueelements;
    return queueElements;

};

/**
 * PATCH-call to change queue status
 * @param subjectID id of the subject
 * @param bearerToken Token for authorization
 * @param value New value (0 for stop, 1 for start, 2 for pause)
 */
const patchSubjectQueue = async (subjectID: number, bearerToken: string, value: string) => {
    const response = await fetch(`${API_BASE_URL}/subjects/${subjectID}/queue`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
            op: 'replace',
            path: '/status',
            value: value,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error updating subject queue status: ${response.statusText}`);
    }
};

/**
 * Uses the patch-call to start subject queue
 * @param subjectID id of the subject
 * @param bearerToken Token for authorization
 */
export const startSubjectQueue = async (subjectID: number, bearerToken: string) => {
    await patchSubjectQueue(subjectID, bearerToken, '1');
};

/**
 * Uses the patch-call to stop the subject queue
 * @param subjectID id of the subject
 * @param bearerToken Token for authorization
 */
export const stopSubjectQueue = async (subjectID: number, bearerToken: string) => {
    await patchSubjectQueue(subjectID, bearerToken, '0');
};

/**
 * Uses the patch-call to pause the subject queue
 * @param subjectID id of the subject
 * @param bearerToken Token for authorization
 */
export const pauseSubjectQueue = async (subjectID: number, bearerToken: string) => {
    await patchSubjectQueue(subjectID, bearerToken, '2');
};


export const changeSubjectQueueMessage = async (subjectID: number, bearerToken: string, message: string) => {
    const response = await fetch(`${API_BASE_URL}/subjects/${subjectID}/queue`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
            op: 'replace',
            path: '/notice',
            value: message,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error updating subject queue status: ${response.statusText}`);
    }
};


/**
 * Get-Call to get the message connected to a queue element
 * @param subjectID The subjectID of the subject where the queue element is
 * @param queueElementID The ID of the queue element for which you want the message
 * @param bearerToken Token to identify
 * @returns the message (string)
 */
export const getQueueElementMessage = async (subjectID: number, queueElementID: number, bearerToken: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/subjects/${subjectID}/queue/${queueElementID}/message`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching queue element message: ${response.statusText}`);
    }
    return await response.text();
};


/**
 * Get-Call to get ALL the messages connected to all the queue elements
 * @param subjectID The subjectID of the subject where the queue element is
 * @param bearerToken Token to identify
 * @returns the message (string)
 */
export const getQueueElementMessages = async (subjectID: number, bearerToken: string) => {
    const response = await fetch(`${API_BASE_URL}/subjects/${subjectID}/queue/messages`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`,
        },
    });

    if (response.status === 204) {
        // No messages to return, return an empty array
        return JSON.stringify([]);
    } else if (!response.ok) {
        throw new Error(`Error fetching queue element messages: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.stringify(data);
};

/**
 * Adds a new queueElement to the queue
 * @param token user bearer for auth
 * @param subjectID id of the subject
 * @param help 0 for approval, 1 for help
 * @param roomID if of the room. 0 if working from home
 * @param table id of the table. 0 if working from home
 * @param exercises list of Exercises
 * @param members members if a group
 * @param message message to TA 
 * @returns true if response is ok, otherwise false
 */
export const addQueueElement = async (token: string, subjectID: number, help: number, roomID: number, table: number, exercises: Exercise[], members: User[], message: string | null) => {

    const response = await fetch(`${API_BASE_URL}/subjects/${subjectID}/queue`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
                subjectID: subjectID,
                roomID: roomID,
                queueElementDesk: table,
                queueElementHelp: help,
                exercises: exercises.map((exercise: Exercise) => exercise.exerciseID),
                members: members
            }
        )
    });
    if (response.ok) {
        const responseBody = await response.json();
        const queueElementID =  responseBody.integer;
        if (message !== null){
            await setQueueElementMessage(token, subjectID, queueElementID, message)
        }
        return true
    } else {
        console.error('Error adding queue element');
        return 0
    }
}


/**
 * POST-call to set queueElement message
 * Which is the message to TA's
 * @param token bearer for auth
 * @param subjectID id of the subject
 * @param queueElementID id of the queueElement
 * @param message the message
 */
export const setQueueElementMessage = async (token: string, subjectID: number, queueElementID: number, message: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/subjects/${subjectID}/queue/${queueElementID}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(message)
        });

        if (response.ok) {
            return true;
        } else {
            console.error('Error setting queue element message');
            return false
        }
    } catch (error) {
        console.error('Error: ', error);
        Alert.alert("Error setting message")
        return false
    }
}





