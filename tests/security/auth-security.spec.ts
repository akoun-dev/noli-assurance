import { test, expect } from '@playwright/test';

test.describe('Sécurité de l\'authentification', () => {
  test('devrait protéger les routes protégées', async ({ page }) => {
    // Tenter d'accéder à une route protégée sans être connecté
    await page.goto('/dashboard');
    
    // Vérifier que l'utilisateur est redirigé vers la page de connexion
    await expect(page).toHaveURL(/\/(auth\/)?signin/);
  });

  test('devrait avoir des en-têtes de sécurité', async ({ page }) => {
    const response = await page.goto('/');
    
    if (response) {
      const headers = response.headers();
      
      // Vérifier les en-têtes de sécurité
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['referrer-policy']).toMatch(/origin-when-cross-origin|strict-origin-when-cross-origin/);
    }
  });

  test('devrait protéger contre les attaques CSRF', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Vérifier que le formulaire contient un token CSRF
    const csrfToken = await page.locator('input[name="csrfToken"]').count();
    expect(csrfToken).toBeGreaterThan(0);
  });

  test('devrait valider les entrées du formulaire de connexion', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Soumettre le formulaire avec des entrées invalides
    await page.fill('input[type="email"]', 'email-invalide');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    
    // Vérifier que le formulaire n'est pas soumis et qu'il y a des erreurs de validation
    await expect(page.locator('.text-destructive')).toBeVisible();
  });

  test('devrait avoir une politique de mots de passe sécurisée', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Tenter de s'inscrire avec un mot de passe faible
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    
    // Vérifier que l'inscription échoue
    await expect(page.locator('.text-destructive')).toBeVisible();
  });
});
