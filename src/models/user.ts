/* eslint-disable @typescript-eslint/no-explicit-any */
interface Department {
  departmentId: string;
  name: string;
  role: number;
}
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