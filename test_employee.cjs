const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const payload = {
            firstName: "Johan",
            lastName: "Doe",
            mobile: "9988776655",
            email: "",
            role: "SALES",
            gender: "MALE",
            baseSalary: 15000,
            departmentId: "",
            designationId: "",
            employmentType: "FULL_TIME",
            salaryType: "MONTHLY",
            city: "",
            address: "",
            name: "Johan Doe"
        };
        const empCode = 'EMP-' + Math.floor(1000 + Math.random() * 9000);

        const res = await prisma.employee.create({
            data: {
                employeeId: empCode,
                name: payload.name,
                mobile: payload.mobile,
                email: payload.email || null,
                role: payload.role || 'SALES',
                baseSalary: payload.baseSalary || 0,
                EmployeeExt: {
                    create: {
                        firstName: payload.firstName || payload.name || '',
                        lastName: payload.lastName || '',
                        gender: payload.gender || 'MALE',
                        employmentType: payload.employmentType || 'FULL_TIME',
                        salaryType: payload.salaryType || 'MONTHLY',
                        Department: payload.departmentId ? { connect: { id: payload.departmentId } } : undefined,
                        Designation: payload.designationId ? { connect: { id: payload.designationId } } : undefined,
                        city: payload.city || '',
                        address: payload.address || '',
                    }
                },
                EmployeeSalary: payload.baseSalary ? {
                    create: {
                        effectiveFrom: new Date(),
                        basicSalary: payload.baseSalary,
                        grossSalary: payload.baseSalary,
                        netSalary: payload.baseSalary,
                    }
                } : undefined
            },
            include: { EmployeeExt: true, EmployeeSalary: true }
        });
        console.log("SUCCESS:", res);
    } catch (e) {
        console.log("ERROR IS:");
        console.error(e);
    }
}
test();
