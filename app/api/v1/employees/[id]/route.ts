import { NextResponse } from 'next/server';
import { EmployeeService } from '../../../../../services/EmployeeService';
import { handleApiError } from '../../../../../utils/errorHandler';

const employeeService = new EmployeeService();

export async function GET(request: Request, { params }: any) {
  try {
    const { id } = await params;
    const employee = await employeeService.getEmployeeById(id);
    return NextResponse.json({ data: employee });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: any) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await employeeService.updateEmployee(id, body);
    return NextResponse.json({ data: result, message: 'Employee updated successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: any) {
  try {
    const { id } = await params;
    await employeeService.deleteEmployee(id);
    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
