const { PrismaClient } = require('@prisma/client');

const clusters = ['aws-0', 'aws-1'];
const regions = [
  'ap-southeast-1', // Singapore
  'ap-northeast-1', // Tokyo
  'ap-northeast-2', // Seoul
  'ap-southeast-2', // Sydney
  'ap-south-1',     // Mumbai
  'us-east-1',      // N. Virginia
  'us-east-2',      // Ohio
  'us-west-1',      // N. California
  'us-west-2',      // Oregon
  'eu-west-1',      // Ireland
  'eu-central-1'    // Frankfurt
];

async function testConnection(cluster, region) {
  const host = `${cluster}-${region}.pooler.supabase.com`;
  const url = `postgresql://postgres.xwrtoeddqhbcwymvfkri:XR4D3QAUP%40Y@${host}:6543/postgres?pgbouncer=true`;
  
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`\n🎉 SUCCESS! Connected to cluster/region: ${cluster}-${region}`);
    console.log(`Host is: ${host}`);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    await prisma.$disconnect();
    if (err.message.includes('tenant/user') && err.message.includes('not found')) {
      process.stdout.write(`.`);
    } else {
      console.log(`\nCluster/Region ${cluster}-${region} failed with error:`, err.message);
    }
    return false;
  }
}

async function main() {
  console.log('Testing regions on aws-0 and aws-1 clusters with Prisma...');
  for (const cluster of clusters) {
    for (const region of regions) {
      const success = await testConnection(cluster, region);
      if (success) {
        console.log('\nFound the correct database URL!');
        process.exit(0);
      }
    }
  }
  console.log('\nFailed to connect to any cluster/region combination. Please check if the credentials/project-ref/password are correct.');
}

main();
