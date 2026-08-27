import 'dotenv/config'

import { prisma } from '../lib/db'

/** The rep dropdown from spec §01, and the auth allowlist from build brief §6. */
const REPS = [
  { name: 'John Kibler', email: 'jkibler@mtgroupbio.com', role: 'admin' },
  { name: 'Heather Shahzade', email: 'hshahzade@mtgroupbio.com', role: 'rep' },
  { name: 'Joshua Taylor', email: 'jtaylor@mtgroupbio.com', role: 'rep' },
  { name: 'Karen Krantz', email: 'kkrantz@mtgroupbio.com', role: 'rep' },
]

async function main() {
  for (const rep of REPS) {
    // Upsert so re-seeding never duplicates a rep or clobbers their quotes.
    await prisma.user.upsert({
      where: { email: rep.email },
      update: { name: rep.name, role: rep.role },
      create: rep,
    })
  }
  console.log(`Seeded ${REPS.length} reps.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
