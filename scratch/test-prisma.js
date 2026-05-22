const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        image_url: true,
        created_at: true,
        products: {
          select: {
            id: true
          }
        }
      }
    });
    console.log('Success! Found categories:', categories.length);
  } catch (error) {
    console.error('Error running Prisma query:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
