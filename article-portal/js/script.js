// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ($, window, document, undefined) {

  "use strict";

  // Create the defaults once
  var pluginName = "simpleCalendar",
    defaults = {
      months1: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
      months: ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
      days: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'], //string of days starting from sunday
      displayYear: true, // display year in header
      fixedStartDay: true, // Week begin always by monday or by day set by number 0 = sunday, 7 = saturday, false = month always begin by first day of the month
      displayEvent: true, // display existing event
      disableEventDetails: false, // disable showing event details
      disableEmptyDetails: false, // disable showing empty date details
      events: [], // List of event
      onInit: function (calendar) {}, // Callback after first initialization
      onMonthChange: function (month, year) {}, // Callback on month change
      onDateSelect: function (date, events) {}, // Callback on date selection
      onEventSelect: function () {},              // Callback fired when an event is selected     - see $(this).data('event')
      onEventCreate: function( $el ) {},          // Callback fired when an HTML event is created - see $(this).data('event')
      onDayCreate:   function( $el, d, m, y ) {}  // Callback fired when an HTML day is created   - see $(this).data('today'), .data('todayEvents')
    };

  // The actual plugin constructor
  function Plugin(element, options) {
    this.element = element;
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.currentDate = new Date();
    this.init();
  }

  // Avoid Plugin.prototype conflicts
  $.extend(Plugin.prototype, {
    init: function () {
      var container = $(this.element);
      var todayDate = this.currentDate;

      var calendar = $('<div class="calendar"></div>');
      var header = $('<header>' +
        '<h2 class="month"></h2>' +
        '<a class="simple-calendar-btn btn-prev" href="#"></a>' +
        '<a class="simple-calendar-btn btn-next" href="#"></a>' +
        '</header>');

      this.updateHeader(todayDate, header);
      calendar.append(header);

      this.buildCalendar(todayDate, calendar);
      container.append(calendar);

      this.bindEvents();
      this.settings.onInit(this);
    },

    //Update the current month header
    updateHeader: function (date, header) {
      var monthText = this.settings.months1[date.getMonth()];
      monthText += this.settings.displayYear ? ' <div class="year">' + date.getFullYear() : '</div>';
      header.find('.month').html(monthText);
    },

    //Build calendar of a month from date
    buildCalendar: function (fromDate, calendar) {
      var plugin = this;

      calendar.find('table').remove();

      var body = $('<table></table>');
      var thead = $('<thead></thead>');
      var tbody = $('<tbody></tbody>');

      //setting current year and month
      var y = fromDate.getFullYear(), m = fromDate.getMonth();

      //first day of the month
      var firstDay = new Date(y, m, 1);
      //last day of the month
      var lastDay = new Date(y, m + 1, 0);
      // Start day of weeks
      var startDayOfWeek = firstDay.getDay();

      if (this.settings.fixedStartDay !== false) {
        // Backward compatibility
        startDayOfWeek =  this.settings.fixedStartDay === true ? 1 : this.settings.fixedStartDay;

        // If first day of month is different of startDayOfWeek
        while (firstDay.getDay() !== startDayOfWeek) {
          firstDay.setDate(firstDay.getDate() - 1);
        }
        // If last day of month is different of startDayOfWeek + 7
        while (lastDay.getDay() !== ((startDayOfWeek + 6) % 7)) {
          lastDay.setDate(lastDay.getDate() + 1);
        }
      }

      //Header day in a week ( (x to x + 7) % 7 to start the week by monday if x = 1)
      for (var i = startDayOfWeek; i < startDayOfWeek + 7; i++) {
        thead.append($('<td>' + this.settings.days[i % 7].substring(0, 3) + '</td>'));
      }

      //For firstDay to lastDay
      for (var day = firstDay; day <= lastDay; day.setDate(day.getDate())) {
        var tr = $('<tr></tr>');
        //For each row
        for (var i = 0; i < 7; i++) {
          var td = $('<td><div class="day" data-date="' + day.toISOString() + '">' + day.getDate() + '</div></td>');

          var $day = td.find('.day');

          //if today is this day
          if (day.toDateString() === (new Date).toDateString()) {
            $day.addClass("today");
          }

          //if day is not in this month
          if (day.getMonth() != fromDate.getMonth()) {
            $day.addClass("wrong-month");
          }

          // filter today's events
          var todayEvents = plugin.getDateEvents(day);

          if (todayEvents.length && plugin.settings.displayEvent) {
				 console.log(todayEvents);

            $day.addClass(plugin.settings.disableEventDetails ? "has-event disabled" : "has-event");
          } else {
            $day.addClass(plugin.settings.disableEmptyDetails ? "disabled" : "");
          }
			 if (day.toDateString() !== (new Date).toDateString() && day.getTime() < (new Date).getTime()) {
            $day.addClass("pass-event");
          }

          // associate some data available from the onDayCreate callback
          $day.data( 'todayEvents', todayEvents );

          // simplify further customization
          this.settings.onDayCreate( $day, day.getDate(), m, y );

          tr.append(td);
          day.setDate(day.getDate() + 1);
        }
        tbody.append(tr);
      }

      body.append(thead);
      body.append(tbody);

      var eventContainer = $('<div class="event-container"><div class="close"></div><div class="event-wrapper"></div></div>');

      calendar.append(body);
      calendar.append(eventContainer);
    },
    changeMonth: function (value) {
      this.currentDate.setMonth(this.currentDate.getMonth() + value, 1);
      this.buildCalendar(this.currentDate, $(this.element).find('.calendar'));
      this.updateHeader(this.currentDate, $(this.element).find('.calendar header'));
      this.settings.onMonthChange(this.currentDate.getMonth(), this.currentDate.getFullYear())
    },
    //Init global events listeners
    bindEvents: function () {
      var plugin = this;

      //Remove previously created events
      $(plugin.element).off();

      //Click previous month
      $(plugin.element).on('click', '.btn-prev', function ( e ) {
        plugin.changeMonth(-1)
        e.preventDefault();
      });

      //Click next month
      $(plugin.element).on('click', '.btn-next', function ( e ) {
        plugin.changeMonth(1);
        e.preventDefault();
      });

      //Binding day event
      $(plugin.element).on('click', '.day', function (e) {
        var date = new Date($(this).data('date'));
        var events = plugin.getDateEvents(date);
        if (!$(this).hasClass('disabled')) {
          plugin.fillUp(e.pageX, e.pageY);
          plugin.displayEvents(events);
        }
        plugin.settings.onDateSelect(date, events);
      });

      //Binding event container close
      $(plugin.element).on('click', '.event-container .close', function (e) {
        plugin.empty(e.pageX, e.pageY);
      });
    },
    displayEvents: function (events) {
      var plugin = this;
      var container = $(this.element).find('.event-wrapper');

      events.forEach(function (event) {
        var startDate = new Date(event.startDate);
        var endDate = new Date(event.endDate);
        var $event = $('' +
          '<div class="event">' +
         //  ' <div class="event-hour">' + startDate.getHours() + ':' + (startDate.getMinutes() < 10 ? '0' : '') + startDate.getMinutes() + '</div>' +
          ' <div class="event-date">' + plugin.formatDateEvent(startDate, endDate) + '</div>' +
          ' <div class="event-place">' + event.place + '</div>' +
          ' <div class="event-summary">' + event.summary + '</div>' +
          '</div>');

        $event.data( 'event', event );
        $event.click( plugin.settings.onEventSelect );

        // simplify further customization
        plugin.settings.onEventCreate( $event );

        container.append($event);
      })
    },
    addEvent: function(newEvent) {
      var plugin = this;
      // add the new event to events list
      plugin.settings.events = [...plugin.settings.events, newEvent]
      this.buildCalendar(this.currentDate, $(this.element).find('.calendar'));
    },
    setEvents: function(newEvents) {
      var plugin = this;
      // add the new event to events list
      plugin.settings.events = newEvents
      this.buildCalendar(this.currentDate, $(this.element).find('.calendar'));
    },
    //Small effect to fillup a container
    fillUp: function (x, y) {
      var plugin = this;
      var elem = $(plugin.element);
      var elemOffset = elem.offset();

      var filler = $('<div class="filler" style=""></div>');
      filler.css("left", x - elemOffset.left);
      filler.css("top", y - elemOffset.top);

      elem.find('.calendar').append(filler);

      filler.animate({
        width: "300%",
        height: "300%"
      }, 500, function () {
        elem.find('.event-container').show();
        filler.hide();
      });
    },
    //Small effect to empty a container
    empty: function (x, y) {
      var plugin = this;
      var elem = $(plugin.element);
      var elemOffset = elem.offset();

      var filler = elem.find('.filler');
      filler.css("width", "300%");
      filler.css("height", "300%");

      filler.show();

      elem.find('.event-container').hide().find('.event').remove();

      filler.animate({
        width: "0%",
        height: "0%"
      }, 500, function () {
        filler.remove();
      });
    },
    getDateEvents: function (d) {
      var plugin = this;
      return plugin.settings.events.filter(function (event) {
        return plugin.isDayBetween(new Date(d), new Date(event.startDate), new Date(event.endDate));
      });
    },
    isDayBetween: function (d, dStart, dEnd) {
      dStart.setHours(0,0,0);
      dEnd.setHours(23,59,59,999);
      d.setHours(12,0,0);

      return dStart <= d && d <= dEnd;
    },
    formatDateEvent: function (dateStart, dateEnd) {
      var formatted = '';
      formatted += dateStart.getDate() + ' ' + this.settings.months[dateStart.getMonth()];

      if (dateEnd.getDate() !== dateStart.getDate()) {
        formatted += ' - ' + dateEnd.getDate() + ' ' + this.settings.months[dateEnd.getMonth()]
      }
      return formatted;
    }
  });

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      }
    });
  };
})(jQuery, window, document);

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
			nextEl: '.slider-event-control__arrow_next',
			prevEl: '.slider-event-control__arrow_prev',
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

// Dynamic Adapt v.1
// HTML data-da="where(uniq class name),when(breakpoint),position(digi)"
// e.x. data-da=".item,992,2"
// Andrikanych Yevhen 2020
// https://www.youtube.com/c/freelancerlifestyle

"use strict";


function DynamicAdapt(type) {
	this.type = type;
}

DynamicAdapt.prototype.init = function () {
	const _this = this;
	// массив объектов
	this.оbjects = [];
	this.daClassname = "_dynamic_adapt_";
	// массив DOM-элементов
	this.nodes = document.querySelectorAll("[data-da]");

	// наполнение оbjects объктами
	for (let i = 0; i < this.nodes.length; i++) {
		const node = this.nodes[i];
		const data = node.dataset.da.trim();
		const dataArray = data.split(",");
		const оbject = {};
		оbject.element = node;
		оbject.parent = node.parentNode;
		оbject.destination = document.querySelector(dataArray[0].trim());
		оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : "767";
		оbject.place = dataArray[2] ? dataArray[2].trim() : "last";
		оbject.index = this.indexInParent(оbject.parent, оbject.element);
		this.оbjects.push(оbject);
	}

	this.arraySort(this.оbjects);

	// массив уникальных медиа-запросов
	this.mediaQueries = Array.prototype.map.call(this.оbjects, function (item) {
		return '(' + this.type + "-width: " + item.breakpoint + "px)," + item.breakpoint;
	}, this);
	this.mediaQueries = Array.prototype.filter.call(this.mediaQueries, function (item, index, self) {
		return Array.prototype.indexOf.call(self, item) === index;
	});

	// навешивание слушателя на медиа-запрос
	// и вызов обработчика при первом запуске
	for (let i = 0; i < this.mediaQueries.length; i++) {
		const media = this.mediaQueries[i];
		const mediaSplit = String.prototype.split.call(media, ',');
		const matchMedia = window.matchMedia(mediaSplit[0]);
		const mediaBreakpoint = mediaSplit[1];

		// массив объектов с подходящим брейкпоинтом
		const оbjectsFilter = Array.prototype.filter.call(this.оbjects, function (item) {
			return item.breakpoint === mediaBreakpoint;
		});
		matchMedia.addListener(function () {
			_this.mediaHandler(matchMedia, оbjectsFilter);
		});
		this.mediaHandler(matchMedia, оbjectsFilter);
	}
};

DynamicAdapt.prototype.mediaHandler = function (matchMedia, оbjects) {
	if (matchMedia.matches) {
		for (let i = 0; i < оbjects.length; i++) {
			const оbject = оbjects[i];
			оbject.index = this.indexInParent(оbject.parent, оbject.element);
			this.moveTo(оbject.place, оbject.element, оbject.destination);
		}
	} else {
		for (let i = 0; i < оbjects.length; i++) {
			const оbject = оbjects[i];
			if (оbject.element.classList.contains(this.daClassname)) {
				this.moveBack(оbject.parent, оbject.element, оbject.index);
			}
		}
	}
};

// Функция перемещения
DynamicAdapt.prototype.moveTo = function (place, element, destination) {
	element.classList.add(this.daClassname);
	if (place === 'last' || place >= destination.children.length) {
		destination.insertAdjacentElement('beforeend', element);
		return;
	}
	if (place === 'first') {
		destination.insertAdjacentElement('afterbegin', element);
		return;
	}
	destination.children[place].insertAdjacentElement('beforebegin', element);
}

// Функция возврата
DynamicAdapt.prototype.moveBack = function (parent, element, index) {
	element.classList.remove(this.daClassname);
	if (parent.children[index] !== undefined) {
		parent.children[index].insertAdjacentElement('beforebegin', element);
	} else {
		parent.insertAdjacentElement('beforeend', element);
	}
}

// Функция получения индекса внутри родителя
DynamicAdapt.prototype.indexInParent = function (parent, element) {
	const array = Array.prototype.slice.call(parent.children);
	return Array.prototype.indexOf.call(array, element);
};

// Функция сортировки массива по breakpoint и place 
// по возрастанию для this.type = min
// по убыванию для this.type = max
DynamicAdapt.prototype.arraySort = function (arr) {
	if (this.type === "min") {
		Array.prototype.sort.call(arr, function (a, b) {
			if (a.breakpoint === b.breakpoint) {
				if (a.place === b.place) {
					return 0;
				}

				if (a.place === "first" || b.place === "last") {
					return -1;
				}

				if (a.place === "last" || b.place === "first") {
					return 1;
				}

				return a.place - b.place;
			}

			return a.breakpoint - b.breakpoint;
		});
	} else {
		Array.prototype.sort.call(arr, function (a, b) {
			if (a.breakpoint === b.breakpoint) {
				if (a.place === b.place) {
					return 0;
				}

				if (a.place === "first" || b.place === "last") {
					return 1;
				}

				if (a.place === "last" || b.place === "first") {
					return -1;
				}

				return b.place - a.place;
			}

			return b.breakpoint - a.breakpoint;
		});
		return;
	}
};

const da = new DynamicAdapt("max");
da.init();
(function burgerMenu() {
    const burger = document.querySelector(".header-menu__burger");
    const menu = document.querySelector(".header-menu");
    const arrayOverlay = document.querySelectorAll(".overlay");
    const body = document.querySelector("body");
    const buttonSubmenu = document.querySelectorAll(".menu-header__button");
    const submenu = document.querySelectorAll(".submenu-header");

    const showMenu = () => {
        menu.classList.add('_active')
        body.classList.add('_lock')
        arrayOverlay.forEach((item) => {
            item.classList.add('_header-menu-open')
        })
    }

    const closeMenu = () => {
        menu.classList.remove('_active')
        body.classList.remove('_lock')
        arrayOverlay.forEach((item) => {
            item.classList.remove('_header-menu-open')
        })
        buttonSubmenu.forEach((item) => {
            item.classList.add('collapsed')
        })
        submenu.forEach((item) => {
            item.classList.remove('show')
        })
    }

    burger.addEventListener("click", () => {
        if (!menu.classList.contains('_active')) {
            showMenu()
        } else {
            closeMenu()
        }
    })
    document.addEventListener('click', (e) => {
        if (!e.target.closest(".header-menu")) {
            closeMenu()
        }
    })
})()

const usd = document.getElementById('usd');
const eur = document.getElementById('eur');
const rub = document.getElementById('rub');

async function getExchangeRates() {
    try {
        let response = await fetch('https://www.nbrb.by/api/exrates/rates?periodicity=0');
        let exchangeRates = await response.json();
        exchangeRates.forEach(item => {
            if (item.Cur_Abbreviation === 'USD') {
                usd.innerText = item.Cur_OfficialRate;
            } else if (item.Cur_Abbreviation === 'EUR') {
                eur.innerText = item.Cur_OfficialRate;
            } else if (item.Cur_Abbreviation === 'RUB') {
                rub.innerText = item.Cur_OfficialRate;
            }
        })
        return exchangeRates;
    } catch (error) {
        console.log(error);
    }
}

getExchangeRates();

$(function () {
    $('.button-hover')
        .on('mouseenter', function (e) {
            var parentOffset = $(this).offset(),
                relX = e.pageX - parentOffset.left,
                relY = e.pageY - parentOffset.top;
            $(this).find('.button-hover__hover-wrap').css({top: relY, left: relX})
        })
        .on('mouseout', function (e) {
            var parentOffset = $(this).offset(),
                relX = e.pageX - parentOffset.left,
                relY = e.pageY - parentOffset.top;
            $(this).find('.button-hover__hover-wrap').css({top: relY, left: relX})
        });
    // $('[href=#]').click(function(){return false});
});

$(".scrollbar-y").mCustomScrollbar();

