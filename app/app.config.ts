export default defineAppConfig({
  global: {
    picture: {
      dark: 'https://res.cloudinary.com/dlyo71nyt/image/upload/ProfilePicture_heyrii.jpg',
      light: 'https://res.cloudinary.com/dlyo71nyt/image/upload/ProfilePicture_heyrii.jpg',
      alt: 'My profile picture'
    },
    meetingLink: 'https://calendar.app.google/CMNRenLR59hkUjtC6',
    email: 'adhil365@mtroyal.ca',
    available: true
  },
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'neutral'
    },
    pageHero: {
      slots: {
        container: 'py-18 sm:py-24 lg:py-32',
        title: 'mx-auto max-w-xl text-pretty text-3xl sm:text-4xl lg:text-5xl',
        description: 'mt-2 text-md mx-auto max-w-2xl text-pretty sm:text-md text-muted'
      }
    }
  },
  footer: {
    credits: `Built with Nuxt UI • © ${new Date().getFullYear()}`,
    colorMode: false,
    links: [{
      'icon': 'i-simple-icons:linkedin',
      'to': 'https://www.linkedin.com/in/amardeepdhillon/',
      'target': '_blank',
      'aria-label': 'Amardeep on LinkedIn'
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/adhillon192',
      'target': '_blank',
      'aria-label': 'Amardeep on GitHub'
    }, {
      'icon': 'i-simple-icons-discord',
      'to': 'http://discordapp.com/users/269732801295679489',
      'target': '_blank',
      'aria-label': 'Amardeep on Discord'
    }, {
      'icon': 'i-simple-icons-linktree',
      'to': 'https://linktr.ee/adhillon192',
      'target': '_blank',
      'aria-label': 'Amardeep on Linktree'
    }]
  }
})
