import type { ReactElement } from 'react';

export interface User {
  name: string;
  email: string;
  avatarUrl: string;
  points: number;
  walletBalance: number; // in local currency
  referralCode: string;
  referrals: number;
  bonusEarned: number;
  lastRedemptionDate: string | null; // ISO 8601 date string
  showWelcomeBonus?: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  points: number;
  estimatedTimeMinutes: number;
  category: string;
}

export enum RewardType {
  AMAZON = 'Amazon Gift Card',
  FLIPKART = 'Flipkart Gift Card',
}

export interface Reward {
  id: string;
  name: string;
  type: RewardType;
  pointsRequired: number;
  value: string; // e.g., "₹100" or "$10"
  icon: ReactElement;
}

export interface EarningHistoryItem {
  id: string;
  type: 'earn';
  description: string;
  points: number; // always positive
  date: string; // ISO 8601 date string
}

export interface RedemptionHistoryItem {
  id: string;
  type: 'redeem';
  description: string;
  points: number; // always negative
  date: string; // ISO 8601 date string
}

export type TransactionHistoryItem = EarningHistoryItem | RedemptionHistoryItem;
