import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/types/user';

const EMAIL_STORAGE_KEY = '@civiclens_citizen_emails';

export interface CitizenEmailRecord {
  id: string;
  to: string;
  subject: string;
  title: string;
  body: string;
  sentAt: string;
  type: 'welcome' | 'login' | 'report_submitted' | 'issue_resolved' | 'badge_unlocked';
}

const getMailEndpoints = (): string[] => {
  const customUrl = process.env.EXPO_PUBLIC_MAIL_SERVER_URL;
  const list = [
    customUrl,
    'http://172.20.10.2:4001/api/mail/send',    // Active Wi-Fi LAN IP
    'http://10.115.46.228:4001/api/mail/send',   // Alternate Wi-Fi LAN IP
    'http://10.0.2.2:4001/api/mail/send',       // Android Emulator host loopback
    'http://localhost:4001/api/mail/send',      // Web / local fallback
    'http://127.0.0.1:4001/api/mail/send',
  ];
  return Array.from(new Set(list.filter(Boolean))) as string[];
};

function createTimeoutSignal(ms: number): AbortSignal | undefined {
  try {
    if (typeof AbortSignal !== 'undefined' && typeof (AbortSignal as any).timeout === 'function') {
      return (AbortSignal as any).timeout(ms);
    }
    if (typeof AbortController !== 'undefined') {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), ms);
      return controller.signal;
    }
  } catch {
    // Fallback if AbortController is unavailable
  }
  return undefined;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function civicLensEmailTemplate(title: string, bodyHtml: string) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
      <div style="background:#0066FF;padding:24px 20px;text-align:center;">
        <h1 style="color:#FFFFFF;margin:0;font-size:22px;font-weight:900;letter-spacing:-0.5px;">CivicLens 2.0</h1>
        <p style="color:#DBEAFE;margin:4px 0 0 0;font-size:12px;font-weight:600;">Community Crowdsourced Road Safety</p>
      </div>
      <div style="padding:28px 24px;color:#0F172A;line-height:1.6;">
        <h2 style="font-size:18px;color:#0F172A;margin-top:0;font-weight:800;">${escapeHtml(title)}</h2>
        <div style="font-size:14px;color:#334155;">
          ${bodyHtml}
        </div>
      </div>
      <div style="background:#F8FAFC;padding:16px 24px;border-top:1px solid #E2E8F0;font-size:11px;color:#64748B;text-align:center;">
        <p style="margin:0;">CivicLens automated citizen notification • Keeping neighborhoods safe & restored.</p>
      </div>
    </div>
  `;
}

/**
 * Dispatches a live email via the SMTP relay service
 */
export async function sendCitizenEmail({
  to,
  subject,
  title,
  bodyHtml,
  type,
}: {
  to: string;
  subject: string;
  title: string;
  bodyHtml: string;
  type: CitizenEmailRecord['type'];
}): Promise<CitizenEmailRecord> {
  const fullHtml = civicLensEmailTemplate(title, bodyHtml);
  const emailRecord: CitizenEmailRecord = {
    id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    to,
    subject,
    title,
    body: bodyHtml,
    sentAt: new Date().toISOString(),
    type,
  };

  let dispatched = false;

  // 1. Primary: Attempt Freelancer Hub Local Gmail SMTP Relay Server (http://172.20.10.2:4001)
  for (const endpoint of getMailEndpoints()) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: createTimeoutSignal(3000),
        body: JSON.stringify({
          to,
          subject,
          html: fullHtml,
          text: title,
        }),
      });

      if (res.ok) {
        dispatched = true;
        console.log(`[CivicLens Mailer] Live email delivered to ${to} via Freelancer Hub SMTP (${endpoint})`);
        break;
      }
    } catch {
      // Continue to next endpoint or cloud fallback
    }
  }

  // 2. Secondary 24/7 Cloud Fallback: Resend Cloud API
  if (!dispatched) {
    const resendApiKey = process.env.EXPO_PUBLIC_RESEND_API_KEY;

    if (resendApiKey) {
      try {
        const fromEmail = process.env.EXPO_PUBLIC_MAIL_FROM || 'CivicLens <onboarding@resend.dev>';
        let targetRecipient = to.trim().toLowerCase();

        const defaultAdminRecipient = process.env.EXPO_PUBLIC_SMTP_USER || 'tonystarm2003@gmail.com';
        if (fromEmail.includes('resend.dev') && !targetRecipient.includes('tonystarm2003@gmail.com')) {
          targetRecipient = defaultAdminRecipient;
        }

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          signal: createTimeoutSignal(10000),
          body: JSON.stringify({
            from: fromEmail,
            to: [targetRecipient],
            subject: subject,
            html: fullHtml,
          }),
        });

        if (resendRes.ok) {
          dispatched = true;
          console.log(`[CivicLens Mailer] Live email delivered to ${targetRecipient} via Resend Cloud API`);
        }
      } catch (err: any) {
        console.warn('[CivicLens Mailer] Resend dispatch attempt failed:', err?.message);
      }
    }
  }

  if (!dispatched) {
    console.warn(`[CivicLens Mailer] Notice: Saved to offline ledger for ${to}`);
  }

  // Save to local device communication ledger
  try {
    const existingRaw = await AsyncStorage.getItem(EMAIL_STORAGE_KEY);
    const existing: CitizenEmailRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
    existing.unshift(emailRecord);
    if (existing.length > 50) existing.pop();
    await AsyncStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn('[CivicLens Mailer] Error updating email ledger:', err);
  }

  return emailRecord;
}

/**
 * 1. Welcome Email on Signup / Account Creation
 */
export async function sendWelcomeCitizenEmail(user: UserProfile) {
  return sendCitizenEmail({
    to: user.email,
    subject: 'Welcome to CivicLens 2.0 — Verified Citizen Account Ready',
    title: `Welcome, ${user.displayName || 'Scout'}!`,
    bodyHtml: `
      <p>Your CivicLens citizen account has been successfully initialized.</p>
      <div style="background:#EFF6FF;border-radius:12px;padding:16px;margin:16px 0;border:1px solid #BFDBFE;">
        <p style="margin:0;font-weight:700;color:#0066FF;">Citizen ID: ${user.uid}</p>
        <p style="margin:4px 0 0 0;font-size:12px;color:#1E40AF;">Registered email: ${user.email}</p>
      </div>
      <p>You can now capture road hazards with Gemini AI Vision, verify on-site community alerts, and upload photo proof of road repairs.</p>
    `,
    type: 'welcome',
  });
}

/**
 * 2. Login Security Notification
 */
export async function sendCitizenLoginNotification(user: UserProfile) {
  const timeStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return sendCitizenEmail({
    to: user.email,
    subject: 'Security Alert: New Sign-in to CivicLens 2.0',
    title: 'New Citizen Login Detected',
    bodyHtml: `
      <p>Hi ${escapeHtml(user.displayName || 'Citizen')},</p>
      <p>Your CivicLens account was just used to sign in on <strong>${timeStr}</strong>.</p>
      <div style="background:#F8FAFC;border-radius:12px;padding:14px;margin:16px 0;border:1px solid #E2E8F0;">
        <p style="margin:0;font-size:12px;color:#475569;">Device session authenticated securely.</p>
      </div>
      <p style="font-size:12px;color:#64748B;">If this was you, no action is needed.</p>
    `,
    type: 'login',
  });
}

/**
 * 3. Hazard Report Submitted Email
 */
export async function sendHazardReportSubmittedEmail(
  user: UserProfile,
  report: { category: string; locationName: string; priorityScore: number }
) {
  return sendCitizenEmail({
    to: user.email,
    subject: `Report Confirmed: ${report.category.toUpperCase()} at ${report.locationName}`,
    title: 'Road Hazard Successfully Broadcasted',
    bodyHtml: `
      <p>Thank you for scouting and reporting a hazard to keep your neighbors safe.</p>
      <div style="background:#EFF6FF;border-radius:12px;padding:16px;margin:16px 0;border:1px solid #BFDBFE;">
        <p style="margin:0;font-weight:800;color:#1E3A8A;">Category: ${report.category.toUpperCase()}</p>
        <p style="margin:4px 0 0 0;color:#1E40AF;">Location: ${escapeHtml(report.locationName)}</p>
        <p style="margin:4px 0 0 0;color:#1E40AF;">Community Priority: ${report.priorityScore}/100</p>
      </div>
      <p>Nearby citizens within 5km have been alerted to verify and watch this hazard.</p>
    `,
    type: 'report_submitted',
  });
}

/**
 * 4. Milestone Unlocked Email
 */
export async function sendMilestoneUnlockedEmail(user: UserProfile, badgeTitle: string, rewardTitle: string) {
  return sendCitizenEmail({
    to: user.email,
    subject: `Milestone Unlocked: ${badgeTitle} on CivicLens`,
    title: 'Congratulations on Your New Civic Badge!',
    bodyHtml: `
      <p>Hi ${escapeHtml(user.displayName || 'Citizen')},</p>
      <p>You have reached a new milestone in community road defense:</p>
      <div style="background:#ECFDF5;border-radius:12px;padding:16px;margin:16px 0;border:1px solid #A7F3D0;">
        <h3 style="margin:0;color:#065F46;font-size:16px;">🏆 ${escapeHtml(badgeTitle)}</h3>
        <p style="margin:4px 0 0 0;color:#047857;font-size:13px;">Citizen Rank Award: ${escapeHtml(rewardTitle)}</p>
      </div>
      <p>Check your Spotdex and You profile in the app to view your badge.</p>
    `,
    type: 'badge_unlocked',
  });
}

/**
 * Fetch all past sent citizen notification emails
 */
export async function getCitizenEmailLogs(): Promise<CitizenEmailRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(EMAIL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
