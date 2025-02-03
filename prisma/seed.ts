import { PrismaClient, UserRole, AccountType, TransactionType, TransactionStatus, CardType, TelecomNetwork, UtilityType, UtilityProvider } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

  const prisma = new PrismaClient();
// Helper function to generate random decimals
const generateRandomDecimal = (min: number, max: number, precision: number = 2): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
};

// Helper function to generate a random date within a range
const generateRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

async function main() {
  console.log('🌱 Starting database seeding...')
  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.user.deleteMany();
  await prisma.account.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.card.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.aPIKey.deleteMany();
  await prisma.address.deleteMany();
  await prisma.airtimePurchase.deleteMany();
  await prisma.dataPurchase.deleteMany();
  await prisma.utilityPayment.deleteMany();

  // Create Users
  console.log('👤 Creating users...');
  const users = await Promise.all(
    Array.from({ length: 10 }).map(async (_, index) => {
      const userRole: UserRole = index === 0 ? 'ADMIN' : 'CUSTOMER';
      const email = faker.internet.email();
      const passwordHash = await bcrypt.hash('password123', 10);
      return prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          phone: faker.phone.number(),
          role: userRole,
          emailVerified: true,
          twoFactorEnabled: false,
        },
      });
    })
  );

  // Create Accounts
  console.log('💳 Creating accounts...');
  const accounts = await Promise.all(
    users.map(async (user) => {
      return prisma.account.create({
        data: {
          userId: user.id,
          accountNumber: faker.finance.accountNumber(),
          type: faker.helpers.arrayElement(Object.values(AccountType)),
          currencyCode: 'USD',
          balance: generateRandomDecimal(1000, 100000),
          ledgerBalance: generateRandomDecimal(1000, 100000),
        },
      });
    })
  );

  // Create Transactions
  console.log('💸 Creating transactions...');
  await Promise.all(
    Array.from({ length: 50 }).map(async () => {
      const fromAccount = faker.helpers.arrayElement(accounts);
      const toAccount = faker.helpers.arrayElement(accounts.filter((a) => a.id !== fromAccount.id));
      return prisma.transaction.create({
        data: {
          userId:fromAccount.userId,
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          amount: generateRandomDecimal(10, 1000),
          currencyCode: 'USD',
          type: faker.helpers.arrayElement(Object.values(TransactionType)),
          status: faker.helpers.arrayElement(Object.values(TransactionStatus)),
          description: faker.finance.transactionDescription(),
        },
      });
    })
  );

  // Create Payment Methods
  console.log('💳 Creating payment methods...');
  await Promise.all(
    users.map(async (user) => {
      return prisma.paymentMethod.create({
        data: {
          userId: user.id,
          type: 'card',
          provider: faker.helpers.arrayElement(['Visa', 'Mastercard']),
          last4: faker.finance.creditCardNumber().slice(-4),
          isDefault: true,
        },
      });
    })
  );

  // Create Cards
  console.log('🃏 Creating cards...');
  await Promise.all(
    accounts.map(async (account) => {
      return prisma.card.create({
        data: {
          userId: account.userId,
          accountId: account.id,
          type: faker.helpers.arrayElement(Object.values(CardType)),
          last4: faker.finance.creditCardNumber().slice(-4),
          expiryMonth: faker.date.future().getMonth() + 1,
          expiryYear: faker.date.future().getFullYear(),
          issuer: faker.helpers.arrayElement(['Visa', 'Mastercard']),
          status: 'active',
        },
      });
    })
  );

  // Create Loans
  console.log('🏦 Creating loans...');
  await Promise.all(
    users.map(async (user) => {
      const account = accounts.find((a) => a.userId === user.id);
      if (!account) return;

      const loan = await prisma.loan.create({
        data: {
          userId: user.id,
          accountId: account.id,
          principal: generateRandomDecimal(1000, 50000),
          interestRate: generateRandomDecimal(5, 20),
          termMonths: faker.number.int({ min: 6, max: 60 }),
          amountDue: generateRandomDecimal(1000, 50000),
          dueDate: faker.date.future(),
          status: 'active',
        },
      });

      // Create Loan Payments
      await Promise.all(
        Array.from({ length: 3 }).map(async () => {
          return prisma.loanPayment.create({
            data: {
              loanId: loan.id,
              amount: generateRandomDecimal(100, 1000),
              principalPaid: generateRandomDecimal(50, 500),
              interestPaid: generateRandomDecimal(50, 500),
              paymentDate: faker.date.past(),
            },
          });
        })
      );
    })
  );

  // Create Merchants
  console.log('🏪 Creating merchants...');
  await Promise.all(
    users.slice(0, 5).map(async (user) => {
      return prisma.merchant.create({
        data: {
          userId: user.id,
          businessName: faker.company.name(),
          apiKey: faker.string.uuid(),
          webhookUrl: faker.internet.url(),
        },
      });
    })
  );

  // Create Airtime Purchases
  console.log('📞 Creating airtime purchases...');
  await Promise.all(
    users.map(async (user) => {
      const account = accounts.find((a) => a.userId === user.id);
      if (!account) return;

      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'AIRTIME',
          amount: generateRandomDecimal(100, 1000),
          status: 'COMPLETED',
        },
      });

      return prisma.airtimePurchase.create({
        data: {
          transactionId: transaction.id,
          network: faker.helpers.arrayElement(Object.values(TelecomNetwork)),
          phoneNumber: faker.phone.number(),
          amount: transaction.amount,
        },
      });
    })
  );

  // Create Utility Payments
  console.log('💡 Creating utility payments...');
  await Promise.all(
    users.map(async (user) => {
      const account = accounts.find((a) => a.userId === user.id);
      if (!account) return;

      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'UTILITY_BILL',
          amount: generateRandomDecimal(500, 5000),
          status: 'COMPLETED',
        },
      });

      return prisma.utilityPayment.create({
        data: {
          transactionId: transaction.id,
          utilityType: faker.helpers.arrayElement(Object.values(UtilityType)),
          provider: faker.helpers.arrayElement(Object.values(UtilityProvider)),
          customerId: faker.string.alphanumeric(10),
          amount: transaction.amount,
        },
      });
    })
  );

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });