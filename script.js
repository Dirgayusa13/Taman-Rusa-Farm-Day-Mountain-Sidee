document.addEventListener('DOMContentLoaded', function() {

    //1. EFEK MENGETIK (TYPEWRITER) PADA HEADLINE //
    const typeHeadline = document.getElementById('typewriterHeadline');
    const textToType = "Mountain Side";
    let isDeleting = false;
    let charIndex = 0;
    const typingSpeed = 150;
    const deletingSpeed = 80;
    const pauseAfterTyping = 2500;
    const pauseWhenEmpty = 500;

    const typeWriterLoop = () => {
        const currentText = textToType.substring(0, charIndex);
        typeHeadline.textContent = currentText;
        if (!isDeleting && charIndex < textToType.length) {
            charIndex++;
            setTimeout(typeWriterLoop, typingSpeed);
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
            setTimeout(typeWriterLoop, deletingSpeed);
        } else if (!isDeleting && charIndex === textToType.length) {
            isDeleting = true;
            setTimeout(typeWriterLoop, pauseAfterTyping);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            setTimeout(typeWriterLoop, pauseWhenEmpty);
        }
    };
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setTimeout(typeWriterLoop, 1000);
    } else {
        typeHeadline.textContent = textToType;
        typeHeadline.classList.remove('typewriter-cursor');
    }

    // 2. EFEK PARALLAX PADA HERO SECTION, Gambar latar bergerak lebih lambat dari scroll
    const heroParallax = document.querySelector('.hero-parallax');
    window.addEventListener('scroll', () => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const scrolled = window.pageYOffset;
            heroParallax.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });

    // 3. SCROLL REVEAL Menambahkan class 'active' saat elemen masuk ke area pandang layar
    const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -100px 0px' };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, observerOptions);
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Animasi denyut pada tombol explore setelah 3 detik
    setTimeout(function() {
        var exploreBtn = document.getElementById('exploreBtn');
        if (exploreBtn) exploreBtn.classList.add('pulse-animation');
    }, 3000);

    // 4. NAVIGASI GALERI Mengontrol scrolling horizontal pada slider foto
    const container = document.getElementById('galleryContainer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (container && prevBtn && nextBtn) {
        const getScrollAmount = () => container.offsetWidth > 768 ? 452 : 350;
        nextBtn.addEventListener('click', () => {
            container.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });
        prevBtn.addEventListener('click', () => {
            container.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });
    }

    // 5. HIGHLIGHT NAVBAR AKTIF Mengubah warna menu navbar berdasarkan section yang sedang dibaca
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const highlightNav = () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= (sectionTop - 250)) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', highlightNav);

    // 6. TOGGLE MENU MOBILE Membuka menu navigasi untuk tampilan layar HP
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('open');
        });
        // Menutup menu jika user klik di luar area menu
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('open');
            }
        });
    }

    // 7. SISTEM KERANJANG TIKET & PEMBAYARAN Logika menambah item, menghitung total, dan menampilkan QRIS
    var cart = [];
    var hargaTiket = 15000;
    var addToCartBtn = document.getElementById('addToCartBtn');
    var viewCartBtn = document.getElementById('viewCartBtn');
    var cartCountSpan = document.getElementById('cartCount');
    var cartModal = document.getElementById('cartModal');
    var cartModalClose = document.getElementById('cartModalClose');
    var cartItemsContainer = document.getElementById('cartItems');
    var cartTotalSpan = document.getElementById('cartTotal');
    var confirmCartBtn = document.getElementById('confirmCartBtn');
    var clearCartBtn = document.getElementById('clearCartBtn');

    // Fungsi mendapatkan metode pembayaran terpilih
    function getSelectedPayment() {
        var selected = document.querySelector('input[name="paymentMethodCart"]:checked');
        return selected ? selected.value : 'QRIS';
    }

    // Fungsi update QRIS dinamis (membuat QR Code via API)
    function updateQRISDisplay() {
        var qrisDisplay = document.getElementById('qrisDisplay');
        var qrisImage = document.getElementById('qrisImage');
        var qrisTotal = document.getElementById('qrisTotal');
        var selected = getSelectedPayment();
        var total = cart.reduce(function(sum, item) { return sum + (item.price * item.quantity); }, 0);
        if (selected === 'QRIS' && cart.length > 0) {
            qrisDisplay.style.display = 'block';
            var dataQR = 'QRIS|FarmDay|' + total + '|' + Date.now();
            qrisImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(dataQR);
            qrisTotal.textContent = 'Rp ' + total.toLocaleString('id-ID');
        } else {
            qrisDisplay.style.display = 'none';
        }
    }

    // Fungsi merender daftar barang di keranjang
    function renderCartItems() {
        if (!cartItemsContainer) return;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; color: var(--outline); padding: 20px 0;">Keranjang Anda kosong.</p>';
            cartTotalSpan.textContent = 'Rp 0';
            return;
        }
        var html = '';
        var total = 0;
        cart.forEach(function(item, index) {
            var subtotal = item.price * item.quantity;
            total += subtotal;
            html += `
                <div class="cart-item" data-index="${index}">
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')} / org</span>
                    </div>
                    <div class="cart-item-qty">
                        <button class="cart-decrease" data-index="${index}">−</button>
                        <span>${item.quantity}</span>
                        <button class="cart-increase" data-index="${index}">+</button>
                    </div>
                    <button class="cart-item-remove" data-index="${index}">✕</button>
                </div>
            `;
        });
        cartItemsContainer.innerHTML = html;
        cartTotalSpan.textContent = 'Rp ' + total.toLocaleString('id-ID');

        // Event listener untuk tombol +/- dan hapus di dalam keranjang
        document.querySelectorAll('.cart-increase').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var idx = parseInt(this.dataset.index);
                cart[idx].quantity += 1;
                updateCartUI();
            });
        });
        document.querySelectorAll('.cart-decrease').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var idx = parseInt(this.dataset.index);
                if (cart[idx].quantity > 1) {
                    cart[idx].quantity -= 1;
                } else {
                    cart.splice(idx, 1);
                }
                updateCartUI();
            });
        });
        document.querySelectorAll('.cart-item-remove').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var idx = parseInt(this.dataset.index);
                cart.splice(idx, 1);
                updateCartUI();
            });
        });
    }
// Fungsi memperbarui UI keranjang
    function updateCartUI() {
        var totalItems = cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
        cartCountSpan.textContent = totalItems;
        if (totalItems > 0) {
            viewCartBtn.style.display = 'block';
        } else {
            viewCartBtn.style.display = 'none';
        }
        renderCartItems();
        updateQRISDisplay();
    }

    function openCartModal() {
        cartModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        renderCartItems();
        updateQRISDisplay();
    }

    function closeCartModal() {
        cartModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            var existing = cart.find(function(item) { return item.name === 'Tiket Masuk'; });
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ name: 'Tiket Masuk', price: hargaTiket, quantity: 1 });
            }
            updateCartUI();
            this.innerHTML = '<span class="material-symbols-outlined" style="font-size:20px;">check</span> Ditambahkan!';
            setTimeout(function() {
                addToCartBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:20px;">add_shopping_cart</span> Tambah ke Keranjang';
            }, 1500);
        });
    }

    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', openCartModal);
    }
    if (cartModalClose) {
        cartModalClose.addEventListener('click', closeCartModal);
    }
    cartModal.addEventListener('click', function(e) {
        if (e.target === cartModal) closeCartModal();
    });
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (cart.length === 0) return;
            if (confirm('Yakin ingin mengosongkan keranjang?')) {
                cart = [];
                updateCartUI();
            }
        });
    }

    // Radio button payment method
    document.querySelectorAll('input[name="paymentMethodCart"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            updateQRISDisplay();
        });
    });

    // 8. TICKET GENERATOR (CANVAS) Menggambar struk tiket digital di atas elemen <canvas>
    function generateTicket(orderData) {
        return new Promise(function(resolve) {
            var canvas = document.getElementById('ticketCanvas');
            var ctx = canvas.getContext('2d');
            var width = 600,
                height = 800;
            canvas.width = width;
            canvas.height = height;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = '#154212';
            ctx.lineWidth = 8;
            ctx.strokeRect(20, 20, width - 40, height - 40);

            ctx.font = 'italic 48px "Dancing Script", cursive';
            ctx.fillStyle = '#154212';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText('Farm Day', width / 2, 60);

            ctx.font = 'bold 28px "Montserrat", sans-serif';
            ctx.fillStyle = '#805533';
            ctx.textBaseline = 'top';
            ctx.fillText('Mountain Side', width / 2, 110);

            ctx.beginPath();
            ctx.moveTo(60, 170);
            ctx.lineTo(width - 60, 170);
            ctx.strokeStyle = '#154212';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]);
            ctx.stroke();
            ctx.setLineDash([]);

            var yPos = 210;
            ctx.font = 'bold 18px "Inter", sans-serif';
            ctx.fillStyle = '#154212';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText('📋 Detail Tiket', 50, yPos);
            yPos += 40;

            ctx.font = '15px "Inter", sans-serif';
            ctx.fillStyle = '#333';
            orderData.items.forEach(function(item) {
                var line = item.name + ' × ' + item.quantity + ' = Rp ' + (item.price * item.quantity).toLocaleString('id-ID');
                ctx.fillText(line, 50, yPos);
                yPos += 30;
            });

            yPos += 10;
            ctx.font = 'bold 20px "Inter", sans-serif';
            ctx.fillStyle = '#154212';
            ctx.textAlign = 'right';
            ctx.fillText('Total: Rp ' + orderData.total.toLocaleString('id-ID'), width - 50, yPos);

            yPos += 50;
            ctx.textAlign = 'left';
            ctx.font = '15px "Inter", sans-serif';
            ctx.fillStyle = '#666';
            ctx.fillText('💳 Metode: ' + orderData.paymentMethod, 50, yPos);

            yPos += 30;
            var now = new Date();
            var dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            var timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            ctx.fillText('📅 ' + dateStr + ' • ' + timeStr, 50, yPos);

            yPos += 50;
            ctx.font = 'bold 14px "Inter", sans-serif';
            ctx.fillStyle = '#805533';
            var orderId = 'FD-' + String(Math.floor(100000 + Math.random() * 900000));
            ctx.fillText('🔑 Kode Booking: ' + orderId, 50, yPos);

            ctx.font = '12px "Inter", sans-serif';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('Nikmati liburan keluarga di Farm Day Mountain Side', width / 2, height - 50);
            ctx.fillText('Jl. Wan Abdurrahman, Sumber Agung, Kemiling, Pesawaran, Lampung', width / 2, height - 30);

            resolve(canvas);
        });
    }

    // Fungsi unduh tiket sebagai file gambar
    function downloadTicket() {
        var canvas = document.getElementById('ticketCanvas');
        if (!canvas) return;
        var link = document.createElement('a');
        link.download = 'Tiket_FarmDay_' + new Date().toISOString().slice(0, 10) + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    if (confirmCartBtn) {
        var newConfirmBtn = confirmCartBtn.cloneNode(true);
        confirmCartBtn.parentNode.replaceChild(newConfirmBtn, confirmCartBtn);
        confirmCartBtn = newConfirmBtn;

        confirmCartBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('Keranjang Anda kosong. Tambahkan tiket terlebih dahulu.');
                return;
            }
            var total = cart.reduce(function(sum, item) { return sum + (item.price * item.quantity); }, 0);
            var metode = getSelectedPayment();
            var totalItems = cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);

            var orderData = {
                items: cart.map(function(item) { return { name: item.name, quantity: item.quantity, price: item.price }; }),
                total: total,
                paymentMethod: metode,
                totalItems: totalItems
            };

            closeCartModal();
            cart = [];
            updateCartUI();

            var successModal = document.getElementById('successModal');
            successModal.classList.add('open');
            document.body.style.overflow = 'hidden';

            generateTicket(orderData).then(function() {
                // selesai
            });
        });
    }

    var successModal = document.getElementById('successModal');
    var successCloseBtn = document.getElementById('successCloseBtn');
    var successModalClose = document.getElementById('successModalClose');
    var downloadBtn = document.getElementById('downloadTicketBtn');

    if (successCloseBtn) {
        successCloseBtn.addEventListener('click', function() {
            successModal.classList.remove('open');
            document.body.style.overflow = '';
        });
    }
    if (successModalClose) {
        successModalClose.addEventListener('click', function() {
            successModal.classList.remove('open');
            document.body.style.overflow = '';
        });
    }
    successModal.addEventListener('click', function(e) {
        if (e.target === successModal) {
            successModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadTicket);
    }

    updateCartUI();

    console.log('✅ Farm Day Mountain Side — semua fitur berjalan!');

    // 9. VALIDASI FORMULIR KONTAK Memastikan input pengguna tidak kosong dan format email benar
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Mencegah form langsung terkirim/reload

            let isValid = true;
            
            // Ambil elemen input
            const nameInput = document.getElementById('contactName');
            const emailInput = document.getElementById('contactEmail');
            const msgInput = document.getElementById('contactMessage');
            
            // Ambil elemen pesan error
            const nameError = document.getElementById('nameError');
            const emailError = document.getElementById('emailError');
            const msgError = document.getElementById('msgError');

            // Reset pesan error setiap kali tombol diklik
            nameError.style.display = 'none';
            emailError.style.display = 'none';
            msgError.style.display = 'none';

            // 1. Validasi Kolom Nama (Tidak boleh kosong)
            if (nameInput.value.trim() === '') {
                nameError.style.display = 'block';
                isValid = false;
            }

            // 2. Validasi Kolom Email (Tidak kosong, harus ada '@' dan '.')
            const emailVal = emailInput.value.trim();
            if (emailVal === '' || !emailVal.includes('@') || !emailVal.includes('.')) {
                emailError.style.display = 'block';
                isValid = false;
            }

            // 3. Validasi Kolom Pesan (Tidak boleh kosong)
            if (msgInput.value.trim() === '') {
                msgError.style.display = 'block';
                isValid = false;
            }

            // Jika semua kolom diisi dengan benar
            if (isValid) {
                alert('Pesan berhasil terkirim! Terima kasih telah menghubungi pihak Farm Day.');
                contactForm.reset(); // Kosongkan form kembali
            }
        });
    }

    // 10. TOMBOL BACK TO TOP Mengarahkan pengguna kembali ke bagian paling atas halaman dengan mulus
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            // Menggunakan window.scrollY untuk akurasi posisi pixel guliran layar
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});