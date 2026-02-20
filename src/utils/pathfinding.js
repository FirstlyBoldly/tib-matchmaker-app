import * as THREE from 'three';
import PF from 'pathfinding';

// A* Pathfinding to navigate around rooms
// Grid based approach on XZ plane

const GRID_SIZE = 100; // 100x100 area
const CELL_SIZE = 2; // Resolution of the grid

const createGrid = (rooms, level, startPos, endPos) => {
    // 1. Initialize empty grid
    // Map coords -50 to 50 -> Grid coords 0 to 100/CELL_SIZE
    const gridWidth = Math.ceil(GRID_SIZE / CELL_SIZE);
    const gridHeight = Math.ceil(GRID_SIZE / CELL_SIZE);

    // Create 2D array: 0 = Walkable, 1 = Obstacle
    const grid = Array(gridWidth).fill().map(() => Array(gridHeight).fill(0));

    // Helper to check if point is in room
    const isPointInRoom = (point, room) => {
        const halfWidth = room.size[0] / 2;
        const halfDepth = room.size[2] / 2;
        return (
            point.x >= room.position[0] - halfWidth &&
            point.x <= room.position[0] + halfWidth &&
            point.z >= room.position[2] - halfDepth &&
            point.z <= room.position[2] + halfDepth
        );
    };

    // 2. Mark obstacles
    rooms.forEach(room => {
        if (room.floor !== level) return;

        // Convert room bounds to grid coords
        // Room position is center
        const halfWidth = room.size[0] / 2;
        const halfDepth = room.size[2] / 2;

        const minX = room.position[0] - halfWidth;
        const maxX = room.position[0] + halfWidth;
        const minZ = room.position[2] - halfDepth;
        const maxZ = room.position[2] + halfDepth;

        // Add padding to avoid clipping corners
        const PADDING = 4;

        // Convert world coords to grid indices
        const startX = Math.floor((minX - PADDING + 50) / CELL_SIZE);
        const endX = Math.ceil((maxX + PADDING + 50) / CELL_SIZE);
        const startZ = Math.floor((minZ - PADDING + 50) / CELL_SIZE);
        const endZ = Math.ceil((maxZ + PADDING + 50) / CELL_SIZE);

        // Create "Thick Walls" 
        // 1. Mark the entire padded box as obstacle
        for (let x = startX; x < endX; x++) {
            for (let z = startZ; z < endZ; z++) {
                if (x >= 0 && x < gridWidth && z >= 0 && z < gridHeight) {
                    grid[x][z] = 1;
                }
            }
        }

        // 2. Carve out the Interior
        // We want the visual wall (at room boundary) to be blocked.
        // So we carve out a box meant to be strictly INSIDE the room.
        // Room bounds: minX, maxX.
        // Safety margin inside: 2 units.
        const internalPadding = 2;

        const innerMinX = minX + internalPadding;
        const innerMaxX = maxX - internalPadding;
        const innerMinZ = minZ + internalPadding;
        const innerMaxZ = maxZ - internalPadding;

        const innerStartX = Math.ceil((innerMinX + 50) / CELL_SIZE);
        const innerEndX = Math.floor((innerMaxX + 50) / CELL_SIZE);
        const innerStartZ = Math.ceil((innerMinZ + 50) / CELL_SIZE);
        const innerEndZ = Math.floor((innerMaxZ + 50) / CELL_SIZE);

        for (let x = innerStartX; x < innerEndX; x++) {
            for (let z = innerStartZ; z < innerEndZ; z++) {
                if (x >= 0 && x < gridWidth && z >= 0 && z < gridHeight) {
                    grid[x][z] = 0; // Walkable Interior
                }
            }
        }

        // 3. Widen Gate Clearing
        if (room.entrance) {
            const eX = room.entrance.x;
            const eZ = room.entrance.z;
            const eW = room.entrance.width;

            // Increase Reach significantly to ensure we punch through any padding
            const REACH = PADDING + 4;

            let clearMinX, clearMaxX, clearMinZ, clearMaxZ;

            if (room.entrance.orientation === 'horizontal') {
                // Wide in X, path is along Z
                clearMinX = eX - (eW / 2) - 1; // Extra 1 unit width
                clearMaxX = eX + (eW / 2) + 1;
                clearMinZ = eZ - REACH;
                clearMaxZ = eZ + REACH;
            } else {
                // Wide in Z, path is along X
                clearMinX = eX - REACH;
                clearMaxX = eX + REACH;
                clearMinZ = eZ - (eW / 2) - 1;
                clearMaxZ = eZ + (eW / 2) + 1;
            }

            const gMinX = Math.max(0, Math.floor((clearMinX + 50) / CELL_SIZE));
            const gMaxX = Math.min(gridWidth, Math.ceil((clearMaxX + 50) / CELL_SIZE));
            const gMinZ = Math.max(0, Math.floor((clearMinZ + 50) / CELL_SIZE));
            const gMaxZ = Math.min(gridHeight, Math.ceil((clearMaxZ + 50) / CELL_SIZE));

            for (let x = gMinX; x < gMaxX; x++) {
                for (let z = gMinZ; z < gMaxZ; z++) {
                    grid[x][z] = 0; // Walkable
                }
            }
        }
    });



    // 4. Force Clear Escalator Zones (Top and Bottom)
    // To ensure multi-floor navigation always has a valid entry/exit point.
    // We import ESCALATORS, or pass them? ideally pass them.
    // For now, we'll hardcode based on the known map data or pass it.
    // To avoid circular dependency, let's accept 'escalators' as arg or default to empty.

    // Quick fix: Hardcode known escalator points for now, or import. 
    // Importing ESCALATORS from mapData might be circular if mapData imports this?
    // mapData imports nothing. pathfinding imports mapData. Safe.

    const escalators = [
        { bottom: [35, 0, 10], top: [45, 10, 10], levels: [1, 2] },
        { bottom: [-35, 10, -10], top: [-45, 20, -10], levels: [2, 3] }
    ];

    escalators.forEach(esc => {
        const pointsToClear = [];
        if (esc.levels.includes(level)) {
            // Check if this level is bottom or top
            if (esc.levels[0] === level) pointsToClear.push(esc.bottom); // Is bottom
            if (esc.levels[1] === level) pointsToClear.push(esc.top);    // Is top
        }

        pointsToClear.forEach(pt => {
            // Clear 5x5 area around escalator point (widen the landing zone)
            const cx = Math.floor((pt[0] + 50) / CELL_SIZE);
            const cy = Math.floor((pt[2] + 50) / CELL_SIZE);

            for (let dx = -3; dx <= 3; dx++) {
                for (let dy = -3; dy <= 3; dy++) {
                    const nx = cx + dx;
                    const ny = cy + dy;
                    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
                        grid[nx][ny] = 0;
                    }
                }
            }
        });
    });



    // 5. Force Clear Start and End Positions - REMOVED
    // We rely on findNearestWalkable to move the user out of walls, 
    // rather than destroying the wall. This ensures Gate Rules are respected.

    return { grid, gridWidth, gridHeight };
};

export const findPath = (startPos, endPos, rooms, level) => {
    // 1. Create Grid for this level (Returns matrix: 0=Walkable, 1=Blocked)
    const { grid: matrix, gridWidth, gridHeight } = createGrid(rooms, level, startPos, endPos);

    // 2. Convert start/end to grid coords
    const toGrid = (pos) => ({
        x: Math.max(0, Math.min(gridWidth - 1, Math.floor((pos.x + 50) / CELL_SIZE))),
        y: Math.max(0, Math.min(gridHeight - 1, Math.floor((pos.z + 50) / CELL_SIZE)))
    });

    let startNode = toGrid(startPos);
    let endNode = toGrid(endPos);

    // 3. Robust Start/End Search
    // If start or end is inside a wall (Blocked=1), find the nearest walkable node
    const findNearestWalkable = (node) => {
        if (matrix[node.x][node.y] === 0) return node;

        // Spiral search up to radius 10 (Increased from 5 to ensure coverage for edge cases like Alice M)
        for (let r = 1; r < 11; r++) {
            for (let dx = -r; dx <= r; dx++) {
                for (let dy = -r; dy <= r; dy++) {
                    const nx = node.x + dx;
                    const ny = node.y + dy;
                    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
                        if (matrix[nx][ny] === 0) return { x: nx, y: ny };
                    }
                }
            }
        }
        return node;
    };

    if (matrix[startNode.x][startNode.y] === 1) startNode = findNearestWalkable(startNode);
    if (matrix[endNode.x][endNode.y] === 1) endNode = findNearestWalkable(endNode);

    // Final safety check
    if (matrix[startNode.x][startNode.y] === 1 || matrix[endNode.x][endNode.y] === 1) {
        return [startPos, endPos];
    }

    // 4. Initialize Pathfinding Library
    const grid = new PF.Grid(matrix);
    const finder = new PF.AStarFinder({
        allowDiagonal: true,
        dontCrossCorners: true
    });

    // 5. Find Path
    let path = finder.findPath(startNode.x, startNode.y, endNode.x, endNode.y, grid);

    // Fallback: If no path found (empty array), return direct line
    if (path.length === 0) {
        return [startPos, endPos];
    }

    // 6. Smoothen Path
    // PF.Util.smoothenPath has a bug (undeclared variable) in strict mode.
    // We implement a simple Line-of-Sight smoothing here.

    if (path.length > 2) {
        const smoothPath = [path[0]];
        let lastNode = path[0];

        // Check line of sight between lastNode and targetNode
        // If clear, skip intermediate nodes.

        // Simple Raycast on Grid
        const hasLineOfSight = (p0, p1) => {
            let x0 = p0[0], y0 = p0[1];
            let x1 = p1[0], y1 = p1[1];

            let dx = Math.abs(x1 - x0);
            let dy = Math.abs(y1 - y0);
            let sx = (x0 < x1) ? 1 : -1;
            let sy = (y0 < y1) ? 1 : -1;
            let err = dx - dy;

            while (true) {
                // Check collision (using original matrix)
                if (matrix[x0][y0] === 1) return false;

                if (x0 === x1 && y0 === y1) break;

                let e2 = 2 * err;
                if (e2 > -dy) { err -= dy; x0 += sx; }
                if (e2 < dx) { err += dx; y0 += sy; }
            }
            return true;
        };

        for (let i = 1; i < path.length; i++) {
            if (!hasLineOfSight(lastNode, path[i])) {
                // Collision found, add the *previous* node as a waypoint
                lastNode = path[i - 1];
                smoothPath.push(lastNode);
            }
        }
        smoothPath.push(path[path.length - 1]);
        path = smoothPath;
    }

    // 7. Convert back to World Coordinates
    const worldPath = path.map(([x, y]) => new THREE.Vector3(
        (x * CELL_SIZE) - 50 + (CELL_SIZE / 2),
        startPos.y,
        (y * CELL_SIZE) - 50 + (CELL_SIZE / 2)
    ));

    // Ensure exact start and end matches
    if (worldPath.length > 0) {
        worldPath[0] = startPos;
        worldPath[worldPath.length - 1] = endPos;
    }

    return worldPath;
};
