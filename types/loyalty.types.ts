
export interface LoyaltyMember {
  id: string;
  customerId: string;
  tierId: string;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  currentPoints: number;
  Customer: any;
  Tier: any;
  joinDate: string;
}
export interface Coupon {
  id: string; code: string; discountType: string; discountValue: number;
}
export interface LoyaltyReward {
  id: string; name: string; type: string; pointsCost: number;
}
