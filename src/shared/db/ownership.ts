export function ownedBy(ownerId: string) {
  return { ownerId } as const;
}

export function belongsToUser(userId: string) {
  return { userId } as const;
}

export function scopeOwnedWhere<T extends Record<string, unknown>>(ownerId: string, where?: T) {
  return where ? ({ AND: [where, ownedBy(ownerId)] } as const) : ownedBy(ownerId);
}
