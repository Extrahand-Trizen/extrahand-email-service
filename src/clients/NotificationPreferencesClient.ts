import axios, { AxiosInstance } from 'axios';
import logger from '../config/logger';

export type NotificationCategory =
    | 'taskUpdates'
    | 'payments'
    | 'promotions'
    | 'reminders'
    | 'system'
    | 'marketing'
    | 'transactional'
    | 'taskReminders'
    | 'keywordTaskAlerts'
    | 'recommendedTaskAlerts';
/**
 * Client for checking user notification preferences from user-service
 * This should be called before sending any email to respect user preferences
 */
export class NotificationPreferencesClient {
    private static client: AxiosInstance;
    private static userServiceUrl: string;

    /**
     * Initialize the client with user service URL
     */
    static initialize() {
        this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:4001';
        const serviceAuthToken = process.env.SERVICE_AUTH_TOKEN || '';

        this.client = axios.create({
            baseURL: this.userServiceUrl,
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json',
                ...(serviceAuthToken ? { 'X-Service-Auth': serviceAuthToken, 'X-Service-Name': 'email-service' } : {}),
            },
        });

        logger.info('NotificationPreferencesClient initialized', {
            userServiceUrl: this.userServiceUrl,
            hasAuthToken: !!serviceAuthToken,
        });
    }

    /**
     * Check if an email notification can be sent to a user for a specific category
     * 
     * @param uid - User ID
     * @param category - Notification category (taskUpdates, payments, etc.)
     * @returns Promise<boolean> - true if email can be sent, false otherwise
     */
    static async canSendEmail(uid: string, category: NotificationCategory): Promise<boolean> {
        if (!this.client) {
            this.initialize();
        }

        try {
            const response = await this.client.get(
                `/api/v1/notification-preferences/${uid}/can-send`,
                {
                    params: {
                        channel: 'email',
                        category,
                    },
                }
            );

            const canSend = response.data?.data?.canSend;

            if (canSend === false) {
                logger.info('Email blocked: user preference is OFF', { uid, category });
                return false;
            }

            if (canSend === true) {
                logger.info('Checked email notification permission', { uid, category, canSend });
                return true;
            }

            logger.warn('Email preference response was unexpected; defaulting to blocked', {
                uid,
                category,
                received: canSend,
            });
            return false;

        } catch (error: any) {
            // Fail-open on network errors: the task-service already pre-checked preferences.
            // Missing USER_SERVICE_URL or a timeout should not block all emails.
            logger.warn('Could not reach user-service for preference check — allowing email (fail-open)', {
                uid,
                category,
                error: error.message,
            });
            return true;
        }
    }

    /**
     * Check if emails can be sent to multiple users for a specific category
     * Returns a map of uid -> canSend
     */
    static async canSendEmailBatch(
        uids: string[],
        category: NotificationCategory
    ): Promise<Map<string, boolean>> {
        if (!this.client) {
            this.initialize();
        }

        const results = new Map<string, boolean>();

        try {
            const response = await this.client.post(
                `/api/v1/notification-preferences/can-send-batch`,
                {
                    uids,
                    channel: 'email',
                    category,
                }
            );

            const batchResults = response.data?.data?.results ?? {};

            // Populate results map
            uids.forEach((uid) => {
                results.set(uid, batchResults[uid] ?? true); // Default to true if not in response
            });

            logger.info('Checked batch email notification permissions', {
                totalUsers: uids.length,
                category,
                allowedCount: Array.from(results.values()).filter((v) => v).length,
            });

            return results;
        } catch (error: any) {
            // Fail-open on network errors: allow emails when user-service is unreachable
            logger.warn('Could not reach user-service for batch preference check — allowing all (fail-open)', {
                totalUsers: uids.length,
                category,
                error: error.message,
            });

            // fail-open: allow all emails if preference check fails
            uids.forEach((uid) => results.set(uid, true));
            return results;
        }
    }

    /**
     * Filter a list of user IDs to only those who can receive emails for a category
     */
    static async filterUsersForEmail(
        uids: string[],
        category: NotificationCategory
    ): Promise<string[]> {
        const results = await this.canSendEmailBatch(uids, category);
        return uids.filter((uid) => results.get(uid) === true);
    }
}

export default NotificationPreferencesClient;
