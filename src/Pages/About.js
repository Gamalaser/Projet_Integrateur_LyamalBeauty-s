
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaHeart, FaStar, FaAward, FaUsers, FaCalendar, FaGem } from 'react-icons/fa';
import '../styles/pages/about.scss';

function About() {
  const { t } = useTranslation();
  
  // Animation au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">
      {/* Background Image Fixe */}
      <div className="about-background"></div>
      <div className="about-overlay"></div>

      {/* Hero Section */}
      <section className="about-hero fade-in">
        <div className="hero-content">
          <h1 className="hero-title">{t('about.hero.title')}</h1>
          <div className="hero-divider"></div>
          <p className="hero-subtitle">
            {t('about.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="about-section fade-in">
        <div className="section-container">
          <div className="glass-card">
            <div className="card-icon">
              <FaHeart />
            </div>
            <h2 className="section-title">{t('about.story.title')}</h2>
            <p className="section-text">
              {t('about.story.paragraph1')}
            </p>
            <p className="section-text">
              {t('about.story.paragraph2')}
            </p>
          </div>
        </div>
      </section>

      {/* Notre Mission */}
      <section className="about-section fade-in">
        <div className="section-container">
          <div className="glass-card">
            <div className="card-icon">
              <FaGem />
            </div>
            <h2 className="section-title">{t('about.mission.title')}</h2>
            <p className="section-text">
              {t('about.mission.paragraph1')}
            </p>
            <p className="section-text">
              {t('about.mission.paragraph2')}
            </p>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="about-section fade-in">
        <div className="section-container">
          <h2 className="section-title-large">{t('about.values.title')}</h2>
          <div className="values-grid">
            <div className="value-card glass-card">
              <div className="value-icon">
                <FaStar />
              </div>
              <h3 className="value-title">{t('about.values.excellence.title')}</h3>
              <p className="value-text">
                {t('about.values.excellence.text')}
              </p>
            </div>

            <div className="value-card glass-card">
              <div className="value-icon">
                <FaHeart />
              </div>
              <h3 className="value-title">{t('about.values.passion.title')}</h3>
              <p className="value-text">
                {t('about.values.passion.text')}
              </p>
            </div>

            <div className="value-card glass-card">
              <div className="value-icon">
                <FaAward />
              </div>
              <h3 className="value-title">{t('about.values.innovation.title')}</h3>
              <p className="value-text">
                {t('about.values.innovation.text')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chiffres Clés */}
      <section className="about-section fade-in">
        <div className="section-container">
          <h2 className="section-title-large">{t('about.stats.title')}</h2>
          <div className="stats-grid">
            <div className="stat-card glass-card">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-number">10,000+</div>
              <div className="stat-label">{t('about.stats.clients')}</div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon">
                <FaCalendar />
              </div>
              <div className="stat-number">12+</div>
              <div className="stat-label">{t('about.stats.years')}</div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon">
                <FaAward />
              </div>
              <div className="stat-number">25+</div>
              <div className="stat-label">{t('about.stats.awards')}</div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon">
                <FaStar />
              </div>
              <div className="stat-number">4.9/5</div>
              <div className="stat-label">{t('about.stats.rating')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Notre Équipe */}
      <section className="about-section fade-in">
        <div className="section-container">
          <div className="glass-card team-card">
            <h2 className="section-title">{t('about.team.title')}</h2>
            <p className="section-text">
              {t('about.team.text')}
            </p>
            <Link to="/team" className="btn-team">
              {t('about.team.button')}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="about-cta fade-in">
        <div className="cta-container">
          <div className="glass-card cta-card">
            <h2 className="cta-title">{t('about.cta.title')}</h2>
            <p className="cta-text">
              {t('about.cta.text')}
            </p>
            <Link to="/booking" className="btn-cta-about">
              {t('about.cta.button')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;