let currentIndex = 0;
        const slides = document.querySelectorAll('.slide');
        const slider = document.getElementById('slider');
        
        function updateSlider() {
            slider.style.transform = `translateX(${-currentIndex * 100}%)`;
        }
        
        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlider();
        }
        
        function prevSlide() {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSlider();
        }
        
        setInterval(nextSlide, 3000); // Auto-slide every 3 seconds