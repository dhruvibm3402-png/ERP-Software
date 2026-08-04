export interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    isActive: boolean;
    currency: string;
    timezone: string;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    priceMonthly: number;
    priceYearly: number;
}
