/* eslint-disable @typescript-eslint/no-explicit-any */

export type UserInstance = {
  name: string;
  email: string;
  language: string;
  roles: any;
  profileImage?: string;
  schedulesCount?: number;
  assignmentsCount?: number;
  shiftsCount?: number;
};