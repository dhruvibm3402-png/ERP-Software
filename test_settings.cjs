const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const category = "COMPANY";
        const data = {
            name: "abs",
            address: "Rajkot, Gujarat",
            email: "abc123@gmail.com",
            phone: "9127638976",
            gst: "123AVH234562",
            pan: "12345678910",
            currency: "INR",
            financialYear: "Apr-Mar"
        };
        const tenantId = null;

        const operations = Object.entries(data).map(([key, value]) => {
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            return prisma.systemSetting.upsert({
                where: { key },
                update: { value: stringValue, category },
                create: { key, value: stringValue, category },
            });
        });

        await prisma.$transaction(operations);
        console.log("SUCCESS!");
    } catch (e) {
        console.error(e);
    }
}
test();
