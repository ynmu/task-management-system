import { PrismaClient, CommunicationPreference } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();
const csvFilePath = path.join(__dirname, 'donors.csv');

const allPreferences: CommunicationPreference[] = [
  'Holiday_Card',
  'Survey',
  'Event',
  'Thank_you',
  'Newsletter',
  'Research_update'
];

// Helper: Generate a random list including "Event"
function generateRandomPreferences(): CommunicationPreference[] {
  const otherPrefs = allPreferences.filter(p => p !== 'Event');
  const count = Math.floor(Math.random() * (otherPrefs.length + 1));
  const shuffled = otherPrefs.sort(() => 0.5 - Math.random()).slice(0, count);
  return ['Event', ...shuffled];
}

async function readCSV(): Promise<any[]> {
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  return new Promise((resolve, reject) => {
    parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    }, (err, records) => {
      if (err) reject(err);
      else resolve(records);
    });
  });
}

async function main() {
  const donors = await readCSV();

  for (const donor of donors) {
    const preferences: CommunicationPreference[] = donor.communicationPreference
      ? [donor.communicationPreference as CommunicationPreference]
      : generateRandomPreferences();

    await prisma.donor.create({
      data: {
        firstName: donor.firstName,
        lastName: donor.lastName,
        organizationName: donor.organizationName || null,
        totalDonations: Number(donor.totalDonations || 0),
        totalPledge: Number(donor.totalPledge || 0),
        largestGift: Number(donor.largestGift || 0),
        largestGiftAppeal: donor.largestGiftAppeal || '',
        firstGiftDate: BigInt(donor.firstGiftDate || Date.now()),
        lastGiftDate: BigInt(donor.lastGiftDate || Date.now()),
        lastGiftAmount: Number(donor.lastGiftAmount || 0),
        lastGiftRequest: BigInt(donor.lastGiftRequest || Date.now()),
        lastGiftAppeal: donor.lastGiftAppeal || '',
        addressLine1: donor.addressLine1,
        addressLine2: donor.addressLine2 || null,
        city: donor.city,
        contactPhoneType: donor.contactPhoneType,
        phoneRestrictions: donor.phoneRestrictions || null,
        emailRestrictions: donor.emailRestrictions || null,
        communicationRestrictions: donor.communicationRestrictions || null,
        subscriptionInPerson: donor.subscriptionInPerson,
        subscriptionMagazine: donor.subscriptionMagazine,
        communicationPreference: preferences,
        pmm: donor.pmm,
        smm: donor.smm,
        vmm: donor.vmm,
        exclude: donor.exclude === 'true',
        deceased: donor.deceased === 'true',
      }
    });
  }

  console.log(`Seeded ${donors.length} donors from CSV.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
