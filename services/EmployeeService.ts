import { EmployeeRepository } from '../repositories/EmployeeRepository';


const employeeRepo = new EmployeeRepository();

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
}

export class EmployeeService {
  async getEmployees(params: QueryParams) {
    const page = Number(params.page || 1);
    const limit = Number(params.limit || 10);
    const search = params.search || '';

    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } }
      ];
    }
    if (params.departmentId) {
      where.EmployeeExt = { departmentId: params.departmentId };
    }

    const [data, total] = await Promise.all([
      employeeRepo.findAll({
        skip: (page - 1) * limit,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' }
      }),
      employeeRepo.count(where)
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async getEmployeeById(id: string) {
    const employee = await employeeRepo.findById(id);
    if (!employee) throw new Error("Employee not found");
    return employee;
  }

  async createEmployee(payload: any) {
    // Generate EMP-code
    const empCode = 'EMP-' + Math.floor(1000 + Math.random() * 9000);

    return employeeRepo.create({
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
    });
  }

  async updateEmployee(id: string, payload: any) {
    const data: any = {
      name: payload.name,
      mobile: payload.mobile,
      email: payload.email,
      role: payload.role,
      baseSalary: payload.baseSalary,
      EmployeeExt: {
        update: {
          firstName: payload.firstName,
          lastName: payload.lastName,
          gender: payload.gender,
          employmentType: payload.employmentType,
          salaryType: payload.salaryType,
          departmentId: payload.departmentId || null,
          designationId: payload.designationId || null,
        }
      }
    };
    return employeeRepo.update(id, data);
  }

  async deleteEmployee(id: string) {
    return employeeRepo.softDelete(id);
  }
}
