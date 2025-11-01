import React from 'react';
import { User, Survey, Reward, RewardType, TransactionHistoryItem } from './types';
import { FlipkartIcon, AmazonIcon } from './constants';

// --- SIMULATED DATABASE --- //
let DB_USER: User = {
  name: 'Alex Doe',
  email: 'test@example.com',
  avatarUrl: 'https://picsum.photos/100',
  points: 8500,
  walletBalance: 850, // Corrected: 8500 points / 10 = ₹850
  referralCode: 'ALEXD2024',
  referrals: 5,
  bonusEarned: 500, // 5 referrals * 100 points/referral
  lastRedemptionDate: '2024-05-25T11:05:00.000Z',
};

let DB_SURVEYS: Survey[] = [
    { id: 's1', title: 'Daily Habits Survey', description: 'A quick survey about your daily routines and lifestyle choices.', points: 150, estimatedTimeMinutes: 5, category: 'Lifestyle' },
    { id: 's2', title: 'Tech Gadgets Usage', description: 'Share your opinions on the latest technology and gadgets you use.', points: 300, estimatedTimeMinutes: 10, category: 'Technology' },
    { id: 's3', title: 'Shopping Preferences', description: 'Help retailers understand your shopping habits, both online and in-store.', points: 250, estimatedTimeMinutes: 8, category: 'Consumer' },
    { id: 's4', title: 'Future of Remote Work', description: 'Give your insights on the evolving landscape of remote and hybrid work.', points: 400, estimatedTimeMinutes: 15, category: 'Work' },
    { id: 's5', title: 'Favorite Streaming Services', description: 'A survey about which streaming platforms you use and why.', points: 200, estimatedTimeMinutes: 7, category: 'Entertainment' },
];

let DB_REWARDS: Reward[] = [
    { id: 'r2', name: '₹250 Amazon Gift Card', type: RewardType.AMAZON, pointsRequired: 2500, value: '₹250', icon: React.createElement(AmazonIcon) },
    { id: 'r5', name: '₹250 Flipkart Gift Card', type: RewardType.FLIPKART, pointsRequired: 2500, value: '₹250', icon: React.createElement(FlipkartIcon) },
    { id: 'r4', name: '₹500 Amazon Gift Card', type: RewardType.AMAZON, pointsRequired: 5000, value: '₹500', icon: React.createElement(AmazonIcon) },
    { id: 'r6', name: '₹500 Flipkart Gift Card', type: RewardType.FLIPKART, pointsRequired: 5000, value: '₹500', icon: React.createElement(FlipkartIcon) },
];

let DB_HISTORY: TransactionHistoryItem[] = [
    { id: 'h1', type: 'earn', description: 'Completed \'Daily Habits Survey\'', points: 150, date: '2024-05-28T10:00:00.000Z' },
    { id: 'h2', type: 'earn', description: 'Referral Bonus: Jane Smith signed up', points: 100, date: '2024-05-27T15:20:00.000Z' },
    { id: 'h3', type: 'redeem', description: 'Redeemed \'₹250 Flipkart Gift Card\'', points: -2500, date: '2024-05-25T11:05:00.000Z' },
    { id: 'h4', type: 'earn', description: 'Completed \'Future of Remote Work\' survey', points: 400, date: '2024-05-24T09:00:00.000Z' },
    { id: 'h5', type: 'earn', description: 'Completed \'Shopping Preferences\' survey', points: 250, date: '2024-05-22T18:30:00.000Z' },
];


// In a real app, the token would be stored in localStorage or an HttpOnly cookie
let FAKE_AUTH_TOKEN: string | null = null;
const OTP_CODE = '123456';
const COOLDOWN_DAYS = 7;

// This flag is not persistent. It resets on page load, allowing the feature to be tested.
let hasShownWelcomeBonusThisSession = false;

const simulateNetworkDelay = (delay = 1000) => new Promise(res => setTimeout(res, delay));

const isUnderCooldown = (): boolean => {
    if (!DB_USER.lastRedemptionDate) return false;
    const lastRedemption = new Date(DB_USER.lastRedemptionDate);
    const cooldownEndDate = new Date(lastRedemption);
    cooldownEndDate.setDate(lastRedemption.getDate() + COOLDOWN_DAYS);
    return new Date() < cooldownEndDate;
}

// --- API FUNCTIONS --- //
export const api = {
    async login(email: string, pass: string): Promise<User> {
        await simulateNetworkDelay();
        if (email === 'test@example.com' && pass === 'password') {
            FAKE_AUTH_TOKEN = 'super-secret-token';
            
            // For demonstration, show the welcome bonus on the first login of a session.
            if (!hasShownWelcomeBonusThisSession) {
                const welcomeBonusPoints = 500; // 50 Rs * 10 points/Rs
                DB_USER.points += welcomeBonusPoints;
                DB_USER.walletBalance = DB_USER.points / 10; // Sync balance
                DB_USER.showWelcomeBonus = true; // Add flag for UI
                hasShownWelcomeBonusThisSession = true; // Set flag to prevent re-showing
            } else {
                DB_USER.showWelcomeBonus = false;
            }

            return { ...DB_USER };
        }
        throw new Error('Invalid credentials');
    },

    async register(name: string, email: string, pass: string): Promise<{ success: boolean }> {
        await simulateNetworkDelay(1500);
        console.log(`Registered new user: ${name}, ${email}`);
        // In this simulation, registering successfully will allow the test user
        // to see the welcome bonus on their next login.
        hasShownWelcomeBonusThisSession = false;
        return { success: true };
    },

    async logout(): Promise<void> {
        FAKE_AUTH_TOKEN = null;
    },
    
    async getAuthenticatedUser(): Promise<User> {
        await simulateNetworkDelay(200);
        if (FAKE_AUTH_TOKEN) {
            return { ...DB_USER };
        }
        throw new Error('Not authenticated');
    },

    async getSurveys(): Promise<Survey[]> {
        await simulateNetworkDelay();
        if (!FAKE_AUTH_TOKEN) throw new Error("Unauthorized");
        return [...DB_SURVEYS];
    },
    
    async getRewards(): Promise<Reward[]> {
        await simulateNetworkDelay();
        if (!FAKE_AUTH_TOKEN) throw new Error("Unauthorized");
        return [...DB_REWARDS];
    },

    async getHistory(): Promise<TransactionHistoryItem[]> {
        await simulateNetworkDelay(700);
        if (!FAKE_AUTH_TOKEN) throw new Error("Unauthorized");
        return [...DB_HISTORY];
    },

    async startSurvey(surveyId: string): Promise<User> {
        await simulateNetworkDelay(500);
        if (!FAKE_AUTH_TOKEN) throw new Error("Unauthorized");
        
        const survey = DB_SURVEYS.find(s => s.id === surveyId);
        if (!survey) throw new Error("Survey not found");

        DB_USER.points += survey.points;
        DB_USER.walletBalance = DB_USER.points / 10; // Sync balance
        DB_SURVEYS = DB_SURVEYS.filter(s => s.id !== surveyId);
        
        DB_HISTORY.unshift({
            id: `h-${Date.now()}`,
            type: 'earn',
            description: `Completed '${survey.title}' survey`,
            points: survey.points,
            date: new Date().toISOString()
        });
        
        return { ...DB_USER };
    },

    async requestRedemption(rewardId: string): Promise<{ success: boolean }> {
        await simulateNetworkDelay(800);
        if (!FAKE_AUTH_TOKEN) throw new Error("Unauthorized");

        if (isUnderCooldown()) {
            throw new Error(`You are on a cooldown. Please wait.`);
        }
        const reward = DB_REWARDS.find(r => r.id === rewardId);
        if (!reward) throw new Error("Reward not found");
        if (DB_USER.points < reward.pointsRequired) throw new Error("Not enough points");

        console.log(`OTP sent for reward ${reward.name}. Code is ${OTP_CODE}`);
        return { success: true };
    },

    async completeRedemption(rewardId: string, otp: string): Promise<User> {
        await simulateNetworkDelay(1200);
        if (!FAKE_AUTH_TOKEN) throw new Error("Unauthorized");
        if (otp !== OTP_CODE) throw new Error("Invalid OTP code.");

        const reward = DB_REWARDS.find(r => r.id === rewardId);
        if (!reward) throw new Error("Reward not found");
        if (DB_USER.points < reward.pointsRequired) throw new Error("Not enough points");

        DB_USER.points -= reward.pointsRequired;
        DB_USER.walletBalance = DB_USER.points / 10; // Sync balance
        DB_USER.lastRedemptionDate = new Date().toISOString();
        
        DB_HISTORY.unshift({
            id: `h-${Date.now()}`,
            type: 'redeem',
            description: `Redeemed '${reward.name}'`,
            points: -reward.pointsRequired,
            date: new Date().toISOString()
        });

        return { ...DB_USER };
    },

    async updateProfile(profileData: Partial<User>): Promise<User> {
        await simulateNetworkDelay();
        if (!FAKE_AUTH_TOKEN) throw new Error("Unauthorized");

        DB_USER = { ...DB_USER, ...profileData };
        return { ...DB_USER };
    }
};