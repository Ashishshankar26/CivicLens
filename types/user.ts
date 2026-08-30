export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  avatarKey?: string;
  gender?: 'male' | 'female';
  bio?: string;
  createdAt: string;
  reportsCount: number;
  confirmationsCount: number;
  resolvedCount: number;
}
