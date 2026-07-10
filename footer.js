// Shared site footer.
// Single source of truth for the footer markup — edit here and every page
// picks up the change. Fixes drift that crept in from copy-pasting the
// footer into ~24 files: inconsistent contact email, stale copyright
// years, and orphaned policy pages with no link anywhere pointing at them.
//
// Not used by card/index.html or policies/*.html — those have their own,
// deliberately different footer designs.

const FOOTER_EMAIL = 'Robert@DessoyRacing.com';

// options:
//   withSocial      - show the Instagram/Facebook/YouTube/LinkedIn row (default true)
//   copyrightName   - e.g. "Harrison Dessoy" or "PHR Performance"
//   copyrightSuffix - e.g. "All rights reserved." or "Official Partner of Harrison Dessoy."
function renderFooter(options = {}) {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const withSocial = options.withSocial !== false;
    const copyrightName = options.copyrightName || 'Harrison Dessoy';
    const copyrightSuffix = options.copyrightSuffix || 'All rights reserved.';
    const year = new Date().getFullYear();

    const social = withSocial ? `
        <div class="social-links">
            <a href="https://www.instagram.com/harrison_dessoy55/" title="Instagram" target="_blank" rel="noopener">
                <img src="images/Instagram logo(2).png" alt="Instagram" width="50" height="50">
            </a>
            <a href="https://www.facebook.com/HarrisonDessoy" title="Facebook" target="_blank" rel="noopener">
                <img src="images/Facebook logo.png" alt="Facebook" width="50" height="50">
            </a>
            <a href="https://www.youtube.com/channel/UCco2lC1RzhZFZYTZYMhFdcA" title="YouTube" target="_blank" rel="noopener">
                <img src="images/Youtube_logo.png" alt="YouTube" width="50" height="50">
            </a>
            <a href="https://www.linkedin.com/in/harrisondessoy/" title="LinkedIn" target="_blank" rel="noopener">
                <img src="images/LinkedIn_logo.png" alt="LinkedIn" width="50" height="50">
            </a>
        </div>` : '';

    const contactMargin = withSocial ? 'margin: 1.5rem 0;' : 'margin-bottom: 1rem;';

    footer.innerHTML = `${social}
        <div class="footer-contact" style="${contactMargin}">
            <p style="margin-bottom: 0.3rem;">Website: www.DessoyRacing.com</p>
            <p>Email: <a href="mailto:${FOOTER_EMAIL}?subject=DessoyRacing.com%20website%20enquiry" style="color: var(--light); text-decoration: underline;">${FOOTER_EMAIL}</a></p>
        </div>
        <p>&copy; ${year} ${copyrightName}. ${copyrightSuffix}</p>
        <p>Racing at the Highest Level</p>
        <p style="margin-top: 0.75rem; font-size: 0.8rem; opacity: 0.65;"><a href="policies/privacy-policy.html" style="color: var(--light); text-decoration: underline;">Privacy Policy</a> &middot; <a href="policies/terms-of-service.html" style="color: var(--light); text-decoration: underline;">Terms of Service</a></p>
        <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.75;">Website designed &amp; built by DessoyArt &mdash; for website enquiries or changes, <a href="https://website.dessoy.co.uk" target="_blank" rel="noopener" style="color: var(--light); text-decoration: underline;">get in touch</a>.</p>`;
}
