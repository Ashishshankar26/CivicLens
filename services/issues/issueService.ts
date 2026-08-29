import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, isLiveFirebase } from '../firebase/config';
import { uploadIssueImage } from '../storage/storageService';
import { CivicIssue, CreateIssueInput } from '@/types/issue';
import { INITIAL_MOCK_ISSUES } from '@/constants/mockData';
import { calculatePriorityScore, generateIssueTimeline } from '@/utils/priority';

const ISSUES_STORAGE_KEY = '@civiclens_issues_cache_v6';
const CONFIRMATIONS_STORAGE_KEY = '@civiclens_user_confirmations_v6';
const RESOLUTIONS_STORAGE_KEY = '@civiclens_user_resolutions_v6';

export const RESOLUTION_THRESHOLD = 2;

function cleanForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(cleanForFirestore);
  if (typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        res[k] = cleanForFirestore(v);
      }
    }
    return res;
  }
  return obj;
}

/**
 * Initializes and retrieves the issue collection from Firestore or local cache.
 */
export async function getIssues(): Promise<CivicIssue[]> {
  try {
    // 1. Try fetching from Firestore if live
    if (isLiveFirebase && db) {
      const issuesRef = collection(db, 'issues');
      const q = query(issuesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const liveIssues: CivicIssue[] = [];
        snapshot.forEach((docSnap) => {
          liveIssues.push(docSnap.data() as CivicIssue);
        });
        await AsyncStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(liveIssues));
        return liveIssues;
      }
    }

    // 2. Load from local cache
    const cached = await AsyncStorage.getItem(ISSUES_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as CivicIssue[];
      if (parsed.length > 0) {
        return parsed;
      }
    }

    // 3. Seed with initial mock issues if cache is empty
    await AsyncStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ISSUES));

    // Also seed to Firestore if live so cloud database has the initial dataset
    if (isLiveFirebase && db) {
      for (const item of INITIAL_MOCK_ISSUES) {
        try {
          await setDoc(doc(db, 'issues', item.id), cleanForFirestore(item), { merge: true });
        } catch {
          // ignore seeding error
        }
      }
    }

    return INITIAL_MOCK_ISSUES;
  } catch (error) {
    console.warn('Error fetching issues, using seeded fallback', error);
    return INITIAL_MOCK_ISSUES;
  }
}

/**
 * Creates and persists a new civic issue report with Smart Priority and Timeline.
 */
export async function createIssue(
  input: CreateIssueInput,
  userId: string,
  userName: string
): Promise<CivicIssue> {
  const issueId = `issue-${Date.now()}`;
  
  // 1. Upload photo
  const uploadedImageUrl = await uploadIssueImage(input.imageUri, userId, issueId);

  // 2. Calculate Smart Priority Score (0 - 100)
  const priorityData = calculatePriorityScore(
    input.severity,
    input.trafficLevel || 'medium',
    1,
    0,
    new Date().toISOString(),
    input.roadType || 'main_road',
    input.impactFactors || []
  );

  const newIssue: CivicIssue = {
    id: issueId,
    category: input.category,
    description: input.description.trim(),
    imageUrl: uploadedImageUrl,
    latitude: input.latitude,
    longitude: input.longitude,
    locationName: input.locationName || `${input.latitude.toFixed(4)}, ${input.longitude.toFixed(4)}`,
    severity: input.severity,
    status: 'active',
    reportedBy: userId,
    reporterName: userName || 'Citizen',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    confirmationCount: 1,
    gettingWorseCount: 0,
    repairedVotesCount: 0,
    resolvedAt: undefined,
    aiSuggestedCategory: input.aiSuggestedCategory,
    aiConfidence: input.aiConfidence,
    
    priorityScore: priorityData.total,
    priorityTier: priorityData.tier,
    impactFactors: input.impactFactors || [],
    roadType: input.roadType || 'main_road',
    trafficLevel: input.trafficLevel || 'medium',
    roadCondition: input.roadCondition || 'dry',
    timeline: generateIssueTimeline({
      category: input.category,
      reporterName: userName,
      createdAt: new Date().toISOString(),
      confirmationCount: 1,
      priorityScore: priorityData.total,
      status: 'active',
    }),
  };

  // 3. Persist to Firestore if live
  if (isLiveFirebase && db) {
    try {
      await setDoc(doc(db, 'issues', issueId), cleanForFirestore(newIssue), { merge: true });
    } catch (err) {
      console.warn('Firestore write warning: persisting to local cache', err);
    }
  }

  // 4. Update local cache
  const cached = await AsyncStorage.getItem(ISSUES_STORAGE_KEY);
  const currentIssues: CivicIssue[] = cached ? JSON.parse(cached) : INITIAL_MOCK_ISSUES;
  const filtered = currentIssues.filter((i) => i.id !== newIssue.id);
  const updatedIssues = [newIssue, ...filtered];
  await AsyncStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(updatedIssues));

  return newIssue;
}

/**
 * Community Confirmation: "Still Exists"
 */
export async function confirmIssueExists(
  issueId: string,
  userId: string
): Promise<{ success: boolean; newCount: number; message: string }> {
  const confirmationsKey = `${CONFIRMATIONS_STORAGE_KEY}_${userId}`;
  const userConfirmationsJson = await AsyncStorage.getItem(confirmationsKey);
  const userConfirmations: string[] = userConfirmationsJson ? JSON.parse(userConfirmationsJson) : [];

  if (userConfirmations.includes(issueId)) {
    return {
      success: false,
      newCount: 0,
      message: 'You have already confirmed that this issue exists.',
    };
  }

  userConfirmations.push(issueId);
  await AsyncStorage.setItem(confirmationsKey, JSON.stringify(userConfirmations));

  // Update in local cache first to compute updated priority and timeline
  const cached = await AsyncStorage.getItem(ISSUES_STORAGE_KEY);
  let newCount = 1;
  let updatedIssueObj: CivicIssue | null = null;

  if (cached) {
    const issues: CivicIssue[] = JSON.parse(cached);
    const updated = issues.map((issue) => {
      if (issue.id === issueId) {
        newCount = (issue.confirmationCount || 0) + 1;
        const newPriority = calculatePriorityScore(
          issue.severity,
          issue.trafficLevel || 'medium',
          newCount,
          issue.gettingWorseCount || 0,
          issue.createdAt,
          issue.roadType || 'main_road',
          issue.impactFactors || []
        );

        updatedIssueObj = {
          ...issue,
          confirmationCount: newCount,
          priorityScore: newPriority.total,
          priorityTier: newPriority.tier,
          updatedAt: new Date().toISOString(),
          timeline: generateIssueTimeline({
            ...issue,
            confirmationCount: newCount,
            priorityScore: newPriority.total,
          }),
        };
        return updatedIssueObj;
      }
      return issue;
    });
    await AsyncStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(updated));
  }

  // Update in Firestore with full updated state
  if (isLiveFirebase && db && updatedIssueObj) {
    try {
      await setDoc(doc(db, 'issues', issueId), cleanForFirestore(updatedIssueObj), { merge: true });
    } catch (err) {
      console.warn('Firestore confirmation update warning', err);
    }
  }

  return {
    success: true,
    newCount,
    message: 'Thank you! Your on-site verification confirms this hazard for neighborhood safety.',
  };
}

/**
 * Community Verification: "Getting Worse" (Critical hazard escalation)
 */
export async function confirmIssueGettingWorse(
  issueId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  const cached = await AsyncStorage.getItem(ISSUES_STORAGE_KEY);
  let updatedIssueObj: CivicIssue | null = null;

  if (cached) {
    const issues: CivicIssue[] = JSON.parse(cached);
    const updated = issues.map((issue) => {
      if (issue.id === issueId) {
        const newWorse = (issue.gettingWorseCount || 0) + 1;
        const newPriority = calculatePriorityScore(
          'high',
          issue.trafficLevel || 'heavy',
          issue.confirmationCount || 1,
          newWorse,
          issue.createdAt,
          issue.roadType || 'main_road',
          issue.impactFactors || []
        );

        updatedIssueObj = {
          ...issue,
          severity: 'high' as const,
          gettingWorseCount: newWorse,
          priorityScore: newPriority.total,
          priorityTier: newPriority.tier,
          updatedAt: new Date().toISOString(),
          timeline: generateIssueTimeline({
            ...issue,
            severity: 'high',
            gettingWorseCount: newWorse,
            priorityScore: newPriority.total,
          }),
        };
        return updatedIssueObj;
      }
      return issue;
    });
    await AsyncStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(updated));
  }

  // Persist the escalation to Firestore immediately
  if (isLiveFirebase && db && updatedIssueObj) {
    try {
      await setDoc(doc(db, 'issues', issueId), cleanForFirestore(updatedIssueObj), { merge: true });
    } catch (err) {
      console.warn('Firestore gettingWorse update warning', err);
    }
  }

  return {
    success: true,
    message: 'Urgent hazard escalation recorded! Smart Priority score increased.',
  };
}

/**
 * Community Confirmation: "Mark as Resolved" with Photo Proof
 */
export async function confirmIssueResolved(
  issueId: string,
  userId: string,
  resolvedImageUrl?: string
): Promise<{ success: boolean; isResolved: boolean; message: string }> {
  const resolutionsKey = `${RESOLUTIONS_STORAGE_KEY}_${userId}`;
  const userResolutionsJson = await AsyncStorage.getItem(resolutionsKey);
  const userResolutions: string[] = userResolutionsJson ? JSON.parse(userResolutionsJson) : [];

  if (!userResolutions.includes(issueId)) {
    userResolutions.push(issueId);
    await AsyncStorage.setItem(resolutionsKey, JSON.stringify(userResolutions));
  }

  // If a local image URI was provided, upload it to storage
  let finalResolvedUrl = resolvedImageUrl;
  if (resolvedImageUrl && (resolvedImageUrl.startsWith('file:') || resolvedImageUrl.startsWith('content:'))) {
    try {
      finalResolvedUrl = await uploadIssueImage(resolvedImageUrl, userId, `${issueId}_resolved`);
    } catch {
      finalResolvedUrl = resolvedImageUrl;
    }
  }

  const cached = await AsyncStorage.getItem(ISSUES_STORAGE_KEY);
  let updatedIssueObj: CivicIssue | null = null;

  if (cached) {
    const issues: CivicIssue[] = JSON.parse(cached);
    const updated = issues.map((issue) => {
      if (issue.id === issueId) {
        const resolutionCount = (issue.repairedVotesCount || 0) + 1;

        updatedIssueObj = {
          ...issue,
          repairedVotesCount: resolutionCount,
          status: 'resolved',
          resolvedAt: new Date().toISOString(),
          resolvedBy: userId,
          resolvedImageUrl: finalResolvedUrl || issue.resolvedImageUrl,
          updatedAt: new Date().toISOString(),
          timeline: generateIssueTimeline({
            ...issue,
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
          }),
        };
        return updatedIssueObj;
      }
      return issue;
    });
    await AsyncStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(updated));
  }

  // Persist resolved status directly to Firestore
  if (isLiveFirebase && db && updatedIssueObj) {
    try {
      await setDoc(doc(db, 'issues', issueId), cleanForFirestore(updatedIssueObj), { merge: true });
    } catch (err) {
      console.warn('Firestore resolved status write error', err);
    }
  }

  return {
    success: true,
    isResolved: true,
    message: 'Community verified! Hazard marked as restored with photo proof.',
  };
}

/**
 * Checks if current user has already taken actions on an issue
 */
export async function getUserActionState(
  issueId: string,
  userId: string
): Promise<{ hasConfirmed: boolean; hasResolved: boolean }> {
  const confirmationsKey = `${CONFIRMATIONS_STORAGE_KEY}_${userId}`;
  const userConfirmationsJson = await AsyncStorage.getItem(confirmationsKey);
  const userConfirmations: string[] = userConfirmationsJson ? JSON.parse(userConfirmationsJson) : [];

  const resolutionsKey = `${RESOLUTIONS_STORAGE_KEY}_${userId}`;
  const userResolutionsJson = await AsyncStorage.getItem(resolutionsKey);
  const userResolutions: string[] = userResolutionsJson ? JSON.parse(userResolutionsJson) : [];

  return {
    hasConfirmed: userConfirmations.includes(issueId),
    hasResolved: userResolutions.includes(issueId),
  };
}
