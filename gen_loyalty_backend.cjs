const fs = require('fs');
const path = require('path');

const folders = [
    'app/api/v1/loyalty/program',
    'app/api/v1/loyalty/tiers',
    'app/api/v1/loyalty/members',
    'app/api/v1/loyalty/rewards',
    'app/api/v1/loyalty/redemptions',
    'app/api/v1/loyalty/coupons',
    'app/api/v1/loyalty/referrals',
    'app/api/v1/loyalty/wallet',
    'repositories',
    'services',
    'app/dashboard/loyalty',
    'app/dashboard/loyalty/members',
    'app/dashboard/loyalty/rewards',
    'app/dashboard/loyalty/coupons',
    'app/dashboard/loyalty/wallet'
];

folders.forEach(f => {
    const dir = path.join(__dirname, f);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Create basic backend template generator
const createApiWrapper = (modelName) => `
import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';

export async function GET(req: Request) {
    try {
        const data = await prisma.${modelName}.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json({ data });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = await prisma.${modelName}.create({ data: body });
        return NextResponse.json({ data, message: 'Created successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
`;

const routes = [
    { p: 'app/api/v1/loyalty/program/route.ts', m: 'loyaltyProgram' },
    { p: 'app/api/v1/loyalty/tiers/route.ts', m: 'loyaltyTier' },
    { p: 'app/api/v1/loyalty/members/route.ts', m: 'loyaltyMember' },
    { p: 'app/api/v1/loyalty/rewards/route.ts', m: 'loyaltyReward' },
    { p: 'app/api/v1/loyalty/redemptions/route.ts', m: 'rewardRedemption' },
    { p: 'app/api/v1/loyalty/coupons/route.ts', m: 'coupon' },
    { p: 'app/api/v1/loyalty/referrals/route.ts', m: 'referral' },
    { p: 'app/api/v1/loyalty/wallet/route.ts', m: 'customerWallet' }
];

routes.forEach(r => fs.writeFileSync(r.p, createApiWrapper(r.m)));

// Service layer
fs.writeFileSync('services/LoyaltyService.ts', `
import prisma from '../lib/prisma';

export class LoyaltyService {
    async addPointsToCustomer(customerId: string, points: number, description: string) {
        // Find member
        let member = await prisma.loyaltyMember.findUnique({ where: { customerId } });
        if(!member) {
            member = await prisma.loyaltyMember.create({ data: { customerId, currentPoints: points, totalPointsEarned: points } });
        } else {
            member = await prisma.loyaltyMember.update({ 
                where: { customerId }, 
                data: { 
                    currentPoints: { increment: points },
                    totalPointsEarned: { increment: points }
                } 
            });
        }

        // Record Transaction
        await prisma.loyaltyTransaction.create({
            data: {
                customerId,
                points,
                type: 'EARN',
                description
            }
        });

        return member;
    }

    async redeemPoints(customerId: string, points: number, description: string) {
         const member = await prisma.loyaltyMember.findUnique({ where: { customerId } });
         if(!member || member.currentPoints < points) throw new Error("Insufficient points");
         
         const updated = await prisma.loyaltyMember.update({
            where: { customerId },
            data: {
                currentPoints: { decrement: points },
                totalPointsRedeemed: { increment: points }
            }
         });

         await prisma.loyaltyTransaction.create({
            data: { customerId, points, type: 'REDEEM', description }
         });

         return updated;
    }
}
export const loyaltyService = new LoyaltyService();
`);
