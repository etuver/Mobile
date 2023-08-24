//const API_BASE_URL = "https://qs2.idi.ntnu.no/api";
import {Building, Campus, Room} from "../Types/types";

const API_BASE_URL = "https://qs-dev.idi.ntnu.no/api";


/**
 * Service call to get a room by roomId
 * @param bearer user token for authentication
 * @param roomId roomID of the room to get
 */
export const getRoom = async (bearer: string, roomId: number): Promise<Room | null> => {
    const url = `${API_BASE_URL}/campus/0/buildings/0/rooms/${roomId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearer}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.error(`Error fetching room: ${response.status} ${response.statusText}`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching room:', error);
        return null;
    }
};


/**
 * Get-call to get roomImage from the server
 * uses 0 as wildcard for campusID and buildingID
 * @param room the room for which image to get
 */
export const getRoomImage = async (room: Room): Promise<Response> => {
    const response = await fetch(`${API_BASE_URL}/campus/` + 0 + '/buildings/' + 0 + '/rooms/' + room.roomID + '/image', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        console.log("error")
        throw new Error("Error fetching room image")
    }
    return response;

}

/**
 * Get-call to get All campuses from the server
 * @return an array of Campus
 */
export const getAllCampuses = async (): Promise<Campus[]> => {
    const response = await fetch(`${API_BASE_URL}/campus`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (!response.ok) {
        console.log("error")
        throw new Error("Error fetching campuses")
    }

    const jsonResponse = await response.json();

    const campuses: Campus[] = jsonResponse.campuses.map((campus: any) => ({
        campusID: campus.campusID,
        campusName: campus.campusName,
        isEnabled: campus.isEnabled,
    }))

    //console.log("campuses: " + JSON.stringify(campuses))

    return campuses
}

/**
 * Get-call to get all buildings for a given Campus
 * @param campusID the ID of the campus for which to get buildings
 * @return an array of Buildings
 */
export const getCampusBuildings = async (campusID: number): Promise<Building[]> => {
    const response = await fetch(`${API_BASE_URL}/campus/` + campusID + '/buildings', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (!response.ok) {
        throw new Error("Error fetching buildings for campus")
    }

    const jsonResponse = await response.json();

    const buildings: Building[] = jsonResponse.buildings.map((building: any) => ({
        buildingID: building.buildingID,
        buildingName: building.buildingName,
        campusID: building.campusID,
        campusName: building.campusName,
    }))

    //console.log("buildings: "+JSON.stringify(buildings))

    return buildings;

}

/**
 * Get-call to get all rooms in a building
 * @param campusID id of the campus where the building is
 * @param buildingID ID of the building
 * @return a list of Room
 */
export const getRoomsInBuilding = async (campusID: number, buildingID: number): Promise<Room[]> => {
    const response = await fetch(`${API_BASE_URL}/campus/` + campusID + '/buildings/' + buildingID + '/rooms', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (!response.ok) {
        throw new Error("Error fetching Rooms for building")
    }

    const responseText = await response.text();

    if (!responseText) {
        console.warn('Empty response received for campusID:', campusID, 'buildingID:', buildingID);
        return []; // Return an empty array if the response text is empty
    }

    //const jsonResponse = await response.json();
    const jsonResponse = JSON.parse(responseText)

    const rooms: Room[] = jsonResponse.rooms.map((room: any) => ({
        campusID: campusID,
        buildingID: room.buildingID,
        roomDesk: room.roomDesk,
        roomFloor: room.roomFloor,
        roomID: room.roomID,
        roomImgLink: room.roomImgLink || null,
        roomName: room.roomName,
        roomNumber: room.roomNumber,
    }))
    //console.log("rooms:  " + JSON.stringify(rooms))

    return rooms

}





