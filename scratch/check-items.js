const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    console.log(`Products in database: ${productCount}`);
    console.log(`Categories in database: ${categoryCount}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
