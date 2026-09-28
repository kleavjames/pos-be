import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ORDER_STATUSES = [
  { code: 'PENDING', label: 'Pending', sortOrder: 1, isTerminal: false },
  { code: 'PREPPING', label: 'Prepping', sortOrder: 2, isTerminal: false },
  {
    code: 'FOR_DELIVERY',
    label: 'For Delivery',
    sortOrder: 3,
    isTerminal: false,
  },
  {
    code: 'PENDING_PAYMENT',
    label: 'Pending Payment',
    sortOrder: 4,
    isTerminal: false,
  },
  { code: 'COMPLETED', label: 'Completed', sortOrder: 5, isTerminal: true },
  { code: 'VOID', label: 'Void', sortOrder: 6, isTerminal: true },
] as const;

const TRANSITIONS: Array<[string, string]> = [
  ['PENDING', 'PREPPING'],
  ['PENDING', 'VOID'],
  ['PREPPING', 'FOR_DELIVERY'],
  ['PREPPING', 'PENDING_PAYMENT'],
  ['PREPPING', 'COMPLETED'],
  ['PREPPING', 'VOID'],
  ['FOR_DELIVERY', 'PENDING_PAYMENT'],
  ['FOR_DELIVERY', 'COMPLETED'],
  ['FOR_DELIVERY', 'VOID'],
  ['PENDING_PAYMENT', 'COMPLETED'],
  ['PENDING_PAYMENT', 'VOID'],
];

const ROLES = [
  { code: 'ADMIN' as const, name: 'Admin' },
  { code: 'MANAGER' as const, name: 'Manager' },
  { code: 'CASHIER' as const, name: 'Cashier' },
];

async function seedOrderStatuses() {
  const statusByCode = new Map<string, string>();

  for (const status of ORDER_STATUSES) {
    const record = await prisma.orderStatus.upsert({
      where: { code: status.code },
      create: status,
      update: {
        label: status.label,
        sortOrder: status.sortOrder,
        isTerminal: status.isTerminal,
      },
    });
    statusByCode.set(status.code, record.id);
  }

  for (const [fromCode, toCode] of TRANSITIONS) {
    const fromStatusId = statusByCode.get(fromCode);
    const toStatusId = statusByCode.get(toCode);
    if (!fromStatusId || !toStatusId) {
      throw new Error(`Missing status for transition ${fromCode} -> ${toCode}`);
    }

    await prisma.orderStatusTransition.upsert({
      where: {
        fromStatusId_toStatusId: { fromStatusId, toStatusId },
      },
      create: { fromStatusId, toStatusId },
      update: {},
    });
  }
}

async function seedRoles() {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { code: role.code },
      create: role,
      update: { name: role.name },
    });
  }
}

async function seedDemoBusiness() {
  const business = await prisma.business.upsert({
    where: { slug: 'let-coffee' },
    create: { name: 'Let Coffee', slug: 'let-coffee' },
    update: { name: 'Let Coffee' },
  });

  await prisma.category.upsert({
    where: {
      businessId_name: { businessId: business.id, name: 'Coffee' },
    },
    create: {
      businessId: business.id,
      name: 'Coffee',
      pricingMode: 'VARIANT',
      optionGroups: {
        create: [
          {
            name: 'Served As & Price',
            type: 'SERVING_VARIANT',
            sortOrder: 1,
            options: {
              create: [
                { name: 'Hot', sortOrder: 1 },
                { name: 'Iced', sortOrder: 2 },
              ],
            },
          },
          {
            name: 'Upgrades & Add-ons',
            type: 'ADDON',
            sortOrder: 2,
            options: {
              create: [
                {
                  name: 'Upgrade to Oatside milk',
                  defaultPrice: 40,
                  sortOrder: 1,
                },
                {
                  name: 'Add-on: Creamy Foam',
                  defaultPrice: 30,
                  sortOrder: 2,
                },
              ],
            },
          },
        ],
      },
    },
    update: {},
  });

  await prisma.category.upsert({
    where: {
      businessId_name: { businessId: business.id, name: 'Matcha Series' },
    },
    create: {
      businessId: business.id,
      name: 'Matcha Series',
      pricingMode: 'VARIANT',
      optionGroups: {
        create: [
          {
            name: 'Served As & Price',
            type: 'SERVING_VARIANT',
            sortOrder: 1,
            options: {
              create: [
                { name: 'Hot', sortOrder: 1 },
                { name: 'Iced / 12oz', sortOrder: 2 },
              ],
            },
          },
          {
            name: 'Matcha Grade Upgrades',
            type: 'ADDON',
            sortOrder: 2,
            options: {
              create: [
                {
                  name: 'Upgrade to Kyo Shizuku',
                  defaultPrice: 30,
                  sortOrder: 1,
                },
                {
                  name: 'Upgrade to Shizu Hikari',
                  defaultPrice: 50,
                  sortOrder: 2,
                },
              ],
            },
          },
        ],
      },
    },
    update: {},
  });

  await prisma.category.upsert({
    where: {
      businessId_name: { businessId: business.id, name: 'Rice Bowls' },
    },
    create: {
      businessId: business.id,
      name: 'Rice Bowls',
      pricingMode: 'SINGLE',
      optionGroups: {
        create: [
          {
            name: 'Available Add-ons',
            type: 'ADDON',
            sortOrder: 1,
            options: {
              create: [
                { name: 'Extra Rice', defaultPrice: 30, sortOrder: 1 },
                { name: 'Extra Fried Rice', defaultPrice: 40, sortOrder: 2 },
                { name: 'Extra Egg', defaultPrice: 15, sortOrder: 3 },
                { name: 'Extra Hotdog', defaultPrice: 20, sortOrder: 4 },
              ],
            },
          },
        ],
      },
    },
    update: {},
  });

  return business;
}

async function main() {
  await seedRoles();
  await seedOrderStatuses();
  await seedDemoBusiness();
  console.log('Seed completed.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
