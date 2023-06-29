// burger menu
const burger = document.querySelector(".burger");
const menu = document.querySelector(".header-menu");
const headerBottom = document.querySelector(".header-bottom");
const wrapper = document.querySelector(".wrapper");
const body = document.querySelector("body");
const buttonSubmenu = document.querySelectorAll(".menu-header__button");
const submenu = document.querySelectorAll(".submenu-header");
const main = document.querySelector("main");
const footer = document.querySelector("footer");
const btnsDropdown = document.querySelectorAll(".btn-dropdown");

// const showOverlay = () => {
//   body.classList.add("_lock");
//   wrapper.classList.add("_overlay");
// };

// const hideOverlay = () => {
//   body.classList.remove("_lock");
//   wrapper.classList.remove("_overlay");
// };

// const showMenu = () => {
//   burger.classList.add("_active");
//   menu.classList.add("_active");
//   body.classList.add("_lock");
//   wrapper.classList.add("_overlay");
//   headerBottom.classList.add("_header-menu-open");
//   main.classList.add("_header-menu-open");
//   footer.classList.add("_header-menu-open");
// };

// const closeMenu = () => {
//   burger.classList.remove("_active");
//   menu.classList.remove("_active");
//   headerBottom.classList.remove("_header-menu-open");
//   main.classList.remove("_header-menu-open");
//   footer.classList.remove("_header-menu-open");
//   buttonSubmenu.forEach((item) => {
//     item.classList.add("collapsed");
//   });
//   submenu.forEach((item) => {
//     item.classList.remove("show");
//   });
// };

if (burger) {
  burger.addEventListener("click", () => {
    if (!burger.classList.contains("_active")) {
      showOverlay();
      showMenu();
    } else {
      hideOverlay();
      closeMenu();
    }
  });
}
if (btnsDropdown) {
  btnsDropdown.forEach((btn) => {
    btn.addEventListener("click", () => {
      console.log("click");
      if (btn.classList.contains("show")) {
        showOverlay();
      } else {
        hideOverlay();
      }
    });
  });
}

// document.addEventListener("click", (e) => {
//   if (
//     !e.target.closest(
//       ".header-menu, .burger, .header-search, .header-search-button, .form-documents__button-open, .form-documents__wrapper, .btn-dropdown, .dropdown-menu"
//     )
//   ) {
//     hideOverlay();
//   }
//   if (!e.target.closest(".header-menu, .burger")) {
//     closeMenu();
//   }
//   if (!e.target.closest(".header-search, .header-search-button")) {
//     headerSearch.classList.remove("_active");
//   }
// });

// header search
const buttonOpenHeaderSearch = document.querySelector(".header-search-button"),
  buttonCloseHeaderSearch = document.querySelector(
    ".header-search__button-close"
  ),
  headerSearch = document.querySelector(".header-search");
if (buttonOpenHeaderSearch) {
  buttonOpenHeaderSearch.addEventListener("click", () => {
    showOverlay();
    headerSearch.classList.add("_active");
  });
}
if (buttonCloseHeaderSearch) {
  buttonCloseHeaderSearch.addEventListener("click", () => {
    hideOverlay();
    headerSearch.classList.remove("_active");
  });
}

// menu form news on main page (max-width: 768px)
const buttonMenuFormNews = document.querySelector(".form-news__button-menu"),
  formNewsMenu = document.querySelector(".form-news__menu"),
  categories = document.querySelectorAll(".item-news-category");

if (buttonMenuFormNews) {
  buttonMenuFormNews.addEventListener("click", () => {
    buttonMenuFormNews.classList.toggle("_active");
    formNewsMenu.classList.toggle("_show");
  });
  const closeMenuFormNews = () => {
    buttonMenuFormNews.classList.remove("_active");
    formNewsMenu.classList.remove("_show");
  };
  categories.forEach((label) => {
    label.addEventListener("click", function (e) {
      e.preventDefault();
      closeMenuFormNews();
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".form-news__menu, .form-news__button-menu")) {
      closeMenuFormNews();
    }
  });
}

// form-documents
const buttonOpenFormDocuments = document.querySelector(
    ".form-documents__button-open"
  ),
  buttonCloseFormDocuments = document.querySelector(
    ".form-documents__button-close"
  ),
  wrapperFormDocuments = document.querySelector(".form-documents__wrapper");
if (buttonOpenFormDocuments) {
  buttonOpenFormDocuments.addEventListener("click", () => {
    showOverlay();
    wrapperFormDocuments.classList.add("_open");
  });

  buttonCloseFormDocuments.addEventListener("click", () => {
    hideOverlay();
    wrapperFormDocuments.classList.remove("_open");
  });

  document.addEventListener("click", function (e) {
    if (
      !e.target.closest(
        ".form-documents__button-open, .form-documents__wrapper"
      )
    ) {
      wrapperFormDocuments.classList.remove("_open");
    }
  });
}
// FUNCTION FOR FORM
function emailTest(input) {
  return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(input.value);
}

function formAddError(input) {
  input.parentElement.classList.add("_error");
}

function formRemoveError(input) {
  input.parentElement.classList.remove("_error");
}
// switch password type
const btnsVisibilityPassword = document.querySelectorAll(".icon-password");
const siblings = (el) =>
  [].slice.call(el.parentNode.children).filter((child) => child !== el);
btnsVisibilityPassword.forEach((btn) =>
  btn.addEventListener("click", () => {
    let input = siblings(btn);
    if (input[0].type === "password") {
      input[0].type = "text";
      btn.classList.remove("bi-eye-slash");
      btn.classList.add("bi-eye");
    } else {
      input[0].type = "password";
      btn.classList.add("bi-eye-slash");
      btn.classList.remove("bi-eye");
    }
  })
);

// toast
const toastButtons = document.querySelectorAll(".toast-button");
const toastsBasic = document.querySelectorAll(".toast-basic");
if (toastButtons) {
  toastButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      console.log(btn.getAttribute("data-class"));
      toastsBasic.forEach((toast) => {
        if (toast.classList.contains(btn.getAttribute("data-class"))) {
          const el = new bootstrap.Toast(toast);
          el.show();
        }
      });
    })
  );
}

// Exchange Rates from Rest API
const usd = document.getElementById("usd");
const eur = document.getElementById("eur");
const rub = document.getElementById("rub");

async function getExchangeRates() {
  try {
    let response = await fetch(
      "https://www.nbrb.by/api/exrates/rates?periodicity=0"
    );
    let exchangeRates = await response.json();
    exchangeRates.forEach((item) => {
      if (item.Cur_Abbreviation === "USD") {
        usd.innerText = item.Cur_OfficialRate;
      } else if (item.Cur_Abbreviation === "EUR") {
        eur.innerText = item.Cur_OfficialRate;
      } else if (item.Cur_Abbreviation === "RUB") {
        rub.innerText = item.Cur_OfficialRate;
      }
    });
    return exchangeRates;
  } catch (error) {
    console.log(error);
  }
}

getExchangeRates();

(function ($) {
  // mask
  $("#phone-registration").mask("+375 (99) 999-99-99");
  $("#unp-registration").mask("999999999");

  // button-hover
  $(function () {
    $(".button-hover")
      .on("mouseenter", function (e) {
        var parentOffset = $(this).offset(),
          relX = e.pageX - parentOffset.left,
          relY = e.pageY - parentOffset.top;
        $(this)
          .find(".button-hover__hover-wrap")
          .css({ top: relY, left: relX });
      })
      .on("mouseout", function (e) {
        var parentOffset = $(this).offset(),
          relX = e.pageX - parentOffset.left,
          relY = e.pageY - parentOffset.top;
        $(this)
          .find(".button-hover__hover-wrap")
          .css({ top: relY, left: relX });
      });
    // $('[href=#]').click(function(){return false});
  });

  $(window).on("load", function () {
    $(".scrollbar-y").mCustomScrollbar();
    $(".scrollbar-x").mCustomScrollbar({
      axis: "x",
    });
  });
})(jQuery);

var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
})

let today = new Date();
let minDate = today.setDate(today.getDate());

// $('#datePickerStart').datetimepicker({
//   useCurrent: false,
//   format: "DD/MM/YYYY",
//   minDate: minDate
// });

$(function () {
  $('#datetimepicker.datetimepicker-cont').datetimepicker({
    format: 'DD.MM.YYYY', // Формат даты
    icons: {
      time: 'bi bi-clock', // Иконка времени
      date: 'bi bi-calendar', // Иконка календаря
      up: 'bi bi-chevron-up', // Иконка вверх
      down: 'bi bi-chevron-down', // Иконка вниз
      previous: 'bi bi-chevron-left', // Иконка стрелки влево
      next: 'bi bi-chevron-right', // Иконка стрелки вправо
      today: 'bi bi-calendar-check', // Иконка "Сегодня"
      clear: 'bi bi-trash', // Иконка "Очистить"
      close: 'bi bi-x', // Иконка "Закрыть"
    },
    minDate: minDate,
    theme: 'bootstrap',
    language: 'ru',
    locale: 'ru'
  });

  $('#datetimepickerEnd').datetimepicker({
    format: 'DD.MM.YYYY', // Формат даты
    icons: {
      time: 'bi bi-clock', // Иконка времени
      date: 'bi bi-calendar', // Иконка календаря
      up: 'bi bi-chevron-up', // Иконка вверх
      down: 'bi bi-chevron-down', // Иконка вниз
      previous: 'bi bi-chevron-left', // Иконка стрелки влево
      next: 'bi bi-chevron-right', // Иконка стрелки вправо
      today: 'bi bi-calendar-check', // Иконка "Сегодня"
      clear: 'bi bi-trash', // Иконка "Очистить"
      close: 'bi bi-x', // Иконка "Закрыть"
    },
    minDate: minDate,
    theme: 'bootstrap',
    language: 'ru',
    locale: 'ru'
  });

  $('#datetimepicker.datetimepicker-reg').datetimepicker({
    format: 'DD.MM.YYYY', // Формат даты
    icons: {
      time: 'bi bi-clock', // Иконка времени
      date: 'bi bi-calendar', // Иконка календаря
      up: 'bi bi-chevron-up', // Иконка вверх
      down: 'bi bi-chevron-down', // Иконка вниз
      previous: 'bi bi-chevron-left', // Иконка стрелки влево
      next: 'bi bi-chevron-right', // Иконка стрелки вправо
      today: 'bi bi-calendar-check', // Иконка "Сегодня"
      clear: 'bi bi-trash', // Иконка "Очистить"
      close: 'bi bi-x', // Иконка "Закрыть"
    },
    theme: 'bootstrap',
    language: 'ru',
    locale: 'ru'
  });
});

$(document).ready(function() {
  $("#regTel").mask("+375 (99) 999-99-99");

  $('#multipleStatus').multiselect(
    {
      buttonClass: 'multiple-select-custom',
      buttonWidth: '100%',
      nSelectedText: ' Статуса выбрано',
      allSelectedText: 'Все статусы выбраны',
      nonSelectedText: 'Ничего не выбрано'
      // buttonText: function(options, select) {
      //   return 'Выберите Статус';
      // },
    }
  );
  
  $('#multipleRule').multiselect(
    {
      buttonClass: 'multiple-select-custom',
      buttonWidth: '100%',
      nSelectedText: ' Прав выбрано',
      allSelectedText: 'Все права выбраны',
      nonSelectedText: 'Ничего не выбрано'
      // buttonText: function(options, select) {
      //   return 'Выберите Статус';
      // },
    }
  );

  $('.multiselect-selected-text').text('Ничего не выбрано')
});

let regForm = document.querySelector('#regRest')
if(regForm){
  regForm.addEventListener('click', ()=>{
    document.querySelector('#regForm').reset()
  })
}

//adaptive height for news list if popular block too high 
let newsList = document.querySelector('.news-list')
let popularBlock = document.querySelector('#popularBlock')


function calcHeighNews (){
  if(newsList){
    // console.log('document.querySelector(#popularBlock).offsetWidth', popularBlock.offsetHeight)
    newsList.style.maxHeight = popularBlock.offsetHeight - '100' + 'px'
  }
}

if(newsList){
  window.addEventListener('load', calcHeighNews)
  window.addEventListener('resize', calcHeighNews)
}

const menu_btn = document.querySelector("#menu-btn");
const sidebar = document.querySelector("#sidebar");
const containerNav = document.querySelector(".nav-container");
if(menu_btn && $(window).width() > 860){
  menu_btn.addEventListener("click", () => {
    sidebar.classList.toggle("active-nav");
    containerNav.classList.toggle("active-container");
    setTimeout(() => {
      calcHeighNews()
    },300);
  });
}


function hideSidenav(){
  if($(window).width() < 860){
    sidebar.classList.remove('active-nav')
    containerNav.classList.remove('active-container')
  }
  else{
    sidebar.classList.add('active-nav')
    containerNav.classList.add('active-container')
  }
}

if(sidebar){
  window.addEventListener('load', hideSidenav)
  window.addEventListener('resize', hideSidenav)
}



let testArray = [{id: '00001', name: 'dfsf'}, {id: '00002', name: 'dsfqerq'}, {id: '00003', name: 'dswqefqerq'}, {id: '000100', name: 'dewr12sfqerq'}]


function FilterByNumber(arr, id){
  console.log(arr.filter(el => el.id === id))
}

let numCertificate = document.querySelector('#numCertificate')
if(numCertificate){
  numCertificate.addEventListener('change', ()=>{
    FilterByNumber(testArray, this.numCertificate.value)
  })
}

const actualList = new Swiper('#actualList', {
  slidesPerView: 4,
  speed: 400,
  spaceBetween: 16,
  navigation: {
    nextEl: '#actualList .swiper-button-next',
    prevEl: '#actualList .swiper-button-prev',
  },
  pagination: {
    el: '#actualList .swiper-pagination',
    type: 'bullets',
    clickable: true
  },
  breakpoints: {
    // when window width is >= 320px
    320: {
      slidesPerView: 1,
      spaceBetween: 8
    },
    // when window width is >= 1100px
    1100: {
      slidesPerView: 3,
      spaceBetween: 8
    },
    // when window width is >= 1300px
    1300: {
      slidesPerView: 4,
      spaceBetween: 16
    }
  }
});

const videoList = new Swiper('.video-list', {
  slidesPerView: 4,
  speed: 400,
  spaceBetween: 16,
  navigation: {
    nextEl: '.video-list .swiper-button-next',
    prevEl: '.video-list .swiper-button-prev',
  },
  pagination: {
    el: '.video-list .swiper-pagination',
    type: 'bullets',
    clickable: true
  },
  breakpoints: {
    // when window width is >= 320px
    320: {
      slidesPerView: 1,
      spaceBetween: 8
    },
    // when window width is >= 1100px
    1100: {
      slidesPerView: 3,
      spaceBetween: 8
    },
    // when window width is >= 1300px
    1300: {
      slidesPerView: 4,
      spaceBetween: 16
    }
  }
});

let actualBook = document.querySelectorAll('#actualBook')

if(actualBook){
  actualBook.forEach(el=> {
    el.addEventListener('click', () => {
      // if(el.classList.contains('bookmark-checked')){
      //   el.classList.toggle('bi-bookmark')
      //   el.classList.toggle('bookmark-checked')
      // }
      // else{
        
      // }
      el.classList.toggle('bi-bookmark')
      el.classList.toggle('bookmark-checked')
      el.classList.toggle('bi-bookmark-star')
    })
  })
}

const mobileBtn = document.querySelector('#mobile-button')
const mobileMenu = document.querySelector('.mobile-nav')

if(mobileBtn){
  mobileBtn.addEventListener('click', ()=>{
    mobileMenu.classList.toggle('mobile-menu-show')
    mobileBtn.classList.toggle('bi-x-lg')
  })
}




