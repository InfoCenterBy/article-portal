if (document.querySelector('.slider-event__wrapper')) {
	new Swiper('.slider-event__wrapper', {
		observer: true,
		watchOverflow: true,
		observeParents: true,
		slidesPerView: 1,
		parallax: true,
		spaceBetween: 24,
		speed: 800,
		mousewheel: {
			sensitive: 1
		},
		navigation: {
			nextEl: '.event-control-next',
			prevEl: '.event-control-prev',
		},
		breakpoints: {
			565: {
				slidesPerView: 2,
			},
			992: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 4,
			},
		},
	});
}
if (document.querySelector('.slider-webinars__wrapper')) {
	new Swiper('.slider-webinars__wrapper', {
		observer: true,
		watchOverflow: true,
		observeParents: true,
		slidesPerView: 1,
		parallax: true,
		spaceBetween: 24,
		speed: 800,
		mousewheel: {
			sensitive: 1
		},
		navigation: {
			nextEl: '.webinar-control-next',
			prevEl: '.webinar-control-prev',
		},
		breakpoints: {
			// 565: {
			// 	slidesPerView: 2,
			// },
			// 992: {
			// 	slidesPerView: 3,
			// },
			// 1400: {
			// 	slidesPerView: 4,
			// },
		},
	});
}
