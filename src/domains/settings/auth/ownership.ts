export function ownsResource(userId: string, ownerId: string) {
  return userId === ownerId;
}

export function assertResourceOwner(userId: string, ownerId: string) {
  if (!ownsResource(userId, ownerId)) throw new Error("Resource not found.");
}
