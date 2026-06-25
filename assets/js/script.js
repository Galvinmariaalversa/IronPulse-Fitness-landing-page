document.addEventListener('DOMContentLoaded', () => {
    
    // --- Smooth Scrolling with Lenis ---
    let lenis = null;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isReducedMotion && typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.5,
            infinite: false
        });

        // Frame loop
        function raf(time) {
            if (lenis) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
        }
        requestAnimationFrame(raf);
    }

    // --- Cached Offset Navigation & Scroll System ---
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let cachedSections = [];

    function updateSectionOffsets() {
        cachedSections = Array.from(sections).map(section => ({
            id: section.getAttribute('id'),
            top: section.offsetTop,
            height: section.clientHeight
        }));
    }

    // Run cache calculation once and update on window resize (avoid layout thrashing)
    updateSectionOffsets();
    window.addEventListener('resize', updateSectionOffsets, { passive: true });

    // Single unified scroll handler
    function handleScroll(scrollY) {
        // Navbar glass effect
        if (scrollY > 50) {
            navbar.classList.add('glass-nav', 'shadow-lg');
            navbar.classList.remove('bg-transparent', 'py-6');
            navbar.classList.add('bg-dark/90', 'py-3');
        } else {
            navbar.classList.remove('glass-nav', 'shadow-lg', 'bg-dark/90', 'py-3');
            navbar.classList.add('bg-transparent', 'py-6');
        }

        // Back to top button visibility
        if (backToTop) {
            if (scrollY > 300) {
                backToTop.classList.remove('opacity-0', 'pointer-events-none');
                backToTop.classList.add('opacity-100', 'pointer-events-auto');
            } else {
                backToTop.classList.add('opacity-0', 'pointer-events-none');
                backToTop.classList.remove('opacity-100', 'pointer-events-auto');
            }
        }

        // Active Section Highlighting
        let currentSectionId = '';
        // Threshold offset for section entry (150px before screen center/top)
        const thresholdOffset = 150;
        for (let i = 0; i < cachedSections.length; i++) {
            const sectionInfo = cachedSections[i];
            if (scrollY >= (sectionInfo.top - thresholdOffset)) {
                currentSectionId = sectionInfo.id;
            }
        }

        if (currentSectionId) {
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.includes(currentSectionId)) {
                    link.classList.add('active', 'text-brand');
                    link.classList.remove('text-gray-300');
                } else {
                    link.classList.remove('active', 'text-brand');
                    link.classList.add('text-gray-300');
                }
            });
        }
    }

    // Attach unified scroll event
    if (lenis) {
        lenis.on('scroll', (e) => {
            handleScroll(e.scroll);
        });
        // Call immediately for initial state
        handleScroll(lenis.scroll);
    } else {
        window.addEventListener('scroll', () => {
            handleScroll(window.scrollY);
        }, { passive: true });
        handleScroll(window.scrollY);
    }

    // --- Premium Anchor Link Clicks ---
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#' || href === '') return;

            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                const stickyHeaderHeight = 80; // height of compressed glass navbar

                if (lenis) {
                    lenis.scrollTo(targetElement, {
                        offset: -stickyHeaderHeight,
                        duration: 1.2,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                } else {
                    const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - stickyHeaderHeight;
                    window.scrollTo({
                        top: targetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // --- Mobile Menu Toggle ---
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMenu() {
        mobileMenu.classList.toggle('-translate-x-full');
        mobileMenu.classList.toggle('menu-open');
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    // --- Stats Counter Animation ---
    const statsSection = document.getElementById('stats');
    const counters = document.querySelectorAll('.counter');
    let started = false;

    function startCount(el) {
        const target = parseInt(el.dataset.target);
        
        const updateCount = () => {
             // Get the number part only, though initial text is 0+
             // We can just store current count in a variable not dependent on innerText
             // But to follow the prompt's simplicity:
             const count = +el.innerText.replace(/\D/g,'');
             const increment = target / 50; 

             if (count < target) {
                 el.innerText = Math.ceil(count + increment) + "+";
                 setTimeout(updateCount, 40);
             } else {
                 el.innerText = target + "+";
             }
        };
        updateCount();
    }

    const observer = new IntersectionObserver((entries) => {
        if(entries[0].isIntersecting && !started) {
            counters.forEach(counter => {
                counter.innerText = '0+';
                startCount(counter);
            });
            started = true;
        }
    }, { threshold: 0.5 });

    if(statsSection) observer.observe(statsSection);

    // --- Testimonials Slider ---
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prev-testi');
    const nextBtn = document.getElementById('next-testi');
    let currentSlide = 0;

    window.currentSlide = function(index) {
        showSlide(index);
        currentSlide = index;
    }

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active', 'block');
            slide.classList.add('hidden');
            if(dots[i]) {
                dots[i].classList.remove('active', 'bg-brand', 'w-6');
                dots[i].classList.add('bg-gray-600', 'w-2');
            }
        });

        if(slides[index]) {
            slides[index].classList.remove('hidden');
            slides[index].classList.add('active', 'block', 'fade-up', 'visible');
        }
        if(dots[index]) {
            dots[index].classList.remove('bg-gray-600', 'w-2');
            dots[index].classList.add('active', 'bg-brand', 'w-6');
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    if(nextBtn) nextBtn.addEventListener('click', nextSlide);
    if(prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Auto slide
    let slideInterval = setInterval(nextSlide, 4000);

    // Pause on hover
    const sliderContainer = document.querySelector('.testimonial-slider');
    if(sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
        sliderContainer.addEventListener('mouseleave', () => slideInterval = setInterval(nextSlide, 4000));
    }
    
    // Initial show
    if(slides.length > 0) showSlide(0);


    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.fade-up');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));


    // --- Contact Form ---
    const form = document.getElementById('contactForm');
    const toastEl = document.getElementById('successToast');
    
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simple validation
            let valid = true;
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                if(!input.value) {
                    valid = false;
                    input.classList.add('border-red-500');
                } else {
                    input.classList.remove('border-red-500');
                }
            });

            if(valid) {
                 // Initialize Bootstrap Toast if available
                if (typeof bootstrap !== 'undefined') {
                    const toast = new bootstrap.Toast(toastEl);
                    toast.show();
                } else {
                    // Fallback alerts if bootstrap js fails
                    alert('✅ Your message has been sent!');
                }
                
                form.reset();
                
                // Remove error borders
                inputs.forEach(input => input.classList.remove('border-red-500'));
            }
        });
     }

    // --- Weekly Class Schedule Timetable ---
    let currentDay = 'monday';
    let currentCategory = 'all';
    const dayTabs = document.querySelectorAll('.day-tab');
    const catFilters = document.querySelectorAll('.cat-filter');
    const scheduleCards = document.querySelectorAll('.schedule-card');

    function filterSchedule() {
        scheduleCards.forEach(card => {
            const matchDay = card.dataset.day === currentDay;
            const matchCat = currentCategory === 'all' || card.dataset.category === currentCategory;
            if (matchDay && matchCat) {
                card.classList.remove('hidden');
                card.classList.add('fade-up', 'visible');
            } else {
                card.classList.add('hidden');
                card.classList.remove('fade-up', 'visible');
            }
        });
    }

    dayTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            dayTabs.forEach(t => {
                t.classList.remove('bg-brand', 'text-dark', 'border-brand');
                t.classList.add('bg-surface', 'text-gray-300', 'border-white/5', 'hover:border-brand/30');
            });
            tab.classList.remove('bg-surface', 'text-gray-300', 'border-white/5', 'hover:border-brand/30');
            tab.classList.add('bg-brand', 'text-dark', 'border-brand');
            currentDay = tab.dataset.day;
            filterSchedule();
        });
    });

    catFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            catFilters.forEach(f => {
                f.classList.remove('text-brand', 'border-brand');
                f.classList.add('text-gray-400', 'border-transparent', 'hover:text-white');
            });
            filter.classList.remove('text-gray-400', 'border-transparent', 'hover:text-white');
            filter.classList.add('text-brand', 'border-brand');
            currentCategory = filter.dataset.category;
            filterSchedule();
        });
    });

    // --- Class Booking Modal ---
    const bookingModal = document.getElementById('bookingModal');
    const closeBookingModalBtn = document.getElementById('closeBookingModal');
    const bookingForm = document.getElementById('bookingForm');
    const bookingClassName = document.getElementById('bookingClassName');
    const bookingClassTime = document.getElementById('bookingClassTime');

    // Event delegation for "Book Slot" buttons
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('book-class-btn')) {
            const btn = e.target;
            const className = btn.dataset.class;
            const classTime = btn.dataset.time;

            if (bookingClassName) bookingClassName.innerText = className;
            if (bookingClassTime) bookingClassTime.innerText = classTime;

            if (bookingModal) {
                bookingModal.classList.add('show');
            }
        }
    });

    function closeModal() {
        if (bookingModal) bookingModal.classList.remove('show');
        if (bookingForm) bookingForm.reset();
    }

    if (closeBookingModalBtn) {
        closeBookingModalBtn.addEventListener('click', closeModal);
    }

    if (bookingModal) {
        bookingModal.addEventListener('click', (e) => {
            if (e.target === bookingModal) {
                closeModal();
            }
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            closeModal();
            const toastEl = document.getElementById('successToast');
            if (toastEl && typeof bootstrap !== 'undefined') {
                const toast = new bootstrap.Toast(toastEl);
                const toastBody = toastEl.querySelector('.toast-body p');
                if (toastBody) toastBody.innerHTML = 'Your booking is confirmed! We sent details to your phone/email.';
                toast.show();
            } else {
                alert('✅ Class booking confirmed!');
            }
        });
    }

    // --- Before/After Image Slider ---
    const sliderInput = document.getElementById('beforeAfterSlider');
    const afterImgContainer = document.getElementById('after-img-container');
    const sliderHandle = document.getElementById('slider-handle');

    if (sliderInput) {
        sliderInput.addEventListener('input', (e) => {
            const val = e.target.value;
            if (afterImgContainer) {
                afterImgContainer.style.clipPath = `inset(0 0 0 ${val}%)`;
            }
            if (sliderHandle) {
                sliderHandle.style.left = `${val}%`;
            }
        });
    }

    // --- BMI Calculator ---
    const btnMetric = document.getElementById('btn-metric');
    const btnImperial = document.getElementById('btn-imperial');
    const weightLabel = document.getElementById('label-weight');
    const weightInput = document.getElementById('bmi-weight');
    const heightMetricContainer = document.getElementById('height-metric-container');
    const heightImperialContainer = document.getElementById('height-imperial-container');

    const heightCm = document.getElementById('bmi-height-cm');
    const heightFt = document.getElementById('bmi-height-ft');
    const heightIn = document.getElementById('bmi-height-in');

    const btnCalculate = document.getElementById('btn-calculate-bmi');
    const resultCard = document.getElementById('bmi-result-card');
    const scoreSpan = document.getElementById('bmi-score');
    const statusSpan = document.getElementById('bmi-status');
    const gaugeBar = document.getElementById('bmi-gauge-bar');
    const suggestionPara = document.getElementById('bmi-suggestion');

    let activeUnit = 'metric';

    if (btnMetric && btnImperial) {
        btnMetric.addEventListener('click', () => {
            activeUnit = 'metric';
            btnMetric.classList.add('bg-brand', 'text-dark');
            btnMetric.classList.remove('text-gray-400');
            btnImperial.classList.remove('bg-brand', 'text-dark');
            btnImperial.classList.add('text-gray-400');
            
            if (weightLabel) weightLabel.innerText = 'Weight (kg)';
            if (weightInput) weightInput.placeholder = 'e.g. 70';
            if (heightMetricContainer) heightMetricContainer.classList.remove('hidden');
            if (heightImperialContainer) heightImperialContainer.classList.add('hidden');
        });

        btnImperial.addEventListener('click', () => {
            activeUnit = 'imperial';
            btnImperial.classList.add('bg-brand', 'text-dark');
            btnImperial.classList.remove('text-gray-400');
            btnMetric.classList.remove('bg-brand', 'text-dark');
            btnMetric.classList.add('text-gray-400');
            
            if (weightLabel) weightLabel.innerText = 'Weight (lbs)';
            if (weightInput) weightInput.placeholder = 'e.g. 154';
            if (heightMetricContainer) heightMetricContainer.classList.add('hidden');
            if (heightImperialContainer) heightImperialContainer.classList.remove('hidden');
        });
    }

    if (btnCalculate) {
        btnCalculate.addEventListener('click', () => {
            const w = parseFloat(weightInput.value);
            let bmi = 0;

            if (!w || isNaN(w)) {
                alert('Please enter a valid weight.');
                return;
            }

            if (activeUnit === 'metric') {
                const h = parseFloat(heightCm.value) / 100;
                if (!h || isNaN(h)) {
                    alert('Please enter a valid height.');
                    return;
                }
                bmi = w / (h * h);
            } else {
                const ft = parseFloat(heightFt.value) || 0;
                const inches = parseFloat(heightIn.value) || 0;
                const hInches = (ft * 12) + inches;
                if (!hInches || isNaN(hInches)) {
                    alert('Please enter a valid height.');
                    return;
                }
                bmi = (w / (hInches * hInches)) * 703;
            }

            if (bmi > 0) {
                const finalBmi = bmi.toFixed(1);
                if (scoreSpan) scoreSpan.innerText = finalBmi;

                let status = '';
                let statusClass = '';
                let progress = 0;
                let advice = '';

                if (bmi < 18.5) {
                    status = 'Underweight';
                    statusClass = 'bg-blue-500/10 text-blue-400';
                    progress = Math.min((bmi / 18.5) * 30, 30);
                    advice = 'Focus on calorie-dense nutrient-rich meals and strength training to build lean muscle mass. We recommend our Strength Training program with Coach Alex.';
                } else if (bmi >= 18.5 && bmi < 25) {
                    status = 'Healthy Weight';
                    statusClass = 'bg-green-500/10 text-green-400';
                    progress = 30 + ((bmi - 18.5) / 6.5) * 30;
                    advice = 'Great job! You are in the optimal health range. Maintain your fitness with a combination of cardio and functional workouts. Check out our Functional Fitness classes.';
                } else if (bmi >= 25 && bmi < 30) {
                    status = 'Overweight';
                    statusClass = 'bg-yellow-500/10 text-yellow-400';
                    progress = 60 + ((bmi - 25) / 5) * 20;
                    advice = 'Consider a slight caloric deficit and increasing daily cardiovascular activity. Our high-energy Weight Loss (HIIT) programs and Zumba classes are perfect for boosting metabolism!';
                } else {
                    status = 'Obese';
                    statusClass = 'bg-red-500/10 text-red-400';
                    progress = 80 + Math.min(((bmi - 30) / 10) * 20, 20);
                    advice = 'Prioritize aerobic conditioning, portion control, and functional joint protection. We suggest booking a Free Trial with Marcus Lee for direct nutritional and workout planning.';
                }

                if (statusSpan) {
                    statusSpan.innerText = status;
                    statusSpan.className = `px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${statusClass}`;
                }
                
                if (gaugeBar) {
                    gaugeBar.style.width = `${progress}%`;
                    if (bmi < 18.5) {
                        gaugeBar.style.backgroundColor = '#60a5fa';
                    } else if (bmi >= 18.5 && bmi < 25) {
                        gaugeBar.style.backgroundColor = '#D4F011';
                    } else if (bmi >= 25 && bmi < 30) {
                        gaugeBar.style.backgroundColor = '#facc15';
                    } else {
                        gaugeBar.style.backgroundColor = '#ef4444';
                    }
                }
                
                if (suggestionPara) suggestionPara.innerText = advice;
                if (resultCard) resultCard.classList.remove('hidden');
            }
        });
    }

    // --- Pricing Toggle ---
    const pricingToggle = document.getElementById('pricing-toggle');
    const priceVals = document.querySelectorAll('.price-val');
    const priceSubs = document.querySelectorAll('.price-sub');
    const billingMonthlyLabel = document.getElementById('billing-monthly');
    const billingAnnualLabel = document.getElementById('billing-annual');

    if (pricingToggle) {
        pricingToggle.addEventListener('change', () => {
            const isAnnual = pricingToggle.checked;
            
            if (isAnnual) {
                if (billingAnnualLabel) billingAnnualLabel.classList.add('text-brand');
                if (billingAnnualLabel) billingAnnualLabel.classList.remove('text-gray-400');
                if (billingMonthlyLabel) billingMonthlyLabel.classList.remove('text-brand');
                if (billingMonthlyLabel) billingMonthlyLabel.classList.add('text-gray-400');
            } else {
                if (billingMonthlyLabel) billingMonthlyLabel.classList.add('text-brand');
                if (billingMonthlyLabel) billingMonthlyLabel.classList.remove('text-gray-400');
                if (billingAnnualLabel) billingAnnualLabel.classList.remove('text-brand');
                if (billingAnnualLabel) billingAnnualLabel.classList.add('text-gray-400');
            }

            priceVals.forEach(val => {
                const targetPrice = isAnnual ? val.dataset.annual : val.dataset.monthly;
                val.style.transform = 'scale(0.9)';
                val.style.transition = 'transform 0.15s ease';
                setTimeout(() => {
                    val.innerText = targetPrice;
                    val.style.transform = 'scale(1)';
                }, 150);
            });

            priceSubs.forEach(sub => {
                sub.style.opacity = '0';
                sub.style.transition = 'opacity 0.15s ease';
                setTimeout(() => {
                    sub.innerText = isAnnual ? sub.dataset.annual : sub.dataset.monthly;
                    sub.style.opacity = '1';
                }, 150);
            });
        });
    }

    // --- Gallery Lightbox ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeLightboxBtn = document.getElementById('closeLightbox');
    const prevLightboxBtn = document.getElementById('prevLightbox');
    const nextLightboxBtn = document.getElementById('nextLightbox');

    let currentImgIndex = 0;
    const imagesList = [];

    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img) {
            imagesList.push({
                src: img.src,
                alt: img.alt || 'Gym Facility'
            });

            item.addEventListener('click', () => {
                currentImgIndex = index;
                openLightbox(currentImgIndex);
            });
        }
    });

    function openLightbox(index) {
        if (!lightboxModal || !imagesList[index]) return;
        
        if (lightboxImg) lightboxImg.src = imagesList[index].src;
        if (lightboxCaption) lightboxCaption.innerText = imagesList[index].alt;
        lightboxModal.classList.add('show');
    }

    function closeLightbox() {
        if (lightboxModal) {
            lightboxModal.classList.remove('show');
        }
    }

    function nextImage() {
        if (imagesList.length === 0) return;
        currentImgIndex = (currentImgIndex + 1) % imagesList.length;
        if (lightboxImg) lightboxImg.src = imagesList[currentImgIndex].src;
        if (lightboxCaption) lightboxCaption.innerText = imagesList[currentImgIndex].alt;
    }

    function prevImage() {
        if (imagesList.length === 0) return;
        currentImgIndex = (currentImgIndex - 1 + imagesList.length) % imagesList.length;
        if (lightboxImg) lightboxImg.src = imagesList[currentImgIndex].src;
        if (lightboxCaption) lightboxCaption.innerText = imagesList[currentImgIndex].alt;
    }

    if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
    if (nextLightboxBtn) nextLightboxBtn.addEventListener('click', nextImage);
    if (prevLightboxBtn) prevLightboxBtn.addEventListener('click', prevImage);

    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (lightboxModal && lightboxModal.classList.contains('show')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            } else if (e.key === 'ArrowLeft') {
                prevImage();
            }
        }
    });

    // --- FAQ Active State Toggle ---
    const faqAccordion = document.getElementById('faqAccordion');
    if (faqAccordion) {
        faqAccordion.addEventListener('show.bs.collapse', (e) => {
            const item = e.target.closest('.accordion-item-custom');
            if (item) item.classList.add('active-item');
        });
        faqAccordion.addEventListener('hide.bs.collapse', (e) => {
            const item = e.target.closest('.accordion-item-custom');
            if (item) item.classList.remove('active-item');
        });
    }

});
