document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const aiTrigger = document.getElementById('aiTrigger');
    const aiPanel = document.getElementById('aiPanel');
    const closeAi = document.querySelector('.close-ai');
    const sendBtn = document.getElementById('sendBtn');
    const aiInput = document.getElementById('aiInput');
    const chatBody = document.getElementById('chatBody');

    // Bot States: IDLE, TICKET_EMAIL, TICKET_MESSAGE
    let botState = 'IDLE';
    let ticketData = { email: '', message: '' };
    let questionHistory = {}; // Track repeats

    // Toggle AI Panel
    if (aiTrigger) {
        aiTrigger.addEventListener('click', () => {
            if (aiPanel.style.display === 'flex') {
                aiPanel.style.display = 'none';
            } else {
                aiPanel.style.display = 'flex';
                aiInput.focus();
            }
        });
    }

    if (closeAi) {
        closeAi.addEventListener('click', () => {
            aiPanel.style.display = 'none';
        });
    }

    const addMessage = (text, type) => {
        const msg = document.createElement('div');
        msg.className = `msg ${type}`;
        msg.textContent = text;
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    const handleSearch = (query) => {
        const text = query.trim();
        if (!text) return;

        addMessage(text, 'user');
        aiInput.value = '';

        setTimeout(() => {
            processInput(text);
        }, 600);
    };

    const processInput = (text) => {
        const query = text.toLowerCase();

        // Ticket Flow Handling
        if (botState === 'TICKET_EMAIL') {
            if (validateEmail(text)) {
                ticketData.email = text;
                botState = 'TICKET_MESSAGE';
                addMessage("Teşekkürler. Lütfen teknik destek ekibimize iletmek istediğiniz sorunuzu veya mesajınızı detaylıca yazın.", 'ai');
            } else {
                addMessage("Lütfen geçerli bir e-posta adresi giriniz.", 'ai');
            }
            return;
        }

        if (botState === 'TICKET_MESSAGE') {
            ticketData.message = text;
            sendTicket();
            return;
        }

        // Standard Search Logic
        // Check for repeats
        questionHistory[query] = (questionHistory[query] || 0) + 1;

        if (questionHistory[query] > 2) {
            startTicketFlow("Bu soruyu birkaç kez sordunuz. Size daha iyi yardımcı olabilmemiz için sizi teknik destek ekibimize yönlendiriyorum.");
            return;
        }

        const result = findBestMatch(query);
        if (result.isFallback) {
            startTicketFlow("Üzgünüm, bu spesifik konuda sistemimde yeterli bilgi bulunmuyor. Elite destek ekibimizden direkt yardım alabilmeniz için bir bilet (ticket) oluşturabiliriz.");
        } else {
            addMessage(result.answer, 'ai');
        }
    };

    const startTicketFlow = (introMsg) => {
        botState = 'TICKET_EMAIL';
        addMessage(introMsg, 'ai');
        addMessage("Size geri dönüş yapabilmemiz için lütfen e-posta adresinizi yazar mısınız?", 'ai');
    };

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    };

    const sendTicket = () => {
        addMessage("Biletiniz hazırlanıyor...", 'ai');

        // Simulating the email send process
        setTimeout(() => {
            const mailtoLink = `mailto:1.fahri.kaymaz.1@gmail.com?subject=Elite Support Ticket&body=Gonderen: ${ticketData.email}%0D%0AMesaj: ${ticketData.message}`;

            addMessage(`Biletiniz başarıyla oluşturuldu! Bilgileriniz 1.fahri.kaymaz.1@gmail.com adresindeki teknik ekibimize iletildi. En kısa sürede size geri dönüş yapacağız.`, 'ai');

            // Optional: Auto-trigger mailto if you want true interaction, but simulation is safer for showcase
            // window.location.href = mailtoLink;

            // Reset state
            botState = 'IDLE';
            ticketData = { email: '', message: '' };
        }, 1500);
    };

    const findBestMatch = (query) => {
        const kb = window.knowledgeBase || [];
        let bestMatch = null;
        let highestScore = 0;
        const queryWords = query.split(/\s+/);

        kb.forEach(item => {
            let score = 0;
            const questionLower = item.q.toLowerCase();
            if (questionLower === query) score += 15;

            queryWords.forEach(word => {
                if (word.length >= 2) {
                    if (questionLower.includes(word)) score += 5;
                    if (item.a.toLowerCase().includes(word)) score += 1;
                }
            });

            if (score > highestScore) {
                highestScore = score;
                bestMatch = item.a;
            }
        });

        if (highestScore > 3) {
            return { answer: bestMatch, isFallback: false };
        } else {
            return { answer: null, isFallback: true };
        }
    };

    if (sendBtn) sendBtn.addEventListener('click', () => handleSearch(aiInput.value));
    if (aiInput) {
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch(aiInput.value);
        });
    }

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.navbar');
        if (nav) {
            if (window.scrollY > 50) {
                nav.style.padding = '1rem 0';
                nav.style.background = 'rgba(5, 10, 20, 0.95)';
            } else {
                nav.style.padding = '2rem 0';
                nav.style.background = 'rgba(5, 10, 20, 0.7)';
            }
        }
    });

    // Reveal animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.bento-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(40px)';
        item.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        observer.observe(item);
    });
});
