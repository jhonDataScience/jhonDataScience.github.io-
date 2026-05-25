document.addEventListener("DOMContentLoaded", () => {
  // Check for native view-timeline support, if not, use IntersectionObserver
  if (!CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px -30px 0px"
    });

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  }

  // JS Fallback for browsers that don't support native scroll-driven animations (header & progress bar)
  if (!CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)')) {
    const header = document.querySelector('header');
    const navContainer = document.querySelector('.nav-container');
    const progressBar = document.getElementById('progress-bar');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

      if (progressBar) {
        progressBar.style.width = `${scrollPercent}%`;
      }

      const progress = Math.min(1, scrollY / 100);
      if (progress > 0) {
        header.style.background = `rgba(3, 3, 3, ${0.75 + progress * 0.1})`;
        header.style.backdropFilter = `blur(${16 + progress * 4}px)`;
        header.style.borderBottomColor = `rgba(0, 229, 255, ${progress * 0.2})`;
        header.style.boxShadow = `0 10px 30px rgba(0, 0, 0, ${progress * 0.5})`;
        navContainer.style.height = `${70 - progress * 15}px`;
      } else {
        header.style.background = '';
        header.style.backdropFilter = '';
        header.style.borderBottomColor = '';
        header.style.boxShadow = '';
        navContainer.style.height = '';
      }
    });
  }

  // Mobile Menu Toggle
  const menuToggle = document.getElementById('mobile-menu');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isActive = menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]:not([data-dialog])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70, // offset for navbar
          behavior: 'smooth'
        });
      }
    });
  });

  // Spotlight Hover Mouse Coordinates
  const spotlightCards = document.querySelectorAll('.bento-card, .project-card');
  spotlightCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Spanish Tax Calculator Calculations
  const calculateCommonTax = (grossIncome) => {
    const brackets = [
      { limit: 12450, rate: 0.19 },
      { limit: 20200, rate: 0.24 },
      { limit: 35200, rate: 0.30 },
      { limit: 60000, rate: 0.37 },
      { limit: 300000, rate: 0.45 },
      { limit: Infinity, rate: 0.47 }
    ];

    const getTaxForBase = (base) => {
      let tax = 0;
      let previousLimit = 0;
      for (let i = 0; i < brackets.length; i++) {
        const { limit, rate } = brackets[i];
        if (base > limit) {
          tax += (limit - previousLimit) * rate;
          previousLimit = limit;
        } else {
          tax += (base - previousLimit) * rate;
          break;
        }
      }
      return tax;
    };

    const socialSecurity = Math.min(grossIncome * 0.0635, 56646 * 0.0635);
    const workDeduction = 2000;
    const taxableBase = Math.max(0, grossIncome - socialSecurity - workDeduction);
    const taxOnBase = getTaxForBase(taxableBase);
    
    const minPersonal = 5550;
    const taxOnMin = getTaxForBase(minPersonal);
    
    return Math.max(0, taxOnBase - taxOnMin);
  };

  const calculateBeckhamTax = (grossIncome) => {
    if (grossIncome <= 600000) {
      return grossIncome * 0.24;
    } else {
      return (600000 * 0.24) + ((grossIncome - 600000) * 0.47);
    }
  };

  // Tax Calculator Slider listener
  const incomeSlider = document.getElementById('income-slider');
  const incomeVal = document.getElementById('income-val');
  const taxCommon = document.getElementById('tax-common');
  const taxBeckham = document.getElementById('tax-beckham');
  const taxSavings = document.getElementById('tax-savings');

  if (incomeSlider && incomeVal && taxCommon && taxBeckham && taxSavings) {
    const formatCurrency = (val) => {
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
    };

    const updateCalculator = () => {
      const income = parseInt(incomeSlider.value, 10);
      incomeVal.textContent = formatCurrency(income);

      const commonTax = calculateCommonTax(income);
      const beckhamTax = calculateBeckhamTax(income);
      const savings = Math.max(0, commonTax - beckhamTax);

      taxCommon.textContent = formatCurrency(commonTax);
      taxBeckham.textContent = formatCurrency(beckhamTax);
      taxSavings.textContent = formatCurrency(savings);

      const savingsContainer = taxSavings.closest('.res-savings');
      if (savings > 0) {
        if (savingsContainer) savingsContainer.classList.add('glow-savings');
      } else {
        if (savingsContainer) savingsContainer.classList.remove('glow-savings');
      }
    };

    incomeSlider.addEventListener('input', updateCalculator);
    updateCalculator(); // init
  }

  // AI Interactive Terminal Console
  const terminalInput = document.getElementById('terminal-input');
  const terminalHistory = document.getElementById('terminal-history');
  const terminalBody = document.getElementById('terminal-body');
  const terminalConsole = document.getElementById('terminal-console');

  let terminalState = {
    step: 'idle'
  };

  if (terminalInput && terminalHistory && terminalBody) {
    if (terminalConsole) {
      terminalConsole.addEventListener('click', () => {
        terminalInput.focus();
      });
    }

    const appendLine = (text, isHtml = false, className = 'ai-line') => {
      const line = document.createElement('div');
      line.className = className;
      if (isHtml) {
        line.innerHTML = text;
      } else {
        line.textContent = text;
      }
      terminalHistory.appendChild(line);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    };

    const processCommand = (rawInput) => {
      const input = rawInput.trim().toLowerCase();
      appendLine(`jonathan@cv:~$ ${rawInput}`);

      if (terminalState.step === 'waiting_fiscal_resident') {
        if (input === 'si' || input === 'sí' || input === 's') {
          appendLine(`[Asistente Fiscal]: Excelentes noticias. La Ley Beckham o el Régimen especial para Nómadas Digitales te permite tributar a un tipo fijo del 24% hasta los 600.000 € de base liquidable.`);
          appendLine(`[Asistente Fiscal]: Puedes simular tu ahorro en tiempo real usando la calculadora fiscal interactiva de la sección anterior.`);
          terminalState.step = 'idle';
        } else if (input === 'no' || input === 'n') {
          appendLine(`[Asistente Fiscal]: Entendido. Tributarás según el régimen general de IRPF progresivo de tu Comunidad Autónoma (tramos de hasta 47%).`);
          appendLine(`[Asistente Fiscal]: Una adecuada planificación contable-fiscal anual con Jonathan Lugo te ayudará a optimizar tus retenciones y aplicar deducciones permitidas.`);
          terminalState.step = 'idle';
        } else {
          appendLine(`Por favor, responde 'si' o 'no'.`);
        }
        appendLine(`&nbsp;`, true);
        return;
      }

      switch (input) {
        case 'ayuda':
        case 'help':
          appendLine(`Comandos disponibles:`);
          appendLine(`  resumen     - Muestra la trayectoria profesional de Jonathan Lugo.`);
          appendLine(`  proyectos   - Lista las soluciones de innovación desarrolladas.`);
          appendLine(`  habilidades - Detalla el ecosistema de herramientas y ERPs.`);
          appendLine(`  educacion   - Muestra la formación y certificaciones.`);
          appendLine(`  fiscal      - Inicia un diagnóstico fiscal express.`);
          appendLine(`  tech        - Detalla el stack tecnológico.`);
          appendLine(`  contacto    - Abre un borrador de correo para agendar una llamada.`);
          appendLine(`  limpiar     - Borra la pantalla de la consola.`);
          appendLine(`  ayuda       - Muestra este menú.`);
          break;
        case 'resumen':
        case 'cv':
          appendLine(`JONATHAN LUGO - Técnico Contable y Fiscal`);
          appendLine(`-----------------------------------------------------`);
          appendLine(`Especialista en contabilidad analítica, auditoría interna, y fiscalidad para no residentes y nómadas digitales.`);
          appendLine(`Experiencia: +15 años liderando departamentos financieros y gestionando carteras de Sociedades y Personas Físicas.`);
          appendLine(`Filosofía: Integrar automatización tecnológica en los procesos financieros tradicionales para máxima fiabilidad.`);
          break;
        case 'proyectos':
        case 'projects':
          appendLine(`PROYECTOS E INNOVACIONES:`);
          appendLine(`-----------------------------------------------------`);
          appendLine(`- ContaSaw: Asistente virtual con IA para auditar y conciliar el PGC.`);
          appendLine(`- Snitch Software: Plataforma de trazabilidad e inmutabilidad (Ley Antifraude).`);
          appendLine(`[Consejo]: Escribe 'contasaw' o 'snitch' para abrir la ventana de detalles en pantalla.`);
          break;
        case 'habilidades':
        case 'skills':
          appendLine(`HABILIDADES & ECOSISTEMA:`);
          appendLine(`-----------------------------------------------------`);
          appendLine(`[Contable/Fiscal]: SAGE, CEGID, A3 Software, Golden Soft, Monitor Informática.`);
          appendLine(`[Tech & Data]    : SQL Server, Access, Excel Avanzado, Power BI, Automatización IA.`);
          appendLine(`[Liderazgo]      : Consolidación de Estados Financieros, Auditoría Interna, Planificación.`);
          break;
        case 'educacion':
        case 'education':
          appendLine(`FORMACIÓN Y CERTIFICACIONES:`);
          appendLine(`-----------------------------------------------------`);
          appendLine(`- Licenciado en Contaduría - Universidad de Oriente (Homologado).`);
          appendLine(`- Cert. Profesionalidad Nivel 3 - Gestión Contable y Adm. Auditoría (SEPE Madrid).`);
          appendLine(`- Cursos Especializados: Fiscalidad de Productos Financieros, Seguridad Social e IRPF.`);
          appendLine(`- Especialización en SEO y Posicionamiento para Asesores (Asesor Excelente).`);
          break;
        case 'contasaw':
          appendLine(`[Sistema]: Abriendo detalles del proyecto ContaSaw...`);
          const dialogContaSaw = document.getElementById('dialog-contasaw');
          if (dialogContaSaw) {
            dialogContaSaw.showModal();
            document.body.style.overflow = 'hidden';
          }
          break;
        case 'snitch':
          appendLine(`[Sistema]: Abriendo detalles del proyecto Snitch Software...`);
          const dialogSnitch = document.getElementById('dialog-snitch');
          if (dialogSnitch) {
            dialogSnitch.showModal();
            document.body.style.overflow = 'hidden';
          }
          break;
        case 'tech':
          appendLine(`STACK TECNOLÓGICO Y HERRAMIENTAS:`);
          appendLine(`-----------------------------------------------------`);
          appendLine(`[Contabilidad/Fiscal]: SAGE, CEGID, A3 Software, Galac Software, Monitor Informática, Golden Soft.`);
          appendLine(`[Análisis y Datos]   : SQL Server, Access, Excel Avanzado (Macros/Formulación Financiera), Power BI.`);
          appendLine(`[Colaboración e IA]  : Notion, Bitrix24, Agentes de IA y automatización de flujos.`);
          break;
        case 'fiscal':
          appendLine(`[Asistente Fiscal]: Iniciando diagnóstico rápido de residencia fiscal...`);
          appendLine(`[Asistente Fiscal]: ¿Eres nómada digital o te has desplazado recientemente a España por motivos laborales? (responde si/no)`);
          terminalState.step = 'waiting_fiscal_resident';
          break;
        case 'contacto':
          appendLine(`[Sistema]: Redirigiendo a cliente de correo (jonathanlugospain@gmail.com)...`);
          setTimeout(() => {
            window.location.href = "mailto:jonathanlugospain@gmail.com?subject=Contacto%20desde%20CV%20Modernizado&body=Hola%20Jonathan,";
          }, 1200);
          break;
        case 'limpiar':
        case 'clear':
          terminalHistory.innerHTML = '';
          break;
        case '':
          break;
        default:
          appendLine(`Comando no reconocido: '${rawInput}'. Escribe 'ayuda' para ver la lista de comandos.`);
      }
      appendLine(`&nbsp;`, true);
    };

    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = terminalInput.value;
        processCommand(val);
        terminalInput.value = '';
      }
    });
  }

  // Project Dialog Modals Control
  const dialogTriggers = document.querySelectorAll('[data-dialog]');
  dialogTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const dialogId = trigger.getAttribute('data-dialog');
      const dialog = document.getElementById(dialogId);
      if (dialog) {
        dialog.showModal();
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeDialogButtons = document.querySelectorAll('[data-close-dialog]');
  closeDialogButtons.forEach(button => {
    button.addEventListener('click', () => {
      const dialog = button.closest('dialog');
      if (dialog) {
        dialog.close();
        document.body.style.overflow = '';
      }
    });
  });

  const dialogs = document.querySelectorAll('dialog');
  dialogs.forEach(dialog => {
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        dialog.close();
        document.body.style.overflow = '';
      }
    });
  });

  // Contact Form Submission, Chips & Feedback
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm && formStatus) {
    // Topic Chips Interaction
    const chips = document.querySelectorAll('.chip-btn');
    const subjectInput = document.getElementById('form-subject');
    
    if (chips.length > 0 && subjectInput) {
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          subjectInput.value = chip.getAttribute('data-value');
          // Dispatch input event to notify CSS validation states (:user-valid / :user-invalid)
          subjectInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
      });
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      formStatus.className = 'form-status';
      formStatus.style.display = 'none';

      // Simulate contact submission
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        formStatus.textContent = '¡Mensaje enviado con éxito! Jonathan se pondrá en contacto contigo pronto.';
        formStatus.style.display = 'block';
        formStatus.classList.add('success');
        
        contactForm.reset();
        chips.forEach(c => c.classList.remove('active'));
        
        setTimeout(() => {
          formStatus.style.display = 'none';
          formStatus.classList.remove('success');
          
          // Auto-close dialog after successful submission
          const contactDialog = document.getElementById('dialog-contact');
          if (contactDialog && contactDialog.hasAttribute('open')) {
            contactDialog.close();
            document.body.style.overflow = '';
          }
        }, 2000);
      }, 1500);
    });
  }

  // Stats Auto-counting Animation
  const statsSection = document.querySelector('.stats');
  const statNumbers = document.querySelectorAll('.stat-number');
  
  if (statsSection && statNumbers.length > 0) {
    const startCounting = () => {
      statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'), 10);
        const suffix = stat.getAttribute('data-suffix') || '';
        let current = 0;
        const duration = 1500;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = target / steps;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            stat.textContent = target + suffix;
            clearInterval(timer);
          } else {
            stat.textContent = Math.floor(current) + suffix;
          }
        }, stepTime);
      });
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounting();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    statsObserver.observe(statsSection);
  }
});
