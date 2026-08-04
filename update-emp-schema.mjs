import fs from 'fs';

let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

// Function to replace a model block entirely
function replaceModel(modelName, newModelStr) {
    const regex = new RegExp(`model ${modelName} \\{[\\s\\S]*?\\n\\}`, 'g');
    if (regex.test(schema)) {
        schema = schema.replace(regex, newModelStr);
    } else {
        schema += `\n\n${newModelStr}`;
    }
}

// 1. Employee
const employeeModel = `model Employee {
  id                     String                @id @default(uuid())
  employeeCode           String                @unique
  firstName              String?
  lastName               String?
  fullName               String
  gender                 String?
  dateOfBirth            DateTime?
  joiningDate            DateTime?
  email                  String?               @unique
  mobile                 String?
  alternateMobile        String?
  profileImage           String?
  aadhaarNumber          String?
  panNumber              String?
  address                String?
  city                   String?
  state                  String?
  country                String?
  pincode                String?
  departmentId           String?
  designationId          String?
  branchId               String?
  roleId                 String?
  managerId              String?
  salary                 Float                 @default(0)
  salaryType             String?
  employmentType         String?
  status                 String                @default("ACTIVE")
  emergencyContactName   String?
  emergencyContactNumber String?
  bloodGroup             String?
  bankName               String?
  accountNumber          String?
  ifscCode               String?
  upiId                  String?
  notes                  String?
  createdBy              String?
  updatedBy              String?
  createdAt              DateTime              @default(now())
  updatedAt              DateTime              @updatedAt
  deletedAt              DateTime?

  // Existing relations to keep compatibility
  employeeId             String?               @unique // retained for old code
  name                   String? // retained for old code
  role                   String? // retained for old code
  department             String? // retained for old code
  isActive               Boolean               @default(true) // retained
  joinDate               DateTime              @default(now()) // retained
  baseSalary             Float                 @default(0) // retained
  biometricId            String?               @unique // retained

  Attendance             Attendance[]
  Leave                  Leave[]
  Payroll                Payroll[]
  PerformanceReview      PerformanceReview[]
  RepairJob              RepairJob[]
  CustomOrderEmployee    CustomOrderEmployee[]
  
  DepartmentRef          Department?           @relation(fields: [departmentId], references: [id])
  DesignationRef         Designation?          @relation(fields: [designationId], references: [id])
  SalaryRecords          Salary[]
  Documents              EmployeeDocument[]
}`;

// 2. Department
const departmentModel = `model Department {
  id          String     @id @default(uuid())
  name        String
  description String?
  status      String     @default("ACTIVE")
  
  Employees   Employee[]
  Designations Designation[]
}`;

// 3. Designation
const designationModel = `model Designation {
  id           String     @id @default(uuid())
  departmentId String
  name         String
  description  String?
  
  Department   Department @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  Employees    Employee[]
}`;

// 4. Attendance
const attendanceModel = `model Attendance {
  id            String    @id @default(uuid())
  employeeId    String
  date          DateTime
  checkIn       DateTime?
  checkOut      DateTime?
  workingHours  Float?
  overtimeHours Float?
  lateMinutes   Int?
  status        String    @default("PRESENT")
  remarks       String?
  
  // Retained
  punchIn       DateTime?
  punchOut      DateTime?
  deviceId      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  Employee      Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@unique([employeeId, date])
}`;

// 5. Leave
const leaveModel = `model Leave {
  id             String    @id @default(uuid())
  employeeId     String
  leaveType      String
  startDate      DateTime
  endDate        DateTime
  days           Float
  reason         String?
  approvalStatus String    @default("PENDING")
  approvedBy     String?
  approvedAt     DateTime?
  
  // Retained
  type           String?
  status         String    @default("PENDING")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  Employee       Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
}`;

// 6. Salary
const salaryModel = `model Salary {
  id            String    @id @default(uuid())
  employeeId    String
  basicSalary   Float
  allowance     Float     @default(0)
  deduction     Float     @default(0)
  bonus         Float     @default(0)
  netSalary     Float
  paymentStatus String    @default("PENDING")
  paymentDate   DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  Employee      Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
}`;

// 7. Documents
const employeeDocumentModel = `model EmployeeDocument {
  id           String   @id @default(uuid())
  employeeId   String
  documentName String
  documentType String
  documentUrl  String
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  Employee     Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
}`;

replaceModel('Employee', employeeModel);
replaceModel('Department', departmentModel);
replaceModel('Designation', designationModel);
replaceModel('Attendance', attendanceModel);
replaceModel('Leave', leaveModel);
replaceModel('Salary', salaryModel);
replaceModel('EmployeeDocument', employeeDocumentModel);

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Successfully updated schema!');
