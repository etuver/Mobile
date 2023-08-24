//const API_BASE_URL = "https://qs2.idi.ntnu.no/api";
const API_BASE_URL = "https://qs-dev.idi.ntnu.no/api";

/**
 * Post call to log in user with email and password
 * @param email user email
 * @param password user password
 * returns a json-response with the user if successful
 */
export async function postlogin(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/login`, {

        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json', // Add this line
        },
        body: JSON.stringify({email, password}),
    });

    if (!response.ok) {
        throw new Error('Failed to log in');
    }

    const setCookieHeader = response.headers.get('set-cookie');
    const token = setCookieHeader?.split(';')[0].split('=')[1];

    const responseBody = await response.json();
    return {...responseBody, token};
}


/**
 * Get the photo of a user in a subject
 * Used by TA's screen to show a image of the students for identifying
 * @param subjectID The subject where the student is attending
 * @param userID The userid of the user whos photo to get
 * @param token Required to identify to prove privilegies to get photo
 */
export const getSubjectUserPhoto = async (subjectID: number, userID: number, token: string): Promise<Response> => {
    const response = await fetch(`${API_BASE_URL}/subjects/${subjectID}/users/${userID}/photo`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    return response;
};





