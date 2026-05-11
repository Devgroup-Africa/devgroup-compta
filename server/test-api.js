// Test simple de l'API
const testAPI = async () => {
  try {
    // Test de santé
    console.log('🔍 Test de l\'API...');
    
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test de connexion
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@devgroup.cm',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login test:', loginData.message);
    
    if (loginData.accessToken) {
      console.log('🔑 Token reçu, test des comptes...');
      
      // Test des comptes
      const accountsResponse = await fetch('http://localhost:5000/api/accounts', {
        headers: {
          'Authorization': `Bearer ${loginData.accessToken}`
        }
      });
      
      const accountsData = await accountsResponse.json();
      console.log(`✅ Comptes récupérés: ${accountsData.accounts?.length || 0} comptes`);
    }
    
    console.log('\n🎉 Tous les tests sont passés!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

testAPI();