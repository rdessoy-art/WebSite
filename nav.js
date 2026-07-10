// Shared site navigation.
// Single source of truth for the main nav menu — edit NAV_ITEMS here and
// every page picks up the change. Add a new page by giving it an empty
// <nav id="nav"><ul></ul></nav> and calling renderNav('pageId', false)
// (or true from index.html) after this script loads.
const NAV_ITEMS = [
    { id: 'home', label: 'Home', section: true },
    { id: 'about', label: 'About', section: true },
    { id: 'news', label: 'News', section: true },
    { id: 'events', label: 'Events', href: 'events.html' },
    { id: 'sponsors', label: 'Sponsors', section: true },
    { id: 'merchandise', label: 'Merchandise', href: 'merchandise.html' },
    { id: 'fanclub', label: 'Fan Club', href: 'fanclub.html' },
];

// activePage: id of the current page/section, used to highlight the current item.
// isHome: true on index.html, where Home/About/News/Sponsors scroll to sections
//         via showSection() instead of linking back to index.html.
function renderNav(activePage, isHome) {
    const list = document.querySelector('#nav ul');
    if (!list) return;

    list.innerHTML = NAV_ITEMS.map(item => {
        const classes = [];
        if (isHome && item.section) classes.push('nav-link');
        if (item.id === activePage) classes.push('active');
        const classAttr = classes.length ? ` class="${classes.join(' ')}"` : '';

        const href = item.section
            ? (isHome ? `#${item.id}` : `index.html#${item.id}`)
            : item.href;

        const onclick = item.section
            ? (isHome ? ` onclick="showSection('${item.id}'); closeMenu()"` : ' onclick="closeMenu()"')
            : (isHome ? '' : ' onclick="closeMenu()"');

        return `<li><a href="${href}"${classAttr}${onclick}>${item.label}</a></li>`;
    }).join('');
}

function toggleMenu() {
    const nav = document.getElementById('nav');
    const hamburger = document.querySelector('.hamburger');
    const isOpen = nav.classList.toggle('active');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

function closeMenu() {
    const nav = document.getElementById('nav');
    const hamburger = document.querySelector('.hamburger');
    nav.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
}
