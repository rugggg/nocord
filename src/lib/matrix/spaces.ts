import { MatrixClient, Room } from "matrix-js-sdk";

export function getSpaces(client: MatrixClient): Room[] {
  return client.getRooms().filter((room) => {
    const creation = room.currentState.getStateEvents("m.room.create", "");
    if (!creation) return false;
    const content = creation.getContent();
    return content?.type === "m.space";
  });
}

export function getChildRooms(client: MatrixClient, spaceId: string): Room[] {
  const space = client.getRoom(spaceId);
  if (!space) return [];

  const childEvents = space.currentState.getStateEvents("m.space.child");
  const childIds = childEvents.map((ev) => ev.getStateKey()).filter(Boolean) as string[];

  return childIds
    .map((id) => client.getRoom(id))
    .filter((r): r is Room => r !== null && r.getMyMembership() === "join");
}

export function getNonSpaceRooms(client: MatrixClient): Room[] {
  const spaces = getSpaces(client);
  const spaceIds = new Set(spaces.map((s) => s.roomId));

  // Collect all rooms that are children of any space
  const childIds = new Set<string>();
  for (const space of spaces) {
    const childEvents = space.currentState.getStateEvents("m.space.child");
    for (const ev of childEvents) {
      const key = ev.getStateKey();
      if (key) childIds.add(key);
    }
  }

  return client.getRooms().filter((room) => {
    if (spaceIds.has(room.roomId)) return false;
    if (childIds.has(room.roomId)) return false;
    if (room.getMyMembership() !== "join") return false;
    const creation = room.currentState.getStateEvents("m.room.create", "");
    if (creation?.getContent()?.type === "m.space") return false;
    return true;
  });
}
