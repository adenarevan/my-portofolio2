import { useState, useEffect } from 'react';

// Icons as simple SVG components
const CodeIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const ReactIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const ApiIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

// Data
const services = [
  {
    icon: <CodeIcon />,
    title: 'Web Application Development',
    description: 'Full-stack web applications built with modern technologies, optimized for performance, security, and scalability.',
  },
  {
    icon: <ReactIcon />,
    title: 'React & Frontend Development',
    description: 'Interactive, responsive user interfaces using React, Next.js, and modern frontend frameworks with clean architecture.',
  },
  {
    icon: <ApiIcon />,
    title: 'Backend Integration (API)',
    description: 'RESTful and GraphQL API development, third-party integrations, and robust backend solutions for your applications.',
  },
  {
    icon: <RefreshIcon />,
    title: 'System Modernization',
    description: 'Legacy system migration, codebase modernization, and technology stack upgrades to improve maintainability.',
  },
];

const projects = [
  {
    title: 'Sistem Pengelolaan Database Jalan Daerah',
    description: 'A comprehensive ERP system for manufacturing companies with inventory management, production planning, and financial reporting modules.',
    techStack: ['React', 'Laravel', 'Mysql', 'Docker'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
  },
  {
    title: 'Healthcare Management Platform',
    description: 'Patient management system with appointment scheduling, medical records, and billing integration for healthcare providers.',
    techStack: ['Next.js', 'TypeScript', 'MongoDB', 'GCP'],
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
  },
  {
    title: 'E-Commerce Marketplace',
    description: 'Multi-vendor marketplace with real-time inventory, payment processing, and advanced analytics dashboard.',
    techStack: ['React', 'Express', 'MySQL', 'Redis'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
  },
  {
    title: 'Government Document Portal',
    description: 'Secure document management and workflow automation system for government institutions with role-based access control.',
    techStack: ['Vue.js', 'Laravel', 'PostgreSQL', 'Docker'],
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop',
  },
];

const whyChooseMe = [
  { title: 'Clean Code', description: 'Well-structured, documented, and maintainable codebase' },
  { title: 'Scalable Architecture', description: 'Solutions designed to grow with your business' },
  { title: 'Professional Communication', description: 'Clear updates and responsive collaboration' },
  { title: 'On-time Delivery', description: 'Committed to meeting deadlines and milestones' },
  { title: 'Real-world Experience', description: 'Proven track record with enterprise clients' },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CTO, TechVentures Inc.',
    content: 'Delivered exceptional work on our platform migration. Professional, thorough, and ahead of schedule.',
  },
  {
    name: 'Michael Chen',
    role: 'Product Manager, DataFlow',
    content: 'Outstanding technical skills combined with excellent communication. A true professional.',
  },
];

const trustedBy = [
  'Tech Innovations Ltd.',
  'Global Systems Corp.',
  'DataFlow Solutions',
  'Enterprise Partners',
];

// Navigation Component
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#portfolio', label: 'Portfolio' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#" className={`text-xl font-bold transition-colors ${
            isScrolled ? 'text-slate-900' : 'text-white'
          }`}>
            DevPortfolio
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-emerald-500 ${
                  isScrolled ? 'text-slate-600' : 'text-white/90'
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Hire Me
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 ${isScrolled ? 'text-slate-900' : 'text-white'}`}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-slate-600 hover:text-emerald-500 font-medium"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center px-5 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Hire Me
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Hero Section
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
    </div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
      <div className="max-w-3xl">
        <p className="text-emerald-400 font-medium mb-4 animate-fade-in-up opacity-0">
          Software Engineer & Web Developer
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in-up opacity-0 animation-delay-200">
          Building reliable, scalable, and modern web applications
        </h1>
        <p className="text-lg text-slate-300 mb-8 max-w-2xl animate-fade-in-up opacity-0 animation-delay-400">
          I help businesses and institutions transform their ideas into production-ready software solutions. 
          From concept to deployment, I deliver clean, maintainable code that scales.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up opacity-0 animation-delay-600">
          <a
            href="#portfolio"
            className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-emerald-500/25"
          >
            View Portfolio
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-all hover:border-white/40"
          >
            Hire Me
          </a>
        </div>
      </div>
    </div>

    {/* Scroll Indicator */}
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
      <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
        <div className="w-1 h-2 bg-white/50 rounded-full"></div>
      </div>
    </div>
  </section>
);

// About Section
const AboutSection = () => (
  <section id="about" className="py-20 lg:py-32 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            About Me
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              I&apos;m a software engineer with <strong className="text-slate-900">5+ years of experience</strong> building 
              web applications for startups, enterprises, and government institutions. My focus is on creating 
              solutions that are not just functional, but maintainable, scalable, and built to last.
            </p>
            <p>
              I specialize in <strong className="text-slate-900">React and modern JavaScript frameworks</strong> on 
              the frontend, paired with robust backend technologies like Node.js, PostgreSQL, and cloud services. 
              I take pride in writing clean, well-documented code and delivering projects on time.
            </p>
            <p>
              Whether you need a complete web application from scratch, API integrations, or modernization of 
              existing systems, I approach every project with professionalism and attention to detail.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm">
              JavaScript / TypeScript
            </div>
               <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm">
              Laravel/CI3
            </div>
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm">
              React / Next.js
            </div>
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm">
              Node.js
            </div>
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm">
              MySQL / PostgreSQL
            </div>
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm">
              GCP / Docker
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl overflow-hidden">
            <img
            src="/src/assets/gua.jpeg"
              alt="Professional headshot"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-emerald-500 text-white p-6 rounded-xl shadow-xl">
            <div className="text-3xl font-bold">5+</div>
            <div className="text-emerald-100 text-sm">Years Experience</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Services Section
const ServicesSection = () => (
  <section id="services" className="py-20 lg:py-32 bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
          Services
        </h2>
        <p className="text-slate-600">
          Comprehensive development services tailored to your business needs, 
          from initial concept to production deployment.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="group bg-white p-8 rounded-xl border border-slate-200 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              {service.icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              {service.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Portfolio Section
const PortfolioSection = () => (
  <section id="portfolio" className="py-20 lg:py-32 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
          Featured Projects
        </h2>
        <p className="text-slate-600">
          A selection of projects that showcase my expertise in building 
          production-ready applications for real-world use cases.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {projects.map((project, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="aspect-video overflow-hidden bg-slate-100">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 lg:p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {project.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {project.techStack.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
              >
                View Project <ExternalLinkIcon />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Why Choose Me Section
const WhyChooseMeSection = () => (
  <section className="py-20 lg:py-32 bg-slate-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Why Choose Me
          </h2>
          <p className="text-slate-400 mb-10 max-w-lg">
            I bring a combination of technical expertise and professional approach 
            that ensures your project is delivered successfully.
          </p>
          <div className="space-y-6">
            {whyChooseMe.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <CheckIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-8 lg:p-10">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-emerald-400 mb-2">50+</div>
              <div className="text-slate-400 text-sm">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-emerald-400 mb-2">30+</div>
              <div className="text-slate-400 text-sm">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-emerald-400 mb-2">5+</div>
              <div className="text-slate-400 text-sm">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-emerald-400 mb-2">99%</div>
              <div className="text-slate-400 text-sm">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Testimonials Section
const TestimonialsSection = () => (
  <section className="py-20 lg:py-32 bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
          Client Testimonials
        </h2>
        <p className="text-slate-600">
          What clients say about working with me on their projects.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-xl border border-slate-200"
          >
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <p className="text-slate-600 mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>
            <div>
              <div className="font-semibold text-slate-900">{testimonial.name}</div>
              <div className="text-slate-500 text-sm">{testimonial.role}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-slate-500 text-sm mb-6">Trusted by companies including</p>
        <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
          {trustedBy.map((company, index) => (
            <div key={index} className="text-slate-400 font-semibold text-lg">
              {company}
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// CTA Section
const CTASection = () => (
  <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-600 to-emerald-700">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
        Ready to Start Your Project?
      </h2>
      <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
        Let&apos;s discuss how I can help bring your ideas to life. Whether you need a 
        complete web application or technical consultation, I&apos;m here to help.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="#contact"
          className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-all hover:translate-y-[-2px] hover:shadow-lg"
        >
          Let&apos;s Work Together
        </a>
        <a
          href="#portfolio"
          className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
        >
          View My Work
        </a>
      </div>
    </div>
  </section>
);

// Contact Section
const ContactSection = () => (
  <section id="contact" className="py-20 lg:py-32 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Get In Touch
          </h2>
          <p className="text-slate-600 mb-8 max-w-lg">
            Have a project in mind or want to discuss potential opportunities? 
            I&apos;d love to hear from you. Choose your preferred method of contact below.
          </p>

          <div className="space-y-4">
            <a
              href="mailto:adeanrevan@gmail.com"
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <EmailIcon />
              </div>
              <div>
                <div className="font-medium text-slate-900">Email</div>
                <div className="text-slate-500 text-sm">adenarevan@gmail.com</div>
              </div>
            </a>

            <a
              href="https://wa.me/089612142465"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                <WhatsAppIcon />
              </div>
              <div>
                <div className="font-medium text-slate-900">WhatsApp</div>
                <div className="text-slate-500 text-sm">089612142465</div>
              </div>
            </a>

            <a
              href="https://linkedin.com/in/adena-reis-vanrika-0bb104187/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <LinkedInIcon />
              </div>
              <div>
                <div className="font-medium text-slate-900">LinkedIn</div>
                <div className="text-slate-500 text-sm">linkedin.com/in/adena-reis-vanrika-0bb104187/</div>
              </div>
            </a>

            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <GitHubIcon />
              </div>
              <div>
                <div className="font-medium text-slate-900">GitHub</div>
                <div className="text-slate-500 text-sm">github.com/adenarevan</div>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-8 lg:p-10">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">
            Send a Message
          </h3>
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                placeholder="Tell me about your project..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full px-6 py-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="bg-slate-900 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <div className="text-xl font-bold text-white mb-1">DevPortfolio</div>
          <p className="text-slate-400 text-sm">
            Building digital solutions that make a difference.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/adenarevan"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors"
          >
            <GitHubIcon />
          </a>
          <a
            href="https://linkedin.com/in/adenarevan"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors"
          >
            <LinkedInIcon />
          </a>
          <a
            href="mailto:adenarevan@gmail.com"
            className="w-10 h-10 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors"
          >
            <EmailIcon />
          </a>
        </div>
      </div>

      <div className="border-t border-slate-800 mt-8 pt-8 text-center">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} DevPortfolio. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

// Main Landing Page Component
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <PortfolioSection />
      <WhyChooseMeSection />
      <TestimonialsSection />
      <CTASection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
