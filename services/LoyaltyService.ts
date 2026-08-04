
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
