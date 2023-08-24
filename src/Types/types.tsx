/** Type of user **/
export type User = {
    userID: number;
    roleID: number,
    email: string;
    //password: string;
    courses: SubjectRole[];
    firstName: string;
    lastName: string;
    token: string;

}

/**Type of subjectRole, which has the roles a user has in a subject
 Used in User type. **/
export type SubjectRole = {
    subjectID: number;
    subjectrole: number;
};

/** The type of subject **/
export type Subject = {
    subjectId: number;
    subjectName: string;
    subjectCode: number;
    subjectActive: number;
    subjectQueueStatus: number;
    notice: string;
    userQueueElementID: number,
}

/** Type for QueueElement (Student in a queue) **/
export type QueueElement = {
    exerciseNumber: number;
    exerciseTeacher: number;
    members: QueueMember[];
    ownerID: number;
    queueElementDesk: number;
    queueElementHelp: boolean;
    queueElementID: number;
    queueElementPosition: number;
    queueElementStartTime: string;
    roomID: number;
    roomNumber: number;
    status: number;
    subjectID: number;
    teacher: number;
    exercises?: number[];
    message?: string;

};

/** Type for QueueMemeber (Part of QueueElement) **/
export type QueueMember = {
    enabled: boolean;
    personEmail: string;
    personFirstName: string;
    personLastName: string;
    roleID: number;
    userID: number;
};

/**
 * Is the message of a QueueElement
 * Key: The subjectQueueElement ID
 * String: The message from student to TA
 */
export type ParsedMessage = {
    key: string;
    value: string;
};

/**
 * Type for an Exercise
 */
export type Exercise = {
    exerciseID: number;
    exerciseNumber: number;
    subjectID: number;
}

/**
 * Type for a room
 */
export type Room = {
    campusID: number;
    buildingID: number;
    roomDesk: number;
    roomFloor: number;
    roomID: number;
    roomImgLink: string;
    roomName: string;
    roomNumber: string;
}

export type Campus = {
    campusID: number;
    campusName: string;
    isEnabled: boolean;

}

export type Building = {
    buildingID: number,
    buildingName: string,
    campusID: number,
    campusName: string,
}

