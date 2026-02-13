export const languages = [
  { code: 'en', name: 'English', region: 'us', flag: '🇺🇸', dir: 'ltr' },
  { code: 'sv', name: 'Svenska', region: 'se', flag: '🇸🇪', dir: 'ltr' },
  { code: 'ar', name: 'العربية', region: 'sa', flag: '🇸🇦', dir: 'rtl' },
  { code: 'fr', name: 'Français', region: 'fr', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', name: 'Español', region: 'es', flag: '🇪🇸', dir: 'ltr' }
];

export const translations = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      back: 'Back',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      next: 'Next',
      done: 'Done',
      continue: 'Continue',
      tryAgain: 'Try Again',
      updatedNow: 'Updated just now'
    },
    nav: {
      home: 'Home',
      history: 'History',
      send: 'Send',
      profile: 'Profile'
    },
    wallet: {
      greeting: 'Good morning,',
      welcomeBack: 'Welcome back,',
      availableBalance: 'Available Balance',
      recentTransactions: 'Recent Transactions',
      seeAll: 'See All',
      noTransactions: 'No transactions yet',
      quickActions: {
        send: 'Send',
        receive: 'Receive',
        scan: 'Scan QR',
        more: 'More'
      }
    },
    history: {
      title: 'Transactions',
      all: 'All',
      received: 'Received',
      sent: 'Sent',
      empty: 'No transactions found',
      complete: 'Complete',
      export: 'Export transactions'
    },
    send: {
      title: 'Send Money',
      who: 'Who are you sending to?',
      phone: 'Phone Number',
      recent: 'Recent',
      enterAmount: 'Enter Amount',
      note: 'Note (optional)',
      notePlaceholder: "What's this for?",
      review: 'Review Transfer',
      confirm: 'Confirm Transfer',
      sending: 'You are sending',
      to: 'to',
      details: {
        to: 'To',
        phone: 'Phone',
        amount: 'Amount',
        fee: 'Fee',
        free: 'Free',
        total: 'Total'
      },
      confirmAndSend: 'Confirm & Send',
      success: 'Transfer Successful!',
      transactionId: 'Transaction ID',
      share: 'Share Receipt',
      available: 'Available balance',
      insufficientFunds: 'Insufficient funds',
      recipient: 'Recipient'
    },
    profile: {
      title: 'Profile',
      account: 'Account',
      personalInfo: 'Personal Information',
      security: 'Security & PIN',
      kyc: 'KYC Status',
      linkedAccounts: 'Linked Accounts',
      bankAccounts: 'Bank Accounts',
      mobileMoney: 'Mobile Money',
      preferences: 'Preferences',
      notifications: 'Notifications',
      darkMode: 'Dark Mode',
      language: 'Language',
      support: 'Support',
      helpCenter: 'Help Center',
      contactSupport: 'Contact Support',
      termsPrivacy: 'Terms & Privacy',
      signOut: 'Sign Out',
      verified: 'Verified',
      comingSoon: 'Coming Soon',
      removePhoto: 'Remove Photo',
      signOutConfirm: 'Are you sure you want to sign out of your account?',
      imageTypeSmall: 'Only JPG, PNG, WEBP, and GIF images are supported.',
      imageSizeSmall: 'Image must be 2 MB or smaller.',
      imageUpdateSuccess: 'Profile photo updated.',
      imageRemoveSuccess: 'Profile photo removed.',
      imageRemoveError: 'Unable to remove image'
    },
    language: {
      title: 'Language',
      select: 'Select Language'
    },
    notifications: {
      title: 'Notifications',
      transactionAlerts: 'Transaction Alerts',
      securityAlerts: 'Security Alerts',
      promoNotifications: 'Promo Notifications',
      updates: 'App Updates'
    },
    receive: {
      title: 'Receive Money',
      instruction: 'Show this QR code to the sender or share your phone number below.',
      share: 'Share Details',
      copied: 'Copied to clipboard!'
    }
  },
  sv: {
    common: {
      save: 'Spara',
      cancel: 'Avbryt',
      back: 'Tillbaka',
      loading: 'Laddar...',
      success: 'Klart',
      error: 'Fel',
      next: 'Nästa',
      done: 'Klar',
      continue: 'Fortsätt',
      tryAgain: 'Försök igen',
      updatedNow: 'Uppdaterad just nu'
    },
    nav: {
      home: 'Hem',
      history: 'Historik',
      send: 'Skicka',
      profile: 'Profil'
    },
    wallet: {
      greeting: 'God morgon,',
      welcomeBack: 'Välkommen tillbaka,',
      availableBalance: 'Tillgängligt saldo',
      recentTransactions: 'Senaste transaktioner',
      seeAll: 'Visa alla',
      noTransactions: 'Inga transaktioner ännu',
      quickActions: {
        send: 'Skicka',
        receive: 'Ta emot',
        scan: 'Skanna QR',
        more: 'Mer'
      }
    },
    history: {
      title: 'Transaktioner',
      all: 'Alla',
      received: 'Mottagna',
      sent: 'Skickade',
      empty: 'Inga transaktioner hittades',
      complete: 'Slutförd',
      export: 'Exportera transaktioner'
    },
    send: {
      title: 'Skicka pengar',
      who: 'Vem skickar du till?',
      phone: 'Telefonnummer',
      recent: 'Senaste',
      enterAmount: 'Ange belopp',
      note: 'Notering (valfritt)',
      notePlaceholder: 'Vad är detta för?',
      review: 'Granska överföring',
      confirm: 'Bekräfta överföring',
      sending: 'Du skickar',
      to: 'till',
      details: {
        to: 'Till',
        phone: 'Telefon',
        amount: 'Belopp',
        fee: 'Avgift',
        free: 'Gratis',
        total: 'Totalt'
      },
      confirmAndSend: 'Bekräfta & skicka',
      success: 'Överföringen lyckades!',
      transactionId: 'Transaktions-ID',
      share: 'Dela kvitto',
      available: 'Tillgängligt saldo',
      insufficientFunds: 'Otillräckliga medel',
      recipient: 'Mottagare'
    },
    profile: {
      title: 'Profil',
      account: 'Konto',
      personalInfo: 'Personuppgifter',
      security: 'Säkerhet & PIN',
      kyc: 'KYC-status',
      linkedAccounts: 'Kopplade konton',
      bankAccounts: 'Bankkonton',
      mobileMoney: 'Mobilpengar',
      preferences: 'Inställningar',
      notifications: 'Aviseringar',
      darkMode: 'Mörkt läge',
      language: 'Språk',
      support: 'Support',
      helpCenter: 'Hjälpcenter',
      contactSupport: 'Kontakta support',
      termsPrivacy: 'Villkor & Integritet',
      signOut: 'Logga ut',
      verified: 'Verifierad',
      comingSoon: 'Kommer snart',
      removePhoto: 'Ta bort bild',
      signOutConfirm: 'Är du säker på att du vill logga ut?',
      imageTypeSmall: 'Endast JPG, PNG, WEBP och GIF-bilder stöds.',
      imageSizeSmall: 'Bilden får vara högst 2 MB.',
      imageUpdateSuccess: 'Profilbilden har uppdaterats.',
      imageRemoveSuccess: 'Profilbilden har tagits bort.',
      imageRemoveError: 'Kunde inte ta bort bilden'
    },
    language: {
      title: 'Språk',
      select: 'Välj språk'
    },
    notifications: {
      title: 'Aviseringar',
      transactionAlerts: 'Transaktionsaviseringar',
      securityAlerts: 'Säkerhetsvarningar',
      promoNotifications: 'Kampanjer',
      updates: 'App-uppdateringar'
    },
    receive: {
      title: 'Ta emot pengar',
      instruction: 'Visa denna QR-kod för avsändaren eller dela ditt telefonnummer nedan.',
      share: 'Dela uppgifter',
      copied: 'Kopierat till urklipp!'
    }
  },
  ar: {
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      back: 'رجوع',
      loading: 'جاري التحميل...',
      success: 'نجاح',
      error: 'خطأ',
      next: 'التالي',
      done: 'تم',
      continue: 'استمرار',
      tryAgain: 'حاول مرة أخرى',
      updatedNow: 'تم التحديث الآن'
    },
    nav: {
      home: 'الرئيسية',
      history: 'السجل',
      send: 'إرسال',
      profile: 'الملف الشخصي'
    },
    wallet: {
      greeting: 'صباح الخير،',
      welcomeBack: 'مرحباً بعودتك،',
      availableBalance: 'الرصيد المتاح',
      recentTransactions: 'أحدث المعاملات',
      seeAll: 'اظهار الكل',
      noTransactions: 'لا توجد معاملات بعد',
      quickActions: {
        send: 'إرسال',
        receive: 'استلام',
        scan: 'مسح QR',
        more: 'المزيد'
      }
    },
    history: {
      title: 'المعاملات',
      all: 'الكل',
      received: 'المستلمة',
      sent: 'المرسلة',
      empty: 'لم يتم العثور على معاملات',
      complete: 'مكتمل',
      export: 'تصدير المعاملات'
    },
    send: {
      title: 'إرسال الأموال',
      who: 'إلى من ترسل؟',
      phone: 'رقم الهاتف',
      recent: 'الأخيرة',
      enterAmount: 'أدخل المبلغ',
      note: 'ملاحظة (اختياري)',
      notePlaceholder: 'ما هو سبب الإرسال؟',
      review: 'مراجعة التحويل',
      confirm: 'تأكيد التحويل',
      sending: 'أنت ترسل',
      to: 'إلى',
      details: {
        to: 'إلى',
        phone: 'الهاتف',
        amount: 'المبلغ',
        fee: 'الرسوم',
        free: 'مجاني',
        total: 'الإجمالي'
      },
      confirmAndSend: 'تأكيد وإرسال',
      success: 'تم التحويل بنجاح!',
      transactionId: 'رقم المعاملة',
      share: 'مشاركة الإيصال',
      available: 'الرصيد المتاح',
      insufficientFunds: 'رصيد غير كافٍ',
      recipient: 'المستلم'
    },
    profile: {
      title: 'الملف الشخصي',
      account: 'الحساب',
      personalInfo: 'المعلومات الشخصية',
      security: 'الأمان وكلمة المرور',
      kyc: 'حالة التحقق',
      linkedAccounts: 'الحسابات المرتبطة',
      bankAccounts: 'الحسابات البنكية',
      mobileMoney: 'المحفظة الإلكترونية',
      preferences: 'التفضيلات',
      notifications: 'التنببهات',
      darkMode: 'الوضع الليلي',
      language: 'اللغة',
      support: 'الدعم',
      helpCenter: 'مركز المساعدة',
      contactSupport: 'اتصل بالدعم',
      termsPrivacy: 'الشروط والخصوصية',
      signOut: 'تسجيل الخروج',
      verified: 'موثق',
      comingSoon: 'قريباً',
      removePhoto: 'إزالة الصورة',
      signOutConfirm: 'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
      imageTypeSmall: 'فقط صور JPG و PNG و WEBP و GIF مدعومة.',
      imageSizeSmall: 'يجب أن تكون الصورة 2 ميجابايت أو أقل.',
      imageUpdateSuccess: 'تم تحديث صورة الملف الشخصي.',
      imageRemoveSuccess: 'تم إزالة صورة الملف الشخصي.',
      imageRemoveError: 'تعذر إزالة الصورة'
    },
    language: {
      title: 'اللغة',
      select: 'اختر اللغة'
    },
    notifications: {
      title: 'التنبيهات',
      transactionAlerts: 'تنبيهات المعاملات',
      securityAlerts: 'تنبيهات الأمان',
      promoNotifications: 'العروض الترويجية',
      updates: 'تحديثات التطبيق'
    },
    receive: {
      title: 'استلام الأموال',
      instruction: 'أظهر رمز QR هذا للمرسل أو شارك رقم هاتفك أدناه.',
      share: 'مشاركة التفاصيل',
      copied: 'تم النسخ إلى الحافظة!'
    }
  },
  fr: {
    common: {
      save: 'Sauvegarder',
      cancel: 'Annuler',
      back: 'Retour',
      loading: 'Chargement...',
      success: 'Succès',
      error: 'Erreur',
      next: 'Suivant',
      done: 'Terminé',
      continue: 'Continuer',
      tryAgain: 'Réessayer',
      updatedNow: 'Mis à jour à l\'instant'
    },
    nav: {
      home: 'Accueil',
      history: 'Historique',
      send: 'Envoyer',
      profile: 'Profil'
    },
    wallet: {
      greeting: 'Bonjour,',
      welcomeBack: 'Bon retour,',
      availableBalance: 'Solde disponible',
      recentTransactions: 'Transactions récentes',
      seeAll: 'Voir tout',
      noTransactions: 'Pas encore de transactions',
      quickActions: {
        send: 'Envoyer',
        receive: 'Recevoir',
        scan: 'Scanner QR',
        more: 'Plus'
      }
    },
    history: {
      title: 'Transactions',
      all: 'Tout',
      received: 'Reçues',
      sent: 'Envoyées',
      empty: 'Aucune transaction trouvée',
      complete: 'Complété',
      export: 'Exporter transactions'
    },
    send: {
      title: 'Envoyer de l\'argent',
      who: 'À qui envoyez-vous?',
      phone: 'Numéro de téléphone',
      recent: 'Récents',
      enterAmount: 'Entrer le montant',
      note: 'Note (optionnel)',
      notePlaceholder: 'C\'est pour quoi?',
      review: 'Réviser le transfert',
      confirm: 'Confirmer le transfert',
      sending: 'Vous envoyez',
      to: 'à',
      details: {
        to: 'À',
        phone: 'Téléphone',
        amount: 'Montant',
        fee: 'Frais',
        free: 'Gratuit',
        total: 'Total'
      },
      confirmAndSend: 'Confirmer & Envoyer',
      success: 'Transfert réussi!',
      transactionId: 'ID de transaction',
      share: 'Partager le reçu',
      available: 'Solde disponible',
      insufficientFunds: 'Fonds insuffisants',
      recipient: 'Destinataire'
    },
    profile: {
      title: 'Profil',
      account: 'Compte',
      personalInfo: 'Informations Personnelles',
      security: 'Sécurité & PIN',
      kyc: 'Statut KYC',
      linkedAccounts: 'Comptes liés',
      bankAccounts: 'Comptes bancaires',
      mobileMoney: 'Mobile Money',
      preferences: 'Préférences',
      notifications: 'Notifications',
      darkMode: 'Mode Sombre',
      language: 'Langue',
      support: 'Assistance',
      helpCenter: 'Centre d\'aide',
      contactSupport: 'Contacter le support',
      termsPrivacy: 'Conditions & Confidentialité',
      signOut: 'Se Déconnecter',
      verified: 'Vérifié',
      comingSoon: 'Bientôt disponible',
      removePhoto: 'Supprimer la photo',
      signOutConfirm: 'Êtes-vous sûr de vouloir vous déconnecter?',
      imageTypeSmall: 'Seules les images JPG, PNG, WEBP et GIF sont supportées.',
      imageSizeSmall: 'L\'image doit faire 2 Mo ou moins.',
      imageUpdateSuccess: 'Photo de profil mise à jour.',
      imageRemoveSuccess: 'Photo de profil supprimée.',
      imageRemoveError: 'Impossible de supprimer l\'image'
    },
    language: {
      title: 'Langue',
      select: 'Choisir la langue'
    },
    notifications: {
      title: 'Notifications',
      transactionAlerts: 'Alertes de transaction',
      securityAlerts: 'Alertes de sécurité',
      promoNotifications: 'Promotions',
      updates: 'Mises à jour'
    },
    receive: {
      title: 'Recevoir de l\'argent',
      instruction: 'Montrez ce code QR à l\'expéditeur ou partagez votre numéro de téléphone ci-dessous.',
      share: 'Partager les détails',
      copied: 'Copié dans le presse-papiers !'
    }
  },
  es: {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      back: 'Volver',
      loading: 'Cargando...',
      success: 'Éxito',
      error: 'Error',
      next: 'Siguiente',
      done: 'Hecho',
      continue: 'Continuar',
      tryAgain: 'Reintentar',
      updatedNow: 'Actualizado ahora'
    },
    nav: {
      home: 'Inicio',
      history: 'Historial',
      send: 'Enviar',
      profile: 'Perfil'
    },
    wallet: {
      greeting: 'Buenos días,',
      welcomeBack: 'Bienvenido,',
      availableBalance: 'Saldo disponible',
      recentTransactions: 'Transacciones recientes',
      seeAll: 'Ver todo',
      noTransactions: 'Aún no hay transacciones',
      quickActions: {
        send: 'Enviar',
        receive: 'Recibir',
        scan: 'Escanear QR',
        more: 'Más'
      }
    },
    history: {
      title: 'Transacciones',
      all: 'Todo',
      received: 'Recibido',
      sent: 'Enviado',
      empty: 'No se encontraron transacciones',
      complete: 'Completado',
      export: 'Exportar transacciones'
    },
    send: {
      title: 'Enviar dinero',
      who: '¿A quién le envías?',
      phone: 'Número de teléfono',
      recent: 'Reciente',
      enterAmount: 'Ingresar monto',
      note: 'Nota (opcional)',
      notePlaceholder: '¿Para qué es esto?',
      review: 'Revisar transferencia',
      confirm: 'Confirmar transferencia',
      sending: 'Estás enviando',
      to: 'a',
      details: {
        to: 'A',
        phone: 'Teléfono',
        amount: 'Monto',
        fee: 'Comisión',
        free: 'Gratis',
        total: 'Total'
      },
      confirmAndSend: 'Confirmar y Enviar',
      success: '¡Transferencia exitosa!',
      transactionId: 'ID de transacción',
      share: 'Compartir recibo',
      available: 'Saldo disponible',
      insufficientFunds: 'Fondos insuficientes',
      recipient: 'Destinatario'
    },
    profile: {
      title: 'Perfil',
      account: 'Cuenta',
      personalInfo: 'Información Personal',
      security: 'Seguridad y PIN',
      kyc: 'Estado KYC',
      linkedAccounts: 'Cuentas vinculadas',
      bankAccounts: 'Cuentas bancarias',
      mobileMoney: 'Dinero móvil',
      preferences: 'Preferencias',
      notifications: 'Notificaciones',
      darkMode: 'Modo Oscuro',
      language: 'Idioma',
      support: 'Soporte',
      helpCenter: 'Centro de ayuda',
      contactSupport: 'Contactar soporte',
      termsPrivacy: 'Términos y Privacidad',
      signOut: 'Cerrar Sesión',
      verified: 'Verificado',
      comingSoon: 'Próximamente',
      removePhoto: 'Eliminar foto',
      signOutConfirm: '¿Estás seguro de que quieres cerrar sesión?',
      imageTypeSmall: 'Solo se admiten imágenes JPG, PNG, WEBP y GIF.',
      imageSizeSmall: 'La imagen debe ser de 2 MB o menos.',
      imageUpdateSuccess: 'Foto de perfil actualizada.',
      imageRemoveSuccess: 'Foto de perfil eliminada.',
      imageRemoveError: 'No se pudo eliminar la imagen'
    },
    language: {
      title: 'Idioma',
      select: 'Seleccionar idioma'
    },
    notifications: {
      title: 'Notificaciones',
      transactionAlerts: 'Alertas de transacción',
      securityAlerts: 'Alertas de seguridad',
      promoNotifications: 'Promociones',
      updates: 'Actualizaciones'
    },
    receive: {
      title: 'Recibir dinero',
      instruction: 'Muestra este código QR al remitente o comparte tu número de teléfono a continuación.',
      share: 'Compartir detalles',
      copied: '¡Copiado al portapapeles!'
    }
  }
};
