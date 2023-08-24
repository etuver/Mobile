//const API_BASE_URL = "https://qs2.idi.ntnu.no/api";
import {Exercise} from "../Types/types";

const API_BASE_URL = "https://qs-dev.idi.ntnu.no/api";

/**
 * Used for patch-calls
 * Specificly in the patchQueueElement- function
 */
type Patch = {
    op: string;
    path: string;
    value: string | null;
};

/**
 * Api-call to approve a queueElement
 * @param subjectID ID of the subject where the queueElement is
 * @param queueElementID ID of the queueElement to approve
 * @param exercises List of exercises to approve. A TA can choose to approve only some of the exercises the
 * queueElement signed up for
 */
export async function approveQueueElement(subjectID: number, queueElementID: number, exercises: Exercise[]): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/subjects/${subjectID}/queue/${queueElementID}/approve`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({exercises}),
        });
        if (response.ok) {
            return true;
        } else {
            console.error(`Failed to approve exercises for queueElement ${queueElementID} in subject ${subjectID}, status: ${response.status}, message: ${await response.text()}`);
            return false;
        }
    } catch (error) {
        console.error("Failed to approve exercises", error);
        return false;
    }
}


/**
 * - Method to handle the start of a queueElement
 * - This is if the queueElement is currently assisted by a TA or not
 * - 1 is active, 0 is if it's not assisted
 * - Sets the teacherId of the queueElement to the userID of the Ta
 * - Uses the patchQueueElement api call
 * @param bearer Token used for identification
 * @param subjectId The subject where the queueElement is
 * @param queueElementId The specific queueElement to edit
 * @param teacherId userID of the TA that is assisting the queueElement
 */
export const startQueueElement = async (bearer: string, subjectId: number, queueElementId: number, teacherId: number) => {
    const patchStatus = {
        op: 'replace',
        path: '/status',
        value: '1',
    };

    const patchTeacher = {
        op: 'replace',
        path: '/teacher',
        value: teacherId.toString(),
    };
    try {
        await patchQueueElement(bearer, subjectId, queueElementId, patchTeacher);
        await patchQueueElement(bearer, subjectId, queueElementId, patchStatus);
        return true;
    } catch (error) {
        console.error('Error starting queue element:', error);
        return false;
    }
}

/**
 * General method to patch a specific queue element
 * Used to change elements of a queueElement like status, members, exercises, location and so on
 * Patch data can contain an operation, a path and a value.
 * @param bearer Token used for identification
 * @param subjectId The subject where the queueElement is
 * @param queueElementId The specific queueElement to edit
 * @param patch a patch-object which specifies what to change
 */
async function patchQueueElement(bearer: string, subjectId: number, queueElementId: number, patch: Patch) {
    const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}/queue/${queueElementId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearer}`,
        },
        credentials: 'include',
        body: JSON.stringify(patch),
    });

    if (!response.ok) {
        throw new Error('Failed to patch queue element');
    }
    const contentLength = response.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength) > 0) {
        return response.json();
    } else {
        return null;
    }
}


/**
 * - Method to handle the stop / cancel of a queueElement
 * - This is if the queueElement is currently assisted by a TA or not
 * - 1 is active, 0 is if it's not assisted
 * - Sets the teacherId of the queueElement to empty
 * - Uses the patchQueueElement api call
 * @param bearer Token used for identification
 * @param subjectId The subject where the queueElement is
 * @param queueElementId The specific queueElement to edit
 */
export const stopQueueElement = async (bearer: string, subjectId: number, queueElementId: number) => {
    const patchStatus = {
        op: 'replace',
        path: '/status',
        value: '0',
    };
    const patchTeacher = {
        op: 'replace',
        path: '/teacher',
        value: null,
    };
    try {
        await patchQueueElement(bearer, subjectId, queueElementId, patchStatus);
        await patchQueueElement(bearer, subjectId, queueElementId, patchTeacher);
        return true;
    } catch (error) {
        console.error('Error stopping queue element:', error);
        return false;
    }
}


/**
 * Call to get a single QueueElement
 * @param bearer token for auth
 * @param subjectID ID for the subject
 * @param queueElementId ID of the element
 */
export const getSingleQueueElement = async (bearer: string, subjectID: number, queueElementId: number) => {
    try {


        const response = await fetch(`${API_BASE_URL}/subjects/${subjectID}/queue/${queueElementId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bearer}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching queue element messages: ${response.statusText}`);
        }
        const jsonResponse = await response.json()
        return jsonResponse


    } catch (error) {
        console.error('Error fetching subject:', error);
        return null
    }

}

/**
 * API-call to delete queueElement from queue
 * Can be used by TAs to remove from queue, or by a student
 * if they want to leave the queue
 */
export const removeQueueElement = async (bearer: string, subjectID: number, queueElementID: number): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/subjects/${subjectID}/queue/${queueElementID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bearer}`,
            },
        });

        return response.ok;
    } catch (error) {
        console.error("Failed to delete queueElement", error);
        return false;
    }


}