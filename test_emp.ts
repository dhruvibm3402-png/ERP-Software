import { EmployeeService } from './services/EmployeeService';

const svc = new EmployeeService();

async function test() {
    try {
        const res = await svc.createEmployee({
            firstName: 'John',
            lastName: 'Doe',
            name: 'John Doe',
            mobile: '1231231231',
            email: '',
            role: 'SALES',
            gender: 'MALE',
            baseSalary: 15000,
            departmentId: '',
            designationId: '',
            employmentType: 'FULL_TIME',
            salaryType: 'MONTHLY',
            city: '',
            address: ''
        });
        console.log("Success", res);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
