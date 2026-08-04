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
