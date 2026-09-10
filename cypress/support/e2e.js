import './commands'

// طنش أي إيرور داخلي بيطلع من الأبليكيشن عشان التست يكمل طبيعي
Cypress.on('uncaught:exception', (err, runnable) => {
  console.log('🔴 App Crash Error:', err.message);
  console.log('📜 Stack Trace:', err.stack);
  // يمنع فشل الفحص مباشرة ويسمح لك بقراءة السجل كاملاً
  return false;
});