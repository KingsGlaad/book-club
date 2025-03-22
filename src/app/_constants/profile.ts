import { Role } from "@prisma/client";

export const ROLE_TYPE_OPTIONS = [
  {
    label: "Administrador",
    value: Role.ADMIN,
  },
  {
    label: "Usuário",
    value: Role.USER,
  },
  {
    label: "Moderador",
    value: Role.MODERATOR,
  },
];
