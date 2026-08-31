import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/pages/privacy.scss';

function PrivacyPolicy() {
  const lastUpdate = '31 juin 2026';

  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <h1 className="privacy-title">Politique de confidentialité</h1>
        <p className="privacy-updated">Dernière mise à jour : {lastUpdate}</p>

        <section className="privacy-section">
          <h2>1. Introduction</h2>
          <p>
            Chez Lyamal Beauty's, nous accordons une grande importance à la
            protection de votre vie privée. Cette politique explique quelles
            données personnelles nous collectons, pourquoi, et comment nous les
            utilisons lorsque vous utilisez notre plateforme de réservation de
            services de beauté.
          </p>
        </section>

        <section className="privacy-section">
          <h2>2. Données que nous collectons</h2>
          <p>Lorsque vous utilisez notre site, nous pouvons collecter :</p>
          <ul>
            <li>
              <strong>Informations de compte</strong> : nom, adresse courriel,
              et rôle (client ou professionnel) lors de votre inscription.
            </li>
            <li>
              <strong>Informations de réservation</strong> : services choisis,
              dates, professionnel sélectionné et notes que vous ajoutez.
            </li>
            <li>
              <strong>Données techniques</strong> : informations fournies
              automatiquement par votre navigateur pour assurer le bon
              fonctionnement du service.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>3. Utilisation de vos données</h2>
          <p>Nous utilisons vos données uniquement pour :</p>
          <ul>
            <li>Créer et gérer votre compte utilisateur.</li>
            <li>Traiter et suivre vos réservations.</li>
            <li>
              Mettre en relation les clients et les professionnels de la beauté.
            </li>
            <li>Améliorer la qualité et la sécurité de notre service.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>4. Partage des données</h2>
          <p>
            Nous ne vendons ni ne louons vos données personnelles à des tiers.
            Vos informations de réservation sont partagées uniquement avec le
            professionnel concerné afin d'assurer la prestation du service.
          </p>
        </section>

        <section className="privacy-section">
          <h2>5. Sécurité</h2>
          <p>
            L'authentification et le stockage des comptes sont assurés par des
            services sécurisés (Firebase). Nous mettons en œuvre des mesures
            raisonnables pour protéger vos données contre tout accès non
            autorisé.
          </p>
        </section>

        <section className="privacy-section">
          <h2>6. Vos droits</h2>
          <p>
            Vous pouvez à tout moment accéder à vos informations, les corriger,
            ou demander la suppression de votre compte. Pour toute demande
            relative à vos données, contactez-nous.
          </p>
        </section>

        <section className="privacy-section">
          <h2>7. Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité,
            vous pouvez nous écrire à :{' '}
            <a href="kamahegamal@gmail.com">
              contact@lyamalbeautys.com
            </a>
            .
          </p>
        </section>

        <Link to="/" className="privacy-back">
          ← Retour à l'accueil
        </Link>
      </div>
      <Footer />
    </div>
  );
}

export default PrivacyPolicy;