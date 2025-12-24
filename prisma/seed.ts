import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Configuration de l'application
  console.log('📝 Creating app configuration...');
  await prisma.appConfig.createMany({
    data: [
      {
        key: 'app_name',
        value: JSON.stringify('AliceBot'),
        description: 'Nom de l\'application',
        category: 'general',
      },
      {
        key: 'app_slogan',
        value: JSON.stringify('Votre partenaire de confiance pour vos transactions bookmaker'),
        description: 'Slogan de l\'application',
        category: 'general',
      },
      {
        key: 'theme_colors',
        value: JSON.stringify({
          primary: '#3B82F6',
          secondary: '#10B981',
          accent: '#F59E0B',
          background: '#FFFFFF',
          text: '#1F2937',
        }),
        description: 'Couleurs du thème',
        category: 'theme',
      },
      {
        key: 'logo_light',
        value: JSON.stringify('/assets/logo-light.png'),
        description: 'Logo mode clair',
        category: 'theme',
      },
      {
        key: 'logo_dark',
        value: JSON.stringify('/assets/logo-dark.png'),
        description: 'Logo mode sombre',
        category: 'theme',
      },
      {
        key: 'active_countries',
        value: JSON.stringify(['TG', 'BJ', 'CI', 'SN', 'ML']),
        description: 'Pays actifs',
        category: 'general',
      },
      {
        key: 'min_deposit',
        value: JSON.stringify(500),
        description: 'Montant minimum dépôt',
        category: 'payment',
      },
      {
        key: 'min_withdrawal',
        value: JSON.stringify(1000),
        description: 'Montant minimum retrait',
        category: 'payment',
      },
      {
        key: 'referral_withdrawal_threshold',
        value: JSON.stringify(2000),
        description: 'Seuil minimum retrait parrainage',
        category: 'referral',
      },
      {
        key: 'referral_commission_percent',
        value: JSON.stringify(5),
        description: 'Pourcentage commission parrainage',
        category: 'referral',
      },
      {
        key: 'whatsapp_support',
        value: JSON.stringify('+22890123456'),
        description: 'Numéro WhatsApp support',
        category: 'contact',
      },
      {
        key: 'whatsapp_payment_validation_template',
        value: JSON.stringify('Bonjour, je souhaite valider mon paiement bancaire.\n\nNom: {name}\nMontant: {amount} FCFA\nBookmaker: {bookmaker}\nRéférence: {reference}\nContact: {contact}\nPays: {country}'),
        description: 'Template message WhatsApp paiement bancaire',
        category: 'payment',
      },
      {
        key: 'email_support',
        value: JSON.stringify('support@alicebot.com'),
        description: 'Email support',
        category: 'contact',
      },
      {
        key: 'social_links',
        value: JSON.stringify({
          facebook: 'https://facebook.com/alicebot',
          twitter: 'https://twitter.com/alicebot',
          instagram: 'https://instagram.com/alicebot',
        }),
        description: 'Liens réseaux sociaux',
        category: 'contact',
      },
    ],
  });

  // 2. Code parrainage par défaut
  console.log('🎁 Creating default referral codes...');
  await prisma.referralCode.createMany({
    data: [
      {
        code: 'ALICE2025',
        withdrawalThreshold: 2000,
        commissionPercent: 5,
        isActive: true,
      },
      {
        code: 'BONUS10',
        withdrawalThreshold: 2000,
        commissionPercent: 10,
        isActive: true,
      },
    ],
  });

  // 3. Bookmakers
  console.log('🎰 Creating bookmakers...');
  const bookmakers = await Promise.all([
    prisma.bookmaker.create({
      data: {
        name: '1xBet',
        logo: '/assets/bookmakers/1xbet.png',
        countries: JSON.stringify(['TG', 'BJ', 'CI', 'SN', 'ML']),
        isActive: true,
        order: 1,
      },
    }),
    prisma.bookmaker.create({
      data: {
        name: '22Bet',
        logo: '/assets/bookmakers/22bet.png',
        countries: JSON.stringify(['TG', 'BJ', 'CI', 'SN']),
        isActive: true,
        order: 2,
      },
    }),
    prisma.bookmaker.create({
      data: {
        name: 'Betwinner',
        logo: '/assets/bookmakers/betwinner.png',
        countries: JSON.stringify(['TG', 'BJ', 'CI']),
        isActive: true,
        order: 3,
      },
    }),
    prisma.bookmaker.create({
      data: {
        name: 'ParionsSport',
        logo: '/assets/bookmakers/parionssport.png',
        countries: JSON.stringify(['TG', 'BJ', 'CI', 'SN', 'ML']),
        isActive: true,
        order: 4,
      },
    }),
  ]);

  // 4. Moyens de paiement
  console.log('💳 Creating payment methods...');
  const paymentMethods = await Promise.all([
    // Mobile Money - Togo
    prisma.paymentMethod.create({
      data: {
        type: 'MOBILE_MONEY',
        name: 'Flooz (Moov Togo)',
        logo: '/assets/payments/flooz.png',
        countries: JSON.stringify(['TG']),
        ussdTemplate: '*155*1*{montant}*{numero}#',
        instructions: 'Composez le code USSD et suivez les instructions',
        isActive: true,
        order: 1,
      },
    }),
    prisma.paymentMethod.create({
      data: {
        type: 'MOBILE_MONEY',
        name: 'TMoney (Togocel)',
        logo: '/assets/payments/tmoney.png',
        countries: JSON.stringify(['TG']),
        ussdTemplate: '*145*1*{montant}*{numero}#',
        instructions: 'Composez le code USSD et suivez les instructions',
        isActive: true,
        order: 2,
      },
    }),
    // Mobile Money - Bénin
    prisma.paymentMethod.create({
      data: {
        type: 'MOBILE_MONEY',
        name: 'MTN Mobile Money',
        logo: '/assets/payments/mtn.png',
        countries: JSON.stringify(['BJ', 'CI', 'SN']),
        ussdTemplate: '*133*1*{montant}*{numero}#',
        instructions: 'Composez le code USSD et suivez les instructions',
        isActive: true,
        order: 3,
      },
    }),
    prisma.paymentMethod.create({
      data: {
        type: 'MOBILE_MONEY',
        name: 'Moov Money',
        logo: '/assets/payments/moov.png',
        countries: JSON.stringify(['BJ', 'CI', 'SN']),
        ussdTemplate: '*555*1*{montant}*{numero}#',
        instructions: 'Composez le code USSD et suivez les instructions',
        isActive: true,
        order: 4,
      },
    }),
    prisma.paymentMethod.create({
      data: {
        type: 'MOBILE_MONEY',
        name: 'Orange Money',
        logo: '/assets/payments/orange.png',
        countries: JSON.stringify(['BJ', 'CI', 'SN', 'ML']),
        ussdTemplate: '*144*1*{montant}*{numero}#',
        instructions: 'Composez le code USSD et suivez les instructions',
        isActive: true,
        order: 5,
      },
    }),
    // Paiements bancaires
    prisma.paymentMethod.create({
      data: {
        type: 'BANK',
        name: 'Carte Bancaire (Visa/Mastercard)',
        logo: '/assets/payments/card.png',
        countries: JSON.stringify(['TG', 'BJ', 'CI', 'SN', 'ML']),
        instructions: 'Validation manuelle via WhatsApp',
        isActive: true,
        order: 6,
      },
    }),
    prisma.paymentMethod.create({
      data: {
        type: 'BANK',
        name: 'Virement Bancaire',
        logo: '/assets/payments/bank.png',
        countries: JSON.stringify(['TG', 'BJ', 'CI', 'SN', 'ML']),
        instructions: 'Validation manuelle via WhatsApp',
        isActive: true,
        order: 7,
      },
    }),
    // Autres
    prisma.paymentMethod.create({
      data: {
        type: 'OTHER',
        name: 'Western Union',
        logo: '/assets/payments/western.png',
        countries: JSON.stringify(['TG', 'BJ', 'CI', 'SN', 'ML']),
        instructions: 'Contactez le support pour les détails',
        isActive: true,
        order: 8,
      },
    }),
  ]);

  // 5. Utilisateurs de test
  console.log('👥 Creating test users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@alicebot.com',
      phone: '+22890000001',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'AliceBot',
      country: 'TG',
      role: 'ADMIN',
      isVerified: true,
      referralCode: 'ADMIN001',
    },
  });

  const support = await prisma.user.create({
    data: {
      email: 'support@alicebot.com',
      phone: '+22890000002',
      password: hashedPassword,
      firstName: 'Support',
      lastName: 'Team',
      country: 'TG',
      role: 'SUPPORT',
      isVerified: true,
    },
  });

  const agents = await Promise.all([
    prisma.user.create({
      data: {
        email: 'agent1@alicebot.com',
        phone: '+22890111111',
        password: hashedPassword,
        firstName: 'Koffi',
        lastName: 'Agent',
        country: 'TG',
        role: 'AGENT',
        isVerified: true,
        isOnline: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'agent2@alicebot.com',
        phone: '+22890222222',
        password: hashedPassword,
        firstName: 'Awa',
        lastName: 'Caissier',
        country: 'TG',
        role: 'AGENT',
        isVerified: true,
        isOnline: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'agent3@alicebot.com',
        phone: '+22890333333',
        password: hashedPassword,
        firstName: 'Yao',
        lastName: 'Agent',
        country: 'BJ',
        role: 'AGENT',
        isVerified: true,
        isOnline: false,
      },
    }),
  ]);

  const client = await prisma.user.create({
    data: {
      email: 'client@test.com',
      phone: '+22890999999',
      password: hashedPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      country: 'TG',
      role: 'CLIENT',
      isVerified: true,
      referralCode: 'CLIENT001',
      referredBy: 'ALICE2025',
      referralBalance: 1500,
    },
  });

  // 6. EmployeePaymentMethods (agents avec leurs moyens de paiement)
  console.log('💼 Creating employee payment methods...');

  // Agent 1 (Togo) - Flooz + TMoney pour 1xBet
  await prisma.employeePaymentMethod.createMany({
    data: [
      {
        employeeId: agents[0].id,
        bookmakerId: bookmakers[0].id, // 1xBet
        paymentMethodId: paymentMethods[0].id, // Flooz
        country: 'TG',
        syntaxe: '*155*1*{montant}*90111111#',
        frais: 0,
        phoneNumber: '+22890111111',
        address: JSON.stringify({
          city: 'Lomé',
          street: 'Rue du Commerce',
          establishment: 'Boutique Koffi',
        }),
        isActive: true,
      },
      {
        employeeId: agents[0].id,
        bookmakerId: bookmakers[0].id, // 1xBet
        paymentMethodId: paymentMethods[1].id, // TMoney
        country: 'TG',
        syntaxe: '*145*1*{montant}*90111111#',
        frais: 0,
        phoneNumber: '+22890111111',
        address: JSON.stringify({
          city: 'Lomé',
          street: 'Rue du Commerce',
          establishment: 'Boutique Koffi',
        }),
        isActive: true,
      },
    ],
  });

  // Agent 2 (Togo) - Flooz pour 22Bet
  await prisma.employeePaymentMethod.create({
    data: {
      employeeId: agents[1].id,
      bookmakerId: bookmakers[1].id, // 22Bet
      paymentMethodId: paymentMethods[0].id, // Flooz
      country: 'TG',
      syntaxe: '*155*1*{montant}*90222222#',
      frais: 100,
      phoneNumber: '+22890222222',
      address: JSON.stringify({
        city: 'Lomé',
        street: 'Avenue de la Libération',
        establishment: 'Agence Awa',
      }),
      isActive: true,
    },
  });

  // Agent 3 (Bénin) - MTN pour 1xBet
  await prisma.employeePaymentMethod.create({
    data: {
      employeeId: agents[2].id,
      bookmakerId: bookmakers[0].id, // 1xBet
      paymentMethodId: paymentMethods[2].id, // MTN
      country: 'BJ',
      syntaxe: '*133*1*{montant}*90333333#',
      frais: 50,
      phoneNumber: '+22990333333',
      address: JSON.stringify({
        city: 'Cotonou',
        street: 'Rue Steinmetz',
        establishment: 'Point Yao',
      }),
      isActive: true,
    },
  });

  // 7. Bookmaker IDs pour le client
  console.log('🎮 Creating bookmaker identifiers...');
  await prisma.bookmakerIdentifier.createMany({
    data: [
      {
        clientId: client.id,
        bookmakerId: bookmakers[0].id,
        identifier: '123456789',
        label: 'Mon compte 1xBet',
      },
      {
        clientId: client.id,
        bookmakerId: bookmakers[1].id,
        identifier: '987654321',
        label: 'Compte 22Bet principal',
      },
    ],
  });

  console.log('✅ Seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`- Admin: ${admin.email} / ${admin.phone}`);
  console.log(`- Support: ${support.email} / ${support.phone}`);
  console.log(`- Agents: ${agents.length}`);
  console.log(`- Client: ${client.email} / ${client.phone}`);
  console.log(`- Bookmakers: ${bookmakers.length}`);
  console.log(`- Payment Methods: ${paymentMethods.length}`);
  console.log('\n🔑 Default password for all users: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
