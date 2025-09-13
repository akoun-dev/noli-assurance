import { test, expect } from '@playwright/test';

test.describe('Sécurité des API', () => {
  test('devrait protéger les endpoints API contre les accès non autorisés', async ({ request }) => {
    // Tenter d'accéder à un endpoint protégé sans token
    const response = await request.get('/api/user/profile');
    
    // Vérifier que l'accès est refusé
    expect(response.status()).toBe(401);
  });

  test('devrait valider les données d\'entrée des formulaires', async ({ request }) => {
    // Envoyer des données invalides au endpoint du formulaire
    const invalidData = {
      nom: '', // Nom vide
      email: 'email-invalide',
      telephone: '123',
      adresse: 'a'.repeat(1000), // Adresse trop longue
    };

    const response = await request.post('/api/formulaire-assure', {
      data: invalidData,
    });

    // Vérifier que la requête est rejetée
    expect(response.status()).toBe(400);
  });

  test('devrait protéger contre les injections SQL', async ({ request }) => {
    // Tenter une injection SQL simple
    const maliciousData = {
      nom: "Robert'); DROP TABLE users; --",
      email: 'test@example.com',
      telephone: '123456789',
      adresse: 'Test Address',
    };

    const response = await request.post('/api/formulaire-assure', {
      data: maliciousData,
    });

    // La requête devrait être rejetée par la validation
    expect([400, 422]).toContain(response.status());
  });

  test('devrait avoir des limites de taux (rate limiting)', async ({ request }) => {
    // Faire plusieurs requêtes rapidement pour tester le rate limiting
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(request.get('/api/health'));
    }

    const responses = await Promise.all(promises);
    const statusCodes = responses.map((r: any) => r.status());

    // Au moins une des requêtes devrait être limitée
    expect(statusCodes).toContain(429);
  });

  test('devrait protéger contre les attaques XSS', async ({ request }) => {
    // Tenter d'injecter du code malveillant
    const xssPayload = {
      nom: '<script>alert("XSS")</script>',
      email: 'test@example.com',
      telephone: '123456789',
      adresse: '<img src="x" onerror="alert(\'XSS\')">',
    };

    const response = await request.post('/api/formulaire-assure', {
      data: xssPayload,
    });

    // La requête devrait être rejetée ou le contenu échappé
    expect([400, 422, 200]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      // Vérifier que le contenu est échappé
      expect(data.nom).not.toContain('<script>');
      expect(data.adresse).not.toContain('<img');
    }
  });

  test('devrait avoir des en-têtes CORS appropriés', async ({ request }) => {
    const response = await request.get('/api/health', {
      headers: {
        'Origin': 'http://malicious-site.com',
      },
    });

    const corsHeader = response.headers()['access-control-allow-origin'];
    
    // Vérifier que l'origine malveillante n'est pas autorisée
    expect(corsHeader).not.toBe('*');
    expect(corsHeader).not.toBe('http://malicious-site.com');
  });
});
