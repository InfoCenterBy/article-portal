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

!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a("object"==typeof exports?require("jquery"):jQuery)}(function(a){var b,c=navigator.userAgent,d=/iphone/i.test(c),e=/chrome/i.test(c),f=/android/i.test(c);a.mask={definitions:{9:"[0-9]",a:"[A-Za-z]","*":"[A-Za-z0-9]"},autoclear:!0,dataName:"rawMaskFn",placeholder:"_"},a.fn.extend({caret:function(a,b){var c;if(0!==this.length&&!this.is(":hidden"))return"number"==typeof a?(b="number"==typeof b?b:a,this.each(function(){this.setSelectionRange?this.setSelectionRange(a,b):this.createTextRange&&(c=this.createTextRange(),c.collapse(!0),c.moveEnd("character",b),c.moveStart("character",a),c.select())})):(this[0].setSelectionRange?(a=this[0].selectionStart,b=this[0].selectionEnd):document.selection&&document.selection.createRange&&(c=document.selection.createRange(),a=0-c.duplicate().moveStart("character",-1e5),b=a+c.text.length),{begin:a,end:b})},unmask:function(){return this.trigger("unmask")},mask:function(c,g){var h,i,j,k,l,m,n,o;if(!c&&this.length>0){h=a(this[0]);var p=h.data(a.mask.dataName);return p?p():void 0}return g=a.extend({autoclear:a.mask.autoclear,placeholder:a.mask.placeholder,completed:null},g),i=a.mask.definitions,j=[],k=n=c.length,l=null,a.each(c.split(""),function(a,b){"?"==b?(n--,k=a):i[b]?(j.push(new RegExp(i[b])),null===l&&(l=j.length-1),k>a&&(m=j.length-1)):j.push(null)}),this.trigger("unmask").each(function(){function h(){if(g.completed){for(var a=l;m>=a;a++)if(j[a]&&C[a]===p(a))return;g.completed.call(B)}}function p(a){return g.placeholder.charAt(a<g.placeholder.length?a:0)}function q(a){for(;++a<n&&!j[a];);return a}function r(a){for(;--a>=0&&!j[a];);return a}function s(a,b){var c,d;if(!(0>a)){for(c=a,d=q(b);n>c;c++)if(j[c]){if(!(n>d&&j[c].test(C[d])))break;C[c]=C[d],C[d]=p(d),d=q(d)}z(),B.caret(Math.max(l,a))}}function t(a){var b,c,d,e;for(b=a,c=p(a);n>b;b++)if(j[b]){if(d=q(b),e=C[b],C[b]=c,!(n>d&&j[d].test(e)))break;c=e}}function u(){var a=B.val(),b=B.caret();if(o&&o.length&&o.length>a.length){for(A(!0);b.begin>0&&!j[b.begin-1];)b.begin--;if(0===b.begin)for(;b.begin<l&&!j[b.begin];)b.begin++;B.caret(b.begin,b.begin)}else{for(A(!0);b.begin<n&&!j[b.begin];)b.begin++;B.caret(b.begin,b.begin)}h()}function v(){A(),B.val()!=E&&B.change()}function w(a){if(!B.prop("readonly")){var b,c,e,f=a.which||a.keyCode;o=B.val(),8===f||46===f||d&&127===f?(b=B.caret(),c=b.begin,e=b.end,e-c===0&&(c=46!==f?r(c):e=q(c-1),e=46===f?q(e):e),y(c,e),s(c,e-1),a.preventDefault()):13===f?v.call(this,a):27===f&&(B.val(E),B.caret(0,A()),a.preventDefault())}}function x(b){if(!B.prop("readonly")){var c,d,e,g=b.which||b.keyCode,i=B.caret();if(!(b.ctrlKey||b.altKey||b.metaKey||32>g)&&g&&13!==g){if(i.end-i.begin!==0&&(y(i.begin,i.end),s(i.begin,i.end-1)),c=q(i.begin-1),n>c&&(d=String.fromCharCode(g),j[c].test(d))){if(t(c),C[c]=d,z(),e=q(c),f){var k=function(){a.proxy(a.fn.caret,B,e)()};setTimeout(k,0)}else B.caret(e);i.begin<=m&&h()}b.preventDefault()}}}function y(a,b){var c;for(c=a;b>c&&n>c;c++)j[c]&&(C[c]=p(c))}function z(){B.val(C.join(""))}function A(a){var b,c,d,e=B.val(),f=-1;for(b=0,d=0;n>b;b++)if(j[b]){for(C[b]=p(b);d++<e.length;)if(c=e.charAt(d-1),j[b].test(c)){C[b]=c,f=b;break}if(d>e.length){y(b+1,n);break}}else C[b]===e.charAt(d)&&d++,k>b&&(f=b);return a?z():k>f+1?g.autoclear||C.join("")===D?(B.val()&&B.val(""),y(0,n)):z():(z(),B.val(B.val().substring(0,f+1))),k?b:l}var B=a(this),C=a.map(c.split(""),function(a,b){return"?"!=a?i[a]?p(b):a:void 0}),D=C.join(""),E=B.val();B.data(a.mask.dataName,function(){return a.map(C,function(a,b){return j[b]&&a!=p(b)?a:null}).join("")}),B.one("unmask",function(){B.off(".mask").removeData(a.mask.dataName)}).on("focus.mask",function(){if(!B.prop("readonly")){clearTimeout(b);var a;E=B.val(),a=A(),b=setTimeout(function(){B.get(0)===document.activeElement&&(z(),a==c.replace("?","").length?B.caret(0,a):B.caret(a))},10)}}).on("blur.mask",v).on("keydown.mask",w).on("keypress.mask",x).on("input.mask paste.mask",function(){B.prop("readonly")||setTimeout(function(){var a=A(!0);B.caret(a),h()},0)}),e&&f&&B.off("input.mask").on("input.mask",u),A()})}})});

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
/**
 * Bootstrap Multiselect (http://davidstutz.de/bootstrap-multiselect/)
 *
 * Apache License, Version 2.0:
 * Copyright (c) 2012 - 2022 David Stutz
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a
 * copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * BSD 3-Clause License:
 * Copyright (c) 2012 - 2022 David Stutz
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    - Redistributions of source code must retain the above copyright notice,
 *      this list of conditions and the following disclaimer.
 *    - Redistributions in binary form must reproduce the above copyright notice,
 *      this list of conditions and the following disclaimer in the documentation
 *      and/or other materials provided with the distribution.
 *    - Neither the name of David Stutz nor the names of its contributors may be
 *      used to endorse or promote products derived from this software without
 *      specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
!function(root,factory){"function"==typeof define&&define.amd&&"function"==typeof require&&"function"==typeof require.specified&&require.specified("knockout")?define(["jquery","knockout"],factory):factory(root.jQuery,root.ko)}(this,(function($,ko){"use strict";function forEach(array,callback){for(var index=0;index<array.length;++index)callback(array[index],index)}void 0!==ko&&ko.bindingHandlers&&!ko.bindingHandlers.multiselect&&(ko.bindingHandlers.multiselect={after:["options","value","selectedOptions","enable","disable"],init:function(element,valueAccessor,allBindings,viewModel,bindingContext){var $element=$(element),config=ko.toJS(valueAccessor());if($element.multiselect(config),allBindings.has("options")){var options=allBindings.get("options");ko.isObservable(options)&&ko.computed({read:function(){options(),setTimeout((function(){var ms=$element.data("multiselect");ms&&ms.updateOriginalOptions(),$element.multiselect("rebuild")}),1)},disposeWhenNodeIsRemoved:element})}if(allBindings.has("value")){var value=allBindings.get("value");ko.isObservable(value)&&ko.computed({read:function(){value(),setTimeout((function(){$element.multiselect("refresh")}),1)},disposeWhenNodeIsRemoved:element}).extend({rateLimit:100,notifyWhenChangesStop:!0})}if(allBindings.has("selectedOptions")){var selectedOptions=allBindings.get("selectedOptions");ko.isObservable(selectedOptions)&&ko.computed({read:function(){selectedOptions(),setTimeout((function(){$element.multiselect("refresh")}),1)},disposeWhenNodeIsRemoved:element}).extend({rateLimit:100,notifyWhenChangesStop:!0})}var setEnabled=function(enable){setTimeout((function(){enable?$element.multiselect("enable"):$element.multiselect("disable")}))};if(allBindings.has("enable")){var enable=allBindings.get("enable");ko.isObservable(enable)?ko.computed({read:function(){setEnabled(enable())},disposeWhenNodeIsRemoved:element}).extend({rateLimit:100,notifyWhenChangesStop:!0}):setEnabled(enable)}if(allBindings.has("disable")){var disable=allBindings.get("disable");ko.isObservable(disable)?ko.computed({read:function(){setEnabled(!disable())},disposeWhenNodeIsRemoved:element}).extend({rateLimit:100,notifyWhenChangesStop:!0}):setEnabled(!disable)}ko.utils.domNodeDisposal.addDisposeCallback(element,(function(){$element.multiselect("destroy")}))},update:function(element,valueAccessor,allBindings,viewModel,bindingContext){var $element=$(element),config=ko.toJS(valueAccessor());$element.multiselect("setOptions",config),$element.multiselect("rebuild")}});var multiselectCount=0;function Multiselect(select,options){this.$select=$(select),this.options=this.mergeOptions($.extend({},options,this.$select.data())),this.$select.attr("data-placeholder")&&(this.options.nonSelectedText=this.$select.data("placeholder")),this.originalOptions=this.$select.clone()[0].options,this.query="",this.searchTimeout=null,this.lastToggledInput=null,this.multiselectId=this.generateUniqueId()+"_0",this.internalIdCount=0,this.options.multiple="multiple"===this.$select.attr("multiple"),this.options.onChange=$.proxy(this.options.onChange,this),this.options.onSelectAll=$.proxy(this.options.onSelectAll,this),this.options.onDeselectAll=$.proxy(this.options.onDeselectAll,this),this.options.onDropdownShow=$.proxy(this.options.onDropdownShow,this),this.options.onDropdownHide=$.proxy(this.options.onDropdownHide,this),this.options.onDropdownShown=$.proxy(this.options.onDropdownShown,this),this.options.onDropdownHidden=$.proxy(this.options.onDropdownHidden,this),this.options.onInitialized=$.proxy(this.options.onInitialized,this),this.options.onFiltering=$.proxy(this.options.onFiltering,this),this.buildContainer(),this.buildButton(),this.buildDropdown(),this.buildReset(),this.buildSelectAll(),this.buildDropdownOptions(),this.buildFilter(),this.buildButtons(),this.updateButtonText(),this.updateSelectAll(!0),this.options.enableClickableOptGroups&&this.options.multiple&&this.updateOptGroups(),this.options.wasDisabled=this.$select.prop("disabled"),this.options.disableIfEmpty&&$("option",this.$select).length<=0&&!this.options.wasDisabled&&this.disable(!0),this.$select.wrap('<span class="multiselect-native-select" />').after(this.$container),this.$select.prop("tabindex","-1"),"never"!==this.options.widthSynchronizationMode&&this.synchronizeButtonAndPopupWidth(),this.$select.data("multiselect",this),this.options.onInitialized(this.$select,this.$container)}Multiselect.prototype={defaults:{buttonText:function(selectedOptions,select){if(this.disabledText.length>0&&select.prop("disabled"))return this.disabledText;if(0===selectedOptions.length)return this.nonSelectedText;if(this.allSelectedText&&selectedOptions.length===$("option",$(select)).length&&1!==$("option",$(select)).length&&this.multiple)return this.selectAllNumber?this.allSelectedText+" ("+selectedOptions.length+")":this.allSelectedText;if(0!=this.numberDisplayed&&selectedOptions.length>this.numberDisplayed)return selectedOptions.length+" "+this.nSelectedText;var selected="",delimiter=this.delimiterText;return selectedOptions.each((function(){var label=void 0!==$(this).attr("label")?$(this).attr("label"):$(this).text();selected+=label+delimiter})),selected.substr(0,selected.length-this.delimiterText.length)},buttonTitle:function(options,select){if(0===options.length)return this.nonSelectedText;var selected="",delimiter=this.delimiterText;return options.each((function(){var label=void 0!==$(this).attr("label")?$(this).attr("label"):$(this).text();selected+=label+delimiter})),selected.substr(0,selected.length-this.delimiterText.length)},checkboxName:function(option){return!1},optionLabel:function(element){return $(element).attr("label")||$(element).text()},optionClass:function(element){return $(element).attr("class")||""},onChange:function(option,checked){},onDropdownShow:function(event){},onDropdownHide:function(event){},onDropdownShown:function(event){},onDropdownHidden:function(event){},onSelectAll:function(selectedOptions){},onDeselectAll:function(deselectedOptions){},onInitialized:function($select,$container){},onFiltering:function($filter){},enableHTML:!1,buttonClass:"custom-select",inheritClass:!1,buttonWidth:"auto",buttonContainer:'<div class="btn-group" />',dropRight:!1,dropUp:!1,selectedClass:"active",maxHeight:null,includeSelectAllOption:!1,includeSelectAllIfMoreThan:0,selectAllText:" Select all",selectAllValue:"multiselect-all",selectAllName:!1,selectAllNumber:!0,selectAllJustVisible:!0,enableFiltering:!1,enableCaseInsensitiveFiltering:!1,enableFullValueFiltering:!1,enableClickableOptGroups:!1,enableCollapsibleOptGroups:!1,collapseOptGroupsByDefault:!1,filterPlaceholder:"Search",filterBehavior:"text",includeFilterClearBtn:!0,preventInputChangeEvent:!1,nonSelectedText:"None selected",nSelectedText:"selected",allSelectedText:"All selected",resetButtonText:"Reset",numberDisplayed:3,disableIfEmpty:!1,disabledText:"",delimiterText:", ",includeResetOption:!1,includeResetDivider:!1,resetText:"Reset",indentGroupOptions:!0,widthSynchronizationMode:"never",buttonTextAlignment:"center",enableResetButton:!1,templates:{button:'<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span class="multiselect-selected-text"></span></button>',popupContainer:'<div class="multiselect-container dropdown-menu"></div>',filter:'<div class="multiselect-filter d-flex align-items-center"><i class="fas fa-sm fa-search text-muted"></i><input type="search" class="multiselect-search form-control" /></div>',buttonGroup:'<div class="multiselect-buttons btn-group" style="display:flex;"></div>',buttonGroupReset:'<button type="button" class="multiselect-reset btn btn-secondary btn-block"></button>',option:'<button type="button" class="multiselect-option dropdown-item"></button>',divider:'<div class="dropdown-divider"></div>',optionGroup:'<button type="button" class="multiselect-group dropdown-item"></button>',resetButton:'<div class="multiselect-reset text-center p-2"><button type="button" class="btn btn-sm btn-block btn-outline-secondary"></button></div>'}},constructor:Multiselect,buildContainer:function(){this.$container=$(this.options.buttonContainer),"never"!==this.options.widthSynchronizationMode?this.$container.on("show.bs.dropdown",$.proxy((function(){this.synchronizeButtonAndPopupWidth(),this.options.onDropdownShow()}),this)):this.$container.on("show.bs.dropdown",this.options.onDropdownShow),this.$container.on("hide.bs.dropdown",this.options.onDropdownHide),this.$container.on("shown.bs.dropdown",this.options.onDropdownShown),this.$container.on("hidden.bs.dropdown",this.options.onDropdownHidden)},buildButton:function(){if(this.$button=$(this.options.templates.button).addClass(this.options.buttonClass),this.$select.attr("class")&&this.options.inheritClass&&this.$button.addClass(this.$select.attr("class")),this.$select.prop("disabled")?this.disable():this.enable(),this.options.buttonWidth&&"auto"!==this.options.buttonWidth&&(this.$button.css({width:"100%"}),this.$container.css({width:this.options.buttonWidth})),this.options.buttonTextAlignment)switch(this.options.buttonTextAlignment){case"left":this.$button.addClass("text-left");break;case"center":this.$button.addClass("text-center");break;case"right":this.$button.addClass("text-right")}var tabindex=this.$select.attr("tabindex");tabindex&&this.$button.attr("tabindex",tabindex),this.$container.prepend(this.$button)},buildDropdown:function(){this.$popupContainer=$(this.options.templates.popupContainer),this.options.dropRight?this.$container.addClass("dropright"):this.options.dropUp&&this.$container.addClass("dropup"),this.options.maxHeight&&this.$popupContainer.css({"max-height":this.options.maxHeight+"px","overflow-y":"auto","overflow-x":"hidden"}),"never"!==this.options.widthSynchronizationMode&&this.$popupContainer.css("overflow-x","hidden"),this.$popupContainer.on("touchstart click",(function(e){e.stopPropagation()})),this.$container.append(this.$popupContainer)},synchronizeButtonAndPopupWidth:function(){if(this.$popupContainer&&"never"!==this.options.widthSynchronizationMode){var buttonWidth=this.$button.outerWidth();switch(this.options.widthSynchronizationMode){case"always":this.$popupContainer.css("min-width",buttonWidth),this.$popupContainer.css("max-width",buttonWidth);break;case"ifPopupIsSmaller":this.$popupContainer.css("min-width",buttonWidth);break;case"ifPopupIsWider":this.$popupContainer.css("max-width",buttonWidth)}}},buildDropdownOptions:function(){if(this.$select.children().each($.proxy((function(index,element){var $element=$(element),tag=$element.prop("tagName").toLowerCase();$element.prop("value")!==this.options.selectAllValue&&("optgroup"===tag?this.createOptgroup(element):"option"===tag&&("divider"===$element.data("role")?this.createDivider():this.createOptionValue(element,!1)))}),this)),$(this.$popupContainer).off("change",'> *:not(.multiselect-group) input[type="checkbox"], > *:not(.multiselect-group) input[type="radio"]'),$(this.$popupContainer).on("change",'> *:not(.multiselect-group) input[type="checkbox"], > *:not(.multiselect-group) input[type="radio"]',$.proxy((function(event){var $target=$(event.target),checked=$target.prop("checked")||!1,isSelectAllOption=$target.val()===this.options.selectAllValue;this.options.selectedClass&&(checked?$target.closest(".multiselect-option").addClass(this.options.selectedClass):$target.closest(".multiselect-option").removeClass(this.options.selectedClass));var id=$target.attr("id"),$option=this.getOptionById(id),$optionsNotThis=$("option",this.$select).not($option),$checkboxesNotThis=$("input",this.$container).not($target);if(isSelectAllOption?checked?this.selectAll(this.options.selectAllJustVisible,!0):this.deselectAll(this.options.selectAllJustVisible,!0):(checked?($option.prop("selected",!0),this.options.multiple?$option.prop("selected",!0):(this.options.selectedClass&&$($checkboxesNotThis).closest(".dropdown-item").removeClass(this.options.selectedClass),$($checkboxesNotThis).prop("checked",!1),$optionsNotThis.prop("selected",!1),this.$button.click()),"active"===this.options.selectedClass&&$optionsNotThis.closest(".dropdown-item").css("outline","")):$option.prop("selected",!1),this.options.onChange($option,checked),this.updateSelectAll(),this.options.enableClickableOptGroups&&this.options.multiple&&this.updateOptGroups()),this.$select.change(),this.updateButtonText(),this.options.preventInputChangeEvent)return!1}),this)),$(".multiselect-option",this.$popupContainer).off("mousedown"),$(".multiselect-option",this.$popupContainer).on("mousedown",(function(e){if(e.shiftKey)return!1})),$(this.$popupContainer).off("touchstart click",".multiselect-option, .multiselect-all, .multiselect-group"),$(this.$popupContainer).on("touchstart click",".multiselect-option, .multiselect-all, .multiselect-group",$.proxy((function(event){event.stopPropagation();var $target=$(event.target),$input;if(event.shiftKey&&this.options.multiple){$target.is("input")||(event.preventDefault(),($target=$target.closest(".multiselect-option").find("input")).prop("checked",!$target.prop("checked")));var checked=$target.prop("checked")||!1;if(null!==this.lastToggledInput&&this.lastToggledInput!==$target){var from=this.$popupContainer.find(".multiselect-option:visible").index($target.closest(".multiselect-option")),to=this.$popupContainer.find(".multiselect-option:visible").index(this.lastToggledInput.closest(".multiselect-option"));if(from>to){var tmp=to;to=from,from=tmp}++to;var range=this.$popupContainer.find(".multiselect-option:not(.multiselect-filter-hidden)").slice(from,to).find("input");range.prop("checked",checked),this.options.selectedClass&&range.closest(".multiselect-option").toggleClass(this.options.selectedClass,checked);for(var i=0,j=range.length;i<j;i++){var $checkbox=$(range[i]),$option;this.getOptionById($checkbox.attr("id")).prop("selected",checked)}}$target.trigger("change")}else if(!$target.is("input")){var $checkbox;if(($checkbox=$target.closest(".multiselect-option, .multiselect-all").find(".form-check-input")).length>0)!this.options.multiple&&$checkbox.prop("checked")||($checkbox.prop("checked",!$checkbox.prop("checked")),$checkbox.change());else if(this.options.enableClickableOptGroups&&this.options.multiple&&!$target.hasClass("caret-container")){var groupItem=$target;groupItem.hasClass("multiselect-group")||(groupItem=$target.closest(".multiselect-group")),($checkbox=groupItem.find(".form-check-input")).length>0&&($checkbox.prop("checked",!$checkbox.prop("checked")),$checkbox.change())}event.preventDefault()}$target.closest(".multiselect-option").find("input[type='checkbox'], input[type='radio']").length>0?this.lastToggledInput=$target:this.lastToggledInput=null,$target.blur()}),this)),this.$container.off("keydown.multiselect").on("keydown.multiselect",$.proxy((function(event){var $items=$(this.$container).find(".multiselect-option:not(.disabled), .multiselect-group:not(.disabled), .multiselect-all").filter(":visible"),index=$items.index($items.filter(":focus")),$search=$(".multiselect-search",this.$container);if(9===event.keyCode&&this.$container.hasClass("show"))this.$button.click();else if(13==event.keyCode){var $current=$items.eq(index);setTimeout((function(){$current.focus()}),1)}else if(38==event.keyCode)0!=index||$search.is(":focus")||setTimeout((function(){$search.focus()}),1);else if(40==event.keyCode)if($search.is(":focus")){var $first=$items.eq(0);setTimeout((function(){$search.blur(),$first.focus()}),1)}else-1==index&&setTimeout((function(){$search.focus()}),1)}),this)),this.options.enableClickableOptGroups&&this.options.multiple&&($(".multiselect-group input",this.$popupContainer).off("change"),$(".multiselect-group input",this.$popupContainer).on("change",$.proxy((function(event){event.stopPropagation();var $target,checked=$(event.target).prop("checked")||!1,$item=$(event.target).closest(".dropdown-item"),$group,$inputs=$item.nextUntil(".multiselect-group").not(".multiselect-filter-hidden").not(".disabled").find("input"),$options=[];this.options.selectedClass&&(checked?$item.addClass(this.options.selectedClass):$item.removeClass(this.options.selectedClass)),$.each($inputs,$.proxy((function(index,input){var $input=$(input),id=$input.attr("id"),$option=this.getOptionById(id);checked?($input.prop("checked",!0),$input.closest(".dropdown-item").addClass(this.options.selectedClass),$option.prop("selected",!0)):($input.prop("checked",!1),$input.closest(".dropdown-item").removeClass(this.options.selectedClass),$option.prop("selected",!1)),$options.push($option)}),this)),this.options.onChange($options,checked),this.$select.change(),this.updateButtonText(),this.updateSelectAll()}),this))),this.options.enableCollapsibleOptGroups){let clickableSelector=this.options.enableClickableOptGroups?".multiselect-group .caret-container":".multiselect-group";$(clickableSelector,this.$popupContainer).off("click"),$(clickableSelector,this.$popupContainer).on("click",$.proxy((function(event){var $group=$(event.target).closest(".multiselect-group"),$inputs=$group.nextUntil(".multiselect-group").not(".multiselect-filter-hidden"),visible=!0;$inputs.each((function(){visible=visible&&!$(this).hasClass("multiselect-collapsible-hidden")})),visible?($inputs.hide().addClass("multiselect-collapsible-hidden"),$group.get(0).classList.add("closed")):($inputs.show().removeClass("multiselect-collapsible-hidden"),$group.get(0).classList.remove("closed"))}),this))}},createCheckbox:function($item,labelContent,name,value,title,inputType,internalId){var $wrapper=$("<span />");$wrapper.addClass("form-check");var $checkboxLabel=$('<label class="form-check-label" />');this.options.enableHTML&&$(labelContent).length>0?$checkboxLabel.html(labelContent):$checkboxLabel.text(labelContent),$wrapper.append($checkboxLabel);var $checkbox=$('<input class="form-check-input"/>').attr("type",inputType);return $checkbox.val(value),$wrapper.prepend($checkbox),internalId&&($checkbox.attr("id",internalId),$checkboxLabel.attr("for",internalId)),name&&$checkbox.attr("name",name),$item.prepend($wrapper),$item.attr("title",title||labelContent),$checkbox},createOptionValue:function(element,isGroupOption){var $element=$(element);$element.is(":selected")&&$element.prop("selected",!0);var label=this.options.optionLabel(element),classes=this.options.optionClass(element),value=$element.val(),inputType=this.options.multiple?"checkbox":"radio",title=$element.attr("title"),$option=$(this.options.templates.option);$option.addClass(classes),isGroupOption&&this.options.indentGroupOptions&&(this.options.enableCollapsibleOptGroups?$option.addClass("multiselect-group-option-indented-full"):$option.addClass("multiselect-group-option-indented")),this.options.collapseOptGroupsByDefault&&"optgroup"===$(element).parent().prop("tagName").toLowerCase()&&($option.addClass("multiselect-collapsible-hidden"),$option.hide());var name=this.options.checkboxName($element),checkboxId=this.createAndApplyUniqueId($element),$checkbox=this.createCheckbox($option,label,name,value,title,inputType,checkboxId),selected=$element.prop("selected")||!1;value===this.options.selectAllValue&&($option.addClass("multiselect-all"),$option.removeClass("multiselect-option"),$checkbox.parent().parent().addClass("multiselect-all")),this.$popupContainer.append($option),$element.is(":disabled")&&$checkbox.attr("disabled","disabled").prop("disabled",!0).closest(".dropdown-item").addClass("disabled"),$checkbox.prop("checked",selected),selected&&this.options.selectedClass&&$checkbox.closest(".dropdown-item").addClass(this.options.selectedClass)},createDivider:function(element){var $divider=$(this.options.templates.divider);this.$popupContainer.append($divider)},createOptgroup:function(group){var $group=$(group),label=$group.attr("label"),value=$group.attr("value"),title=$group.attr("title"),$groupOption=$("<span class='multiselect-group dropdown-item-text'></span>");if(this.options.enableClickableOptGroups&&this.options.multiple){$groupOption=$(this.options.templates.optionGroup);var checkboxId=this.createAndApplyUniqueId($group),$checkbox=this.createCheckbox($groupOption,label,null,value,title,"checkbox",checkboxId)}else this.options.enableHTML?$groupOption.html(" "+label):$groupOption.text(" "+label);var classes=this.options.optionClass(group);$groupOption.addClass(classes),this.options.enableCollapsibleOptGroups&&($groupOption.find(".form-check").addClass("d-inline-block"),$groupOption.get(0).insertAdjacentHTML("afterbegin",'<span class="caret-container dropdown-toggle"></span>')),$group.is(":disabled")&&$groupOption.addClass("disabled"),this.$popupContainer.append($groupOption),$("option",group).each($.proxy((function($,group){this.createOptionValue(group,!0)}),this))},buildReset:function(){if(this.options.includeResetOption){if(this.options.includeResetDivider){var divider=$(this.options.templates.divider);divider.addClass("mt-0"),this.$popupContainer.prepend(divider)}var $resetButton=$(this.options.templates.resetButton);this.options.enableHTML?$("button",$resetButton).html(this.options.resetText):$("button",$resetButton).text(this.options.resetText),$("button",$resetButton).click($.proxy((function(){this.clearSelection()}),this)),this.$popupContainer.prepend($resetButton)}},buildSelectAll:function(){var alreadyHasSelectAll;if("number"==typeof this.options.selectAllValue&&(this.options.selectAllValue=this.options.selectAllValue.toString()),!this.hasSelectAll()&&this.options.includeSelectAllOption&&this.options.multiple&&$("option",this.$select).length>this.options.includeSelectAllIfMoreThan){this.options.includeSelectAllDivider&&this.$popupContainer.prepend($(this.options.templates.divider));var $option=$(this.options.templates.li||this.options.templates.option),$checkbox=this.createCheckbox($option,this.options.selectAllText,this.options.selectAllName,this.options.selectAllValue,this.options.selectAllText,"checkbox",this.createAndApplyUniqueId(null));$option.addClass("multiselect-all"),$option.removeClass("multiselect-option"),$option.find(".form-check-label").addClass("font-weight-bold"),this.$popupContainer.prepend($option),$checkbox.prop("checked",!1)}},buildFilter:function(){if(this.options.enableFiltering||this.options.enableCaseInsensitiveFiltering){var enableFilterLength=Math.max(this.options.enableFiltering,this.options.enableCaseInsensitiveFiltering);this.$select.find("option").length>=enableFilterLength&&(this.$filter=$(this.options.templates.filter),$("input",this.$filter).attr("placeholder",this.options.filterPlaceholder),this.options.includeFilterClearBtn?(this.isFirefox()&&0===this.$filter.find(".multiselect-clear-filter").length&&this.$filter.append("<i class='fas fa-times text-muted multiselect-clear-filter multiselect-moz-clear-filter'></i>"),this.$filter.find(".multiselect-clear-filter").on("click",$.proxy((function(event){clearTimeout(this.searchTimeout),this.query="",this.$filter.find(".multiselect-search").val(""),$(".dropdown-item",this.$popupContainer).show().removeClass("multiselect-filter-hidden"),this.updateSelectAll(),this.options.enableClickableOptGroups&&this.options.multiple&&this.updateOptGroups()}),this))):(this.$filter.find(".multiselect-search").attr("type","text"),this.$filter.find(".multiselect-clear-filter").remove()),this.$popupContainer.prepend(this.$filter),this.$filter.val(this.query).on("click",(function(event){event.stopPropagation()})).on("input keydown",$.proxy((function(event){13===event.which&&event.preventDefault(),this.isFirefox()&&this.options.includeFilterClearBtn&&(event.target.value?this.$filter.find(".multiselect-moz-clear-filter").show():this.$filter.find(".multiselect-moz-clear-filter").hide()),clearTimeout(this.searchTimeout),this.searchTimeout=this.asyncFunction($.proxy((function(){var currentGroup,currentGroupVisible;this.query!==event.target.value&&(this.query=event.target.value,$.each($(".multiselect-option, .multiselect-group",this.$popupContainer),$.proxy((function(index,element){var value=$("input",element).length>0?$("input",element).val():"",text=$(".form-check-label",element).text(),filterCandidate="";if("text"===this.options.filterBehavior?filterCandidate=text:"value"===this.options.filterBehavior?filterCandidate=value:"both"===this.options.filterBehavior&&(filterCandidate=text+"\n"+value),value!==this.options.selectAllValue&&text){var showElement=!1;if(this.options.enableCaseInsensitiveFiltering&&(filterCandidate=filterCandidate.toLowerCase(),this.query=this.query.toLowerCase()),this.options.enableFullValueFiltering&&"both"!==this.options.filterBehavior){var valueToMatch=filterCandidate.trim().substring(0,this.query.length);this.query.indexOf(valueToMatch)>-1&&(showElement=!0)}else filterCandidate.indexOf(this.query)>-1&&(showElement=!0);showElement||($(element).css("display","none"),$(element).addClass("multiselect-filter-hidden")),showElement&&($(element).css("display","block"),$(element).removeClass("multiselect-filter-hidden")),$(element).hasClass("multiselect-group")?(currentGroup=element,currentGroupVisible=showElement):(showElement&&$(currentGroup).show().removeClass("multiselect-filter-hidden"),!showElement&&currentGroupVisible&&$(element).show().removeClass("multiselect-filter-hidden"))}}),this)));this.updateSelectAll(),this.options.enableClickableOptGroups&&this.options.multiple&&this.updateOptGroups(),this.updatePopupPosition(),this.options.onFiltering(event.target)}),this),300,this)}),this)))}},buildButtons:function(){if(this.options.enableResetButton){var $buttonGroup=$(this.options.templates.buttonGroup);this.$buttonGroupReset=$(this.options.templates.buttonGroupReset).text(this.options.resetButtonText),$buttonGroup.append(this.$buttonGroupReset),this.$popupContainer.prepend($buttonGroup),this.defaultSelection={},$("option",this.$select).each($.proxy((function(index,element){var $option=$(element);this.defaultSelection[$option.val()]=$option.prop("selected")}),this)),this.$buttonGroupReset.on("click",$.proxy((function(event){$("option",this.$select).each($.proxy((function(index,element){var $option=$(element);$option.prop("selected",this.defaultSelection[$option.val()])}),this)),this.refresh(),this.options.enableFiltering&&(this.$filter.trigger("keydown"),$("input",this.$filter).val(""))}),this))}},updatePopupPosition:function(){var transformMatrix=this.$popupContainer.css("transform"),matrixType=transformMatrix.substring(0,transformMatrix.indexOf("(")),values,valuesArray=transformMatrix.substring(transformMatrix.indexOf("(")+1,transformMatrix.length-1).split(","),valueIndex=5;if("matrix3d"===matrixType&&(valueIndex=13),!(valuesArray.length<valueIndex)){var yTransformation=valuesArray[valueIndex];(yTransformation=void 0===yTransformation?0:yTransformation.trim())<0&&(yTransformation=-1*this.$popupContainer.css("height").replace("px",""),valuesArray[valueIndex]=yTransformation,transformMatrix=matrixType+"("+valuesArray.join(",")+")",this.$popupContainer.css("transform",transformMatrix))}},destroy:function(){this.$container.remove(),this.$select.unwrap(),this.$select.show(),this.$select.prop("disabled",this.options.wasDisabled),this.$select.find("option, optgroup").removeAttr("data-multiselectid"),this.$select.data("multiselect",null)},refresh:function(){var inputs={};$(".multiselect-option input",this.$popupContainer).each((function(){inputs[$(this).val()]=$(this)})),$("option",this.$select).each($.proxy((function(index,element){var $elem=$(element),$input=inputs[$(element).val()];$elem.is(":selected")?($input.prop("checked",!0),this.options.selectedClass&&$input.closest(".multiselect-option").addClass(this.options.selectedClass)):($input.prop("checked",!1),this.options.selectedClass&&$input.closest(".multiselect-option").removeClass(this.options.selectedClass)),$elem.is(":disabled")?$input.attr("disabled","disabled").prop("disabled",!0).closest(".multiselect-option").addClass("disabled"):$input.prop("disabled",!1).closest(".multiselect-option").removeClass("disabled")}),this)),this.updateButtonText(),this.updateSelectAll(),this.options.enableClickableOptGroups&&this.options.multiple&&this.updateOptGroups()},select:function(selectValues,triggerOnChange){$.isArray(selectValues)||(selectValues=[selectValues]);for(var i=0;i<selectValues.length;i++){var value=selectValues[i];if(null!=value){var $checkboxes=this.getInputsByValue(value);if($checkboxes&&0!==$checkboxes.length)for(var checkboxIndex=0;checkboxIndex<$checkboxes.length;++checkboxIndex){var $checkbox=$checkboxes[checkboxIndex],$option=this.getOptionById($checkbox.attr("id"));if(void 0!==$option){if(this.options.selectedClass&&$checkbox.closest(".dropdown-item").addClass(this.options.selectedClass),$checkbox.prop("checked",!0),$option.prop("selected",!0),!this.options.multiple){var $checkboxesNotThis=$("input",this.$container).not($checkbox),$optionsNotThis;$($checkboxesNotThis).prop("checked",!1),$($checkboxesNotThis).closest(".multiselect-option").removeClass("active"),$("option",this.$select).not($option).prop("selected",!1)}triggerOnChange&&this.options.onChange($option,!0)}}}}this.updateButtonText(),this.updateSelectAll(),this.options.enableClickableOptGroups&&this.options.multiple&&this.updateOptGroups()},clearSelection:function(){this.deselectAll(!1),this.updateButtonText(),this.updateSelectAll(),this.options.enableClickableOptGroups&&this.options.multiple&&this.updateOptGroups()},deselect:function(deselectValues,triggerOnChange){if(this.options.multiple){$.isArray(deselectValues)||(deselectValues=[deselectValues]);for(var i=0;i<deselectValues.length;i++){var value=deselectValues[i];if(null!=value){var $checkboxes=this.getInputsByValue(value);if($checkboxes&&0!==$checkboxes.length)for(var checkboxIndex=0;checkboxIndex<$checkboxes.length;++checkboxIndex){var $checkbox=$checkboxes[checkboxIndex],$option=this.getOptionById($checkbox.attr("id"));$option&&(this.options.selectedClass&&$checkbox.closest(".dropdown-item").removeClass(this.options.selectedClass),$checkbox.prop("checked",!1),$option.prop("selected",!1),triggerOnChange&&this.options.onChange($option,!1))}}}this.updateButtonText(),this.updateSelectAll(),this.options.enableClickableOptGroups&&this.options.multiple&&this.updateOptGroups()}},selectAll:function(justVisible,triggerOnSelectAll){if(this.options.multiple){var selected=[],justVisible;if(justVisible=void 0===justVisible||justVisible){var visibleOptions=$(".multiselect-option:not(.disabled):not(.multiselect-filter-hidden)",this.$popupContainer);$("input:enabled",visibleOptions).prop("checked",!0),visibleOptions.addClass(this.options.selectedClass),$("input:enabled",visibleOptions).each($.proxy((function(index,element){var id=$(element).attr("id"),option=this.getOptionById(id);$(option).prop("selected")||selected.push(option),$(option).prop("selected",!0)}),this))}else{var allOptions=$(".multiselect-option:not(.disabled)",this.$popupContainer);$("input:enabled",allOptions).prop("checked",!0),allOptions.addClass(this.options.selectedClass),$("input:enabled",allOptions).each($.proxy((function(index,element){var id=$(element).attr("id"),option=this.getOptionById(id);$(option).prop("selected")||selected.push(option),$(option).prop("selected",!0)}),this))}$('.multiselect-option input[value="'+this.options.selectAllValue+'"]',this.$popupContainer).prop("checked",!0),this.options.enableClickableOptGroups&&this.options.multiple&&this.updateOptGroups(),this.updateButtonText(),this.updateSelectAll(),triggerOnSelectAll&&this.options.onSelectAll(selected)}},deselectAll:function(justVisible,triggerOnDeselectAll){if(this.options.multiple){var deselected=[],justVisible;if(justVisible=void 0===justVisible||justVisible){var visibleOptions=$(".multiselect-option:not(.disabled):not(.multiselect-filter-hidden)",this.$popupContainer);$('input[type="checkbox"]:enabled',visibleOptions).prop("checked",!1),visibleOptions.removeClass(this.options.selectedClass),$('input[type="checkbox"]:enabled',visibleOptions).each($.proxy((function(index,element){var id=$(element).attr("id"),option=this.getOptionById(id);$(option).prop("selected")&&deselected.push(option),$(option).prop("selected",!1)}),this))}else{var allOptions=$(".multiselect-option:not(.disabled):not(.multiselect-group)",this.$popupContainer);$('input[type="checkbox"]:enabled',allOptions).prop("checked",!1),allOptions.removeClass(this.options.selectedClass),$('input[type="checkbox"]:enabled',allOptions).each($.proxy((function(index,element){var id=$(element).attr("id"),option=this.getOptionById(id);$(option).prop("selected")&&deselected.push(option),$(option).prop("selected",!1)}),this))}$('.multiselect-all input[value="'+this.options.selectAllValue+'"]',this.$popupContainer).prop("checked",!1),this.options.enableClickableOptGroups&&this.options.multiple&&this.updateOptGroups(),this.updateButtonText(),this.updateSelectAll(),triggerOnDeselectAll&&this.options.onDeselectAll(deselected)}},rebuild:function(){this.internalIdCount=0,this.$popupContainer.html(""),this.$select.find("option, optgroup").removeAttr("data-multiselectid"),this.options.multiple="multiple"===this.$select.attr("multiple"),this.buildSelectAll(),this.buildDropdownOptions(),this.buildFilter(),this.buildButtons(),this.updateButtonText(),this.updateSelectAll(!0),this.options.enableClickableOptGroups&&this.options.multiple&&this.updateOptGroups(),this.options.disableIfEmpty&&($("option",this.$select).length<=0?this.$select.prop("disabled")||this.disable(!0):this.$select.data("disabled-by-option")&&this.enable()),this.options.dropRight?this.$container.addClass("dropright"):this.options.dropUp&&this.$container.addClass("dropup"),"never"!==this.options.widthSynchronizationMode&&this.synchronizeButtonAndPopupWidth()},dataprovider:function(dataprovider){var groupCounter=0,$select=this.$select.empty();$.each(dataprovider,(function(index,option){var $tag;if($.isArray(option.children))groupCounter++,$tag=$("<optgroup/>").attr({label:option.label||"Group "+groupCounter,disabled:!!option.disabled,value:option.value}),forEach(option.children,(function(subOption){var attributes={value:subOption.value,label:void 0!==subOption.label&&null!==subOption.label?subOption.label:subOption.value,title:subOption.title,selected:!!subOption.selected,disabled:!!subOption.disabled};for(var key in subOption.attributes)attributes["data-"+key]=subOption.attributes[key];$tag.append($("<option/>").attr(attributes))}));else{var attributes={value:option.value,label:void 0!==option.label&&null!==option.label?option.label:option.value,title:option.title,class:option.class,selected:!!option.selected,disabled:!!option.disabled};for(var key in option.attributes)attributes["data-"+key]=option.attributes[key];($tag=$("<option/>").attr(attributes)).text(void 0!==option.label&&null!==option.label?option.label:option.value)}$select.append($tag)})),this.rebuild()},enable:function(){this.$select.prop("disabled",!1),this.$button.prop("disabled",!1).removeClass("disabled"),this.updateButtonText()},disable:function(disableByOption){this.$select.prop("disabled",!0),this.$button.prop("disabled",!0).addClass("disabled"),disableByOption?this.$select.data("disabled-by-option",!0):this.$select.data("disabled-by-option",null),this.updateButtonText()},setOptions:function(options){this.options=this.mergeOptions(options)},mergeOptions:function(options){return $.extend(!0,{},this.defaults,this.options,options)},hasSelectAll:function(){return $(".multiselect-all",this.$popupContainer).length>0},updateOptGroups:function(){var $groups=$(".multiselect-group",this.$popupContainer),selectedClass=this.options.selectedClass;$groups.each((function(){var $options=$(this).nextUntil(".multiselect-group").not(".multiselect-filter-hidden").not(".disabled"),checked=!0;$options.each((function(){var $input;$("input",this).prop("checked")||(checked=!1)})),selectedClass&&(checked?$(this).addClass(selectedClass):$(this).removeClass(selectedClass)),$("input",this).prop("checked",checked)}))},updateSelectAll:function(notTriggerOnSelectAll){if(this.hasSelectAll()){var allBoxes=$(".multiselect-option:not(.multiselect-filter-hidden):not(.multiselect-group):not(.disabled) input:enabled",this.$popupContainer),allBoxesLength=allBoxes.length,checkedBoxesLength=allBoxes.filter(":checked").length,selectAllItem=$(".multiselect-all",this.$popupContainer),selectAllInput=selectAllItem.find("input");checkedBoxesLength>0&&checkedBoxesLength===allBoxesLength?(selectAllInput.prop("checked",!0),selectAllItem.addClass(this.options.selectedClass)):(selectAllInput.prop("checked",!1),selectAllItem.removeClass(this.options.selectedClass))}},updateButtonText:function(){var options=this.getSelected();this.options.enableHTML?$(".multiselect .multiselect-selected-text",this.$container).html(this.options.buttonText(options,this.$select)):$(".multiselect .multiselect-selected-text",this.$container).text(this.options.buttonText(options,this.$select)),$(".multiselect",this.$container).attr("title",this.options.buttonTitle(options,this.$select)),this.$button.trigger("change")},getSelected:function(){return $("option",this.$select).filter(":selected")},getOptionById:function(id){return id?this.$select.find("option[data-multiselectid="+id+"], optgroup[data-multiselectid="+id+"]"):null},getInputsByValue:function(value){for(var checkboxes=$(".multiselect-option input:not(.multiselect-search)",this.$popupContainer),valueToCompare=value.toString(),matchingCheckboxes=[],i=0;i<checkboxes.length;i+=1){var checkbox=checkboxes[i];checkbox.value===valueToCompare&&matchingCheckboxes.push($(checkbox))}return matchingCheckboxes},updateOriginalOptions:function(){this.originalOptions=this.$select.clone()[0].options},asyncFunction:function(callback,timeout,self){var args=Array.prototype.slice.call(arguments,3);return setTimeout((function(){callback.apply(self||window,args)}),timeout)},setAllSelectedText:function(allSelectedText){this.options.allSelectedText=allSelectedText,this.updateButtonText()},isFirefox:function(){var firefoxIdentifier="firefox",valueNotFoundIndex=-1;return!(!navigator||!navigator.userAgent)&&navigator.userAgent.toLocaleLowerCase().indexOf("firefox")>-1},createAndApplyUniqueId:function($relatedElement){var id="multiselect_"+this.multiselectId+"_"+this.internalIdCount++;return $relatedElement&&($relatedElement[0].dataset.multiselectid=id),id},generateUniqueId:function(){return Math.random().toString(36).substr(2)}},$.fn.multiselect=function(option,parameter,extraOptions){return this.each((function(){var data=$(this).data("multiselect"),options;data||(data=new Multiselect(this,"object"==typeof option&&option)),"string"==typeof option&&data[option](parameter,extraOptions)}))},$.fn.multiselect.Constructor=Multiselect,$((function(){$("select[data-role=multiselect]").multiselect()}))}));
// burger menu
const burger = document.querySelector('.burger');
const menu = document.querySelector('.header-menu');
const headerBottom = document.querySelector('.header-bottom');
const wrapper = document.querySelector('.wrapper');
const body = document.querySelector('body');
const buttonSubmenu = document.querySelectorAll('.menu-header__button');
const submenu = document.querySelectorAll('.submenu-header');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
const btnsDropdown = document.querySelectorAll('.btn-dropdown');

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
	burger.addEventListener('click', () => {
		if (!burger.classList.contains('_active')) {
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
		btn.addEventListener('click', () => {
			console.log('click');
			if (btn.classList.contains('show')) {
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
const buttonOpenHeaderSearch = document.querySelector('.header-search-button'),
	buttonCloseHeaderSearch = document.querySelector('.header-search__button-close'),
	headerSearch = document.querySelector('.header-search');
if (buttonOpenHeaderSearch) {
	buttonOpenHeaderSearch.addEventListener('click', () => {
		showOverlay();
		headerSearch.classList.add('_active');
	});
}
if (buttonCloseHeaderSearch) {
	buttonCloseHeaderSearch.addEventListener('click', () => {
		hideOverlay();
		headerSearch.classList.remove('_active');
	});
}

// menu form news on main page (max-width: 768px)
const buttonMenuFormNews = document.querySelector('.form-news__button-menu'),
	formNewsMenu = document.querySelector('.form-news__menu'),
	categories = document.querySelectorAll('.item-news-category');

if (buttonMenuFormNews) {
	buttonMenuFormNews.addEventListener('click', () => {
		buttonMenuFormNews.classList.toggle('_active');
		formNewsMenu.classList.toggle('_show');
	});
	const closeMenuFormNews = () => {
		buttonMenuFormNews.classList.remove('_active');
		formNewsMenu.classList.remove('_show');
	};
	categories.forEach((label) => {
		label.addEventListener('click', function (e) {
			e.preventDefault();
			closeMenuFormNews();
		});
	});
	document.addEventListener('click', function (e) {
		if (!e.target.closest('.form-news__menu, .form-news__button-menu')) {
			closeMenuFormNews();
		}
	});
}

// form-documents
const buttonOpenFormDocuments = document.querySelector('.form-documents__button-open'),
	buttonCloseFormDocuments = document.querySelector('.form-documents__button-close'),
	wrapperFormDocuments = document.querySelector('.form-documents__wrapper');
if (buttonOpenFormDocuments) {
	buttonOpenFormDocuments.addEventListener('click', () => {
		showOverlay();
		wrapperFormDocuments.classList.add('_open');
	});

	buttonCloseFormDocuments.addEventListener('click', () => {
		hideOverlay();
		wrapperFormDocuments.classList.remove('_open');
	});

	document.addEventListener('click', function (e) {
		if (!e.target.closest('.form-documents__button-open, .form-documents__wrapper')) {
			wrapperFormDocuments.classList.remove('_open');
		}
	});
}
// FUNCTION FOR FORM
function emailTest(input) {
	return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(input.value);
}

function formAddError(input) {
	input.parentElement.classList.add('_error');
}

function formRemoveError(input) {
	input.parentElement.classList.remove('_error');
}
// switch password type
const btnsVisibilityPassword = document.querySelectorAll('.icon-password');
const siblings = (el) => [].slice.call(el.parentNode.children).filter((child) => child !== el);
btnsVisibilityPassword.forEach((btn) =>
	btn.addEventListener('click', () => {
		let input = siblings(btn);
		if (input[0].type === 'password') {
			input[0].type = 'text';
			btn.classList.remove('bi-eye-slash');
			btn.classList.add('bi-eye');
		} else {
			input[0].type = 'password';
			btn.classList.add('bi-eye-slash');
			btn.classList.remove('bi-eye');
		}
	})
);

// toast
const toastButtons = document.querySelectorAll('.toast-button');
const toastsBasic = document.querySelectorAll('.toast-basic');
if (toastButtons) {
	toastButtons.forEach((btn) =>
		btn.addEventListener('click', () => {
			console.log(btn.getAttribute('data-class'));
			toastsBasic.forEach((toast) => {
				if (toast.classList.contains(btn.getAttribute('data-class'))) {
					const el = new bootstrap.Toast(toast);
					el.show();
				}
			});
		})
	);
}

// Exchange Rates from Rest API
const usd = document.getElementById('usd');
const eur = document.getElementById('eur');
const rub = document.getElementById('rub');

async function getExchangeRates() {
	try {
		let response = await fetch('https://www.nbrb.by/api/exrates/rates?periodicity=0');
		let exchangeRates = await response.json();
		exchangeRates.forEach((item) => {
			if (item.Cur_Abbreviation === 'USD') {
				usd.innerText = item.Cur_OfficialRate;
			} else if (item.Cur_Abbreviation === 'EUR') {
				eur.innerText = item.Cur_OfficialRate;
			} else if (item.Cur_Abbreviation === 'RUB') {
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
	$('#phone-registration').mask('+375 (99) 999-99-99');
	$('#unp-registration').mask('999999999');

	// button-hover
	$(function () {
		$('.button-hover')
			.on('mouseenter', function (e) {
				var parentOffset = $(this).offset(),
					relX = e.pageX - parentOffset.left,
					relY = e.pageY - parentOffset.top;
				$(this).find('.button-hover__hover-wrap').css({ top: relY, left: relX });
			})
			.on('mouseout', function (e) {
				var parentOffset = $(this).offset(),
					relX = e.pageX - parentOffset.left,
					relY = e.pageY - parentOffset.top;
				$(this).find('.button-hover__hover-wrap').css({ top: relY, left: relX });
			});
		// $('[href=#]').click(function(){return false});
	});

	$(window).on('load', function () {
		$('.scrollbar-y').mCustomScrollbar();
		$('.scrollbar-x').mCustomScrollbar({
			axis: 'x',
		});
	});
})(jQuery);

var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
	return new bootstrap.Popover(popoverTriggerEl);
});

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
		locale: 'ru',
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
		locale: 'ru',
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
		locale: 'ru',
	});
});

$(document).ready(function () {
	$('#regTel').mask('+375 (99) 999-99-99');

	$('#multipleStatus').multiselect({
		buttonClass: 'multiple-select-custom',
		buttonWidth: '100%',
		nSelectedText: ' Статуса выбрано',
		allSelectedText: 'Все статусы выбраны',
		nonSelectedText: 'Ничего не выбрано',
		// buttonText: function(options, select) {
		//   return 'Выберите Статус';
		// },
	});

	$('#multipleRule').multiselect({
		buttonClass: 'multiple-select-custom',
		buttonWidth: '100%',
		nSelectedText: ' Прав выбрано',
		allSelectedText: 'Все права выбраны',
		nonSelectedText: 'Ничего не выбрано',
		// buttonText: function(options, select) {
		//   return 'Выберите Статус';
		// },
	});

	$('.multiselect-selected-text').text('Ничего не выбрано');
});

let regForm = document.querySelector('#regRest');
if (regForm) {
	regForm.addEventListener('click', () => {
		document.querySelector('#regForm').reset();
	});
}

//adaptive height for news list if popular block too high
let newsList = document.querySelector('.news-list');
let popularBlock = document.querySelector('#popularBlock');

function calcHeighNews() {
	if (newsList) {
		// console.log('document.querySelector(#popularBlock).offsetWidth', popularBlock.offsetHeight)
		newsList.style.maxHeight = popularBlock.offsetHeight - '100' + 'px';
	}
}

if (newsList) {
	window.addEventListener('load', calcHeighNews);
	window.addEventListener('resize', calcHeighNews);
}

const menu_btn = document.querySelector('#menu-btn');
const sidebar = document.querySelector('#sidebar');
const containerNav = document.querySelector('.nav-container');
if (menu_btn && $(window).width() > 860) {
	menu_btn.addEventListener('click', () => {
		sidebar.classList.toggle('active-nav');
		containerNav.classList.toggle('active-container');
		setTimeout(() => {
			calcHeighNews();
		}, 300);
	});
}
function hideSidenav() {
	if ($(window).width() < 860) {
		sidebar.classList.remove('active-nav');
		containerNav.classList.remove('active-container');
	} else {
		sidebar.classList.add('active-nav');
		containerNav.classList.add('active-container');
	}
}

if (sidebar) {
	window.addEventListener('load', hideSidenav);
	window.addEventListener('resize', hideSidenav);
}

// console.log('test', localStorage.sideBar);
// if (localStorage.sideBar != 'true') {
//      console.log('nav false');
//      sidebar.classList.remove('active-nav');
//      containerNav.classList.remove('active-container');
// }

let testArray = [
	{ id: '00001', name: 'dfsf' },
	{ id: '00002', name: 'dsfqerq' },
	{ id: '00003', name: 'dswqefqerq' },
	{ id: '000100', name: 'dewr12sfqerq' },
];

function FilterByNumber(arr, id) {
	console.log(arr.filter((el) => el.id === id));
}

let numCertificate = document.querySelector('#numCertificate');
if (numCertificate) {
	numCertificate.addEventListener('change', () => {
		FilterByNumber(testArray, this.numCertificate.value);
	});
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
		clickable: true,
	},
	breakpoints: {
		// when window width is >= 320px
		320: {
			slidesPerView: 1,
			spaceBetween: 8,
		},
		// when window width is >= 1100px
		1100: {
			slidesPerView: 3,
			spaceBetween: 8,
		},
		// when window width is >= 1300px
		1300: {
			slidesPerView: 4,
			spaceBetween: 16,
		},
	},
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
		clickable: true,
	},
	breakpoints: {
		// when window width is >= 320px
		320: {
			slidesPerView: 1,
			spaceBetween: 8,
		},
		// when window width is >= 1100px
		1100: {
			slidesPerView: 3,
			spaceBetween: 8,
		},
		// when window width is >= 1300px
		1300: {
			slidesPerView: 4,
			spaceBetween: 16,
		},
	},
});

let actualBook = document.querySelectorAll('#actualBook');

if (actualBook) {
	actualBook.forEach((el) => {
		el.addEventListener('click', () => {
			// if(el.classList.contains('bookmark-checked')){
			//   el.classList.toggle('bi-bookmark')
			//   el.classList.toggle('bookmark-checked')
			// }
			// else{

			// }
			el.classList.toggle('bi-bookmark');
			el.classList.toggle('bookmark-checked');
			el.classList.toggle('bi-bookmark-star');
		});
	});
}

const mobileBtn = document.querySelector('#mobile-button');
const mobileMenu = document.querySelector('.mobile-nav');

if (mobileBtn) {
	mobileBtn.addEventListener('click', () => {
		mobileMenu.classList.toggle('mobile-menu-show');
		mobileBtn.classList.toggle('bi-x-lg');
	});
}

const upBtn = document.querySelector('.up-btn');

if (upBtn) {
	upBtn.addEventListener('click', () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	});
	window.addEventListener('scroll', function () {
		upBtn.hidden = scrollY < document.documentElement.clientHeight;
	});
}
