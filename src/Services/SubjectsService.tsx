import {Exercise, Subject, SubjectRole, User} from "../Types/types";

//const API_BASE_URL = "https://qs2.idi.ntnu.no/api";
const API_BASE_URL = "https://qs-dev.idi.ntnu.no/api";


/**
 * Post-call to get all subjects where a user is attending, both as student and TA
 * Filters out subjects that is inactive
 * @param userId the id of the user
 * @returns All active subjects where uses is attending
 */
export const getSubjectsForUser = async (userId: number): Promise<Subject[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/subjects`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch courses for user');
        }

        const jsonResponse = await response.json();

        // Transform the response into the Course[] format
        const subjects = jsonResponse.subjects.map((subject: any) => {
            return {
                subjectId: subject.subjectID,
                subjectName: subject.subjectName,
                subjectCode: subject.subjectCode,
                subjectActive: subject.subjectActive,
                subjectQueueStatus: subject.subjectQueueStatus,
                notice: subject.queueMeta.notice,
                userQueueElementID: subject.userQueueElementID,


            };
        });

        // Only showing active subjects in the app
        const activeSubjects = subjects.filter((subject: Subject) => subject.subjectActive === 1);


        return activeSubjects;
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw new Error("Failed to fetch courses for user")
    }
};


/**
 * Returns all subjectRoles for a user
 * @param userID ID of the user of which to get roles
 * @returns a list of all subjects paired with the roles
 */
export const getSubjectRoles = async (userID: number): Promise<SubjectRole[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userID}/subjects/roles`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch roles for user");
        }

        const rolesData: { key: string; value: string }[] = await response.json();

        //Maps the data into a list of SubjectRoles
        const subjectroles: SubjectRole[] = rolesData.map(({key, value}) => ({
            subjectID: parseInt(key, 10),
            subjectrole: parseInt(value, 10),
        }));

        return subjectroles;
    } catch (error) {
        console.error("Error fetching user roles:", error);
        return [];
    }
};

/**
 * MEthod to get all exercises in a subject
 * @param subjectID id of the subject
 */
export const getSubjectExercises = async (subjectID: number): Promise<Exercise[] | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/subjects/${subjectID}/exercises`, {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (response.ok) {

            const exercisesData = await response.json();

            const exercises: Exercise[] = exercisesData.exercises.map((exercise: any) => ({
                exerciseID: exercise.exerciseID,
                exerciseNumber: exercise.exerciseNumber,
                subjectID: exercise.subjectID,
            }));
            return exercises;
        } else {
            console.error(
                `Failed to fetch exercises for subject ${subjectID}, status: ${response.status}, message: ${response.statusText}`
            );
            return null;
        }
    } catch (error) {
        console.error(`Failed to fetch exercises for subject ${subjectID}:`, error);
        return null;
    }
};

///subjects/{subject_id}/users/available
/**
 * Get all users in the subject that is not already in queue
 * @param subjectID Id of the subject
 */
export const getAvailableSubjectStudents = async (subjectID: number): Promise<User[] | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}` + "/subjects/" + subjectID + "/users/available", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        })
        if (response.status == 204){
            return null
        }

        //console.log("response: " + JSON.stringify(response))
        if (!response.ok) {
            throw new Error("Failed to fetch available users from api")
        }

        const userData = await response.json();

        const users: User[] = userData.people.map((user: any) => ({
            userID: user.userID,
            roleID: user.roleID,
            email: user.email,
            firstName: user.personFirstName,
            lastName: user.personLastName,
        }));
        //console.log("users: "+ JSON.stringify(users))

        return users
    } catch (error) {
        console.error("Failed to fetch available users")
        return null
    }

}
/**
 * Get information about a specific subject
 * @param bearer user token for auth
 * @param subjectID id of the subject
 */
export const getSpecificSubject = async (bearer: string, subjectID: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/subjects/${subjectID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `bearer=${bearer}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch courses for user');
        }

        const jsonResponse = await response.json();

        const subject: Subject = {
            subjectId: jsonResponse.subjectID,
            subjectName: jsonResponse.subjectName,
            subjectCode: jsonResponse.subjectCode,
            subjectActive: jsonResponse.subjectActive,
            subjectQueueStatus: jsonResponse.subjectQueueStatus,
            notice: jsonResponse.queueMeta.notice,
            userQueueElementID: jsonResponse.userQueueElementID,
        }

        return subject



    } catch (error) {
        console.error('Error fetching subject:', error);
        throw error;
    }

}
