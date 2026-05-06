export type PropertyType = "Dorm" | "Condo" | "Apartment" | "Airbnb" | "House";
export type OccupancyStatus = "Occupied" | "Vacant" | "Maintenance";
export type PaymentStatus = "Paid" | "Due Soon" | "Overdue";
export type InvoiceStatus = "Draft" | "Sent" | "Paid";
export type UnitSize = "Small" | "Medium" | "Big";

export interface RentalUnit {
  id: string;
  label: string;
  occupantsCount: number;
  size: UnitSize;
  monthlyRent: number;
  status: OccupancyStatus;
}

export interface RentalProperty {
  id: string;
  name: string;
  type: PropertyType;
  address: string;
  image: string;
  imagePath?: string;
  statusTag: "Pre-selling" | "RFO" | "Under Construction";
  units: RentalUnit[];
  notes?: string;
}

export interface Tenant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  propertyId: string;
  unitLabel: string;
  leaseStart: string;
  leaseEnd: string;
  dueDate: number;
  paymentStatus: PaymentStatus;
  contractFileName: string;
}

export interface Reminder {
  id: string;
  tenantId: string;
  subject: string;
  message: string;
  scheduledAt: string;
  sentAt?: string;
  status: "Scheduled" | "Sent";
}

export interface Invoice {
  id: string;
  tenantId: string;
  propertyId: string;
  billingPeriod: string;
  periodStart?: string;
  periodEnd?: string;
  baseRent?: number;
  utilitiesTotal?: number;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
}

export interface UtilityBillingCycle {
  id: string;
  propertyId: string;
  unitLabel: string;
  billingPeriod: string;
  periodStart?: string;
  periodEnd?: string;
  previousReading: number;
  currentReading: number;
  electricityRate: number;
  waterRate: number;
  additionalFees: number;
  createdAt: string;
}

export const formatPhp = (amount: number): string =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export const mockRentalProperties: RentalProperty[] = [
  {
    id: "prop-1",
    name: "Sunrise Dormitory",
    type: "Dorm",
    address: "Matina, Davao City",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=900&fit=crop",
    statusTag: "RFO",
    units: [
      { id: "u-1", label: "Room 101", occupantsCount: 2, size: "Small", monthlyRent: 5800, status: "Occupied" },
      { id: "u-2", label: "Room 203", occupantsCount: 3, size: "Medium", monthlyRent: 6500, status: "Occupied" },
      { id: "u-3", label: "Room 305", occupantsCount: 4, size: "Big", monthlyRent: 7200, status: "Vacant" },
    ],
    notes: "Near universities",
  },
  {
    id: "prop-2",
    name: "BGC One Bedroom Cluster",
    type: "Condo",
    address: "BGC, Taguig",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=900&fit=crop",
    statusTag: "Under Construction",
    units: [
      { id: "u-4", label: "Unit 5A", occupantsCount: 2, size: "Small", monthlyRent: 26000, status: "Occupied" },
      { id: "u-5", label: "Unit 7B", occupantsCount: 3, size: "Medium", monthlyRent: 28000, status: "Occupied" },
      { id: "u-6", label: "Unit 10C", occupantsCount: 5, size: "Big", monthlyRent: 35000, status: "Vacant" },
    ],
  },
  {
    id: "prop-3",
    name: "Cebu Midtown Apartments",
    type: "Apartment",
    address: "Lahug, Cebu City",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=900&fit=crop",
    statusTag: "Pre-selling",
    units: [
      { id: "u-7", label: "Unit 1A", occupantsCount: 2, size: "Small", monthlyRent: 15000, status: "Occupied" },
      { id: "u-8", label: "Unit 2B", occupantsCount: 4, size: "Medium", monthlyRent: 18000, status: "Occupied" },
      { id: "u-9", label: "Unit 3A", occupantsCount: 6, size: "Big", monthlyRent: 22000, status: "Maintenance" },
    ],
  },
];

export const mockTenants: Tenant[] = [
  {
    id: "tenant-1",
    fullName: "Alyssa Reyes",
    email: "alyssa.reyes@email.com",
    phone: "+63 917 111 2233",
    propertyId: "prop-1",
    unitLabel: "Room 203",
    leaseStart: "2026-01-01",
    leaseEnd: "2026-12-31",
    dueDate: 5,
    paymentStatus: "Due Soon",
    contractFileName: "reyes-lease-2026.pdf",
  },
  {
    id: "tenant-2",
    fullName: "Mark Dela Cruz",
    email: "mark.dc@email.com",
    phone: "+63 917 555 9911",
    propertyId: "prop-2",
    unitLabel: "Unit 7B",
    leaseStart: "2025-11-01",
    leaseEnd: "2026-10-31",
    dueDate: 10,
    paymentStatus: "Paid",
    contractFileName: "delacruz-lease.pdf",
  },
  {
    id: "tenant-3",
    fullName: "Joan Villanueva",
    email: "joan.v@email.com",
    phone: "+63 917 441 7788",
    propertyId: "prop-3",
    unitLabel: "Unit 3A",
    leaseStart: "2025-12-15",
    leaseEnd: "2026-12-14",
    dueDate: 1,
    paymentStatus: "Overdue",
    contractFileName: "villanueva-contract.pdf",
  },
];

export const mockReminders: Reminder[] = [
  {
    id: "rem-1",
    tenantId: "tenant-3",
    subject: "Rent payment overdue reminder",
    message: "Hello Joan, this is a friendly reminder that your rent is currently overdue. Please settle your payment as soon as possible.",
    scheduledAt: "2026-05-05T09:00:00.000Z",
    sentAt: "2026-05-05T09:00:00.000Z",
    status: "Sent",
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    tenantId: "tenant-1",
    propertyId: "prop-1",
    billingPeriod: "May 2026",
    baseRent: 6500,
    utilitiesTotal: 0,
    amount: 6500,
    dueDate: "2026-05-05",
    status: "Sent",
    createdAt: "2026-05-01",
  },
  {
    id: "inv-2",
    tenantId: "tenant-2",
    propertyId: "prop-2",
    billingPeriod: "May 2026",
    baseRent: 28000,
    utilitiesTotal: 0,
    amount: 28000,
    dueDate: "2026-05-10",
    status: "Paid",
    createdAt: "2026-05-01",
  },
];

export const mockUtilityBillingCycles: UtilityBillingCycle[] = [
  {
    id: "util-1",
    propertyId: "prop-1",
    unitLabel: "Room 203",
    billingPeriod: "May 2026",
    periodStart: "2026-05-01",
    periodEnd: "2026-05-31",
    previousReading: 1100,
    currentReading: 1240,
    electricityRate: 12,
    waterRate: 450,
    additionalFees: 150,
    createdAt: "2026-05-01",
  },
  {
    id: "util-2",
    propertyId: "prop-2",
    unitLabel: "Unit 7B",
    billingPeriod: "May 2026",
    periodStart: "2026-05-01",
    periodEnd: "2026-05-31",
    previousReading: 8900,
    currentReading: 9050,
    electricityRate: 13,
    waterRate: 600,
    additionalFees: 300,
    createdAt: "2026-05-01",
  },
];
