export const ROOM_TYPES = {
    STAGE: { color: '#8b5cf6', label: 'Stage' },     // Violet
    LOUNGE: { color: '#f97316', label: 'Lounge' },    // Orange
    MEETING: { color: '#3b82f6', label: 'Meeting' },  // Blue
    WORK: { color: '#10b981', label: 'Work' },        // Emerald
    FOOD: { color: '#ef4444', label: 'Dining' },      // Red
    QUIET: { color: '#64748b', label: 'Quiet' },      // Slate
    ENTRANCE: { color: '#eab308', label: 'Entry' }    // Yellow
};

export const ROOMS = [
    // Floor 1
    { floor: 1, name: 'Main Stage', type: 'STAGE', position: [20, 2, 20], size: [30, 4, 20], entrance: { x: 20, z: 10, width: 6, orientation: 'horizontal' } }, // Facing 'North' (lower Z)
    { floor: 1, name: 'Lounge', type: 'LOUNGE', position: [-20, 1.5, -20], size: [25, 3, 25], entrance: { x: -7.5, z: -20, width: 4, orientation: 'vertical' } }, // Facing 'East' (towards center)
    { floor: 1, name: 'Entrance', type: 'ENTRANCE', position: [0, 1.5, 45], size: [20, 3, 10], entrance: { x: 0, z: 40, width: 8, orientation: 'horizontal' } }, // Facing inside
    // Floor 2
    { floor: 2, name: 'Meeting A', type: 'MEETING', position: [25, 1.5, 25], size: [15, 3, 15], entrance: { x: 17.5, z: 25, width: 3, orientation: 'vertical' } },
    { floor: 2, name: 'Meeting B', type: 'MEETING', position: [-25, 1.5, 25], size: [15, 3, 15], entrance: { x: -17.5, z: 25, width: 3, orientation: 'vertical' } },
    { floor: 2, name: 'Coworking', type: 'WORK', position: [0, 1.5, -20], size: [40, 3, 20], entrance: { x: 0, z: -10, width: 6, orientation: 'horizontal' } },
    { floor: 2, name: 'Cafeteria', type: 'FOOD', position: [30, 1.5, -30], size: [20, 3, 20], entrance: { x: 20, z: -30, width: 4, orientation: 'vertical' } },
    // Floor 3
    { floor: 3, name: 'Innovation Lab', type: 'WORK', position: [0, 1.5, 0], size: [50, 3, 30], entrance: { x: 0, z: 15, width: 8, orientation: 'horizontal' } },
    { floor: 3, name: 'Quiet Zone', type: 'QUIET', position: [-35, 1.5, -35], size: [20, 3, 20], entrance: { x: -25, z: -35, width: 3, orientation: 'vertical' } },
    { floor: 3, name: 'Demo Area', type: 'STAGE', position: [35, 1.5, 35], size: [20, 3, 20], entrance: { x: 35, z: 25, width: 4, orientation: 'horizontal' } },
];

export const ESCALATORS = [
    // Floor 1 to 2 (East Side)
    { id: 'e1-2', levels: [1, 2], bottom: [35, 0, 10], top: [45, 10, 10], direction: 'east' },
    // Floor 2 to 3 (West Side)
    { id: 'e2-3', levels: [2, 3], bottom: [-35, 10, -10], top: [-45, 20, -10], direction: 'west' }
];

export const getRoomAtPosition = (position, floor) => {
    // Basic hit testing
    // Position is array [x, y, z] or object {x, y, z} if passed from Three.js vector
    const x = Array.isArray(position) ? position[0] : position.x;
    const z = Array.isArray(position) ? position[2] : position.z;

    return ROOMS.find(room => {
        if (room.floor !== floor) return false;

        const halfWidth = room.size[0] / 2;
        const halfDepth = room.size[2] / 2;

        return (
            x >= room.position[0] - halfWidth &&
            x <= room.position[0] + halfWidth &&
            z >= room.position[2] - halfDepth &&
            z <= room.position[2] + halfDepth
        );
    });
};
