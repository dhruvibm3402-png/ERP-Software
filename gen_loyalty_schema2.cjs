const fs = require('fs');
let s = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Strip out appended models if they exist
const idx = s.indexOf('model LoyaltyProgram {');
if (idx !== -1) {
    s = s.substring(0, idx - 1);
}

// Remove newly added fields from Customer if they exist
s = s.replace(/  LoyaltyMember.+\n/g, '');
s = s.replace(/  CustomerWallet.+\n/g, '');
s = s.replace(/  RewardRedemption.+\n/g, '');
s = s.replace(/  Coupon.+\n/g, '');
s = s.replace(/  ReferralsMade.+\n/g, '');

const modelsToAdd = `
model LoyaltyProgram {
  id                    String   @id @default(cuid())
  name                  String
  isActive              Boolean  @default(true)
  pointValue            Float    @default(1.0)
  minSpendForPoints     Float    @default(0)
  pointsExpiryDays      Int      @default(365)
  branchId              String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  createdBy             String?
  updatedBy             String?
}

model LoyaltyTier {
  id                    String   @id @default(cuid())
  name                  String   @unique
  minSpending           Float
  minPoints             Int
  rewardMultiplier      Float    @default(1.0)
  birthdayBonus         Int      @default(0)
  anniversaryBonus      Int      @default(0)
  exclusiveDiscountPct  Float    @default(0.0)
  isActive              Boolean  @default(true)
  branchId              String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  LoyaltyMember         LoyaltyMember[]
}

model LoyaltyMember {
  id                    String   @id @default(cuid())
  customerId            String   @unique
  tierId                String?
  totalPointsEarned     Int      @default(0)
  totalPointsRedeemed   Int      @default(0)
  currentPoints         Int      @default(0)
  joinDate              DateTime @default(now())
  isActive              Boolean  @default(true)
  branchId              String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  Customer              Customer @relation("CustomerLoyaltyMember", fields: [customerId], references: [id], onDelete: Cascade)
  Tier                  LoyaltyTier? @relation(fields: [tierId], references: [id])
}

model LoyaltyReward {
  id                    String   @id @default(cuid())
  name                  String
  description           String?
  type                  String   // VOUCHER, DISCOUNT, FREE_GIFT
  pointsCost            Int
  discountPct           Float?
  flatDiscount          Float?
  isActive              Boolean  @default(true)
  branchId              String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  RewardRedemption      RewardRedemption[]
}

model RewardRedemption {
  id                    String   @id @default(cuid())
  customerId            String
  rewardId              String
  pointsUsed            Int
  status                String   @default("REDEEMED") // REDEEMED, CANCELLED
  branchId              String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  Customer              Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  Reward                LoyaltyReward @relation(fields: [rewardId], references: [id])
}

model Coupon {
  id                    String   @id @default(cuid())
  code                  String   @unique
  discountType          String   // FLAT, PERCENTAGE
  discountValue         Float
  minSpend              Float?
  maxDiscount           Float?
  usageLimit            Int?
  usageCount            Int      @default(0)
  startDate             DateTime?
  expiryDate            DateTime?
  isActive              Boolean  @default(true)
  branchId              String?
  customerId            String?  // If it's a specific customer coupon
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  Customer              Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
}

model Referral {
  id                    String   @id @default(cuid())
  referrerId            String
  referredEmail         String?
  referredPhone         String?
  referralCode          String   @unique
  status                String   @default("PENDING") // PENDING, SUCCESSFUL
  rewardPoints          Int      @default(0)
  branchId              String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  Referrer              Customer @relation("ReferrerLinks", fields: [referrerId], references: [id], onDelete: Cascade)
}

model CustomerWallet {
  id                    String   @id @default(cuid())
  customerId            String   @unique
  balance               Float    @default(0)
  isActive              Boolean  @default(true)
  branchId              String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  Customer              Customer @relation("CustomerWallet", fields: [customerId], references: [id], onDelete: Cascade)
  WalletTransaction     WalletTransaction[]
}

model WalletTransaction {
  id                    String   @id @default(cuid())
  walletId              String
  type                  String   // CREDIT, DEBIT
  amount                Float
  referenceId           String?
  description           String?
  createdAt             DateTime @default(now())
  Wallet                CustomerWallet @relation(fields: [walletId], references: [id], onDelete: Cascade)
}
`;

const customerClosing = s.indexOf('}', s.indexOf('model Customer {'));
if (customerClosing > -1) {
    let newSchema = s.slice(0, customerClosing);
    newSchema += `  LoyaltyMember      LoyaltyMember? @relation("CustomerLoyaltyMember")\n`;
    newSchema += `  CustomerWallet     CustomerWallet? @relation("CustomerWallet")\n`;
    newSchema += `  RewardRedemption   RewardRedemption[]\n`;
    newSchema += `  Coupon             Coupon[]\n`;
    newSchema += `  ReferralsMade      Referral[] @relation("ReferrerLinks")\n`;
    newSchema += s.slice(customerClosing);
    fs.writeFileSync('prisma/schema.prisma', newSchema + '\n' + modelsToAdd);
}
