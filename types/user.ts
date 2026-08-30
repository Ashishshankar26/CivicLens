export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  avatarKey?: string; // 'compass' | 'shield' | 'zap' | 'crown' | 'car' | 'bike' | 'star' | 'camera' | 'flame'
  bio?: string;
  createdAt: string;
  reportsCount: number;
  confirmationsCount: number;
  resolvedCount: number;
}
