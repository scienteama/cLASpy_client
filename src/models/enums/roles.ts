export enum UserRoleEnum {
  ADMIN = 1,
  POWER_USER = 2,
  STANDARD_USER = 3,
  READ_ONLY = 4,
}

export const MapUserRoleEnum = new Map<number, string>([
  [UserRoleEnum.ADMIN, 'Administrateur'],
  [UserRoleEnum.POWER_USER, 'Opérateur'],
  [UserRoleEnum.STANDARD_USER, 'Utilisateur'],
  [UserRoleEnum.READ_ONLY, 'Lecteur'],
]);
