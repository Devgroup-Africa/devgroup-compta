export const sendInvoiceEmail = async (invoice, recipientEmail, subject, message, pdfBuffer) => {
  try {
    // Import dynamique de nodemailer
    const nodemailer = await import('nodemailer');
    
    // Vérifier que les variables d'environnement sont configurées
    if (!process.env.MAIL_HOST || !process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
      throw new Error('Configuration email incomplète. Veuillez vérifier les variables d\'environnement MAIL_HOST, MAIL_USERNAME et MAIL_PASSWORD.');
    }

    // Configuration du transporteur email avec retry
    const transporter = nodemailer.default.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_PORT === '465', // true pour 465, false pour 587
      auth: {
        user: process.env.MAIL_USERNAME.trim(),
        pass: process.env.MAIL_PASSWORD.trim()
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
      pool: {
        maxConnections: 1,
        maxMessages: 5,
        rateDelta: 2000,
        rateLimit: 5
      }
    });

    // Vérifier la connexion
    await transporter.verify();

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'DevGroup Africa'}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME}>`,
      to: recipientEmail,
      subject: subject || `Facture ${invoice.number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Facture ${invoice.number}</h2>
          <p>${message || 'Veuillez trouver ci-joint votre facture.'}</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Détails de la facture</h3>
            <p><strong>Numéro:</strong> ${invoice.number}</p>
            <p><strong>Date d'émission:</strong> ${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</p>
            <p><strong>Date d'échéance:</strong> ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
            <p><strong>Montant total:</strong> ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(invoice.total)}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Merci pour votre confiance !<br>
            ${process.env.MAIL_FROM_NAME || 'DevGroup Africa'}
          </p>
        </div>
      `,
      attachments: pdfBuffer ? [{
        filename: `Facture_${invoice.number}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }] : []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    // Fermer la connexion
    await transporter.close();
    
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Erreur lors de l'envoi de l'email: ${error.message}`);
  }
};
