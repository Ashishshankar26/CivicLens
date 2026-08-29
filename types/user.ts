export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  createdAt: string;
  reportsCount: number;
  confirmationsCount: number;
  resolvedCount: number;
}
