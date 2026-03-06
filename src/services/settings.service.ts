import { prisma } from "@/lib/prisma";

const KEY_NOTIFICATION_RADIUS_KM = "notification_radius_km";
const DEFAULT_NOTIFICATION_RADIUS_KM = 30;

export class SettingsService {
  static async getNotificationRadiusKm(): Promise<number> {
    const row = await prisma.appSetting.findUnique({
      where: { key: KEY_NOTIFICATION_RADIUS_KM },
    });
    if (!row?.value) return DEFAULT_NOTIFICATION_RADIUS_KM;
    const num = Number(row.value);
    return Number.isFinite(num) && num > 0 ? num : DEFAULT_NOTIFICATION_RADIUS_KM;
  }

  static async setNotificationRadiusKm(km: number): Promise<number> {
    const value = Math.max(1, Math.min(500, Math.round(km)));
    await prisma.appSetting.upsert({
      where: { key: KEY_NOTIFICATION_RADIUS_KM },
      create: { key: KEY_NOTIFICATION_RADIUS_KM, value: String(value) },
      update: { value: String(value) },
    });
    return value;
  }

  static async getPublicSettings(): Promise<{ notificationRadiusKm: number }> {
    const notificationRadiusKm = await this.getNotificationRadiusKm();
    return { notificationRadiusKm };
  }
}
