/**
 * Templates d'emails professionnels pour les transactions
 */

interface OrderEmailData {
  clientName: string;
  orderType: 'DEPOT' | 'RETRAIT';
  amount: number;
  fees: number;
  bookmakerName: string;
  orderId: string;
  date: string;
  cancellationReason?: string;
  appName?: string;
  appLogo?: string;
}

const getBaseStyles = () => `
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
    .header-success { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
    .header-error { background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
    .header .icon { font-size: 48px; margin-bottom: 10px; }
    .content { padding: 30px; }
    .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
    .message { font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 25px; }
    .details-box { background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #667eea; }
    .details-box-success { border-left-color: #38ef7d; }
    .details-box-error { border-left-color: #f45c43; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6c757d; font-size: 14px; }
    .detail-value { color: #333; font-weight: 600; font-size: 14px; }
    .amount-highlight { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0; }
    .amount-highlight-success { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
    .amount-highlight-error { background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); }
    .amount-highlight .label { font-size: 14px; opacity: 0.9; margin-bottom: 5px; }
    .amount-highlight .value { font-size: 32px; font-weight: 700; }
    .footer { background-color: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef; }
    .footer p { color: #6c757d; font-size: 12px; margin: 5px 0; }
    .footer .app-name { color: #333; font-weight: 600; font-size: 14px; }
    .btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 20px 0; }
    .warning-box { background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0; }
    .warning-box p { color: #856404; margin: 0; font-size: 14px; }
  </style>
`;

export function generateOrderConfirmedEmail(data: OrderEmailData): string {
  const isDeposit = data.orderType === 'DEPOT';
  const transactionType = isDeposit ? 'Dépôt' : 'Retrait';
  const total = data.amount + data.fees;
  const appName = data.appName || 'Notre Plateforme';

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${transactionType} Confirmé</title>
      ${getBaseStyles()}
    </head>
    <body>
      <div class="container">
        <div class="header header-success">
          <div class="icon">&#10004;</div>
          <h1>${transactionType} Confirmé !</h1>
        </div>

        <div class="content">
          <p class="greeting">Bonjour <strong>${data.clientName}</strong>,</p>

          <p class="message">
            Excellente nouvelle ! Votre demande de <strong>${transactionType.toLowerCase()}</strong> a été
            <strong style="color: #38ef7d;">confirmée avec succès</strong>.
          </p>

          <div class="amount-highlight amount-highlight-success">
            <div class="label">Montant ${isDeposit ? 'déposé' : 'retiré'}</div>
            <div class="value">${data.amount.toLocaleString('fr-FR')} FCFA</div>
          </div>

          <div class="details-box details-box-success">
            <h3 style="margin-top: 0; color: #333; font-size: 16px;">Détails de la transaction</h3>

            <div class="detail-row">
              <span class="detail-label">Référence</span>
              <span class="detail-value">#${data.orderId.slice(0, 8).toUpperCase()}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Type</span>
              <span class="detail-value">${transactionType}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Bookmaker</span>
              <span class="detail-value">${data.bookmakerName}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Montant</span>
              <span class="detail-value">${data.amount.toLocaleString('fr-FR')} FCFA</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Frais de service</span>
              <span class="detail-value">${data.fees.toLocaleString('fr-FR')} FCFA</span>
            </div>

            <div class="detail-row" style="background-color: #e8f5e9; margin: 10px -25px -25px; padding: 15px 25px; border-radius: 0 0 8px 8px;">
              <span class="detail-label" style="font-weight: 600; color: #333;">Total</span>
              <span class="detail-value" style="color: #38ef7d; font-size: 18px;">${total.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">${data.date}</span>
          </div>

          <p class="message" style="margin-top: 25px;">
            ${isDeposit
              ? 'Votre compte bookmaker a été crédité. Vous pouvez maintenant placer vos paris !'
              : 'Le montant sera transféré sur votre compte mobile dans les plus brefs délais.'}
          </p>
        </div>

        <div class="footer">
          <p class="app-name">${appName}</p>
          <p>Votre plateforme de confiance pour vos transactions</p>
          <p style="margin-top: 15px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateOrderRejectedEmail(data: OrderEmailData): string {
  const isDeposit = data.orderType === 'DEPOT';
  const transactionType = isDeposit ? 'Dépôt' : 'Retrait';
  const appName = data.appName || 'Notre Plateforme';

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${transactionType} Non Confirmé</title>
      ${getBaseStyles()}
    </head>
    <body>
      <div class="container">
        <div class="header header-error">
          <div class="icon">&#10006;</div>
          <h1>${transactionType} Non Confirmé</h1>
        </div>

        <div class="content">
          <p class="greeting">Bonjour <strong>${data.clientName}</strong>,</p>

          <p class="message">
            Nous sommes désolés de vous informer que votre demande de <strong>${transactionType.toLowerCase()}</strong>
            n'a pas pu être traitée.
          </p>

          <div class="amount-highlight amount-highlight-error">
            <div class="label">Montant demandé</div>
            <div class="value">${data.amount.toLocaleString('fr-FR')} FCFA</div>
          </div>

          ${data.cancellationReason ? `
          <div class="warning-box">
            <p><strong>Raison :</strong> ${data.cancellationReason}</p>
          </div>
          ` : ''}

          <div class="details-box details-box-error">
            <h3 style="margin-top: 0; color: #333; font-size: 16px;">Détails de la demande</h3>

            <div class="detail-row">
              <span class="detail-label">Référence</span>
              <span class="detail-value">#${data.orderId.slice(0, 8).toUpperCase()}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Type</span>
              <span class="detail-value">${transactionType}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Bookmaker</span>
              <span class="detail-value">${data.bookmakerName}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Montant</span>
              <span class="detail-value">${data.amount.toLocaleString('fr-FR')} FCFA</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Date de la demande</span>
              <span class="detail-value">${data.date}</span>
            </div>
          </div>

          <p class="message" style="margin-top: 25px;">
            Si vous pensez qu'il s'agit d'une erreur ou si vous avez des questions,
            n'hésitez pas à contacter notre service client via l'application.
          </p>

          <p class="message">
            Vous pouvez soumettre une nouvelle demande à tout moment.
          </p>
        </div>

        <div class="footer">
          <p class="app-name">${appName}</p>
          <p>Votre plateforme de confiance pour vos transactions</p>
          <p style="margin-top: 15px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateOrderEmail(
  state: 'CONFIRMED' | 'CANCELLED',
  data: OrderEmailData
): string {
  if (state === 'CONFIRMED') {
    return generateOrderConfirmedEmail(data);
  }
  return generateOrderRejectedEmail(data);
}
