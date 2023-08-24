

/**
 * Helper function that combines firstName and lastName to a full name
 * Reformats the name if too long
 * @param firstName first name
 * @param lastName last name
 * @returns if full name is shorter than 20 characters returns firstname plus lastname
 * @returns if fullname is longer than 20 chars and name is more than 3 parts ("John driddolo doe"), returns
 * only first firstname plus lastname.
 * @returns if the name still is longer than 20 returns concatenated firstname + lastname ("J. Doe")
 */
export const formatName = (firstName: string, lastName: string) => {
    const fullName = `${firstName} ${lastName}`;
    const nameParts = fullName.split(' ');

    if (fullName.length <= 20) {
        return fullName;
    }

    if (nameParts.length > 3) {
        return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
    }

    const shortFirstName = nameParts[0].charAt(0) + '.';
    const shortName = `${shortFirstName} ${nameParts[nameParts.length - 1]}`;

    return shortName.length > 20 ? `${shortFirstName} ${lastName}` : shortName;
};


export const getQueueStatusText = (statusnumber: number): string => {
    switch (statusnumber) {
        case 0:
            return 'closed';
        case 1:
            return 'open';
        case 2:
            return 'paused';
        default:
            return '';
    }
};