const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
    const fullPath = path.join(__dirname, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
};

const repositoryContent = `
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class EmployeeRepository {
  async findAll({ skip, take, where, orderBy }: { skip?: number; take?: number; where?: Prisma.EmployeeWhereInput; orderBy?: Prisma.EmployeeOrderByWithRelationInput }) {
    return prisma.employee.findMany({
      skip, take, where, orderBy,
      include: {
        EmployeeExt: { include: { Department: true, Designation: true } },
      }
    });
  }
  async count(where?: Prisma.EmployeeWhereInput) {
    return prisma.employee.count({ where });
  }
  async findById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        EmployeeExt: { include: { Department: true, Designation: true } },
        EmployeeSalary: { orderBy: { effectiveFrom: 'desc' }, take: 1 },
        EmployeeDocument: true
      }
    });
  }
  async create(data: Prisma.EmployeeCreateInput) {
    return prisma.employee.create({
      data,
      include: { EmployeeExt: true, EmployeeSalary: true }
    });
  }
  async update(id: string, data: Prisma.EmployeeUpdateInput) {
    return prisma.employee.update({
      where: { id },
      data,
      include: { EmployeeExt: true, EmployeeSalary: true }
    });
  }
  async softDelete(id: string) {
    return prisma.employee.update({
      where: { id },
      data: { isActive: false, EmployeeExt: { update: { deletedAt: new Date() } } }
    });
  }
}
`;

const serviceContent = `
import { EmployeeRepository } from '../repositories/EmployeeRepository';
import { AppError } from '../utils/errorHandler'; // fallback if needed

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
      email: payload.email,
      role: payload.role,
      baseSalary: payload.baseSalary,
      EmployeeExt: {
        create: {
          firstName: payload.firstName || payload.name,
          lastName: payload.lastName || '',
          gender: payload.gender,
          employmentType: payload.employmentType || 'FULL_TIME',
          salaryType: payload.salaryType || 'MONTHLY',
          Department: payload.departmentId ? { connect: { id: payload.departmentId } } : undefined,
          Designation: payload.designationId ? { connect: { id: payload.designationId } } : undefined,
          city: payload.city,
          address: payload.address,
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
          departmentId: payload.departmentId,
          designationId: payload.designationId,
        }
      }
    };
    return employeeRepo.update(id, data);
  }
  
  async deleteEmployee(id: string) {
    return employeeRepo.softDelete(id);
  }
}
`;

const routeGetContent = `
import { NextResponse } from 'next/server';
import { EmployeeService } from '../../../../services/EmployeeService';
import { handleApiError } from '../../../../utils/errorHandler';

const employeeService = new EmployeeService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const departmentId = searchParams.get('departmentId') || undefined;

    const result = await employeeService.getEmployees({ page, limit, search, departmentId });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await employeeService.createEmployee(body);
    return NextResponse.json({ data: result, message: 'Employee created successfully' }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
`;

const routeIdContent = `
import { NextResponse } from 'next/server';
import { EmployeeService } from '../../../../../services/EmployeeService';
import { handleApiError } from '../../../../../utils/errorHandler';

const employeeService = new EmployeeService();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const employee = await employeeService.getEmployeeById(id);
    return NextResponse.json({ data: employee });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await employeeService.updateEmployee(id, body);
    return NextResponse.json({ data: result, message: 'Employee updated successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    await employeeService.deleteEmployee(id);
    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
`;

write('repositories/EmployeeRepository.ts', repositoryContent);
write('services/EmployeeService.ts', serviceContent);
write('app/api/v1/employees/route.ts', routeGetContent);
write('app/api/v1/employees/[id]/route.ts', routeIdContent);

console.log('Backend scaffolding done.');
