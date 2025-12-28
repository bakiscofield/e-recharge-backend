PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
);
INSERT INTO _prisma_migrations VALUES('331ec4bd-f94f-452c-b5df-df62b8507681','d498d4a671b0a2a4db16aa0dbb8e8826b8745c2b5c811ba5b23d3c1c8600204e',1766471282284,'20251223062801_init',NULL,NULL,1766471281908,1);
INSERT INTO _prisma_migrations VALUES('6e29693d-6a2e-4578-a92a-037c9a16cc53','b1343ed417198036c918bbb2ea74df4d231af752429cd1cb131ea286c007a269',1766481285924,'20251223091445_add_rbac_and_theme',NULL,NULL,1766481285649,1);
INSERT INTO _prisma_migrations VALUES('e32dfc00-f19f-4860-88e4-5a80c8094235','75c72b1d7ab731db95a0cba0407347b1fca5073f165e4614a3f586bf52c9d395',1766606909860,'20251224200829_add_email_verification',NULL,NULL,1766606909759,1);
INSERT INTO _prisma_migrations VALUES('a4858452-2573-4c49-93ce-f33619d5c1bf','e2f4ce3618f7502e00034c743cdf29262b3091875e76450e2e4b7facbeed4d53',1766653014041,'20251225085653_remove_logos',NULL,NULL,1766653013952,1);
CREATE TABLE IF NOT EXISTS "OtpCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "AppConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO AppConfig VALUES('c6f15ef9-aa63-4288-926b-f8ffa2d679c6','app_name','"AliceBot"','Nom de l''application','general',1766471409290);
INSERT INTO AppConfig VALUES('8ec63fe7-ff48-4f25-b7a1-70fbcd4925bf','app_slogan','"Votre partenaire de confiance pour vos transactions bookmaker"','Slogan de l''application','general',1766471409290);
INSERT INTO AppConfig VALUES('1e73a1d9-d1bc-45f9-bb3c-e75f320e6585','theme_colors','{"primary":"#3B82F6","secondary":"#10B981","accent":"#F59E0B","background":"#FFFFFF","text":"#1F2937"}','Couleurs du thème','theme',1766471409290);
INSERT INTO AppConfig VALUES('c255f9be-7ab8-4a02-9519-2bafabc902fe','logo_light','"/assets/logo-light.png"','Logo mode clair','theme',1766471409290);
INSERT INTO AppConfig VALUES('9d181fed-cf8b-44ad-9956-3227bff94691','logo_dark','"/assets/logo-dark.png"','Logo mode sombre','theme',1766471409290);
INSERT INTO AppConfig VALUES('e212ed18-e26c-42e7-9ef1-998abf9ae56c','active_countries','["TG","BJ","CI","SN","ML"]','Pays actifs','general',1766471409290);
INSERT INTO AppConfig VALUES('ec0a95cc-5cb2-4fb8-97f8-47087c810047','min_deposit','500','Montant minimum dépôt','payment',1766471409290);
INSERT INTO AppConfig VALUES('5c1ef22d-71dc-4de4-8e45-99556d7c78a0','min_withdrawal','1000','Montant minimum retrait','payment',1766471409290);
INSERT INTO AppConfig VALUES('fa5a78c0-1e4b-462e-b7a5-56a358b87ed7','referral_withdrawal_threshold','2000','Seuil minimum retrait parrainage','referral',1766471409290);
INSERT INTO AppConfig VALUES('6e20a299-0aa5-40e5-b081-2c144a13a031','referral_commission_percent','5','Pourcentage commission parrainage','referral',1766471409290);
INSERT INTO AppConfig VALUES('60889b5f-a4e4-4da6-9a2d-d02600bdd310','whatsapp_support','"+22890123456"','Numéro WhatsApp support','contact',1766471409290);
INSERT INTO AppConfig VALUES('50028ccf-4f2c-4904-a437-5458c888a516','whatsapp_payment_validation_template','"Bonjour, je souhaite valider mon paiement bancaire.\n\nNom: {name}\nMontant: {amount} FCFA\nBookmaker: {bookmaker}\nRéférence: {reference}\nContact: {contact}\nPays: {country}"','Template message WhatsApp paiement bancaire','payment',1766471409290);
INSERT INTO AppConfig VALUES('bc0a87c0-aa10-4df4-bbbd-99b87f1a9155','email_support','"support@alicebot.com"','Email support','contact',1766471409290);
INSERT INTO AppConfig VALUES('da46a4bd-7e77-4a8f-9695-21828d285978','social_links','{"facebook":"https://facebook.com/alicebot","twitter":"https://twitter.com/alicebot","instagram":"https://instagram.com/alicebot"}','Liens réseaux sociaux','contact',1766471409290);
INSERT INTO AppConfig VALUES('192f215a-78de-4eeb-a3b8-4bcaa51f0178','appName','zagada_service','Nom de l''application','branding',1766665729321);
INSERT INTO AppConfig VALUES('81949ede-f096-4fc2-9180-687a0ec432ec','secondaryColor','#ff2600','Couleur secondaire','branding',1766665729322);
INSERT INTO AppConfig VALUES('6f676c05-03ef-4c88-9105-7ad6986f270d','appTagline','Dépôts & Retraits','Slogan de l''application','branding',1766665729321);
INSERT INTO AppConfig VALUES('3b0bd6d8-7b3d-4a59-a6d3-747170e9ee81','primaryColor','#ff9500','Couleur principale','branding',1766665729322);
INSERT INTO AppConfig VALUES('15268245-bbe1-495c-b478-14db17eafd85','appLogo','http://localhost:3001/uploads/de3ca0d9b491b48a3268d821f4272db4.png','URL du logo','branding',1766665729322);
CREATE TABLE IF NOT EXISTS "EmployeePaymentMethod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "bookmakerId" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "syntaxe" TEXT,
    "frais" REAL NOT NULL DEFAULT 0,
    "address" TEXT,
    "phoneNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeePaymentMethod_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EmployeePaymentMethod_bookmakerId_fkey" FOREIGN KEY ("bookmakerId") REFERENCES "Bookmaker" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EmployeePaymentMethod_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO EmployeePaymentMethod VALUES('db1656f1-db0e-45d9-adcd-290ec345aa55','a01153c8-90b3-40f8-aff1-d2939ac18d71','a0d7892a-a30d-4049-8057-5e52870f414a','ffb78402-8b02-4f2c-9dc7-b405a2300eb2','TG','*155*1*{montant}*90111111#',0.0,'{"city":"Lomé","street":"Rue du Commerce","establishment":"Boutique Koffi"}','+22890111111',1,1766471409583,1766471409583);
INSERT INTO EmployeePaymentMethod VALUES('11a0b724-f555-40f1-b72e-21c9156ba4ec','a01153c8-90b3-40f8-aff1-d2939ac18d71','a0d7892a-a30d-4049-8057-5e52870f414a','3ac8287e-0480-4831-8f15-f4f2d39c8419','TG','*145*1*{montant}*90111111#',0.0,'{"city":"Lomé","street":"Rue du Commerce","establishment":"Boutique Koffi"}','+22890111111',1,1766471409583,1766471409583);
INSERT INTO EmployeePaymentMethod VALUES('dc22d27d-9758-4f7b-bf31-31d73d576efd','57ea0d72-ea92-4ceb-94f6-44743b0da91f','1f513fe3-962f-49fd-a348-c9423950ef55','ffb78402-8b02-4f2c-9dc7-b405a2300eb2','TG','*155*1*{montant}*90222222#',100.0,'{"city":"Lomé","street":"Avenue de la Libération","establishment":"Agence Awa"}','+22890222222',1,1766471409590,1766471409590);
INSERT INTO EmployeePaymentMethod VALUES('4e48ea78-24ee-471a-a600-92c3ccff1c73','ec80bd20-cf65-40dc-96cd-0cb6ec0b69ea','a0d7892a-a30d-4049-8057-5e52870f414a','8ede0ef0-7a10-4d1b-b066-7195fb8262c2','BJ','*133*1*{montant}*90333333#',50.0,'{"city":"Cotonou","street":"Rue Steinmetz","establishment":"Point Yao"}','+22990333333',1,1766471409596,1766593550524);
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "fees" REAL NOT NULL DEFAULT 0,
    "state" TEXT NOT NULL DEFAULT 'COMING',
    "referenceId" TEXT,
    "bookmakerIdentifier" TEXT,
    "clientContact" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "bookmakerId" TEXT NOT NULL,
    "employeePaymentMethodId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "confirmedAt" DATETIME,
    "cancelledAt" DATETIME,
    "cancellationReason" TEXT,
    CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_bookmakerId_fkey" FOREIGN KEY ("bookmakerId") REFERENCES "Bookmaker" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_employeePaymentMethodId_fkey" FOREIGN KEY ("employeePaymentMethodId") REFERENCES "EmployeePaymentMethod" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "Order" VALUES('dad0010c-8ed3-4b54-9159-de65ae8c1ea6','DEPOT',5000.0,0.0,'CANCELLED','2364512',NULL,'+22890999999','f928030d-a83c-446a-ad32-0717cce4db8e','a0d7892a-a30d-4049-8057-5e52870f414a','db1656f1-db0e-45d9-adcd-290ec345aa55',1766474365199,1766614371218,NULL,1766614371217,'Rejetée par le caissier');
INSERT INTO "Order" VALUES('2eb1c2ef-acc8-439c-8b60-431ec196a687','DEPOT',15000.0,0.0,'CONFIRMED','145662147',NULL,'+22890999999','f928030d-a83c-446a-ad32-0717cce4db8e','a0d7892a-a30d-4049-8057-5e52870f414a','db1656f1-db0e-45d9-adcd-290ec345aa55',1766609351490,1766610560937,1766610560936,NULL,NULL);
INSERT INTO "Order" VALUES('4439a7f4-b1fc-4930-b104-27fb1df68f5b','DEPOT',555.0,0.0,'COMING','4444',NULL,'+22890999999','f928030d-a83c-446a-ad32-0717cce4db8e','a0d7892a-a30d-4049-8057-5e52870f414a','db1656f1-db0e-45d9-adcd-290ec345aa55',1766752546338,1766752546338,NULL,NULL,NULL);
INSERT INTO "Order" VALUES('ca041606-be86-4ab9-ba35-4528d66acfc5','RETRAIT',11111.0,0.0,'COMING','14456','123456789','+22890999999','f928030d-a83c-446a-ad32-0717cce4db8e','a0d7892a-a30d-4049-8057-5e52870f414a','db1656f1-db0e-45d9-adcd-290ec345aa55',1766766266568,1766766266568,NULL,NULL,NULL);
CREATE TABLE IF NOT EXISTS "BookmakerIdentifier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "bookmakerId" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BookmakerIdentifier_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookmakerIdentifier_bookmakerId_fkey" FOREIGN KEY ("bookmakerId") REFERENCES "Bookmaker" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO BookmakerIdentifier VALUES('11afd6e2-3caf-499c-9bd0-339c9d20e24c','f928030d-a83c-446a-ad32-0717cce4db8e','a0d7892a-a30d-4049-8057-5e52870f414a','123456789','Mon compte 1xBet',1766471409604,1766471409604);
INSERT INTO BookmakerIdentifier VALUES('5c495cea-8652-4985-aae5-4d18902de854','f928030d-a83c-446a-ad32-0717cce4db8e','1f513fe3-962f-49fd-a348-c9423950ef55','987654321','Compte 22Bet principal',1766471409604,1766471409604);
CREATE TABLE IF NOT EXISTS "ReferralWithdrawal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "processedAt" DATETIME,
    CONSTRAINT "ReferralWithdrawal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "ChatConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "agentId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'SUPPORT',
    "lastMessageAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatConversation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChatConversation_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO ChatConversation VALUES('a7a24fcd-849e-40c0-880d-6c1bdc7d32db','f928030d-a83c-446a-ad32-0717cce4db8e',NULL,'SUPPORT',1766767409898,1766766277130);
INSERT INTO ChatConversation VALUES('3ebe7cc7-405c-46d3-9bae-7f2447343b08','f928030d-a83c-446a-ad32-0717cce4db8e',NULL,'SUPPORT',1766767552693,1766766277131);
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO ChatMessage VALUES('b3138549-d7c3-437c-8c36-352b94198540','3ebe7cc7-405c-46d3-9bae-7f2447343b08','f928030d-a83c-446a-ad32-0717cce4db8e','salut ',NULL,0,1766766286436);
INSERT INTO ChatMessage VALUES('e3f93c61-0a20-4f2c-a81d-feb88c8e0378','3ebe7cc7-405c-46d3-9bae-7f2447343b08','f928030d-a83c-446a-ad32-0717cce4db8e','salut',NULL,0,1766766295579);
INSERT INTO ChatMessage VALUES('f3a166bf-81ac-4aba-a6b4-425849ca0e97','a7a24fcd-849e-40c0-880d-6c1bdc7d32db','f928030d-a83c-446a-ad32-0717cce4db8e','jjj',NULL,1,1766766868741);
INSERT INTO ChatMessage VALUES('aaf6bb16-5866-42b5-aac5-0835d09965cb','a7a24fcd-849e-40c0-880d-6c1bdc7d32db','f928030d-a83c-446a-ad32-0717cce4db8e','jjj',NULL,1,1766767230955);
INSERT INTO ChatMessage VALUES('67b91d37-9534-4e84-966d-b011ecbd935e','a7a24fcd-849e-40c0-880d-6c1bdc7d32db','f928030d-a83c-446a-ad32-0717cce4db8e','bonjour',NULL,1,1766767409890);
INSERT INTO ChatMessage VALUES('27d4b92a-7357-4242-ac48-9ccf0681b072','3ebe7cc7-405c-46d3-9bae-7f2447343b08','a37b7f6d-0c90-481e-b235-263c4bec5973','oki',NULL,0,1766767552675);
CREATE TABLE IF NOT EXISTS "PushSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "keys" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO Notification VALUES('077078c4-ca54-441e-ba33-fcc20e11222a','f928030d-a83c-446a-ad32-0717cce4db8e','ORDER_STATUS_CHANGED','Dépôt créé','Votre dépôt de 5000 FCFA est en cours de traitement','{"orderId":"dad0010c-8ed3-4b54-9159-de65ae8c1ea6"}',1,0,1766474365206);
INSERT INTO Notification VALUES('8782e877-9247-452b-8027-f513d7531bda','f928030d-a83c-446a-ad32-0717cce4db8e','ORDER_STATUS_CHANGED','Dépôt créé','Votre dépôt de 15000 FCFA est en cours de traitement','{"orderId":"2eb1c2ef-acc8-439c-8b60-431ec196a687"}',1,0,1766609351502);
INSERT INTO Notification VALUES('b419ad08-87ad-46e2-87ca-90f4f68ddf66','a01153c8-90b3-40f8-aff1-d2939ac18d71','NEW_ORDER_ASSIGNED','Nouvelle demande de dépôt','Jean Dupont demande un dépôt de 15000 FCFA sur 1xBet','{"orderId":"2eb1c2ef-acc8-439c-8b60-431ec196a687","clientName":"Jean Dupont","amount":15000,"type":"DEPOT","bookmaker":"1xBet","paymentMethod":"Flooz (Moov Togo)","clientContact":"+22890999999","referenceId":"145662147"}',0,0,1766609351508);
INSERT INTO Notification VALUES('c639f016-29f1-437d-942a-fab13ac2c79e','f928030d-a83c-446a-ad32-0717cce4db8e','ORDER_STATUS_CHANGED','Commande confirmée','Votre dépôt de 15000 FCFA a été confirmé','{"orderId":"2eb1c2ef-acc8-439c-8b60-431ec196a687"}',1,0,1766610560946);
INSERT INTO Notification VALUES('d4c0c578-2fa2-4c18-92d9-4169171172e3','f928030d-a83c-446a-ad32-0717cce4db8e','ORDER_STATUS_CHANGED','Commande annulée','Votre dépôt a été annulé: Rejetée par le caissier','{"orderId":"dad0010c-8ed3-4b54-9159-de65ae8c1ea6"}',1,0,1766614371228);
INSERT INTO Notification VALUES('b8c66799-f072-4435-a429-aef2c848b66f','f928030d-a83c-446a-ad32-0717cce4db8e','ORDER_STATUS_CHANGED','Dépôt créé','Votre dépôt de 555 FCFA est en cours de traitement','{"orderId":"4439a7f4-b1fc-4930-b104-27fb1df68f5b"}',0,0,1766752546351);
INSERT INTO Notification VALUES('9ddb8f94-fc84-4965-a1e1-a9a1cba245c9','a01153c8-90b3-40f8-aff1-d2939ac18d71','NEW_ORDER_ASSIGNED','Nouvelle demande de dépôt','Jean Dupont demande un dépôt de 555 FCFA sur 1xBet','{"orderId":"4439a7f4-b1fc-4930-b104-27fb1df68f5b","clientName":"Jean Dupont","amount":555,"type":"DEPOT","bookmaker":"1xBet","paymentMethod":"Flooz (Moov Togo)","clientContact":"+22890999999","referenceId":"4444"}',0,0,1766752546361);
INSERT INTO Notification VALUES('627e1b95-5fd1-4aaa-9f0e-0800ff825dc8','f928030d-a83c-446a-ad32-0717cce4db8e','ORDER_STATUS_CHANGED','Retrait créé','Votre retrait de 11111 FCFA est en cours de traitement','{"orderId":"ca041606-be86-4ab9-ba35-4528d66acfc5"}',0,0,1766766266578);
INSERT INTO Notification VALUES('d005372a-07a3-4489-a258-1ffb606896e6','a01153c8-90b3-40f8-aff1-d2939ac18d71','NEW_ORDER_ASSIGNED','Nouvelle demande de retrait','Jean Dupont demande un retrait de 11111 FCFA sur 1xBet','{"orderId":"ca041606-be86-4ab9-ba35-4528d66acfc5","clientName":"Jean Dupont","amount":11111,"type":"RETRAIT","bookmaker":"1xBet","paymentMethod":"Flooz (Moov Togo)","clientContact":"+22890999999","referenceId":"14456"}',0,0,1766766266587);
INSERT INTO Notification VALUES('9ffa0089-a1f2-4a44-9992-58f0374bcfad','a37b7f6d-0c90-481e-b235-263c4bec5973','NEW_MESSAGE','Nouveau message client','Jean Dupont: salut ','{"conversationId":"3ebe7cc7-405c-46d3-9bae-7f2447343b08","messageId":"b3138549-d7c3-437c-8c36-352b94198540","senderId":"f928030d-a83c-446a-ad32-0717cce4db8e"}',0,0,1766766286456);
INSERT INTO Notification VALUES('2d78df19-a208-489f-8a3a-6d49b18c0017','8d5ccb56-1bbe-44df-a882-82c5daf28130','NEW_MESSAGE','Nouveau message client','Jean Dupont: salut ','{"conversationId":"3ebe7cc7-405c-46d3-9bae-7f2447343b08","messageId":"b3138549-d7c3-437c-8c36-352b94198540","senderId":"f928030d-a83c-446a-ad32-0717cce4db8e"}',0,0,1766766286467);
INSERT INTO Notification VALUES('232a9d79-2b8a-480c-b666-a1a270656f6e','d9387d08-e5d6-47b9-9b76-f89e53617e5a','NEW_MESSAGE','Nouveau message client','Jean Dupont: salut ','{"conversationId":"3ebe7cc7-405c-46d3-9bae-7f2447343b08","messageId":"b3138549-d7c3-437c-8c36-352b94198540","senderId":"f928030d-a83c-446a-ad32-0717cce4db8e"}',0,0,1766766286474);
INSERT INTO Notification VALUES('12784048-0dfc-423d-b389-6ec547a519c5','a37b7f6d-0c90-481e-b235-263c4bec5973','NEW_MESSAGE','Nouveau message client','Jean Dupont: salut','{"conversationId":"3ebe7cc7-405c-46d3-9bae-7f2447343b08","messageId":"e3f93c61-0a20-4f2c-a81d-feb88c8e0378","senderId":"f928030d-a83c-446a-ad32-0717cce4db8e"}',0,0,1766766295599);
INSERT INTO Notification VALUES('5dabede3-f62e-411f-afb6-fe1323aa89a4','8d5ccb56-1bbe-44df-a882-82c5daf28130','NEW_MESSAGE','Nouveau message client','Jean Dupont: salut','{"conversationId":"3ebe7cc7-405c-46d3-9bae-7f2447343b08","messageId":"e3f93c61-0a20-4f2c-a81d-feb88c8e0378","senderId":"f928030d-a83c-446a-ad32-0717cce4db8e"}',0,0,1766766295605);
INSERT INTO Notification VALUES('118c10d9-5b8b-4fe6-9714-b30484486bb9','d9387d08-e5d6-47b9-9b76-f89e53617e5a','NEW_MESSAGE','Nouveau message client','Jean Dupont: salut','{"conversationId":"3ebe7cc7-405c-46d3-9bae-7f2447343b08","messageId":"e3f93c61-0a20-4f2c-a81d-feb88c8e0378","senderId":"f928030d-a83c-446a-ad32-0717cce4db8e"}',0,0,1766766295619);
INSERT INTO Notification VALUES('0fc14861-d24b-4590-a291-a2ec18b445e2','a37b7f6d-0c90-481e-b235-263c4bec5973','NEW_MESSAGE','Nouveau message client','Jean Dupont: jjj','{"conversationId":"a7a24fcd-849e-40c0-880d-6c1bdc7d32db","messageId":"f3a166bf-81ac-4aba-a6b4-425849ca0e97","senderId":"f928030d-a83c-446a-ad32-0717cce4db8e"}',0,0,1766766868764);
INSERT INTO Notification VALUES('b77a8573-4b78-4aa8-8823-fc4d9932d796','8d5ccb56-1bbe-44df-a882-82c5daf28130','NEW_MESSAGE','Nouveau message client','Jean Dupont: jjj','{"conversationId":"a7a24fcd-849e-40c0-880d-6c1bdc7d32db","messageId":"f3a166bf-81ac-4aba-a6b4-425849ca0e97","senderId":"f928030d-a83c-446a-ad32-0717cce4db8e"}',0,0,1766766868771);
INSERT INTO Notification VALUES('826d45fc-c613-4d5a-bda4-ab81a9aa5756','d9387d08-e5d6-47b9-9b76-f89e53617e5a','NEW_MESSAGE','Nouveau message client','Jean Dupont: jjj','{"conversationId":"a7a24fcd-849e-40c0-880d-6c1bdc7d32db","messageId":"f3a166bf-81ac-4aba-a6b4-425849ca0e97","senderId":"f928030d-a83c-446a-ad32-0717cce4db8e"}',0,0,1766766868778);
INSERT INTO Notification VALUES('c09cb4fc-938a-4a5c-8d06-d8ee197badd6','a37b7f6d-0c90-481e-b235-263c4bec5973','NEW_MESSAGE','Nouveau message client','Jean Dupont: jjj','{"conversationId":"a7a24fcd-849e-40c0-880d-6c1bdc7d32db","messageId":"aaf6bb16-5866-42b5-aac5-0835d09965cb","senderId":"f928030d-a83c-446a-ad32-0717cce4db8e"}',0,0,1766767230975);
INSERT INTO Notification VALUES('299111a9-b281-4fe0-be82-c6a4cc72c813','8d5ccb56-1bbe-44df-a882-82c5daf28130','NEW_MESSAGE','Nouveau message client','Jean Dupont: jjj','{"conversationId":"a7a24fcd-849e-40c0-880d-6c1bdc7d32db","messageId":"aaf6bb16-5866-42b5-aac5-0835d09965cb","senderId":"f928030d-a83c-446a-ad32-0717cce4db8e"}',0,0,1766767230986);
INSERT INTO Notification VALUES('606aef65-ec00-4561-8e7a-ccd5652d5ce5','d9387d08-e5d6-47b9-9b76-f89e53617e5a','NEW_MESSAGE','Nouveau message client','Jean Dupont: jjj','{"conversationId":"a7a24fcd-849e-40c0-880d-6c1bdc7d32db","messageId":"aaf6bb16-5866-42b5-aac5-0835d09965cb","senderId":"f928030d-a83c-446a-ad32-0717cce4db8e"}',0,0,1766767230994);
INSERT INTO Notification VALUES('edd3c75c-7e96-435b-a69c-88161cda194b','a37b7f6d-0c90-481e-b235-263c4bec5973','NEW_MESSAGE','Nouveau message client','Jean Dupont: bonjour','{"conversationId":"a7a24fcd-849e-40c0-880d-6c1bdc7d32db","messageId":"67b91d37-9534-4e84-966d-b011ecbd935e","senderId":"f928030d-a83c-446a-ad32-0717cce4db8e"}',0,0,1766767409910);
INSERT INTO Notification VALUES('4c165931-f405-46be-a20d-a4e50db8b4c0','8d5ccb56-1bbe-44df-a882-82c5daf28130','NEW_MESSAGE','Nouveau message client','Jean Dupont: bonjour','{"conversationId":"a7a24fcd-849e-40c0-880d-6c1bdc7d32db","messageId":"67b91d37-9534-4e84-966d-b011ecbd935e","senderId":"f928030d-a83c-446a-ad32-0717cce4db8e"}',0,0,1766767409917);
INSERT INTO Notification VALUES('0562a043-5044-4669-9370-ae35a36d34ad','d9387d08-e5d6-47b9-9b76-f89e53617e5a','NEW_MESSAGE','Nouveau message client','Jean Dupont: bonjour','{"conversationId":"a7a24fcd-849e-40c0-880d-6c1bdc7d32db","messageId":"67b91d37-9534-4e84-966d-b011ecbd935e","senderId":"f928030d-a83c-446a-ad32-0717cce4db8e"}',0,0,1766767409925);
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO AuditLog VALUES('e24b7eb5-c5aa-41bc-a866-5022d0f95c23','f928030d-a83c-446a-ad32-0717cce4db8e','CREATE_ORDER','Order','dad0010c-8ed3-4b54-9159-de65ae8c1ea6','{"type":"DEPOT","amount":5000}',NULL,NULL,1766474365217);
INSERT INTO AuditLog VALUES('7209d6ea-ad98-4092-8e9f-e80842109c49','f928030d-a83c-446a-ad32-0717cce4db8e','CREATE_ORDER','Order','2eb1c2ef-acc8-439c-8b60-431ec196a687','{"type":"DEPOT","amount":15000}',NULL,NULL,1766609351513);
INSERT INTO AuditLog VALUES('ac7b6128-6e27-4631-9f15-d63833717cce','a01153c8-90b3-40f8-aff1-d2939ac18d71','UPDATE_ORDER_STATUS','Order','2eb1c2ef-acc8-439c-8b60-431ec196a687','{"oldState":"COMING","newState":"CONFIRMED"}',NULL,NULL,1766610563338);
INSERT INTO AuditLog VALUES('d6e666f2-9a25-44e7-a73f-ecfe2fd4eec6','a01153c8-90b3-40f8-aff1-d2939ac18d71','UPDATE_ORDER_STATUS','Order','dad0010c-8ed3-4b54-9159-de65ae8c1ea6','{"oldState":"COMING","newState":"CANCELLED"}',NULL,NULL,1766614372709);
INSERT INTO AuditLog VALUES('ed84794f-46af-4f9d-89bf-59c102d0f480','f928030d-a83c-446a-ad32-0717cce4db8e','CREATE_ORDER','Order','4439a7f4-b1fc-4930-b104-27fb1df68f5b','{"type":"DEPOT","amount":555}',NULL,NULL,1766752546370);
INSERT INTO AuditLog VALUES('2af578c2-7d7c-4a3b-8ac1-f725fa00e4e3','f928030d-a83c-446a-ad32-0717cce4db8e','CREATE_ORDER','Order','ca041606-be86-4ab9-ba35-4528d66acfc5','{"type":"RETRAIT","amount":11111}',NULL,NULL,1766766266595);
CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Role_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO Permission VALUES('4c8496c4-282f-4a42-870f-9662640a111a','orders.view','Voir les commandes','Permet de voir toutes les commandes','orders',1766481353076,1766481353076);
INSERT INTO Permission VALUES('b381950d-d2f6-4a57-b3d4-fc9be658f1c1','orders.validate','Valider les commandes','Permet de valider les dépôts','orders',1766481353086,1766481353086);
INSERT INTO Permission VALUES('f608cdd7-0f66-4ff8-9a78-f6cded3b10b7','orders.reject','Rejeter les commandes','Permet de rejeter les dépôts','orders',1766481353095,1766481353095);
INSERT INTO Permission VALUES('1b9c3707-97fd-473c-b486-c0a0367b9260','orders.delete','Supprimer les commandes','Permet de supprimer des commandes','orders',1766481353105,1766481353105);
INSERT INTO Permission VALUES('8c46454c-5357-4d28-bdc7-750955516c9e','users.view','Voir les utilisateurs','Permet de voir la liste des utilisateurs','users',1766481353117,1766481353117);
INSERT INTO Permission VALUES('13012175-6e23-4b6c-84a0-520d44418bc1','users.edit','Modifier les utilisateurs','Permet de modifier les profils utilisateurs','users',1766481353125,1766481353125);
INSERT INTO Permission VALUES('552b5305-849a-4579-9458-9adfb7bad1cb','users.ban','Bannir les utilisateurs','Permet de désactiver des comptes','users',1766481353133,1766481353133);
INSERT INTO Permission VALUES('c1c2f024-eede-4f3f-922e-99f0ed4778ab','users.delete','Supprimer les utilisateurs','Permet de supprimer des comptes','users',1766481353138,1766481353138);
INSERT INTO Permission VALUES('dd420f23-e884-4155-bc53-5b45da8039f6','bookmakers.view','Voir les bookmakers','Permet de voir les bookmakers','bookmakers',1766481353150,1766481353150);
INSERT INTO Permission VALUES('86a96406-271d-4c72-ba15-ab91f2f6bf41','bookmakers.create','Créer des bookmakers','Permet d''ajouter des bookmakers','bookmakers',1766481353158,1766481353158);
INSERT INTO Permission VALUES('eb3b6182-136e-47e7-a59b-4c0ea36ea074','bookmakers.edit','Modifier les bookmakers','Permet de modifier les bookmakers','bookmakers',1766481353167,1766481353167);
INSERT INTO Permission VALUES('cbf63596-482e-48a8-9397-edd4b858bfc5','bookmakers.delete','Supprimer les bookmakers','Permet de supprimer des bookmakers','bookmakers',1766481353172,1766481353172);
INSERT INTO Permission VALUES('f8dbc960-729c-4ea5-a9f8-d3f1c332f3df','payment-methods.view','Voir les moyens de paiement','Permet de voir les moyens de paiement','payment-methods',1766481353180,1766481353180);
INSERT INTO Permission VALUES('324764fc-10f6-4196-af6f-9538e4ce8c06','payment-methods.create','Créer des moyens de paiement','Permet d''ajouter des moyens de paiement','payment-methods',1766481353185,1766481353185);
INSERT INTO Permission VALUES('10065c01-5649-4ee4-87cd-c3f62044c1f1','payment-methods.edit','Modifier les moyens de paiement','Permet de modifier les moyens de paiement','payment-methods',1766481353191,1766481353191);
INSERT INTO Permission VALUES('f055a069-1a07-4514-aca2-5744d9833629','payment-methods.delete','Supprimer les moyens de paiement','Permet de supprimer des moyens de paiement','payment-methods',1766481353201,1766481353201);
INSERT INTO Permission VALUES('84c65805-17da-47b1-a509-ab6423d252c0','config.view','Voir la configuration','Permet de voir les paramètres','config',1766481353209,1766481353209);
INSERT INTO Permission VALUES('16012227-a3b4-43d7-955c-0410c6397ab4','config.edit','Modifier la configuration','Permet de modifier les paramètres','config',1766481353215,1766481353215);
INSERT INTO Permission VALUES('d377716a-6d90-4353-abb6-2336749a3cd5','config.theme.view','Voir le thème','Permet de voir le thème actif','config.theme',1766481353224,1766481353224);
INSERT INTO Permission VALUES('a5f0e810-ce60-493d-b18f-a5b7c022874e','config.theme.edit','Modifier le thème','Permet de personnaliser le thème','config.theme',1766481353230,1766481353230);
INSERT INTO Permission VALUES('df91f965-399a-4345-9e8a-79158acc5971','config.ui.view','Voir les composants UI','Permet de voir les composants','config.ui',1766481353238,1766481353238);
INSERT INTO Permission VALUES('f051caaa-14e0-4a28-822f-d6d93f93ff8c','config.ui.edit','Modifier les composants UI','Permet de configurer les composants','config.ui',1766481353244,1766481353244);
INSERT INTO Permission VALUES('b3cac07b-9d09-4077-ac8f-777e7aeff769','newsletters.view','Voir les newsletters','Permet de voir les newsletters','newsletters',1766481353253,1766481353253);
INSERT INTO Permission VALUES('c8eefe87-b12d-4676-be98-7064d5ed0723','newsletters.create','Créer des newsletters','Permet de créer des newsletters','newsletters',1766481353258,1766481353258);
INSERT INTO Permission VALUES('3f9052df-ba23-44e5-9cbf-e35a9cb6035f','newsletters.edit','Modifier les newsletters','Permet de modifier des newsletters','newsletters',1766481353268,1766481353268);
INSERT INTO Permission VALUES('56942b7d-9ab8-438a-8921-126369cfd363','newsletters.publish','Publier les newsletters','Permet de publier des newsletters','newsletters',1766481353274,1766481353274);
INSERT INTO Permission VALUES('d65003f4-00ba-43d0-9f83-36afafa25648','newsletters.delete','Supprimer les newsletters','Permet de supprimer des newsletters','newsletters',1766481353284,1766481353284);
INSERT INTO Permission VALUES('502c3791-6113-4d5a-97ba-acaa92ab926e','chat.view','Voir le chat','Permet de voir les conversations','chat',1766481353291,1766481353291);
INSERT INTO Permission VALUES('5be1d9e3-f016-4635-98f5-ca74bdf42994','chat.moderate','Modérer le chat','Permet de modérer les messages','chat',1766481353298,1766481353298);
INSERT INTO Permission VALUES('5864d412-bdbf-41de-b861-cafcb836103a','chat.delete','Supprimer des messages','Permet de supprimer des messages','chat',1766481353307,1766481353307);
INSERT INTO Permission VALUES('97c4ef19-aa82-4471-84cb-3621871988dd','roles.view','Voir les rôles','Permet de voir les rôles','roles',1766481353313,1766481353313);
INSERT INTO Permission VALUES('2ad94548-80ba-447f-97c1-9f91ada8384d','permissions.view','Voir les permissions','Permet de voir les permissions','permissions',1766481353322,1766481353322);
INSERT INTO Permission VALUES('cb3a16cf-bc87-4342-98a0-cb81ee13a12f','agents.view','Voir les agents','Permet de voir les agents/caissiers','agents',1766481353330,1766481353330);
INSERT INTO Permission VALUES('7b925314-ba97-4c80-b010-06dba7016ade','agents.create','Créer des agents','Permet de créer des agents/caissiers','agents',1766481353338,1766481353338);
INSERT INTO Permission VALUES('f89265cf-f7d0-42c6-9161-174939f6e2b8','agents.edit','Modifier les agents','Permet de modifier les agents/caissiers','agents',1766481353344,1766481353344);
INSERT INTO Permission VALUES('1c9d7faa-4f4e-4120-b5e6-641b7e35cdf5','agents.delete','Supprimer les agents','Permet de supprimer des agents/caissiers','agents',1766481353355,1766481353355);
CREATE TABLE IF NOT EXISTS "RolePermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "UserRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "UIComponentConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "componentType" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "showForCountries" TEXT,
    "showForRoles" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "Newsletter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "targetCountries" TEXT,
    "targetRoles" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "avatar" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationCode" TEXT,
    "emailVerificationCodeExpiresAt" DATETIME,
    "referralCode" TEXT,
    "referredBy" TEXT,
    "referralBalance" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO User VALUES('a37b7f6d-0c90-481e-b235-263c4bec5973','admin@alicebot.com','+22890000001','$2b$10$ourY6dKTUpnd8lAhcS8a0OXVFY8cksCefyC2tBiAHoySYcqW9zVcO','Admin','AliceBot','TG',NULL,1,1,1766767548840,'ADMIN',1,0,0,NULL,NULL,'ADMIN001',NULL,0.0,1766471409534,1766767548841);
INSERT INTO User VALUES('8d5ccb56-1bbe-44df-a882-82c5daf28130','support@alicebot.com','+22890000002','$2b$10$ourY6dKTUpnd8lAhcS8a0OXVFY8cksCefyC2tBiAHoySYcqW9zVcO','Support','Team','TG',NULL,1,0,1766471409542,'SUPPORT',1,0,0,NULL,NULL,NULL,NULL,0.0,1766471409542,1766471409542);
INSERT INTO User VALUES('a01153c8-90b3-40f8-aff1-d2939ac18d71','agent1@alicebot.com','+22890111111','$2b$10$ourY6dKTUpnd8lAhcS8a0OXVFY8cksCefyC2tBiAHoySYcqW9zVcO','Koffi','Agent','TG',NULL,1,1,1766471409551,'AGENT',1,0,0,NULL,NULL,NULL,NULL,0.0,1766471409551,1766471409551);
INSERT INTO User VALUES('57ea0d72-ea92-4ceb-94f6-44743b0da91f','agent2@alicebot.com','+22890222222','$2b$10$ourY6dKTUpnd8lAhcS8a0OXVFY8cksCefyC2tBiAHoySYcqW9zVcO','Awa','Caissier','TG',NULL,1,1,1766471409551,'AGENT',1,0,0,NULL,NULL,NULL,NULL,0.0,1766471409551,1766471409551);
INSERT INTO User VALUES('ec80bd20-cf65-40dc-96cd-0cb6ec0b69ea','agent3@alicebot.com','+22890333333','$2b$10$ourY6dKTUpnd8lAhcS8a0OXVFY8cksCefyC2tBiAHoySYcqW9zVcO','Yao','Agent','BJ',NULL,1,0,1766471409552,'AGENT',1,0,0,NULL,NULL,NULL,NULL,0.0,1766471409552,1766471409552);
INSERT INTO User VALUES('f928030d-a83c-446a-ad32-0717cce4db8e','client@test.com','+22890999999','$2b$10$ourY6dKTUpnd8lAhcS8a0OXVFY8cksCefyC2tBiAHoySYcqW9zVcO','Jean','Dupont','TG',NULL,1,0,1766767480190,'CLIENT',1,0,0,NULL,NULL,'CLIENT001','ALICE2025',1500.0,1766471409576,1766767480191);
INSERT INTO User VALUES('d9387d08-e5d6-47b9-9b76-f89e53617e5a','superadmin@alicebot.com','+22670000000','$2b$10$DKMOAea.CHvMw4qbh/iFtegKuKO17Ln0V1JQ1z43f59wD3xjAF9ZG','Super','Admin','TG',NULL,1,0,1766615573317,'SUPER_ADMIN',1,1,0,NULL,NULL,NULL,NULL,0.0,1766481340650,1766615573318);
CREATE TABLE IF NOT EXISTS "Bookmaker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "countries" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO Bookmaker VALUES('a0d7892a-a30d-4049-8057-5e52870f414a','1xBet','http://localhost:3001/uploads/b4abbf108604dc7cb1a22610332b6c1377.png','["TG","BJ","CI","SN","ML"]',1,1,1766471409309,1766939267508);
INSERT INTO Bookmaker VALUES('1f513fe3-962f-49fd-a348-c9423950ef55','22Bet','http://localhost:3001/assets/bookmakers/22bet.png','["TG","BJ","CI","SN"]',1,2,1766471409310,1766471409310);
INSERT INTO Bookmaker VALUES('23849c8e-51c6-48a2-b97d-cef1d6f8bb26','ParionsSport','http://localhost:3001/assets/bookmakers/parionssport.png','["TG","BJ","CI","SN","ML"]',1,4,1766471409311,1766471409311);
INSERT INTO Bookmaker VALUES('008be861-0cad-4659-b088-ea0dbb776ec0','Betwinner','http://localhost:3001/assets/bookmakers/betwinner.png','["TG","BJ","CI"]',1,3,1766471409311,1766471409311);
CREATE TABLE IF NOT EXISTS "PaymentMethod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "countries" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "ussdTemplate" TEXT,
    "instructions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO PaymentMethod VALUES('ffb78402-8b02-4f2c-9dc7-b405a2300eb2','MOBILE_MONEY','Flooz (Moov Togo)','/assets/payments/flooz.png','["TG"]',1,1,'*155*1*{montant}*{numero}#','Composez le code USSD et suivez les instructions',1766471409348,1766471409348);
INSERT INTO PaymentMethod VALUES('3ac8287e-0480-4831-8f15-f4f2d39c8419','MOBILE_MONEY','TMoney (Togocel)','/assets/payments/tmoney.png','["TG"]',1,2,'*145*1*{montant}*{numero}#','Composez le code USSD et suivez les instructions',1766471409350,1766471409350);
INSERT INTO PaymentMethod VALUES('8ede0ef0-7a10-4d1b-b066-7195fb8262c2','MOBILE_MONEY','MTN Mobile Money','/assets/payments/mtn.png','["BJ","CI","SN"]',1,3,'*133*1*{montant}*{numero}#','Composez le code USSD et suivez les instructions',1766471409349,1766471409349);
INSERT INTO PaymentMethod VALUES('773133e6-014a-4a48-ba54-b6793cfee137','MOBILE_MONEY','Moov Money','/assets/payments/moov.png','["BJ","CI","SN"]',1,4,'*555*1*{montant}*{numero}#','Composez le code USSD et suivez les instructions',1766471409349,1766471409349);
INSERT INTO PaymentMethod VALUES('e26956d6-d1fb-483c-965a-a4dc79487f61','MOBILE_MONEY','Orange Money','/assets/payments/orange.png','["BJ","CI","SN","ML"]',1,5,'*144*1*{montant}*{numero}#','Composez le code USSD et suivez les instructions',1766471409349,1766471409349);
INSERT INTO PaymentMethod VALUES('fb4d0111-bd93-4f3f-86ac-692308b5b51c','BANK','Carte Bancaire (Visa/Mastercard)','/assets/payments/card.png','["TG","BJ","CI","SN","ML"]',1,6,NULL,'Validation manuelle via WhatsApp',1766471409349,1766471409349);
INSERT INTO PaymentMethod VALUES('b0a27ae6-759d-4558-ba83-a5beb8cf86c5','BANK','Virement Bancaire','/assets/payments/bank.png','["TG","BJ","CI","SN","ML"]',1,7,NULL,'Validation manuelle via WhatsApp',1766471409350,1766471409350);
INSERT INTO PaymentMethod VALUES('e6adcd96-ca2d-452e-b51b-0dd0a26020a7','OTHER','Western Union','/assets/payments/western.png','["TG","BJ","CI","SN","ML"]',1,8,NULL,'Contactez le support pour les détails',1766471409350,1766471409350);
CREATE TABLE IF NOT EXISTS "Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "displayType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO Announcement VALUES('8a3748a6-2fb3-4614-a4ad-8f41425c6ab1','1','http://localhost:3001/uploads/announcements/88153410d10a7c10c87464645b738d152eb.jpeg','IMAGE','WhatsApp Image 2025-10-29 at 16.13.05.jpeg',31930,'ONCE',1,1766938901941,1766938901941);
INSERT INTO Announcement VALUES('125eb923-0859-4450-b00c-a321fac2a387','1','http://localhost:3001/uploads/announcements/c1e2adf10cca96102dd1053f652c16322510.png','IMAGE','LOGO.png',21292,'ONCE',1,1766938953301,1766938953301);
CREATE TABLE IF NOT EXISTS "ReferralCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "withdrawalThreshold" REAL NOT NULL DEFAULT 2000,
    "commissionPercent" REAL NOT NULL DEFAULT 5,
    "commissionType" TEXT NOT NULL DEFAULT 'ALL_DEPOSITS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO ReferralCode VALUES('1b6938b2-bb9f-4b33-b22c-24b7c3ea238a','ALICE2025',2000.0,5.0,'ALL_DEPOSITS',1,1766471409302,1766471409302);
INSERT INTO ReferralCode VALUES('0e7b04d4-da64-46a4-bdcf-db981c185e7c','BONUS10',2000.0,10.0,'ALL_DEPOSITS',1,1766471409302,1766471409302);
CREATE TABLE IF NOT EXISTS "ThemeConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "primaryColor" TEXT NOT NULL DEFAULT '#00f0ff',
    "secondaryColor" TEXT NOT NULL DEFAULT '#ff00ff',
    "accentColor" TEXT NOT NULL DEFAULT '#00ff88',
    "backgroundColor" TEXT NOT NULL DEFAULT '#0a0a1f',
    "surfaceColor" TEXT NOT NULL DEFAULT '#1a1a3f',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textSecondary" TEXT NOT NULL DEFAULT '#a0a0ff',
    "glowIntensity" REAL NOT NULL DEFAULT 0.8,
    "animationSpeed" REAL NOT NULL DEFAULT 1.0,
    "particlesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "gradientEnabled" BOOLEAN NOT NULL DEFAULT true,
    "moneyAnimationStyle" TEXT NOT NULL DEFAULT 'rain',
    "moneyColor" TEXT NOT NULL DEFAULT '#ffd700',
    "moneyGlow" BOOLEAN NOT NULL DEFAULT true,
    "logoAnimationType" TEXT NOT NULL DEFAULT 'pulse',
    "logoGlowColor" TEXT NOT NULL DEFAULT '#00f0ff',
    "backgroundType" TEXT NOT NULL DEFAULT 'gradient',
    "backgroundImage" TEXT,
    "backgroundVideo" TEXT,
    "clientBackgroundType" TEXT NOT NULL DEFAULT 'animation',
    "clientBackgroundImage" TEXT,
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter, system-ui',
    "fontSizeBase" INTEGER NOT NULL DEFAULT 16,
    "borderRadius" INTEGER NOT NULL DEFAULT 12,
    "borderGlow" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO ThemeConfig VALUES('32773e23-8b84-4d9f-bc33-a8a6c39f9170','#00f0ff','#ff00ff','#00ff88','#0a0a1f','#193e3c','#ffffff','#a0a0ff',1.0,2.0,1,1,'sparkle','#4400ff',1,'pulse','#00f0ff','waves',NULL,NULL,'image','http://localhost:3001/uploads/fbcd91af74ad1dafb106f9ae4678637d1.png','Inter, system-ui',16,12,1,4,1,1766485653466,1766485653466);
CREATE INDEX "OtpCode_phone_code_idx" ON "OtpCode"("phone", "code");
CREATE UNIQUE INDEX "AppConfig_key_key" ON "AppConfig"("key");
CREATE INDEX "AppConfig_category_idx" ON "AppConfig"("category");
CREATE INDEX "EmployeePaymentMethod_employeeId_idx" ON "EmployeePaymentMethod"("employeeId");
CREATE INDEX "EmployeePaymentMethod_bookmakerId_idx" ON "EmployeePaymentMethod"("bookmakerId");
CREATE INDEX "EmployeePaymentMethod_paymentMethodId_idx" ON "EmployeePaymentMethod"("paymentMethodId");
CREATE INDEX "EmployeePaymentMethod_country_idx" ON "EmployeePaymentMethod"("country");
CREATE INDEX "EmployeePaymentMethod_isActive_idx" ON "EmployeePaymentMethod"("isActive");
CREATE UNIQUE INDEX "EmployeePaymentMethod_employeeId_bookmakerId_paymentMethodId_country_key" ON "EmployeePaymentMethod"("employeeId", "bookmakerId", "paymentMethodId", "country");
CREATE INDEX "Order_clientId_idx" ON "Order"("clientId");
CREATE INDEX "Order_state_idx" ON "Order"("state");
CREATE INDEX "Order_type_idx" ON "Order"("type");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX "BookmakerIdentifier_clientId_idx" ON "BookmakerIdentifier"("clientId");
CREATE UNIQUE INDEX "BookmakerIdentifier_clientId_bookmakerId_key" ON "BookmakerIdentifier"("clientId", "bookmakerId");
CREATE INDEX "ReferralWithdrawal_clientId_idx" ON "ReferralWithdrawal"("clientId");
CREATE INDEX "ReferralWithdrawal_state_idx" ON "ReferralWithdrawal"("state");
CREATE INDEX "ChatConversation_clientId_idx" ON "ChatConversation"("clientId");
CREATE INDEX "ChatConversation_agentId_idx" ON "ChatConversation"("agentId");
CREATE INDEX "ChatConversation_lastMessageAt_idx" ON "ChatConversation"("lastMessageAt");
CREATE INDEX "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");
CREATE UNIQUE INDEX "PushSubscription_userId_endpoint_key" ON "PushSubscription"("userId", "endpoint");
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
CREATE INDEX "Role_name_idx" ON "Role"("name");
CREATE INDEX "Role_isSystem_idx" ON "Role"("isSystem");
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");
CREATE INDEX "Permission_category_idx" ON "Permission"("category");
CREATE INDEX "Permission_code_idx" ON "Permission"("code");
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");
CREATE INDEX "UIComponentConfig_componentType_idx" ON "UIComponentConfig"("componentType");
CREATE INDEX "UIComponentConfig_isVisible_idx" ON "UIComponentConfig"("isVisible");
CREATE UNIQUE INDEX "UIComponentConfig_componentType_key" ON "UIComponentConfig"("componentType");
CREATE INDEX "Newsletter_publishedAt_idx" ON "Newsletter"("publishedAt");
CREATE INDEX "Newsletter_isDraft_idx" ON "Newsletter"("isDraft");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
CREATE INDEX "User_phone_idx" ON "User"("phone");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_referralCode_idx" ON "User"("referralCode");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_isOnline_idx" ON "User"("isOnline");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");
CREATE INDEX "User_isSuperAdmin_idx" ON "User"("isSuperAdmin");
CREATE INDEX "Bookmaker_isActive_idx" ON "Bookmaker"("isActive");
CREATE INDEX "PaymentMethod_type_idx" ON "PaymentMethod"("type");
CREATE INDEX "PaymentMethod_isActive_idx" ON "PaymentMethod"("isActive");
CREATE UNIQUE INDEX "ReferralCode_code_key" ON "ReferralCode"("code");
CREATE INDEX "ThemeConfig_isActive_idx" ON "ThemeConfig"("isActive");
CREATE INDEX "Announcement_isActive_idx" ON "Announcement"("isActive");
CREATE INDEX "Announcement_displayType_idx" ON "Announcement"("displayType");
CREATE INDEX "Announcement_createdAt_idx" ON "Announcement"("createdAt");
COMMIT;
