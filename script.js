document.addEventListener('DOMContentLoaded', () => {

    // 0. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            mainNav.classList.toggle('open');
            document.body.style.overflow = mainNav.classList.contains('open') ? 'hidden' : '';
        });
        // Close menu when a nav link is clicked
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                mainNav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // Mobile book button
    const mobileBookBtn = document.getElementById('book-btn-mobile');
    if (mobileBookBtn) {
        mobileBookBtn.addEventListener('click', () => {
            const modal = document.getElementById('consultationModal');
            if (modal) modal.classList.add('show');
            if (mobileToggle) mobileToggle.classList.remove('active');
            if (mainNav) mainNav.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    // 1. Scroll Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        root: null,
        threshold: 0.15, // Trigger when 15% of element is in view
        rootMargin: "0px 0px -50px 0px" // Slightly before the element hits the view 
    };
    
    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once it's revealed for performance, 
                // but if we want it to animate every time, leave it. Let's unobserve for premium feel.
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);
    
    revealElements.forEach(el => revealOnScroll.observe(el));


    // 2. Testimonials Slider Interactions
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    const slider = document.querySelector('.testimonials-slider');

    if (prevBtn && nextBtn && slider) {
        nextBtn.addEventListener('click', () => {
            const firstChild = slider.firstElementChild;
            slider.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            slider.style.transform = `translateX(-190px)`; // roughly card width + gap
            
            setTimeout(() => {
                slider.style.transition = 'none';
                slider.style.transform = 'translate(0)';
                slider.appendChild(firstChild);
            }, 500);
        });

        prevBtn.addEventListener('click', () => {
            const lastChild = slider.lastElementChild;
            slider.insertBefore(lastChild, slider.firstElementChild);
            slider.style.transition = 'none';
            slider.style.transform = `translateX(-190px)`;
            
            setTimeout(() => {
                slider.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                slider.style.transform = 'translate(0)';
            }, 50);
        });
    }

    // 3. Disease Search Engine Logic
    const diseaseSearchInput = document.getElementById('disease-search-input');
    const diseaseResults = document.getElementById('disease-results');
    const alphaBtns = document.querySelectorAll('#alphabet-filter .alpha-btn');
    const diseaseModal = document.getElementById('diseaseModal');
    const closeDiseaseModal = document.getElementById('close-disease-modal');

    function renderDiseases(list) {
        if (!diseaseResults) return;
        
        if (list.length === 0) {
            diseaseResults.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Aucune maladie trouvée pour cette recherche.</p>';
        } else {
            diseaseResults.innerHTML = list.map(d => `
                <div class="disease-result-card" onclick="window.showDiseaseDetail('${d.name}', '${d.category}')">
                    <h4>${d.name}</h4>
                    <span class="category-tag">${d.category}</span>
                </div>
            `).join('');
        }
        diseaseResults.style.display = 'grid';
    }

    window.showDiseaseDetail = (name, category) => {
        document.getElementById('modal-disease-name').textContent = name;
        document.getElementById('modal-disease-category').textContent = category;
        document.getElementById('modal-disease-desc').textContent = `Informations détaillées sur ${name}. Cette condition est classée dans la catégorie ${category.toLowerCase()}. À la Clinique KERTHAN, nous disposons d'intervenants spécialisés pour la prise en charge de cette pathologie.`;
        diseaseModal.classList.add('show');
    };

    if (closeDiseaseModal) {
        closeDiseaseModal.addEventListener('click', () => diseaseModal.classList.remove('show'));
    }

    if (diseaseSearchInput) {
        diseaseSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length > 0) {
                const filtered = window.diseasesData.filter(d => 
                    d.name.toLowerCase().includes(query) || 
                    d.category.toLowerCase().includes(query)
                );
                renderDiseases(filtered);
            } else {
                diseaseResults.style.display = 'none';
            }
        });
    }

    if (alphaBtns) {
        alphaBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const letter = e.target.textContent;
                
                alphaBtns.forEach(b => {
                    b.classList.remove('active-alpha');
                    b.style.backgroundColor = 'transparent';
                    b.style.color = 'var(--primary-dark)';
                });
                
                e.target.style.backgroundColor = 'var(--primary)';
                e.target.style.color = 'var(--white)';
                
                if (diseaseSearchInput) {
                    diseaseSearchInput.value = '';
                    diseaseSearchInput.placeholder = `Maladies commençant par ${letter}...`;
                }

                const filtered = window.diseasesData.filter(d => 
                    d.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().startsWith(letter)
                );
                renderDiseases(filtered);
            });
        });
    }

    // 4. Consultation Modal Logic
    const modal = document.getElementById('consultationModal');
    const heroBookBtn = document.getElementById('hero-book-btn');
    const headerBookBtn = document.getElementById('book-btn');
    const footerBookBtn = document.getElementById('footer-book-btn');
    const closeBtn = document.querySelector('.close-modal');
    const form = document.getElementById('consultationForm');
    const pdfContent = document.getElementById('pdf-content');
    const successMessage = document.getElementById('successMessage');
    const closeSuccessBtn = document.getElementById('closeSuccess');

    // Open Modal Events
    if(heroBookBtn) heroBookBtn.addEventListener('click', () => { modal.classList.add('show'); });
    if(headerBookBtn) headerBookBtn.addEventListener('click', () => { modal.classList.add('show'); });
    if(footerBookBtn) footerBookBtn.addEventListener('click', () => { modal.classList.add('show'); });

    // Close Modal Events
    if(closeBtn) closeBtn.addEventListener('click', () => { modal.classList.remove('show'); });
    if(closeSuccessBtn) closeSuccessBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
            successMessage.style.display = 'none';
            pdfContent.style.display = 'block';
            form.reset();
        }, 300);
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    // Form Submit Event
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const loadingMsg = document.getElementById('loadingMessage');
            if(loadingMsg) loadingMsg.style.display = 'block';

            const patientName = document.getElementById('patientName').value;
            const patientPhone = document.getElementById('patientPhone').value;
            
            try {
                // Generate PDF using html2canvas and jspdf
                const canvas = await html2canvas(document.querySelector('.modal-header'), {
                    scale: 2,
                    backgroundColor: '#ffffff'
                });
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                
                pdf.addImage(imgData, 'PNG', 10, 10, 190, 40);
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(16);
                pdf.text("Informations du Patient", 15, 60);
                
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(12);
                pdf.text(`Nom: ${patientName}`, 15, 75);
                pdf.text(`Age: ${document.getElementById('patientAge').value} ans`, 15, 85);
                pdf.text(`Telephone: ${patientPhone}`, 15, 95);
                pdf.text(`Type: ${document.getElementById('consultationType').value}`, 15, 105);
                pdf.text(`Service: ${document.getElementById('serviceBranch').value}`, 15, 115);
                
                pdf.setFont("helvetica", "bold");
                pdf.text("Motif:", 15, 130);
                pdf.setFont("helvetica", "normal");
                const splitText = pdf.splitTextToSize(document.getElementById('consultationReason').value, 180);
                pdf.text(splitText, 15, 140);
                
                pdf.save(`Fiche_Consultation_${patientName.replace(/ /g, '_')}.pdf`);
                
                // Show success
                if(pdfContent) pdfContent.style.display = 'none';
                if(successMessage) successMessage.style.display = 'block';
                
                // Open WhatsApp
                const whatsappMsg = encodeURIComponent(`Bonjour, je souhaite prendre rendez-vous.\nNom : ${patientName}\nJe viens de télécharger ma fiche de consultation en PDF.`);
                setTimeout(() => {
                    window.open(`https://wa.me/237699999999?text=${whatsappMsg}`, '_blank');
                }, 1500);
            } catch (err) {
                console.error("PDF generation failed", err);
                alert("Erreur lors de la création du PDF. Veuillez réessayer.");
            } finally {
                if(loadingMsg) loadingMsg.style.display = 'none';
            }
        });
    }

    // 5. ScrollSpy Logic for Main Menu
    const sections = document.querySelectorAll('section[id], div[id="contact"]');
    const navLinks = document.querySelectorAll('.main-nav ul li a');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150; // Offset for sticky header
            const sectionId = section.getAttribute('id');
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                current = sectionId;
            }
        });

        // Special case for contact which is at the very bottom
        if ((window.innerHeight + scrollY) >= document.body.offsetHeight - 50) {
            current = 'contact';
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

});
